require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
const habitRoutes = require('./routes/habitRoutes');
const userRoutes = require('./routes/userRoutes');
const userController = require('./controllers/userController');
const db = require('./database');

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running correctly.' });
});

// App routing
app.use('/api/users', userRoutes);
app.use('/api/habits', userController.verifyUser, habitRoutes);

// Admin login route
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        // Mock token for simplicity
        res.json({ token: 'mock-admin-token-12345' });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Middleware to verify mock admin token
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader === 'Bearer mock-admin-token-12345') {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Mock admin route for testings, protected
app.get('/api/admin/stats', verifyAdmin, (req, res) => {
    db.get('SELECT COUNT(*) as users FROM users', (err, userRow) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        db.get('SELECT COUNT(*) as activeHabits, SUM(completedToday) as completedToday FROM habits', (err, habitRow) => {
            if (err) return res.status(500).json({ error: 'DB Error' });
            res.json({ 
                users: userRow ? userRow.users : 0, 
                activeHabits: habitRow ? habitRow.activeHabits : 0, 
                completedToday: habitRow ? habitRow.completedToday : 0 
            });
        });
    });
});

app.get('/api/admin/users', verifyAdmin, (req, res) => {
    db.all(`
        SELECT u.id, u.username, 
               COUNT(h.id) as totalHabits, 
               SUM(CASE WHEN h.completedToday = 1 THEN 1 ELSE 0 END) as completedToday 
        FROM users u 
        LEFT JOIN habits h ON u.id = h.userId 
        GROUP BY u.id
    `, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch users' });
        const formatted = rows.map(r => ({
            ...r,
            totalHabits: r.totalHabits || 0,
            completedToday: r.completedToday || 0
        }));
        res.json(formatted);
    });
});

app.post('/api/admin/users', verifyAdmin, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Username already exists' });
                return res.status(500).json({ error: 'Failed to create user' });
            }
            res.status(201).json({ id: this.lastID, username, totalHabits: 0, completedToday: 0 });
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/admin/users/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run('UPDATE users SET username = ?, password = ? WHERE id = ?', [username, hashedPassword, id], function(err) {
                if (err) return res.status(500).json({ error: 'Failed to update user' });
                res.json({ message: 'User updated successfully' });
            });
        } else {
            db.run('UPDATE users SET username = ? WHERE id = ?', [username, id], function(err) {
                if (err) return res.status(500).json({ error: 'Failed to update user' });
                res.json({ message: 'User updated successfully' });
            });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/users/:id', verifyAdmin, (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to delete user' });
        if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    });
});

// Chatbot route using Gemini API
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ reply: "Please provide a valid conversation history." });
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "fallback" });
        
        // Format history for the API
        const contents = messages.map(m => ({
            role: m.isBot ? 'model' : 'user',
            parts: [{ text: m.text }]
        }));

        const persona = "You are Karina. A quiet, introverted, and emotionally intelligent person who leads with care, carries herself with grace, and hides a soft, slightly awkward personality behind a strong exterior. You act as a funny friend and a personal habit coach. Keep responses reasonably concise and conversational for a small floating chat widget.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: persona
            }
        });

        res.json({ reply: response.text });
    } catch (err) {
        console.error("Gemini AI API Error:", err.message);
        res.status(500).json({ reply: "I'm having a little trouble thinking of what to say right now... Make sure your API key is correctly put into .env!" });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
