import { collectDefaultMetrics, Counter, Registry } from 'prom-client';

const register = new Registry();
collectDefaultMetrics({ register });

const tasksCreatedTotal = new Counter({
  name: 'tasks_created_total',
  help: 'Total number of tasks created',
  registers: [register],
});

export { register, tasksCreatedTotal };
