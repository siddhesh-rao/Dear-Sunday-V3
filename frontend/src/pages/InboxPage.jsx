import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { lettersAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function LetterItem({ letter: init, onRead }) {
  const [letter, setLetter] = useState(init);
  const [open, setOpen] = useState(init.isRead);

  const handleOpen = async () => {
    setOpen(true);
    if (!letter.isRead) {
      try { await lettersAPI.markRead(letter._id); onRead?.(letter._id); setLetter(l => ({ ...l, isRead: true })); } catch {}
    }
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16 }}>
      {!open ? (
        /* Closed envelope */
        <motion.div
          whileHover={{ y: -3, boxShadow: '0 8px 32px rgba(44,32,24,0.14)' }}
          onClick={handleOpen}
          style={{
            background: '#F5F0E8', borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
            border: '1px solid rgba(44,32,24,0.1)', boxShadow: '0 2px 16px rgba(44,32,24,0.07)',
            position: 'relative'
          }}>
          {!letter.isRead && (
            <div style={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', background: '#8B3A2A' }} />
          )}
          {/* Envelope flap */}
          <svg viewBox="0 0 600 80" style={{ width: '100%', display: 'block' }}>
            <polygon points="0,0 600,0 300,65" fill="#E8E0D0" />
            <polygon points="0,0 300,65 0,80" fill="#DDD5C5" />
            <polygon points="600,0 300,65 600,80" fill="#DDD5C5" />
          </svg>
          <div style={{ padding: '8px 32px 28px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#2C2018', marginBottom: 4 }}>
                from <strong>{letter.authorPenName}</strong>
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>
                {letter.prompt?.title?.slice(0, 50)}{letter.prompt?.title?.length > 50 ? '…' : ''}
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#9B8878', marginTop: 4, opacity: 0.7 }}>
                {format(new Date(letter.deliveredAt || letter.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
            {/* Wax seal */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: 'radial-gradient(circle at 38% 35%, #8B5A3A, #5C3018)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 10px rgba(92,48,24,0.4)', fontSize: '1.2rem'
            }}>☀</div>
          </div>
          <div style={{ padding: '4px 32px 12px' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#C4A882', letterSpacing: '0.06em' }}>tap to open →</p>
          </div>
        </motion.div>
      ) : (
        /* Opened letter */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ background: '#FDFAF4', borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(44,32,24,0.09)', boxShadow: '0 4px 24px rgba(44,32,24,0.08)' }}>
          {/* Header */}
          <div style={{ padding: '28px 36px 20px', borderBottom: '1px solid rgba(44,32,24,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.8rem', color: '#6B5744', fontWeight: 600 }}>Dear Reader,</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', marginTop: 4 }}>
                in response to: <em style={{ fontFamily: 'Cormorant Garamond, serif' }}>{letter.prompt?.title}</em>
              </p>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'radial-gradient(circle at 38% 35%, #8B5A3A, #5C3018)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', boxShadow: '0 2px 8px rgba(92,48,24,0.35)' }}>☀</div>
          </div>

          {/* Admin note */}
          {letter.adminNote && (
            <div style={{ margin: '20px 36px 0', padding: '14px 18px', background: 'rgba(196,168,130,0.15)', borderRadius: 10, border: '1px solid rgba(196,168,130,0.3)' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', color: '#6B5744' }}>
                <span style={{ opacity: 0.6 }}>a note from sunday: </span>{letter.adminNote}
              </p>
            </div>
          )}

          {/* Content */}
          <div className="letter-lines" style={{ padding: '20px 36px 28px', minHeight: 200 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', lineHeight: '34px', color: '#2C2018', whiteSpace: 'pre-wrap' }}>
              {letter.content}
            </p>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 36px 28px', borderTop: '1px solid rgba(44,32,24,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.2rem', color: '#9B8878', fontWeight: 500 }}>
              warmly, <span style={{ color: '#6B5744' }}>{letter.authorPenName}</span>
            </p>
            <button onClick={() => setOpen(false)} style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>fold ↑</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function InboxPage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lettersAPI.getMailbox().then(d => setLetters(d.letters || [])).finally(() => setLoading(false));
  }, []);

  const unread = letters.filter(l => !l.isRead).length;
  const handleRead = id => setLetters(prev => prev.map(l => l._id === id ? { ...l, isRead: true } : l));

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 8 }}>Inbox</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,3rem)', color: '#2C2018', fontWeight: 400 }}>
            {unread > 0 ? <>{unread} new {unread === 1 ? 'letter' : 'letters'}</> : 'Your letters'}
          </h1>
          {unread > 0 && (
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#6B5744', marginTop: 6 }}>
              Someone took the time to write to you.
            </p>
          )}
        </motion.div>

        {loading && [1, 2].map(i => <div key={i} style={{ height: 160, borderRadius: 16, background: '#F5F0E8', marginBottom: 16 }} />)}

        {!loading && letters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 16 }}>📭</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.3rem', color: '#6B5744' }}>Your inbox is empty.</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#9B8878', marginTop: 8 }}>Write a letter this Sunday, and one will find its way to you.</p>
          </div>
        )}

        {!loading && letters.map(l => <LetterItem key={l._id} letter={l} onRead={handleRead} />)}
      </div>
    </div>
  );
}
