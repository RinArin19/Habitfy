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
app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
    try {
        const userRes = await db.query('SELECT COUNT(*) as users FROM users');
        const habitRes = await db.query('SELECT COUNT(*) as "activeHabits", SUM(CASE WHEN "completedToday" = true THEN 1 ELSE 0 END) as "completedToday" FROM habits');
        
        const userRow = userRes.rows[0];
        const habitRow = habitRes.rows[0];
        
        res.json({ 
            users: userRow ? parseInt(userRow.users) : 0, 
            activeHabits: habitRow ? parseInt(habitRow.activeHabits) : 0, 
            completedToday: habitRow ? parseInt(habitRow.completedToday || 0) : 0 
        });
    } catch (err) { res.status(500).json({ error: 'DB Error' }); }
});

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
    try {
        const { rows } = await db.query(`
            SELECT u.id, u.username, 
                   COUNT(h.id) as "totalHabits", 
                   SUM(CASE WHEN h."completedToday" = true THEN 1 ELSE 0 END) as "completedToday" 
            FROM users u 
            LEFT JOIN habits h ON u.id = h."userId" 
            GROUP BY u.id
        `);
        const formatted = rows.map(r => ({
            ...r,
            totalHabits: parseInt(r.totalHabits) || 0,
            completedToday: parseInt(r.completedToday) || 0
        }));
        res.json(formatted);
    } catch (err) { res.status(500).json({ error: 'Failed to fetch users' }); }
});

app.post('/api/admin/users', verifyAdmin, async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await db.query('INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id', [username, hashedPassword]);
        res.status(201).json({ id: rows[0].id, username, totalHabits: 0, completedToday: 0 });
    } catch (err) {
        if (err.code === '23505' || (err.message && err.message.includes('UNIQUE'))) return res.status(409).json({ error: 'Username already exists' });
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.put('/api/admin/users/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });
    
    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query('UPDATE users SET username = $1, password = $2 WHERE id = $3', [username, hashedPassword, id]);
        } else {
            await db.query('UPDATE users SET username = $1 WHERE id = $2', [username, id]);
        }
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/admin/users/:id', verifyAdmin, async (req, res) => {
    try {
        const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        if (rowCount === 0) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) { res.status(500).json({ error: 'Failed to delete user' }); }
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
