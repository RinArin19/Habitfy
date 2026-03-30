import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Flame, Plus, Bell } from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import AchievementsBoard from '../../components/AchievementsBoard';

const API_URL = 'http://localhost:5000/api/habits';

function UserDashboard() {
  const [habits, setHabits] = useState([]);
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
  };

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHabits(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch habits', err);
      setLoading(false);
    }
  };

  const addHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: newHabitTitle })
      });
      const newHabit = await res.json();
      setHabits([...habits, newHabit]);
      setNewHabitTitle('');
    } catch (err) {
      console.error('Failed to add habit', err);
    }
  };

  const toggleHabit = async (id) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_URL}/${id}/complete`, { 
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updatedHabit = await res.json();
      
      const updatedHabits = habits.map(h => h.id === id ? updatedHabit : h);
      setHabits(updatedHabits);
      
      // Trigger local browser notification as a micro-interaction flair
      if (updatedHabit.completedToday && Notification.permission === 'granted') {
        new Notification('Great job! 🎉', {
          body: `You completed: ${updatedHabit.title}`
        });
      }

      // Check for Perfect Day trigger
      if (updatedHabit.completedToday) {
        const completedCount = updatedHabits.filter(h => h.completedToday).length;
        if (completedCount === updatedHabits.length && updatedHabits.length > 0) {
          confetti({
            particleCount: 200,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle habit', err);
    }
  };

  if (loading) return <div className="glass" style={{padding: '2rem'}}>Loading your routines...</div>;

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.completedToday).length;
  const progressPercent = totalHabits === 0 ? 0 : Math.round((completedHabits / totalHabits) * 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <>
      <div className="glass animate-slide-up" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2>Today's Routines ✨</h2>
          <p>What are we achieving today?</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="progress-chart-container">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle
                cx="50" cy="50" r={radius}
                className="progress-track"
              />
              <circle
                cx="50" cy="50" r={radius}
                className="progress-fill"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                stroke="#10b981"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="progress-text">
              <span>{progressPercent}%</span>
            </div>
          </div>
          <button className="btn-icon" title="Enable Reminders" onClick={requestNotificationPermission}>
            <Bell size={20} />
          </button>
        </div>
      </div>

      <form onSubmit={addHabit} className="input-group">
        <input 
          type="text" 
          className="input-field" 
          placeholder="e.g. Meditate for 10 minutes..." 
          value={newHabitTitle}
          onChange={(e) => setNewHabitTitle(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          <Plus size={20} /> Add Habit
        </button>
      </form>

      <div className="grid">
        {habits.map(habit => (
          <div key={habit.id} className="glass habit-card animate-slide-up">
            <div className="habit-info">
              <h3>{habit.title}</h3>
              <div className="habit-streak">
                <Flame size={16} /> {habit.streak} Day Streak
              </div>
            </div>
            
            <button 
              className={clsx("btn-icon", habit.completedToday && "completed")}
              onClick={() => toggleHabit(habit.id)}
            >
              {habit.completedToday ? <CheckCircle2 size={24} /> : <Circle size={24} />}
            </button>
          </div>
        ))}
        {habits.length === 0 && <p>No habits added yet. Start your journey above!</p>}
      </div>
    </div>
      <AchievementsBoard habits={habits} />
    </>
  );
}

export default UserDashboard;
