import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { promptsAPI, lettersAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function WritePage() {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState(null);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    promptsAPI.getActive().then(d => setPrompt(d.prompt)).finally(() => setLoading(false));
  }, []);

  const charCount = content.length;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const isValid = charCount >= 50 && charCount <= 5000;

  const handleSubmit = async () => {
    if (!isValid) { toast.error('Write at least 50 characters.'); return; }
    setSending(true);
    try {
      await lettersAPI.submit({ promptId: prompt._id, content });
      setSubmitted(true);
    } catch (err) { toast.error(err.message); }
    finally { setSending(false); }
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', maxWidth: 480 }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ fontSize: '3rem', marginBottom: 24 }}>✉</motion.div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', color: '#2C2018', marginBottom: 16, fontWeight: 400 }}>
          your letter is sealed.
        </h2>
        <p style={{ fontFamily: 'DM Sans', fontSize: '0.95rem', color: '#6B5744', lineHeight: 1.8, marginBottom: 32 }}>
          It will find its way to someone in the circle. The following Sunday, one written for you will arrive in your inbox.
        </p>
        <a href="/dashboard"><button className="btn-dark">Back to home →</button></a>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 60px' }}>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 8 }}>Prompt</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem,4vw,2.5rem)', color: '#2C2018', fontWeight: 400 }}>Write this week's letter</h1>
        </motion.div>

        {loading && <div style={{ height: 100, borderRadius: 12, background: '#F5F0E8', marginBottom: 24 }} />}

        {!loading && !prompt && (
          <div className="paper-card" style={{ padding: 32, textAlign: 'center', opacity: 0.6 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#6B5744' }}>No active prompt right now. Come back on Sunday.</p>
          </div>
        )}

        {!loading && prompt && (
          <>
            {/* Prompt card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ background: '#F5F0E8', borderRadius: 14, padding: '20px 24px', marginBottom: 28, border: '1px solid rgba(44,32,24,0.08)' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 8 }}>This Sunday's prompt</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.35rem', color: '#2C2018', lineHeight: 1.5 }}>"{prompt.title}"</p>
              {prompt.body && <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B5744', marginTop: 10, lineHeight: 1.6, opacity: 0.8 }}>{prompt.body}</p>}
            </motion.div>

            {/* Letter paper */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="paper-card" style={{ overflow: 'hidden', marginBottom: 16 }}>
              {/* Letter header */}
              <div style={{ padding: '24px 32px 16px', borderBottom: '1px solid rgba(44,32,24,0.07)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.6rem', color: '#6B5744', fontWeight: 600 }}>Dear Stranger,</p>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#9B8878', letterSpacing: '0.06em' }}>writing as</p>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', color: '#6B5744' }}>{user?.penName}</p>
                  </div>
                </div>
              </div>

              {/* Lined writing area */}
              <div className="letter-lines" style={{ padding: '8px 32px 24px', minHeight: 320 }}>
                <textarea
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  maxLength={5000}
                  placeholder="Begin here. Write freely. This person will never know your real name…"
                  style={{
                    width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none',
                    fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '1.1rem',
                    lineHeight: '34px', color: '#2C2018', minHeight: 306, paddingTop: 8,
                  }}
                />
              </div>

              {/* Letter footer */}
              <div style={{ padding: '16px 32px 24px', borderTop: '1px solid rgba(44,32,24,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.2rem', color: '#9B8878', fontWeight: 500 }}>
                  warmly, <span style={{ color: '#6B5744' }}>{user?.penName}</span>
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>
                  {format(new Date(), 'MMMM d, yyyy')}
                </p>
              </div>
            </motion.div>

            {/* Word/char count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '0 4px' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: charCount < 50 ? '#C4A882' : '#9B8878' }}>
                {charCount < 50 ? `${50 - charCount} more characters to go…` : `${wordCount} words`}
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: charCount > 4500 ? '#8B3A2A' : '#9B8878' }}>
                {charCount} / 5000
              </p>
            </div>

            <button onClick={handleSubmit} disabled={!isValid || sending} className="btn-dark"
              style={{ width: '100%', justifyContent: 'center', opacity: isValid ? 1 : 0.4, fontSize: '11px', padding: '14px' }}>
              {sending ? 'Sealing your letter…' : 'Seal and send ✉'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
