const db = require('../database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-local-dev';

exports.register = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Username already exists' });
                }
                return res.status(500).json({ error: 'Failed to create user' });
            }
            
            // Generate token after successful registration
            const token = jwt.sign({ id: this.lastID, username, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
            res.status(201).json({ token, user: { id: this.lastID, username } });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!row) return res.status(401).json({ error: 'Invalid username or password' });

        const match = await bcrypt.compare(password, row.password);
        if (!match) return res.status(401).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ id: row.id, username: row.username, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: row.id, username: row.username } });
    });
};

exports.verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized user' });
    }
    
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: 'Invalid token' });
        req.user = decoded; // Contains id, username, role
        next();
    });
};
