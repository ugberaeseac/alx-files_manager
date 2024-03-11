import express from 'express';
import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController'

function routeController(app) {
  const route = express.Router();
  app.use('/', route);

  route.get('/status', AppController.getStatus);
  route.get('/stats', AppController.getStats);

  route.get('/connect', AuthController.getConnect);
  route.get('/disconnect', AuthController.getDisconnect);
  route.get('/users/me', UserController.getMe);

}

module.exports = routeController;
