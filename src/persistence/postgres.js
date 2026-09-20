const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeout: 30000,
    connectionTimeout: 2000,
})

async function init() {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
}

async function teardown() {
    await pool.end();
}

async function getItems() {
    const { rows } = await pool.query('SELECT * FROM tasks order by "createdAt" DESC');
    return rows;
}

async function getItem(id) {
    const { rows } = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return rows[0];
}

async function storeItem(item) {
    const { rows } = await pool.query('INSERT INTO tasks (name) VALUES ($1) RETURNING *',
        [item.name]);
    return rows[0];
}

async function updateItem(id, item) {
    await pool.query('UPDATE tasks SET name = $1, status = $2 WHERE id = $3',
        [item.name, item.status, id]);
}

async function removeItem(id) {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
}