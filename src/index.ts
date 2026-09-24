import express from 'express';
import path from 'node:path';
import * as db from './persistence';
import itemsRoutes from './routes/items.routes';
import authRoutes from './routes/auth.routes';
import getProjects from './routes/getProjects';
import addProject from './routes/addProject';
import updateProject from './routes/updateProject';
import deleteProject from './routes/deleteProject';
import getColumns from './routes/getColumns';
import addColumn from './routes/addColumn';
import updateColumn from './routes/updateColumn';
import deleteColumn from './routes/deleteColumn';
import { startTaskCreatedConsumer } from './events/consumers/taskCreatedConsumer';

const app = express();

app.use(express.json());
app.disable('x-powered-by');

app.get('/health', (_req, res) => res.sendStatus(200));

app.use('/', itemsRoutes);
app.use('/', authRoutes);

app.use(express.static(path.join(__dirname, '/static')));

app.get('/projects', getProjects);
app.post('/projects', addProject);
app.put('/projects/:id', updateProject);
app.delete('/projects/:id', deleteProject);

app.get('/columns', getColumns);
app.post('/columns', addColumn);
app.put('/columns/:id', updateColumn);
app.delete('/columns/:id', deleteColumn);

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
