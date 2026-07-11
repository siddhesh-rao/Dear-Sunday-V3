import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { promptsAPI, lettersAPI, participantsAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { format, differenceInSeconds } from 'date-fns';

function Countdown({ deadline }) {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const s = differenceInSeconds(new Date(deadline), new Date());
      if (s <= 0) { setT('Submissions closed'); return; }
      const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600),
            m = Math.floor((s % 3600) / 60), sec = s % 60;
      setT(`${d}d ${h}h ${m}m ${sec}s`);
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [deadline]);
  return <span style={{ fontFamily: 'DM Sans', fontSize: '0.95rem', color: '#6B5744' }}>{t}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(null);
  const [profile, setProfile] = useState(null);
  const [unread, setUnread] = useState(0);
  const [myLetters, setMyLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([promptsAPI.getActive(), participantsAPI.getMe(), lettersAPI.getMy(), lettersAPI.getMailbox()])
      .then(([p, prof, letters, mailbox]) => {
        setPrompt(p.prompt); setProfile(prof.participant);
        setMyLetters(letters.letters || []);
        setUnread((mailbox.letters || []).filter(l => !l.isRead).length);
      }).finally(() => setLoading(false));
  }, []);

  const hasWritten = prompt && myLetters.some(l => l.prompt?._id === prompt._id);

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '88px 24px 60px' }}>

        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 8 }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,3rem)', color: '#2C2018', fontWeight: 400 }}>
            good morning, <em>{user?.penName}</em>.
          </h1>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            { val: profile?.lettersWritten || 0, label: 'letters written' },
            { val: profile?.lettersReceived || 0, label: 'letters received' },
            { val: unread, label: 'unread', highlight: unread > 0 },
          ].map((s, i) => (
            <div key={i} className="paper-card" style={{ padding: '20px 16px', textAlign: 'center', borderColor: s.highlight ? 'rgba(44,32,24,0.15)' : undefined }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', color: s.highlight ? '#2C2018' : '#6B5744', lineHeight: 1 }}>{s.val}</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B8878', marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Active prompt */}
        {loading && <div style={{ height: 200, borderRadius: 16, background: '#F5F0E8', marginBottom: 20 }} />}

        {!loading && prompt && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="paper-card" style={{ padding: '32px 36px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
            {/* Top accent line */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, #C4A882, #9B8878, #C4A882)' }} />
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 12 }}>
              This Sunday's prompt
            </p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: 'clamp(1.4rem,3vw,2rem)', color: '#2C2018', lineHeight: 1.4, marginBottom: 20 }}>
              "{prompt.title}"
            </p>
            {prompt.body && (
              <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B5744', lineHeight: 1.7, marginBottom: 20, opacity: 0.8 }}>{prompt.body}</p>
            )}
            {prompt.submissionDeadline && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid rgba(44,32,24,0.08)' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', letterSpacing: '0.06em' }}>CLOSES IN</p>
                <Countdown deadline={prompt.submissionDeadline} />
              </div>
            )}
            {hasWritten ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.2rem' }}>✉</span>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: '#6B5744' }}>
                  Your letter is sealed. Someone will receive it soon.
                </p>
              </div>
            ) : (
              <Link to="/prompt">
                <button className="btn-dark">Write this week's letter →</button>
              </Link>
            )}
          </motion.div>
        )}

        {!loading && !prompt && (
          <div className="paper-card" style={{ padding: 36, textAlign: 'center', marginBottom: 20, opacity: 0.6 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#6B5744' }}>
              No prompt this Sunday yet. Come back soon.
            </p>
          </div>
        )}

        {/* Unread letter banner */}
        {unread > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Link to="/inbox" style={{ textDecoration: 'none' }}>
              <div className="paper-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', marginBottom: 20, transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <span style={{ fontSize: '1.5rem' }}>💌</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#2C2018' }}>
                    You have {unread} unread {unread === 1 ? 'letter' : 'letters'}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', marginTop: 2 }}>Someone took the time to write to you</p>
                </div>
                <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>Open inbox →</span>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Past letters */}
        {myLetters.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginTop: 40 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 16 }}>Your letters</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {myLetters.slice(0, 5).map(l => (
                <div key={l._id} className="paper-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: '#2C2018', marginBottom: 2 }}>
                      "{l.prompt?.title?.slice(0, 55)}{l.prompt?.title?.length > 55 ? '…' : ''}"
                    </p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>
                      {format(new Date(l.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase',
                    padding: '4px 12px', borderRadius: 20,
                    background: l.status === 'delivered' ? 'rgba(44,32,24,0.08)' : 'rgba(196,168,130,0.25)',
                    color: l.status === 'delivered' ? '#6B5744' : '#9B8878'
                  }}>{l.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
