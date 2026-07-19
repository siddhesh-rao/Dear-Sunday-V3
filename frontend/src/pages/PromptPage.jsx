import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { promptsAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import { format, differenceInSeconds } from 'date-fns';

function Countdown({ deadline }) {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const s = differenceInSeconds(new Date(deadline), new Date());
      if (s <= 0) { setT('Submissions closed'); return; }
      const d = Math.floor(s / 86400),
            h = Math.floor((s % 86400) / 3600),
            m = Math.floor((s % 3600) / 60),
            sec = s % 60;
      setT(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${sec}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);
  return (
    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#6B5744' }}>
      {t}
    </span>
  );
}

export default function PromptPage() {
  const { user, role } = useAuth();
  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promptsAPI.getActive()
      .then(d => setPrompt(d.prompt))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 80px' }}>

        {/* Page heading */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#9B8878', marginBottom: 10,
          }}>
            {format(new Date(), 'EEEE, MMMM d · yyyy')}
          </p>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif', fontWeight: 400,
            fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#2C2018', lineHeight: 1.1,
          }}>
            this week's prompt
          </h1>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div style={{ height: 260, borderRadius: 20, background: '#F5F0E8', marginBottom: 20, opacity: 0.6 }} />
        )}

        {/* No active prompt */}
        {!loading && !prompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="paper-card"
            style={{ padding: '48px 36px', textAlign: 'center', opacity: 0.6 }}>
            <p style={{ fontSize: '2rem', marginBottom: 16 }}>✉</p>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
              fontSize: '1.4rem', color: '#6B5744', marginBottom: 10,
            }}>
              No prompt this Sunday yet.
            </p>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#9B8878', lineHeight: 1.7 }}>
              The circle opens every Sunday morning.<br />Come back soon.
            </p>
          </motion.div>
        )}

        {/* Active prompt */}
        {!loading && prompt && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>

            {/* Main prompt card */}
            <div className="paper-card" style={{
              padding: '40px 40px 36px',
              position: 'relative', overflow: 'hidden',
              marginBottom: 20,
            }}>
              {/* Top gold accent line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg, #C4A882, #9B8878 50%, #C4A882)',
              }} />

              {/* Sunday number */}
              <p style={{
                fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#9B8878', marginBottom: 20,
              }}>
                Sunday letter
              </p>

              {/* The actual prompt */}
              <p style={{
                fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', color: '#2C2018',
                lineHeight: 1.35, marginBottom: 24,
              }}>
                "{prompt.title}"
              </p>

              {/* Optional body/context */}
              {prompt.body && (
                <p style={{
                  fontFamily: 'DM Sans', fontSize: '0.9rem', color: '#6B5744',
                  lineHeight: 1.8, marginBottom: 28,
                  paddingTop: 20, borderTop: '1px solid rgba(44,32,24,0.08)',
                }}>
                  {prompt.body}
                </p>
              )}

              {/* Deadline countdown */}
              {prompt.submissionDeadline && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  paddingTop: 20, borderTop: '1px solid rgba(44,32,24,0.08)',
                  marginBottom: 28,
                }}>
                  <p style={{
                    fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#9B8878',
                  }}>
                    Closes in
                  </p>
                  <Countdown deadline={prompt.submissionDeadline} />
                </div>
              )}

              {/* CTA based on auth state */}
              {!user && (
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link to="/signup">
                    <button className="btn-dark">Join the circle →</button>
                  </Link>
                  <Link to="/login">
                    <button className="btn-ghost">Sign in</button>
                  </Link>
                </div>
              )}

              {user && role === 'participant' && (
                <Link to="/prompt">
                  <button className="btn-dark">Write this week's letter →</button>
                </Link>
              )}
            </div>

            {/* Gentle note below */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                fontSize: '1rem', color: '#9B8878', lineHeight: 1.7,
              }}>
                Your letter will be written under your pen name.<br />
                Someone in the circle will receive it. A week later, one arrives for you.
              </p>
            </motion.div>

          </motion.div>
        )}

        {/* Past prompts hint */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ marginTop: 60, paddingTop: 40, borderTop: '1px solid rgba(44,32,24,0.08)' }}>
            <p style={{
              fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#9B8878', marginBottom: 20,
              textAlign: 'center',
            }}>
              Some prompts from the circle
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'write a letter to the version of you from five years ago.',
                'the smallest joy of your week — the one you almost didn\'t notice.',
                'a place you keep returning to in your mind.',
                'what you have not said out loud, and why.',
                'a love letter to a stranger you\'ll never meet.',
              ].map((p, i) => (
                <div key={i} style={{
                  padding: '14px 20px',
                  background: '#F5F0E8',
                  borderRadius: 12,
                  border: '1px solid rgba(44,32,24,0.07)',
                }}>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic',
                    fontSize: '1rem', color: '#6B5744',
                  }}>
                    "{p}"
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
