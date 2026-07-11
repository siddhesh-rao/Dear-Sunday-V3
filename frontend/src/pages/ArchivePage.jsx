// ArchivePage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { lettersAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { format } from 'date-fns';

export function ArchivePage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { lettersAPI.getMy().then(d => setLetters(d.letters || [])).finally(() => setLoading(false)); }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '88px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 8 }}>Archive</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem,5vw,3rem)', color: '#2C2018', fontWeight: 400 }}>Letters you've written</h1>
        </motion.div>
        {loading && [1,2,3].map(i => <div key={i} style={{ height: 80, borderRadius: 14, background: '#F5F0E8', marginBottom: 12 }} />)}
        {!loading && letters.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.3rem', color: '#6B5744' }}>Nothing here yet.</p>
            <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#9B8878', marginTop: 8 }}>Write your first letter this Sunday.</p>
          </div>
        )}
        {!loading && letters.map((l, i) => (
          <motion.div key={l._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="paper-card" style={{ padding: '20px 24px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#2C2018', marginBottom: 4 }}>
                  "{l.prompt?.title?.slice(0, 70)}{l.prompt?.title?.length > 70 ? '…' : ''}"
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>{format(new Date(l.createdAt), 'MMMM d, yyyy')}</p>
              </div>
              <span style={{ fontFamily: 'DM Sans', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', borderRadius: 20, background: l.status === 'delivered' ? 'rgba(44,32,24,0.08)' : 'rgba(196,168,130,0.2)', color: '#9B8878', flexShrink: 0 }}>
                {l.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default ArchivePage;
