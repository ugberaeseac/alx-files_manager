import express from 'express';
import AppController from '../controllers/AppController';

const routes = express.Router();

routes.get('/status', AppController.getStatus);
routes.get('/stats', AppController.getStats);

// Authenticate a user

export default routes;
