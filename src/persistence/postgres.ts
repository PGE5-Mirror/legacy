import { Pool } from 'pg';
import { Task, NewTask, TaskUpdate } from '../models/Task';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function init(): Promise<void> {
  await pool.query('SELECT 1');
  console.log('Connected to PostgreSQL');
}

export async function teardown(): Promise<void> {
  await pool.end();
}

export async function getItems(): Promise<Task[]> {
  const { rows } = await pool.query<Task>('SELECT * FROM tasks order by "createdAt" DESC');
  return rows;
}

export async function getItem(id: string): Promise<Task | undefined> {
  const { rows } = await pool.query<Task>('SELECT * FROM tasks WHERE id = $1', [id]);
  return rows[0];
}

export async function storeItem(item: NewTask): Promise<Task> {
  const { rows } = await pool.query<Task>('INSERT INTO tasks (name) VALUES ($1) RETURNING *', [
    item.name,
  ]);
  return rows[0];
}

export async function updateItem(id: string, item: TaskUpdate): Promise<void> {
  await pool.query('UPDATE tasks SET name = $1, completed = $2 WHERE id = $3', [
    item.name,
    item.completed,
    id,
  ]);
}

export async function removeItem(id: string): Promise<void> {
  await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}
