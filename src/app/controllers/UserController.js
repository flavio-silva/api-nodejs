import * as yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = yup.object().shape({
      name: yup
        .string()
        .required()
        .max(255),
      email: yup
        .string()
        .email()
        .required()
        .max(255),
      password: yup
        .string()
        .required()
        .min(6)
        .max(20),
      provider: yup.boolean(),
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({
        error: err.message,
      });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email: email || user.email,
      provider,
    });
  }
}
export default new UserController();
