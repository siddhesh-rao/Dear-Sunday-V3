import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', padding: '13px 16px', borderRadius: 12,
  background: '#F5F0E8', border: '1px solid rgba(44,32,24,0.12)',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.9rem', color: '#2C2018',
  outline: 'none', transition: 'border-color 0.2s',
};
const labelStyle = {
  fontFamily: 'DM Sans, sans-serif', fontSize: '10px',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#9B8878', display: 'block', marginBottom: 6,
};

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginParticipant } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await loginParticipant(email, password); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.8rem', fontWeight: 600, color: '#2C2018', textDecoration: 'none' }}>dear sunday</Link>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#6B5744', marginTop: 8 }}>welcome back</p>
        </div>
        <div className="paper-card" style={{ padding: '36px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} placeholder="your@email.com" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={inputStyle} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? 'Opening the door…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(44,32,24,0.08)' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B8878', textAlign: 'center', marginBottom: 10 }}>
              Looking for the admin entrance?
            </p>
            <Link
              to="/admin/login"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: '1px solid rgba(44,32,24,0.12)',
                color: '#2C2018',
                textDecoration: 'none',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '0.9rem',
                background: 'rgba(245,240,232,0.6)',
              }}
            >
              Admin login →
            </Link>
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#9B8878' }}>
          New here? <Link to="/signup" style={{ color: '#2C2018', fontWeight: 500 }}>Join the circle</Link>
        </p>
      </motion.div>
    </div>
  );
}

export function Signup() {
  const [form, setForm] = useState({ realName: '', penName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try { await signup(form); toast.success(`welcome, ${form.penName} ✉`); navigate('/dashboard'); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.8rem', fontWeight: 600, color: '#2C2018', textDecoration: 'none' }}>dear sunday</Link>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#6B5744', marginTop: 8 }}>choose your pen name</p>
        </div>
        <div className="paper-card" style={{ padding: '36px 32px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Your real name <span style={{ opacity: 0.5 }}>(admin-only)</span></label>
              <input value={form.realName} onChange={set('realName')} required style={inputStyle} placeholder="Your actual name" />
            </div>
            <div>
              <label style={labelStyle}>Pen name</label>
              <input value={form.penName} onChange={set('penName')} required style={inputStyle} placeholder="e.g. sparrowfoot, iron & honey" />
              <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', marginTop: 5 }}>This is who you are in the circle. Choose something that feels like you.</p>
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={form.email} onChange={set('email')} required style={inputStyle} placeholder="your@email.com" />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={form.password} onChange={set('password')} required style={inputStyle} placeholder="At least 6 characters" />
            </div>
            <button type="submit" disabled={loading} className="btn-dark" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {loading ? 'Entering the circle…' : 'Join the circle →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#9B8878' }}>
          Already here? <Link to="/login" style={{ color: '#2C2018', fontWeight: 500 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
