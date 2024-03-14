import express from 'express';
import UsersController from '../controllers/UsersController';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController';

function routeController(app) {
  const route = express.Router();
  app.use('/', route);

  route.post('/users', (request, response) => {
    UsersController.postNew(request, response);
  });
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);

  app.get('/connect', AuthController.getConnect);
  app.get('/disconnect', AuthController.getDisconnect);
  app.get('/users/me', UsersController.getMe);

  app.post('/files', FilesController.postUpload);

  app.get('/files/:id/data', FilesController.getFile);
}

module.exports = routeController;
