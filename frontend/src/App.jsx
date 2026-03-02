import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import ProfileForm from './pages/ProfileForm';
import Dashboard from './pages/Dashboard';
import Compare from './pages/Compare';
import SchemeDetail from './pages/SchemeDetail';
import Roadmap from './pages/Roadmap';
import Tracker from './pages/Tracker';
import Scholarships from './pages/Scholarships';
import Login from './pages/Login';
import Register from './pages/Register';

import ChatInterface from './components/ChatInterface';
import AdminPanel from './pages/AdminPanel';

// Mock context for simplified global state if needed later
export const UserContext = React.createContext();

function App() {
  const [user, setUser] = React.useState(null);

  // We rely on local storage for initial simple auth mocking
  React.useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <div className="min-h-screen flex flex-col font-sans bg-white">
          <Header />
          <main className="flex-1" style={{ backgroundColor: '#F8FAFC' }}>
            <Routes>
              {/* If no user logged in, they can see landing. But for hackathon let's just make everything accessible so reviewing is easy */}
              <Route path="/" element={<Landing />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/eligible" element={<Dashboard />} />
              <Route path="/dashboard" element={<Navigate to="/eligible" replace />} />
              
              <Route path="/profile" element={<ProfileForm />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/scheme/:id" element={<SchemeDetail />} />
              <Route path="/roadmap/:id" element={<Roadmap />} />
              <Route path="/tracker" element={<Tracker />} />
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/chat" element={<ChatInterface />} />
              <Route path="/admin" element={<AdminPanel />} />
              
              {/* Auth related, we leave the previous login/register for compatibility but rely on new structure */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
