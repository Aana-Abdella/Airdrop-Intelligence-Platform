import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfileManager from './components/ProfileManager';
import AirdropTracker from './components/AirdropTracker';
import Operations from './components/Operations';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const handleExpiredAuth = () => setUser(null);
    window.addEventListener('auth:expired', handleExpiredAuth);
    return () => window.removeEventListener('auth:expired', handleExpiredAuth);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b12] text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400/20 border-t-indigo-400" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-600">Securing workspace</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#080b12] text-slate-100">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login onLogin={login} />}
          />
          <Route
            path="/"
            element={user ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profiles"
            element={user ? <ProfileManager user={user} onLogout={logout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/airdrops"
            element={user ? <AirdropTracker user={user} onLogout={logout} /> : <Navigate to="/login" />}
          />
          <Route path="/tasks" element={user ? <Operations view="tasks" user={user} onLogout={logout} /> : <Navigate to="/login" />} />
          <Route path="/notifications" element={user ? <Operations view="notifications" user={user} onLogout={logout} /> : <Navigate to="/login" />} />
          <Route path="/security" element={user ? <Operations view="security" user={user} onLogout={logout} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={user ? '/' : '/login'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
