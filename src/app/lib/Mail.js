import nodemailer from 'nodemailer';
import nodemailerhbs from 'nodemailer-express-handlebars';
import expresshbs from 'express-handlebars';
import { resolve } from 'path';
import mailConfig from '../../config/mail';

class Mail {
  constructor() {
    const { host, port, auth } = mailConfig;

    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth,
    });

    this.configTemplate();
  }

  configTemplate() {
    const viewPath = resolve(__dirname, '..', 'views', 'emails');
    this.transporter.use(
      'compile',
      nodemailerhbs({
        viewEngine: expresshbs.create({
          layoutsDir: resolve(viewPath, 'layouts'),
          partialsDir: resolve(viewPath, 'partials'),
          defaultLayout: 'default',
          extname: '.hbs',
        }),
        viewPath,
        extName: '.hbs',
      })
    );
  }

  sendMail(message) {
    this.transporter.sendMail({
      ...mailConfig.default,
      ...message,
    });
  }
}

export default new Mail();
