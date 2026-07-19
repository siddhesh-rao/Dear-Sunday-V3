import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lettersAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { ChevronDown } from 'lucide-react';

function LetterRow({ letter, index }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      key={letter._id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      style={{ marginBottom: 12 }}
    >
      {/* Header row — always visible, clickable */}
      <div
        onClick={() => setOpen(o => !o)}
        className="paper-card"
        style={{
          padding: '20px 24px',
          cursor: 'pointer',
          borderRadius: open ? '16px 16px 0 0' : 16,
          borderBottom: open ? '1px solid rgba(44,32,24,0.06)' : undefined,
          transition: 'all 0.2s',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
              fontSize: '1.05rem', color: '#2C2018', marginBottom: 4,
            }}>
              "{letter.prompt?.title?.slice(0, 70)}{letter.prompt?.title?.length > 70 ? '…' : ''}"
            </p>
            <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>
              {format(new Date(letter.createdAt), 'MMMM d, yyyy')}
              {letter.content && (
                <span style={{ marginLeft: 10, opacity: 0.6 }}>
                  {letter.content.trim().split(/\s+/).length} words
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{
              fontFamily: 'DM Sans', fontSize: '10px', textTransform: 'uppercase',
              letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 20,
              background: letter.status === 'delivered' ? 'rgba(44,32,24,0.08)' : 'rgba(196,168,130,0.2)',
              color: letter.status === 'delivered' ? '#6B5744' : '#9B8878',
            }}>
              {letter.status}
            </span>
            <ChevronDown
              size={15}
              style={{
                color: '#9B8878',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.25s',
              }}
            />
          </div>
        </div>
      </div>

      {/* Expanded letter content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: '#FDFAF4',
              border: '1px solid rgba(44,32,24,0.09)',
              borderTop: 'none',
              borderRadius: '0 0 16px 16px',
              overflow: 'hidden',
            }}>
              {/* Letter heading */}
              <div style={{
                padding: '20px 32px 16px',
                borderBottom: '1px solid rgba(44,32,24,0.07)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.5rem', color: '#6B5744', fontWeight: 600 }}>
                  Dear Stranger,
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#9B8878', textAlign: 'right' }}>
                  written as<br />
                  <em style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.95rem', color: '#6B5744' }}>
                    {user?.penName}
                  </em>
                </p>
              </div>

              {/* Letter body with lined paper */}
              <div
                className="letter-lines"
                style={{ padding: '16px 32px 28px', minHeight: 160 }}
              >
                {letter.content ? (
                  <p style={{
                    fontFamily: 'Cormorant Garamond, Georgia, serif',
                    fontSize: '1.1rem', lineHeight: '34px',
                    color: '#2C2018', whiteSpace: 'pre-wrap',
                  }}>
                    {letter.content}
                  </p>
                ) : (
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                    fontSize: '1rem', color: '#9B8878', opacity: 0.6,
                    lineHeight: '34px',
                  }}>
                    Letter content not available.
                  </p>
                )}
              </div>

              {/* Letter footer */}
              <div style={{
                padding: '14px 32px 22px',
                borderTop: '1px solid rgba(44,32,24,0.07)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.1rem', color: '#9B8878', fontWeight: 500 }}>
                  warmly, <span style={{ color: '#6B5744' }}>{user?.penName}</span>
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>
                  {format(new Date(letter.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function ArchivePage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lettersAPI.getMy()
      .then(d => setLetters(d.letters || []))
      .catch(() => setLetters([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 60px' }}>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 8 }}>Archive</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,3rem)', color: '#2C2018', fontWeight: 400 }}>
            Letters you've written
          </h1>
          {letters.length > 0 && (
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: '#9B8878', marginTop: 6 }}>
              {letters.length} {letters.length === 1 ? 'letter' : 'letters'} — click any to read it
            </p>
          )}
        </motion.div>

        {/* Loading skeletons */}
        {loading && [1, 2, 3].map(i => (
          <div key={i} style={{ height: 80, borderRadius: 14, background: '#F5F0E8', marginBottom: 12, opacity: 1 - i * 0.2 }} />
        ))}

        {/* Empty state */}
        {!loading && letters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <p style={{ fontSize: '2rem', marginBottom: 16 }}>✍</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.3rem', color: '#6B5744' }}>
              Nothing here yet.
            </p>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#9B8878', marginTop: 8 }}>
              Write your first letter this Sunday.
            </p>
          </div>
        )}

        {/* Letter list */}
        {!loading && letters.map((l, i) => (
          <LetterRow key={l._id} letter={l} index={i} />
        ))}
      </div>
    </div>
  );
}

export default ArchivePage;
