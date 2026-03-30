const db = require('../database');

exports.getAllHabits = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await db.query('SELECT * FROM habits WHERE "userId" = $1', [userId]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch habits' });
    }
};

exports.createHabit = async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;
        if (!title) return res.status(400).json({ error: 'Title is required' });
        
        const { rows } = await db.query(
            'INSERT INTO habits ("userId", title, streak, "completedToday") VALUES ($1, $2, $3, $4) RETURNING id', 
            [userId, title, 0, false]
        );
        res.status(201).json({ id: rows[0].id, userId, title, streak: 0, completedToday: false });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create habit' });
    }
};

exports.completeHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const { rows } = await db.query('SELECT * FROM habits WHERE id = $1 AND "userId" = $2', [id, userId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Habit not found' });
        
        const habit = rows[0];
        const newCompleted = !habit.completedToday;
        const newStreak = newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);
        
        await db.query('UPDATE habits SET "completedToday" = $1, streak = $2 WHERE id = $3', [newCompleted, newStreak, id]);
        res.json({ ...habit, completedToday: newCompleted, streak: newStreak });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update habit' });
    }
};

exports.deleteHabit = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const { rowCount } = await db.query('DELETE FROM habits WHERE id = $1 AND "userId" = $2', [id, userId]);
        if (rowCount === 0) return res.status(404).json({ error: 'Habit not found' });
        
        res.json({ message: 'Deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
};
