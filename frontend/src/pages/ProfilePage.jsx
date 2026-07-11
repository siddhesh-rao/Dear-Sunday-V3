import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { participantsAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    participantsAPI.getMe().then(d => { setProfile(d.participant); setBio(d.participant.bio || ''); });
  }, []);

  const saveBio = async () => {
    setSaving(true);
    try { await participantsAPI.updateBio(bio); setProfile(p => ({ ...p, bio })); setEditing(false); toast.success('Saved'); }
    catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  if (!profile) return <div style={{ minHeight: '100vh', background: '#EDE8DF' }}><Navbar /></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 520, margin: '0 auto', padding: '88px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="paper-card" style={{ padding: '40px 36px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'radial-gradient(circle at 38% 35%, #8B5A3A, #5C3018)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.4rem', boxShadow: '0 4px 16px rgba(92,48,24,0.3)' }}>☀</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '2rem', color: '#2C2018', marginBottom: 4, fontWeight: 400 }}>{profile.penName}</h2>
            <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', letterSpacing: '0.06em' }}>joined {format(new Date(profile.joinedAt), 'MMMM yyyy')}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 28 }}>
              {[{ v: profile.lettersWritten, l: 'written' }, { v: profile.lettersReceived, l: 'received' }].map((s, i) => (
                <div key={i}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', color: '#2C2018', lineHeight: 1 }}>{s.v}</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B8878', marginTop: 4 }}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="paper-card" style={{ padding: '24px 28px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9B8878' }}>About {profile.penName}</p>
              {!editing && <button onClick={() => setEditing(true)} style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#6B5744', background: 'none', border: 'none', cursor: 'pointer' }}>edit</button>}
            </div>
            {editing ? (
              <div>
                <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={4}
                  style={{ width: '100%', background: '#EDE8DF', border: '1px solid rgba(44,32,24,0.12)', borderRadius: 10, padding: '12px 14px', fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: '#2C2018', resize: 'none', outline: 'none', lineHeight: 1.6 }}
                  placeholder="A few words about yourself…" />
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <button onClick={saveBio} disabled={saving} className="btn-dark" style={{ padding: '8px 20px', fontSize: '10px' }}>{saving ? 'Saving…' : 'Save'}</button>
                  <button onClick={() => setEditing(false)} style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', color: profile.bio ? '#2C2018' : '#9B8878', lineHeight: 1.6 }}>
                {profile.bio || 'No bio yet.'}
              </p>
            )}
          </div>

          <div style={{ background: 'rgba(44,32,24,0.04)', borderRadius: 12, padding: '14px 20px', marginBottom: 20, border: '1px dashed rgba(44,32,24,0.12)' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>🔒 Your real name <strong style={{ color: '#6B5744' }}>{profile.realName}</strong> is only visible to the admin.</p>
          </div>

          <button onClick={logout} style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'rgba(44,32,24,0.06)', border: '1px solid rgba(44,32,24,0.1)', fontFamily: 'DM Sans', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B8878', cursor: 'pointer' }}>
            Sign out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
