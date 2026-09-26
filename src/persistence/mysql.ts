// src/persistence/mysql.ts
import waitPort from 'wait-port';
import mysql from 'mysql2/promise';
import { Task } from '../models/Task';

const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB } = process.env;

let pool: mysql.Pool;

export async function init(): Promise<void> {
    await waitPort({ host: MYSQL_HOST as string, port: 3306, timeout: 10000 });

    pool = mysql.createPool({
            connectionLimit: 5,
            host: MYSQL_HOST as string,
            user: MYSQL_USER as string,
            password: MYSQL_PASSWORD as string,
            database: MYSQL_DB as string,
            charset: 'utf8mb4',
        });

    await pool.query(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean) DEFAULT CHARSET utf8mb4'
    );
    console.log(`Connected to mysql db at host ${MYSQL_HOST}`);
}

export async function teardown(): Promise<void> {
    await pool.end();
}

export async function getItems(): Promise<Task[]> {
    const [rows] = await pool.query('SELECT * FROM todo_items');
    return (rows as any[]).map(item => ({
        id: item.id,
        name: item.name,
        completed: item.completed === 1,
    }));
}

export async function storeItem(item: Task): Promise<void> {
    await pool.query(
        'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
        [item.id, item.name, item.completed ? 1 : 0]
    );
}

export async function getItem(id: string): Promise<Task | undefined> {
    const [rows] = await pool.query('SELECT * FROM todo_items WHERE id=?', [id]);
    const items = rows as any[];
    
    if (items.length === 0) return undefined;

    return {
        id: items[0].id,
        name: items[0].name,
        completed: items[0].completed === 1,
    };
}

export async function updateItem(id: string, item: Task): Promise<void> {
    await pool.query(
        'UPDATE todo_items SET name=?, completed=? WHERE id=?',
        [item.name, item.completed ? 1 : 0, id]
    );
}

export async function removeItem(id: string): Promise<void> {
    await pool.query('DELETE FROM todo_items WHERE id = ?', [id]);
}