import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import { ChevronDown } from 'lucide-react';

const PROMPTS = [
  { no: 12, text: 'to the version of you 5 years ago' },
  { no: 11, text: 'the smallest joy of your week' },
  { no: 10, text: 'a place you return to in dreams' },
  { no: 9,  text: 'what you have not said out loud' },
  { no: 8,  text: 'a love letter to a stranger' },
  { no: 7,  text: 'the thing you keep almost saying' },
];

const TESTIMONIALS = [
  { quote: 'I have never written to a stranger before. I did not know a stranger could sound so much like a friend I was still looking for.', pen: 'sparrowfoot' },
  { quote: 'Sundays used to feel heavy. Now they feel like a small, warm hand on my shoulder.', pen: 'iron & honey' },
  { quote: 'It is the first thing on the internet in a long time that felt like a letter should feel.', pen: 'seven of cups' },
];

const FAQS = [
  { q: 'What is Dear Sunday?', a: 'Dear Sunday is a weekly letter-writing ritual. Every Sunday, you receive a prompt. You write a letter under your pen name. The following Sunday, a letter written for you arrives in your inbox — from someone else in the circle, in response to the same prompt.' },
  { q: 'Is it really anonymous?', a: 'Yes. Your real name is never shown to other participants. Only the admin sees your real name for account purposes. Everyone else knows you only by your pen name.' },
  { q: 'How are pairs chosen?', a: 'The admin manually pairs letters each week — ensuring you never receive your own letter back, and thoughtfully matching writers across the circle.' },
  { q: 'Can I skip a week?', a: 'Of course. There is no obligation. If you don\'t submit a letter, you simply won\'t receive one that week. The circle continues either way.' },
  { q: 'Where do the letters live?', a: 'Letters you receive live in your Inbox, forever. Letters you\'ve written appear in your Archive. Nothing disappears.' },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        background: '#F5F0E8', borderRadius: 14, padding: '20px 24px',
        border: '1px solid rgba(44,32,24,0.08)', cursor: 'pointer',
        marginBottom: 10, transition: 'all 0.2s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#2C2018' }}>{q}</p>
        <ChevronDown size={16} style={{ color: '#9B8878', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 16 }} />
      </div>
      {open && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '0.875rem', color: '#6B5744', lineHeight: 1.7, marginTop: 12 }}>
          {a}
        </motion.p>
      )}
    </div>
  );
}

function KraftEnvelope({ no, text, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      style={{ flexShrink: 0, width: 220 }}
    >
      {/* Letter peeking above envelope */}
      <div style={{
        background: '#FDFAF4', borderRadius: '8px 8px 0 0',
        border: '1px solid rgba(196,168,130,0.4)',
        padding: '14px 16px 10px',
        marginBottom: -2,
        boxShadow: '0 -2px 12px rgba(44,32,24,0.06)'
      }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 6 }}>sunday no. {no}</p>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', color: '#2C2018', lineHeight: 1.4 }}>{text}</p>
        <div style={{ marginTop: 10 }}>
          {[100, 80, 90].map((w, i) => (
            <div key={i} style={{ height: 1, background: 'rgba(44,32,24,0.1)', borderRadius: 2, marginBottom: 5, width: `${w}%` }} />
          ))}
        </div>
      </div>
      {/* Kraft envelope body */}
      <div style={{ background: '#C4A882', borderRadius: '0 0 10px 10px', height: 60, position: 'relative', overflow: 'hidden' }}>
        {/* Envelope flap lines */}
        <svg viewBox="0 0 220 60" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          <polygon points="0,0 110,35 220,0" fill="#B09268" opacity="0.6" />
          <polygon points="0,60 110,35 220,60" fill="rgba(0,0,0,0.05)" />
        </svg>
      </div>
    </motion.div>
  );
}

export default function Landing() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);

  useEffect(() => {
    if (user && role === 'participant') navigate('/dashboard');
    if (user && role === 'admin') navigate('/admin');
  }, [user]);

  return (
    <div style={{ background: '#EDE8DF', minHeight: '100vh' }}>
      <Navbar transparent={true} />

      {/* HERO — full bleed sunset gradient like screenshot 1 */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden' }}>
        {/* Gradient background matching the purple→pink sunset */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, #8B7BB5 0%, #A47EA8 20%, #C4847A 50%, #D4956A 75%, #C4906A 100%)',
        }} />
        {/* Subtle overlay for text legibility */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(20,10,5,0.15)' }} />

        <motion.div style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(237,232,223,0.75)', marginBottom: 24 }}>
            A weekly letter-writing ritual
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.05, marginBottom: 28, maxWidth: 800 }}>
            a letter, <em>every sunday</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1rem', color: 'rgba(237,232,223,0.85)', lineHeight: 1.8, maxWidth: 480, marginBottom: 40 }}>
            Each Sunday, a prompt. You write, anonymously, under a pen name. Your letter reaches someone. A week later, one arrives for you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/signup"><button className="btn-dark">Join the circle</button></Link>
            <a href="#prompt"><button className="btn-ghost">Read this week's prompt</button></a>
          </motion.div>

          {/* Floating letter card peek — like screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.7 }}
            style={{
              position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
              background: '#FDFAF4', borderRadius: '12px 12px 0 0', padding: '16px 24px 0',
              width: 280, boxShadow: '0 -4px 30px rgba(44,32,24,0.15)',
              border: '1px solid rgba(196,168,130,0.3)', borderBottom: 'none'
            }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 6 }}>sunday no. 12</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: '#2C2018' }}>a letter to you, five years ago</p>
            <div style={{ marginTop: 12, paddingBottom: 12 }}>
              {[100, 85, 95, 70].map((w, i) => (
                <div key={i} style={{ height: 1, background: 'rgba(44,32,24,0.1)', marginBottom: 6, width: `${w}%`, borderRadius: 2 }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{ padding: '100px 24px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 32 }}>
          What is dear sunday?
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#2C2018', lineHeight: 1.2, fontWeight: 400 }}>
          Dear Sunday is a slow, weekly ritual. One prompt. One letter. One stranger who is, for a week, waiting to hear from <em>you</em>.
        </motion.h2>
      </section>

      {/* HOW IT WORKS — 3 photo cards like screenshots */}
      <section id="how" style={{ padding: '0 24px 100px' }}>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B8878', textAlign: 'center', marginBottom: 40 }}>
          How it works
        </motion.p>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              step: 1, icon: '✉', title: 'receive the prompt',
              desc: 'Every Sunday morning, a single prompt lands. Short. Honest. Something worth sitting with.',
              gradient: 'linear-gradient(160deg, #C4956A 0%, #8B6A3A 100%)',
              overlay: 'rgba(60,35,10,0.35)'
            },
            {
              step: 2, icon: '✒', title: 'write, anonymously',
              desc: 'Sign in as your pen name. Write what feels true. Nobody sees it but the person it was meant for.',
              gradient: 'linear-gradient(160deg, #7B6FA8 0%, #9B7B9A 50%, #C48A7A 100%)',
              overlay: 'rgba(30,20,50,0.3)'
            },
            {
              step: 3, icon: '✦', title: 'a letter arrives',
              desc: 'The following Sunday, one written for you appears in your inbox. From a stranger. About the same prompt.',
              gradient: 'linear-gradient(160deg, #4A6080 0%, #7A8A9A 50%, #9A7A6A 100%)',
              overlay: 'rgba(20,30,50,0.35)'
            },
          ].map(({ step, icon, title, desc, gradient, overlay }, i) => (
            <motion.div key={step}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.12 }}
              style={{ borderRadius: 20, overflow: 'hidden', minHeight: 380, position: 'relative', background: gradient }}>
              <div style={{ position: 'absolute', inset: 0, background: overlay }} />
              <div style={{ position: 'relative', padding: 28, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div className="step-badge" style={{ alignSelf: 'flex-start', marginBottom: 'auto' }}>
                  <span style={{ fontSize: 12 }}>{icon}</span>
                  <span>Step {step}</span>
                </div>
                <div style={{ paddingTop: 120 }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.8rem', color: '#F5F0E8', marginBottom: 12, lineHeight: 1.2 }}>{title}</h3>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: 'rgba(245,240,232,0.85)', lineHeight: 1.7 }}>{desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ENVELOPE ARCHIVE SECTION — like screenshot 6 */}
      <section id="prompt" style={{ padding: '80px 0 100px', background: '#EDE8DF' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B8878', textAlign: 'center', marginBottom: 16 }}>
            A year of sundays
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#2C2018', textAlign: 'center', marginBottom: 48, lineHeight: 1.2, fontWeight: 400 }}>
            fifty-two small invitations to <em>write yourself down</em>
          </motion.h2>
        </div>
        {/* Horizontal scrolling envelopes */}
        <div style={{ overflowX: 'auto', paddingBottom: 16 }} className="scrollbar-hide">
          <div style={{ display: 'flex', gap: 20, padding: '8px 40px', width: 'max-content' }}>
            {PROMPTS.map((p, i) => (
              <KraftEnvelope key={p.no} no={p.no} text={p.text} delay={i * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — like screenshot 7 */}
      <section style={{ padding: '80px 24px 100px' }}>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B8878', textAlign: 'center', marginBottom: 48 }}>
          From the circle
        </motion.p>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {TESTIMONIALS.map(({ quote, pen }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              style={{ background: '#F5F0E8', borderRadius: 16, padding: '32px 28px', border: '1px solid rgba(44,32,24,0.07)' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.15rem', color: '#2C2018', lineHeight: 1.65, marginBottom: 24 }}>
                "{quote}"
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: '11px', letterSpacing: '0.06em', color: '#9B8878' }}>
                — pen name: {pen}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ — like screenshot 8 */}
      <section style={{ padding: '80px 24px 100px', maxWidth: 760, margin: '0 auto' }}>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#9B8878', textAlign: 'center', marginBottom: 16 }}>
          Questions
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#2C2018', textAlign: 'center', marginBottom: 48, fontWeight: 400 }}>
          things worth asking
        </motion.h2>
        {FAQS.map((faq, i) => <FAQItem key={i} {...faq} />)}
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '80px 24px 120px', textAlign: 'center' }}>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#2C2018', marginBottom: 16, fontWeight: 400 }}>
          this sunday, <em>write to someone</em>
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ fontFamily: 'DM Sans', fontSize: '0.95rem', color: '#6B5744', maxWidth: 420, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Choose a pen name. Read the prompt. Send it into the quiet. Someone will be so glad you did.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Link to="/signup">
            <button className="btn-dark" style={{ padding: '14px 36px', fontSize: '11px' }}>
              Join the circle →
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(44,32,24,0.08)', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Dancing Script, cursive', fontSize: '1.2rem', color: '#9B8878', marginBottom: 8 }}>dear sunday</p>
        <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', letterSpacing: '0.06em', opacity: 0.6 }}>
          a weekly letter-writing ritual · every letter finds its reader
        </p>
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/login" style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#9B8878', opacity: 0.4, textDecoration: 'none', letterSpacing: '0.06em' }}>admin</Link>
        </p>
      </footer>
    </div>
  );
}
