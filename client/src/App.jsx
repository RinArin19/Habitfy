import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import UserDashboard from './pages/user/UserDashboard';
import UserLogin from './pages/user/UserLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';
import Chatbot from './components/Chatbot';
import { LogOut } from 'lucide-react';

function Navigation({ user, adminToken, onLogout }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="glass nav-bar animate-slide-up">
      <Link to="/" style={{textDecoration: 'none'}}><h2>HabitiFy 🚀</h2></Link>
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center' }}>
        {isAdminRoute ? (
           adminToken ? (
             <>
               <span style={{color: 'var(--primary)', fontWeight: 'bold', marginRight: '1rem'}}>Admin Mode</span>
               <button className="btn-icon" onClick={() => onLogout('admin')} title="Logout" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>
                 <LogOut size={18} />
               </button>
             </>
           ) : null
        ) : (
           user ? (
             <>
               <span style={{marginRight: '1rem', color: '#64748b'}}>Hi, {user.username}</span>
               <button className="btn-icon" onClick={() => onLogout('user')} title="Logout" style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444'}}>
                 <LogOut size={18} />
               </button>
             </>
           ) : null
        )}
      </div>
    </nav>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username });
    }
    
    const handleStorageChange = () => {
      setAdminToken(localStorage.getItem('adminToken'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = (type) => {
    if (type === 'user') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('username');
      setUser(null);
    } else {
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      window.location.href = '/admin'; // Force reload admin state
    }
  };

  return (
    <Router>
      <div className="app-container">
        <Navigation user={user} adminToken={adminToken} onLogout={handleLogout} />

        <main>
          <Routes>
            <Route path="/" element={
               user ? <UserDashboard user={user} /> : <UserLogin onLoginSuccess={setUser} />
            } />
            <Route path="/admin" element={<AdminDashboard onAdminChange={setAdminToken} />} />
          </Routes>
        </main>
        
        <Chatbot />
      </div>
    </Router>
  );
}

export default App;
