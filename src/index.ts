import express from 'express';
import path from 'path';
import * as db from './persistence';
import getItems from './routes/getItems';
import addItem from './routes/addItem';
import updateItem from './routes/updateItem';
import deleteItem from './routes/deleteItem';
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

app.disable('x-powered-by');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

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
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const gracefulShutdown = (): void => {
  db.teardown()
    .catch(() => {})
    .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
