import { Pool, QueryResult } from 'pg';

interface Task {
    id?: string;
    name: string;
    completed?: boolean;
    createdAt?: Date;
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

async function init(): Promise<void> {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
}

async function teardown(): Promise<void> {
    await pool.end();
}

async function getItems(): Promise<Task[]> {
    const { rows }: QueryResult<Task> = await pool.query('SELECT * FROM tasks order by "createdAt" DESC');
    return rows;
}

async function getItem(id: string): Promise<Task | undefined> {
    const { rows }: QueryResult<Task> = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0];
}

async function storeItem(item: Task): Promise<Task> {
    const { rows }: QueryResult<Task> = await pool.query(
        'INSERT INTO tasks (name) VALUES ($1) RETURNING *',
        [item.name]
    );
    return rows[0];
}

async function updateItem(id: string, item: Task): Promise<void> {
    await pool.query(
        'UPDATE tasks SET name = $1, completed = $2 WHERE id = $3',
        [item.name, item.completed, id]
    );
}

async function removeItem(id: string): Promise<void> {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}

export {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};