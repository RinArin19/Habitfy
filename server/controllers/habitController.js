const db = require('../database');

exports.getAllHabits = (req, res) => {
    // req.user is guaranteed to be set by the new verifyUser middleware
    const userId = req.user.id;
    
    db.all('SELECT * FROM habits WHERE userId = ?', [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch habits' });
        // Format boolean properly because SQLite stores boolean as 0/1
        const formatted = rows.map(r => ({ ...r, completedToday: !!r.completedToday }));
        res.json(formatted);
    });
};

exports.createHabit = (req, res) => {
    const { title } = req.body;
    const userId = req.user.id;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    
    db.run('INSERT INTO habits (userId, title, streak, completedToday) VALUES (?, ?, ?, ?)', [userId, title, 0, 0], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to create habit' });
        res.status(201).json({ id: this.lastID, userId, title, streak: 0, completedToday: false });
    });
};

exports.completeHabit = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    db.get('SELECT * FROM habits WHERE id = ? AND userId = ?', [id, userId], (err, habit) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!habit) return res.status(404).json({ error: 'Habit not found' });
        
        const newCompleted = habit.completedToday ? 0 : 1;
        const newStreak = newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1);
        
        db.run('UPDATE habits SET completedToday = ?, streak = ? WHERE id = ?', [newCompleted, newStreak, id], (err) => {
            if (err) return res.status(500).json({ error: 'Failed to update habit' });
            res.json({ ...habit, completedToday: !!newCompleted, streak: newStreak });
        });
    });
};

exports.deleteHabit = (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    
    db.run('DELETE FROM habits WHERE id = ? AND userId = ?', [id, userId], function(err) {
        if (err) return res.status(500).json({ error: 'Failed to delete habit' });
        if (this.changes === 0) return res.status(404).json({ error: 'Habit not found' });
        res.json({ message: 'Deleted successfully' });
    });
};
