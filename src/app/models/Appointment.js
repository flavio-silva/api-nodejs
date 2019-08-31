import { Model, Sequelize } from 'sequelize';
import { isAfter, differenceInHours } from 'date-fns';

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
        canceled_at: Sequelize.DATE,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isAfter(new Date(), this.date);
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return differenceInHours(this.date, new Date()) > 2;
          },
        },
      },
      { sequelize }
    );
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' });
  }
}

export default Appointment;
