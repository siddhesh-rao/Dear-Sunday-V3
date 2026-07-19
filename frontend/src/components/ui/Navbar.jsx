import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar({ transparent = false }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: transparent && !menuOpen ? 'transparent' : 'rgba(237,232,223,0.95)',
    backdropFilter: transparent && !menuOpen ? 'none' : 'blur(12px)',
    borderBottom: transparent && !menuOpen ? 'none' : '1px solid rgba(44,32,24,0.08)',
    transition: 'all 0.3s',
  };

  const linkColor = transparent && !menuOpen ? 'rgba(237,232,223,0.8)' : undefined;

  return (
    <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={navStyle}>
      {/* Inline style tag to handle the responsive breakpoint since we're not using Tailwind here */}
      <style>{`
        .desktop-nav { display: flex; align-items: center; gap: 32px; }
        .hamburger-btn { display: none; background: none; border: none; cursor: pointer; }
        .mobile-panel { display: none; }

        @media (max-width: 768px) {
          .desktop-nav { display: none; }
          .hamburger-btn { display: flex; }
          .mobile-panel.open {
            display: flex;
            flex-direction: column;
            gap: 16px;
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            background: rgba(237,232,223,0.98);
            backdrop-filter: blur(12px);
            padding: 24px;
            border-bottom: 1px solid rgba(44,32,24,0.08);
          }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to={user ? (role === 'admin' ? '/admin' : '/dashboard') : '/'} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
          <span style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.5rem', fontWeight: 600, color: transparent && !menuOpen ? '#EDE8DF' : '#2C2018', letterSpacing: '0.01em' }}>
            dear sunday
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="desktop-nav">
          {!user && (
            <>
              <Link to="/#about" className="nav-link" style={{ color: linkColor }}>About</Link>
              <Link to="/this-week" className="nav-link" style={{ color: linkColor }}>Prompt</Link>
              <Link to="/#how" className="nav-link" style={{ color: linkColor }}>How it works</Link>
              <Link to="/login" className="nav-link" style={{ color: linkColor }}>Sign in</Link>
              <Link to="/signup">
                <button className="btn-dark" style={{ padding: '10px 22px', fontSize: '10px' }}>Join the circle</button>
              </Link>
            </>
          )}

          {user && role === 'participant' && (
            <>
              <Link to="/this-week" className="nav-link">Prompt</Link>
              <Link to="/inbox"     className="nav-link">Inbox</Link>
              <Link to="/archive"   className="nav-link">Archive</Link>
              <Link to="/profile"   className="nav-link">Profile</Link>
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
            </>
          )}

          {user && role === 'admin' && (
            <>
              <Link to="/admin"         className="nav-link">Dashboard</Link>
              <Link to="/admin/pairing" className="nav-link">Pairings</Link>
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Sign out</button>
            </>
          )}
        </div>

        {/* Hamburger button — mobile only */}
        <button className="hamburger-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
          {menuOpen ? <X size={24} color="#2C2018" /> : <Menu size={24} color={transparent ? '#EDE8DF' : '#2C2018'} />}
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <div className={`mobile-panel ${menuOpen ? 'open' : ''}`}>
        {!user && (
          <>
            <Link to="/#about" className="nav-link" onClick={() => setMenuOpen(false)}>About</Link>
            <Link to="/this-week" className="nav-link" onClick={() => setMenuOpen(false)}>Prompt</Link>
            <Link to="/#how" className="nav-link" onClick={() => setMenuOpen(false)}>How it works</Link>
            <Link to="/login" className="nav-link" onClick={() => setMenuOpen(false)}>Sign in</Link>
            <Link to="/signup" onClick={() => setMenuOpen(false)}>
              <button className="btn-dark" style={{ padding: '10px 22px', fontSize: '10px' }}>Join the circle</button>
            </Link>
          </>
        )}

        {user && role === 'participant' && (
          <>
            <Link to="/this-week" className="nav-link" onClick={() => setMenuOpen(false)}>Prompt</Link>
            <Link to="/inbox"     className="nav-link" onClick={() => setMenuOpen(false)}>Inbox</Link>
            <Link to="/archive"   className="nav-link" onClick={() => setMenuOpen(false)}>Archive</Link>
            <Link to="/profile"   className="nav-link" onClick={() => setMenuOpen(false)}>Profile</Link>
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Sign out</button>
          </>
        )}

        {user && role === 'admin' && (
          <>
            <Link to="/admin"         className="nav-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/admin/pairing" className="nav-link" onClick={() => setMenuOpen(false)}>Pairings</Link>
            <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>Sign out</button>
          </>
        )}
      </div>
    </motion.nav>
  );
}