import express from 'express';
import process from 'process';
import routes from './routes/index';

const app = express();
app.use('/', routes);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`your app is runnning on localhost:${PORT}`);
});

export default app;
