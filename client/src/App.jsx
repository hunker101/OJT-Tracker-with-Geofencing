import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DTR from './pages/DTR';
import Sites from './pages/Sites';
import Holidays from './pages/Holidays';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '17px',
          color: 'var(--text-primary)',
          textDecoration: 'none',
          letterSpacing: '-0.5px',
          marginRight: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            width: 30, height: 30,
            background: 'linear-gradient(135deg, #60B1FF 0%, #0084FF 100%)',
            borderRadius: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.3), 0 2px 8px rgba(0,132,255,0.35)',
            flexShrink: 0,
          }}>
            <svg width="16" height="16" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          OJT Tracker
        </Link>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: 'rgba(0,0,0,0.1)', margin: '0 4px' }} />

        {/* Nav links */}
        {[{ to: '/', label: 'Dashboard' }, { to: '/dtr', label: 'DTR Report' }, { to: '/sites', label: 'Sites' }, { to: '/holidays', label: 'Holidays' }].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: '14px',
            textDecoration: 'none',
            padding: '7px 14px',
            borderRadius: '10px',
            color: location.pathname === to ? 'var(--blue-primary-solid)' : 'var(--text-secondary)',
            background: location.pathname === to ? 'rgba(0,132,255,0.08)' : 'transparent',
            transition: 'all 0.2s ease',
          }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      {/* Background glow layer */}
      <div className="bg-glow" />

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dtr" element={<DTR />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/holidays" element={<Holidays />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
