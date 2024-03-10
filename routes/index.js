import express from 'express';
import UsersController from '../controllers/UsersController';

function routeController(app) {
  const route = express.Router();
  app.use('/', route);

  route.post('/users', (request, response) => {
    UsersController.postNew(request, response);
  });
}

module.exports = routeController;
