const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
});

async function initDB() {
    if (!process.env.DATABASE_URL) {
        console.log("No DATABASE_URL found. Skipping PostgreSQL initialization.");
        return;
    }

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS habits (
                id SERIAL PRIMARY KEY,
                "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                streak INTEGER DEFAULT 0,
                "completedToday" BOOLEAN DEFAULT false
            )
        `);
        console.log('Connected to PostgreSQL and tables verified.');
    } catch (err) {
        console.error('Failed to initialize PostgreSQL tables:', err.message);
    }
}

initDB();

module.exports = pool;
