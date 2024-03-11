import express from 'express';
import process from 'process';
import routeController from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

routeController(app);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
