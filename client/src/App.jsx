import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DTR from './pages/DTR';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'bg-blue-700 text-white' : 'text-blue-100 hover:bg-blue-700 hover:text-white';

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-white font-black text-xl tracking-tight flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                OJT Tracker
            </span>
          </div>
          <div className="flex space-x-1">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive('/')}`}>
              Dashboard
            </Link>
            <Link to="/dtr" className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isActive('/dtr')}`}>
              DTR Report
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dtr" element={<DTR />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
