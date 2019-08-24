import './database';

const server = require('express');
const routes = require('./routes');

class App {
  constructor() {
    this.server = server();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(server.json());
  }

  routes() {
    this.server.use(routes);
  }
}

module.exports = new App().server;
