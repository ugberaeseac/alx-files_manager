import express from 'express';
import UsersController from '../controllers/UsersController';
import AppController from '../controllers/AppController';
import FilesController from '../controllers/FilesController';

function routeController(app) {
  const route = express.Router();
  app.use('/', route);

  route.post('/users', (request, response) => {
    UsersController.postNew(request, response);
  });
  route.get('/files', (request, response) => {
    FilesController.getIndex(request, response);
  });
  route.get('files/:id', (request, response) => {
    FilesController.getShow(request, response);
  });

  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);
}

module.exports = routeController;
