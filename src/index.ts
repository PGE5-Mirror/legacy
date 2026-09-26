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
import { verifyToken } from './middlewares/auth.middleware';
import getOrganizations from './routes/getOrganizations';
import addOrganization from './routes/addOrganization';
import updateOrganization from './routes/updateOrganization';
import deleteOrganization from './routes/deleteOrganization';
import getOrganizationMembers from './routes/getOrganizationMembers';
import addOrganizationMember from './routes/addOrganizationMember';
import deleteOrganizationMember from './routes/deleteOrganizationMember';
import getUserSettings from './routes/getUserSettings';
import updateUserSettings from './routes/updateUserSettings';

const app = express();

app.use(express.json());
app.disable('x-powered-by');

app.get('/health', (_req, res) => res.sendStatus(200));

app.use('/', itemsRoutes);
app.use('/', authRoutes);

app.use(express.static(path.join(__dirname, '/static')));

app.put('/projects/:id', verifyToken, updateProject);
app.delete('/projects/:id', verifyToken, deleteProject);

app.get('/columns', getColumns);
app.post('/columns', addColumn);
app.put('/columns/:id', updateColumn);
app.delete('/columns/:id', deleteColumn);

app.get('/organizations', verifyToken, getOrganizations);
app.post('/organizations', verifyToken, addOrganization);
app.put('/organizations/:id', verifyToken, updateOrganization);
app.delete('/organizations/:id', verifyToken, deleteOrganization);

app.get('/organizations/:id/members', verifyToken, getOrganizationMembers);
app.post('/organizations/:id/members', verifyToken, addOrganizationMember);
app.delete('/organizations/:id/members/:memberId', verifyToken, deleteOrganizationMember);

app.get('/organizations/:id/projects', verifyToken, getProjects);
app.post('/organizations/:id/projects', verifyToken, addProject);

app.get('/users/me/settings', verifyToken, getUserSettings);
app.put('/users/me/settings', verifyToken, updateUserSettings);

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
