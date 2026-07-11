import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  background: '#F5F0E8', border: '1px solid rgba(44,32,24,0.12)',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#2C2018', outline: 'none',
};
const labelStyle = {
  fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.1em',
  textTransform: 'uppercase', color: '#9B8878', display: 'block', marginBottom: 6,
};

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await loginAdmin(email, password); navigate('/admin'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.8rem', fontWeight: 600, color: '#2C2018', textDecoration: 'none' }}>
            dear sunday
          </Link>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#9B8878', marginTop: 6 }}>admin</p>
        </div>
        <div className="paper-card" style={{ padding: '36px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="admin@dearsunday.app" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', opacity: 0.6, textDecoration: 'none' }}>← back to dear sunday</Link>
        </p>
      </motion.div>
    </div>
  );
}
