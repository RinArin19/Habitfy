const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        
        // Create users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        // Create habits table
        db.run(`CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            title TEXT,
            streak INTEGER DEFAULT 0,
            completedToday BOOLEAN DEFAULT 0,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )`);
    }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
