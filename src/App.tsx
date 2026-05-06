import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Admin from './pages/Admin.tsx';
import Watchlist from './pages/Watchlist.tsx';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />} />
        
        <Route 
          path="/dashboard" 
          element={user && user.role === 'client' ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/admin" 
          element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/markets" 
          element={user ? <Watchlist /> : <Navigate to="/login" />} 
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
