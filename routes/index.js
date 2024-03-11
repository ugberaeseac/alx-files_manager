import express from 'express';
import UsersController from '../controllers/UsersController';
import AppController from '../controllers/AppController';

function routeController(app) {
  const route = express.Router();
  app.use('/', route);

  route.post('/users', (request, response) => {
    UsersController.postNew(request, response);
  });
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
}

module.exports = routeController;
