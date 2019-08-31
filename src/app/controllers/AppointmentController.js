import * as yup from 'yup';
import {
  startOfHour,
  endOfHour,
  parseISO,
  isBefore,
  format,
  differenceInHours,
} from 'date-fns';
import pt from 'date-fns/locale/pt';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointment from '../models/Appointment';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Queue from '../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const recordsPerPage = 20;

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: [['date', 'asc']],
      limit: recordsPerPage,
      offset: (page - 1) * recordsPerPage,
      attributes: ['id', 'date', 'past', 'cancelable'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['url', 'path'],
            },
          ],
        },
      ],
    });
    return res.json(appointments);
  }

  async store(req, res) {
    const schema = yup.object().shape({
      date: yup.date().required(),
      provider_id: yup
        .number()
        .integer()
        .required(),
    });

    try {
      schema.validateSync(req.body);
    } catch (err) {
      return res.status(400).json({
        error: err.message,
      });
    }

    const { provider_id, date } = req.body;

    const isProvider = await User.findOne({
      where: {
        id: provider_id,
        provider: true,
      },
    });

    if (!isProvider) {
      return res.status(401).json({
        error: 'This User is not a provider',
      });
    }

    const initialHour = startOfHour(parseISO(date));
    const endHour = endOfHour(parseISO(date));

    if (isBefore(initialHour, new Date())) {
      return res.status(400).json({
        error: 'Provided date has been passed',
      });
    }

    const hasAppointment = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: {
          [Op.between]: [initialHour, endHour],
        },
      },
    });

    if (hasAppointment) {
      return res.status(400).json({
        error: 'Appointment hour is not available',
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date,
    });

    const user = await User.findByPk(req.userId);
    const formattedDate = format(parseISO(date), "dd' de 'MMMM', às 'H:mm'h'", {
      locale: pt,
    });

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const now = new Date();
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You does not have permission to cancel this appointment.',
      });
    }

    if (differenceInHours(appointment.date, now) < 2) {
      return res.status(400).json({
        error: 'you can only cancel an appointment two hours in advance',
      });
    }
    appointment.canceled_at = now;

    await appointment.save();
    Queue.addJob(CancellationMail.key, { appointment });

    return res.status(204).send();
  }
}

export default new AppointmentController();
