import React, { useState } from 'react';
import { User, Lock, ExternalLink } from 'lucide-react';

function UserLogin({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('username', data.user.username);
        onLoginSuccess(data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="glass" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2>{isLogin ? 'Welcome Back 👋' : 'Join HabitiFy 🚀'}</h2>
          <p>{isLogin ? 'Login to continue your habit journey' : 'Create an account to track your progress'}</p>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <User size={20} style={{ margin: '0 0.5rem', color: '#9ca3af' }} />
            <input 
              type="text" 
              className="input-field" 
              style={{ flex: 1,border: 'none', background: 'transparent', outline: 'none' }}
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group" style={{ marginBottom: 0 }}>
            <Lock size={20} style={{ margin: '0 0.5rem', color: '#9ca3af' }} />
            <input 
              type="password" 
              className="input-field" 
              style={{ flex: 1,border: 'none', background: 'transparent', outline: 'none' }}
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: '1rem' }}>
            {loading ? 'Entering...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
