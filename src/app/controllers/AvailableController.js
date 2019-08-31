import { Op } from 'sequelize';
import {
  startOfDay,
  endOfDay,
  isAfter,
  endOfHour,
  startOfHour,
} from 'date-fns';
import Appointment from '../models/Appointment';

class AvailableController {
  async index (req, res) {
    let { date = new Date().getTime() } = req.query;
    date = parseInt(date, 10);

    if (!date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
        provider_id: req.params.providerId,
        canceled_at: null,
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const dates = schedule.map(time => {
      const changedDate = new Date(date);
      const [hour, minutes] = time.split(':');
      changedDate.setHours(hour);
      changedDate.setMinutes(minutes);
      changedDate.setSeconds(0);

      let available = isAfter(changedDate, new Date());

      const hasAppointment = appointments.find(appointment => {
        const appointmentDate = startOfHour(appointment.date);

        return (
          appointmentDate >= startOfHour(changedDate) &&
          appointmentDate <= endOfHour(changedDate)
        );
      });

      available = hasAppointment ? false : available;

      return {
        time,
        value: changedDate,
        available,
      };
    });

    return res.json(dates);
  }
}

export default new AvailableController();
