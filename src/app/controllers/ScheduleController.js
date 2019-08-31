import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointment from '../models/Appointment';

class ScheduleController {
  async index(req, res) {
    const user = await User.findByPk(req.userId, { attributes: ['provider'] });

    if (!user.provider) {
      return res.status(401).json({
        error: 'User is not a provider',
      });
    }

    let where = { provider_id: req.userId, canceled_at: null };

    const { date } = req.query;

    if (date) {
      where = {
        date: {
          [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))],
        },
        ...where,
      };
    }

    const appointments = await Appointment.findAll({
      where,
      order: ['date'],
    });

    return res.json(appointments);
  }
}

export default new ScheduleController();
