import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProfileManager from './components/ProfileManager';

const statusStyles = {
  NEW: 'bg-sky-600',
  ONGOING: 'bg-amber-500',
  COMPLETED: 'bg-violet-600',
  CLAIMABLE: 'bg-emerald-600',
  ENDED: 'bg-slate-600',
};

const columns = [
  { key: 'NEW', label: 'New Airdrops' },
  { key: 'ONGOING', label: 'Ongoing Farming' },
  { key: 'COMPLETED', label: 'Completed (Waiting Claim)' },
  { key: 'CLAIMABLE', label: 'Claimable Now' },
  { key: 'ENDED', label: 'Ended' },
];

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100">
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
