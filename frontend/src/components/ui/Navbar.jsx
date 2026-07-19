import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Navbar({ transparent = false }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const navStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
    background: transparent ? 'transparent' : 'rgba(237,232,223,0.95)',
    backdropFilter: transparent ? 'none' : 'blur(12px)',
    borderBottom: transparent ? 'none' : '1px solid rgba(44,32,24,0.08)',
    transition: 'all 0.3s',
  };

  return (
    <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={navStyle}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo — Dancing Script like screenshots */}
        <Link to={user ? (role === 'admin' ? '/admin' : '/dashboard') : '/'} style={{ textDecoration: 'none' }}>
          <span style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.5rem', fontWeight: 600, color: transparent ? '#EDE8DF' : '#2C2018', letterSpacing: '0.01em' }}>
            dear sunday
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {!user && (
            <>
              <Link to="/#about" className="nav-link" style={{ color: transparent ? 'rgba(237,232,223,0.8)' : undefined }}>About</Link>
              <Link to="/this-week" className="nav-link" style={{ color: transparent ? 'rgba(237,232,223,0.8)' : undefined }}>Prompt</Link>
              <Link to="/#how" className="nav-link" style={{ color: transparent ? 'rgba(237,232,223,0.8)' : undefined }}>How it works</Link>
              <Link to="/login" className="nav-link" style={{ color: transparent ? 'rgba(237,232,223,0.8)' : undefined }}>Sign in</Link>
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
      </div>
    </motion.nav>
  );
}
