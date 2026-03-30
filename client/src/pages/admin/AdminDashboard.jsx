import React, { useState, useEffect } from 'react';
import { Users, Activity, CheckSquare, LogOut, Trash2, Edit2, Plus, BarChart2, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import AdminLogin from './AdminLogin';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE}/api/admin/stats`;

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, activeHabits: 0, completedToday: 0 });
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', password: '' });
  const [chartType, setChartType] = useState('pie');

  const COLORS = ['#ef4444', '#10b981']; // Red for incomplete, Green for complete

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        setToken(null);
        localStorage.removeItem('adminToken');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setStats(data);
      
      // Fetch users list
      const usersRes = await fetch(`${API_BASE}/api/admin/users`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (usersRes.ok) {
         setUsersList(await usersRes.json());
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsersList(usersList.filter(u => u.id !== id));
        fetchStats(); // refresh stats
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  if (!token) return <AdminLogin onLoginSuccess={() => setToken(localStorage.getItem('adminToken'))} />;

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        setNewUser({ username: '', password: '' });
        fetchStats();
      } else {
        alert("Failed to create user. Make sure username is unique.");
      }
    } catch (err) { console.error("Error creating user", err); }
  };

  const submitEditUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setEditingUser(null);
        fetchStats();
      }
    } catch (err) { console.error("Error editing user", err); }
  };

  const renderChart = (user) => {
    const incomplete = Math.max(0, user.totalHabits - user.completedToday);
    const data = [
      { name: 'To Do', value: incomplete },
      { name: 'Done', value: user.completedToday }
    ];
    
    // If no habits exist, return empty state
    if (user.totalHabits === 0) return <div style={{height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af'}}>No Habits</div>;

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={100}>
          <PieChart>
            <Pie data={data} innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value">
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
            </Pie>
            <Tooltip contentStyle={{background: 'rgba(255,255,255,0.9)', borderRadius: '8px', border: 'none'}} />
          </PieChart>
        </ResponsiveContainer>
      );
    } else if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={data} margin={{top: 10, right: 10, bottom: 0, left: -20}}>
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip cursor={{fill: 'transparent'}} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={100}>
          <LineChart data={data} margin={{top: 10, right: 10, bottom: 0, left: 10}}>
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };

  if (loading) return <div className="glass" style={{padding: '2rem'}}>Loading metrics...</div>;

  return (
    <div className="animate-slide-up">
      <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>System Overview 📊</h2>
          <p>Real-time analytics across the platform</p>
        </div>
        <button className="btn-icon" onClick={handleLogout} title="Logout" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>
          <LogOut size={20} />
        </button>
      </div>

      <div className="grid">
        <div className="glass habit-card">
          <div className="habit-info">
            <p>Total Users</p>
            <h3>{stats.users}</h3>
          </div>
          <div className="btn-icon" style={{background: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5'}}>
            <Users size={24} />
          </div>
        </div>

        <div className="glass habit-card">
          <div className="habit-info">
            <p>Active Habits Tracked</p>
            <h3>{stats.activeHabits}</h3>
          </div>
          <div className="btn-icon" style={{background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b'}}>
            <Activity size={24} />
          </div>
        </div>

        <div className="glass habit-card">
          <div className="habit-info">
            <p>Completed Today</p>
            <h3>{stats.completedToday}</h3>
          </div>
          <div className="btn-icon" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>
            <CheckSquare size={24} />
          </div>
        </div>
      </div>
      
      <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3>Broadcast Notification 📣</h3>
        <p style={{marginBottom: '1rem'}}>Send a push notification to all users (Requires active Service Worker / Web Push)</p>
        <div className="input-group">
          <input type="text" className="input-field" placeholder="Message content..." />
          <button className="btn btn-primary" onClick={() => alert('Broadcast simulated!')}>
            Send Broadcast
          </button>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h3>Manage Users 👥</h3>
            <p>Active users registered on the platform</p>
          </div>
          
          <div style={{display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.5)', padding: '0.25rem', borderRadius: '12px'}}>
            <button className={`btn-icon ${chartType === 'pie' ? 'active-chart' : ''}`} onClick={() => setChartType('pie')} title="Pie Chart" style={chartType==='pie'?{background:'#4f46e5',color:'white'}:{border:'none'}}><PieIcon size={16}/></button>
            <button className={`btn-icon ${chartType === 'bar' ? 'active-chart' : ''}`} onClick={() => setChartType('bar')} title="Bar Chart" style={chartType==='bar'?{background:'#4f46e5',color:'white'}:{border:'none'}}><BarChart2 size={16}/></button>
            <button className={`btn-icon ${chartType === 'line' ? 'active-chart' : ''}`} onClick={() => setChartType('line')} title="Line Chart" style={chartType==='line'?{background:'#4f46e5',color:'white'}:{border:'none'}}><TrendingUp size={16}/></button>
          </div>
        </div>

        <form onSubmit={handleCreateUser} className="input-group" style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.3)', borderRadius: '12px' }}>
          <input type="text" className="input-field" placeholder="New Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} required />
          <input type="password" className="input-field" placeholder="New Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required />
          <button type="submit" className="btn btn-primary"><Plus size={18} /> Create</button>
        </form>
        
        {usersList.length === 0 ? <p>No users found.</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {usersList.map(user => (
              <div key={user.id} className="habit-card glass" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem', cursor: 'default' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold'}}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{margin: 0}}>{user.username}</h4>
                      <small style={{color: 'var(--text-muted)'}}>{user.totalHabits} Habits</small>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    {editingUser === user.id ? (
                      <button className="btn btn-primary" style={{padding: '0.25rem 0.5rem', fontSize: '0.8rem'}} onClick={() => submitEditUser(user.id)}>Save</button>
                    ) : (
                      <button className="btn-icon" onClick={() => { setEditingUser(user.id); setEditForm({username: user.username, password: ''}); }} style={{ width: '30px', height: '30px' }} title="Edit User">
                        <Edit2 size={14} />
                      </button>
                    )}
                    <button className="btn-icon" onClick={() => handleDeleteUser(user.id)} style={{ color: '#ef4444', width: '30px', height: '30px' }} title="Delete User">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {editingUser === user.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <input type="text" className="input-field" placeholder="Username" value={editForm.username} onChange={e => setEditForm({...editForm, username: e.target.value})} />
                    <input type="password" className="input-field" placeholder="New Password (optional)" value={editForm.password} onChange={e => setEditForm({...editForm, password: e.target.value})} />
                  </div>
                ) : (
                  <div style={{ background: 'rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.5rem', marginTop: '0.5rem' }}>
                     {renderChart(user)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
