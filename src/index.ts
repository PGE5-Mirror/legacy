import express from 'express';
import path from 'node:path';
import * as db from './persistence';
import itemsRoutes from './routes/items.routes';
import authRoutes from './routes/auth.routes';
import { startTaskCreatedConsumer } from './events/consumers/taskCreatedConsumer';
import userRoutes from "./routes/user.routes";

const app = express();

app.use(express.json());
app.disable("x-powered-by");

app.get('/health', (_req, res) => res.sendStatus(200));

app.use('/', itemsRoutes);
app.use('/', authRoutes);
app.use('/', userRoutes);

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