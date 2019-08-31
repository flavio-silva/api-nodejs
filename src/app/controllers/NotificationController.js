import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const user = await User.findByPk(req.userId, { attributes: ['provider'] });

    if (!user.provider) {
      return res.status(401).json({
        error: 'Only provider can load notifications',
      });
    }

    const notifications = await Notification.find({
      user: req.userId,
    }).sort({ createdAt: -1 });

    return res.json(notifications);
  }

  async update(req, res) {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      {
        read: true,
      },
      {
        new: true,
      }
    );

    return res.json(notification);
  }
}

export default new NotificationController();
