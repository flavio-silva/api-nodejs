import 'dotenv/config';
import express from 'express';
import { resolve } from 'path';
import Youch from 'youch';
import * as Sentry from '@sentry/node';
import 'express-async-errors';
import routes from './routes';
import sentryConfig from './config/sentry';
import './database';

class App {
  constructor() {
    this.server = express();
    Sentry.init(sentryConfig);
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    const uploadsPath = resolve(__dirname, '..', 'temp', 'uploads');
    this.server.use('/files', express.static(uploadsPath));
    this.server.use(express.json());
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (error, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(error, req).toJSON();
        return res.status(500).json(errors);
      }

      return res.status(500).json({
        error: 'Internal Server Error',
      });
    });
  }
}

module.exports = new App().server;
