import express from 'express';
import path from 'path';
import * as db from './persistence';

import itemsRoutes from './routes/items.routes';
import { startTaskCreatedConsumer } from './events/consumers/taskCreatedConsumer';

const app = express();

app.use(express.json());

app.use('/', itemsRoutes);

app.use(express.static(path.join(__dirname, '/static')));

db.init()
  .then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
    startTaskCreatedConsumer();
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });

const gracefulShutdown = () => {
  db.teardown()
    .catch(() => {})
    .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);
