import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  handle({ data }) {
    const { appointment } = data;
    Mail.sendMail({
      to: `${appointment.provider.name}<${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        date: format(
          parseISO(appointment.date),
          "'dia 'dd' de 'MMMM', às 'H:mm'h'",
          {
            locale: pt,
          }
        ),
        user: appointment.provider.name,
        client: appointment.user.name,
      },
    });
  }
}

export default new CancellationMail();
