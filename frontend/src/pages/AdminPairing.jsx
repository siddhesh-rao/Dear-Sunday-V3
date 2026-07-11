import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { lettersAPI, promptsAPI, participantsAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, Send, Trash2, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPairing() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [letters, setLetters] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [filter, setFilter] = useState('submitted');
  const [loading, setLoading] = useState(true);
  const [pairing, setPairing] = useState(false);
  const [delivering, setDelivering] = useState(null);

  useEffect(() => {
    Promise.all([promptsAPI.getAll(), participantsAPI.getAll()])
      .then(([p, parts]) => {
        setPrompts(p.prompts || []);
        setParticipants(parts.participants || []);
        const active = (p.prompts || []).find(x => x.isActive);
        if (active) { setSelectedPrompt(active); loadLetters(active._id); }
      }).finally(() => setLoading(false));
  }, []);

  const loadLetters = async (promptId) => {
    try { const d = await lettersAPI.adminGetAll({ promptId }); setLetters(d.letters || []); }
    catch (err) { toast.error(err.message); }
  };

  const handleSelectPrompt = (p) => {
    setSelectedPrompt(p); setSelectedLetter(null); setSelectedRecipient(null); loadLetters(p._id);
  };

  const handlePair = async () => {
    if (!selectedLetter || !selectedRecipient) return;
    setPairing(true);
    try {
      await lettersAPI.adminPair(selectedLetter._id, selectedRecipient._id);
      setLetters(prev => prev.map(l => l._id === selectedLetter._id
        ? { ...l, status: 'paired', recipient: selectedRecipient, recipientPenName: selectedRecipient.penName }
        : l));
      toast.success(`Paired ✉`);
      setSelectedLetter(null); setSelectedRecipient(null);
    } catch (err) { toast.error(err.message); }
    finally { setPairing(false); }
  };

  const handleDeliver = async (letter) => {
    if (!confirm(`Deliver to ${letter.recipient?.penName}?`)) return;
    setDelivering(letter._id);
    try {
      await lettersAPI.adminDeliver(letter._id, adminNote);
      setLetters(prev => prev.map(l => l._id === letter._id ? { ...l, status: 'delivered' } : l));
      toast.success('Delivered 💌'); setAdminNote('');
    } catch (err) { toast.error(err.message); }
    finally { setDelivering(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await lettersAPI.adminDelete(id); setLetters(prev => prev.filter(l => l._id !== id)); } catch {}
  };

  const filteredLetters = letters.filter(l => filter === 'all' || l.status === filter);
  const counts = {
    submitted: letters.filter(l => l.status === 'submitted').length,
    paired: letters.filter(l => l.status === 'paired').length,
    delivered: letters.filter(l => l.status === 'delivered').length,
  };

  const eligibleRecipients = selectedLetter
    ? participants.filter(p =>
        p._id !== selectedLetter.author?._id && p.isActive &&
        !letters.some(l => l.author?._id === selectedLetter.author?._id && l.recipient?._id === p._id)
      )
    : [];

  const sectionLabel = { fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 14, display: 'block' };

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '88px 24px 60px' }}>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 6 }}>Admin</p>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#2C2018', fontWeight: 400 }}>Letter pairings</h1>
          <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#9B8878', marginTop: 4 }}>Select a letter · choose a recipient · deliver.</p>
        </motion.div>

        {/* Prompt selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
          {prompts.map(p => (
            <button key={p._id} onClick={() => handleSelectPrompt(p)}
              style={{
                fontFamily: 'DM Sans', fontSize: '11px', letterSpacing: '0.06em',
                padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                background: selectedPrompt?._id === p._id ? '#2C2018' : '#F5F0E8',
                color: selectedPrompt?._id === p._id ? '#EDE8DF' : '#6B5744',
                border: '1px solid rgba(44,32,24,0.12)',
              }}>
              {p.isActive && '● '}{p.title.slice(0, 40)}{p.title.length > 40 ? '…' : ''}
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        {selectedPrompt && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
            {[
              { key: 'submitted', label: 'Unmatched', count: counts.submitted },
              { key: 'paired', label: 'Paired', count: counts.paired },
              { key: 'delivered', label: 'Delivered', count: counts.delivered },
              { key: 'all', label: 'All', count: letters.length },
            ].map(s => (
              <button key={s.key} onClick={() => setFilter(s.key)}
                style={{
                  padding: '14px 8px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
                  background: filter === s.key ? '#2C2018' : '#F5F0E8',
                  border: '1px solid rgba(44,32,24,0.1)',
                }}>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', color: filter === s.key ? '#EDE8DF' : '#2C2018', lineHeight: 1 }}>{s.count}</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.08em', color: filter === s.key ? 'rgba(237,232,223,0.7)' : '#9B8878', marginTop: 4 }}>{s.label}</p>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Left: letters */}
          <div>
            <span style={sectionLabel}>Letters ({filteredLetters.length})</span>
            <div style={{ maxHeight: 600, overflowY: 'auto', paddingRight: 4 }}>
              {filteredLetters.map(letter => (
                <div key={letter._id} style={{ marginBottom: 12 }}>
                  <motion.div
                    whileHover={{ y: -1 }}
                    onClick={() => letter.status === 'submitted' && setSelectedLetter(selectedLetter?._id === letter._id ? null : letter)}
                    style={{
                      background: selectedLetter?._id === letter._id ? '#F5F0E8' : '#FDFAF4',
                      border: `1px solid ${selectedLetter?._id === letter._id ? 'rgba(44,32,24,0.25)' : 'rgba(44,32,24,0.09)'}`,
                      borderRadius: 12, padding: '14px 16px',
                      cursor: letter.status === 'submitted' ? 'pointer' : 'default',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '0.95rem', color: '#2C2018' }}>{letter.author?.penName}</p>
                      <span style={{
                        fontFamily: 'DM Sans', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase',
                        padding: '3px 8px', borderRadius: 20,
                        background: letter.status === 'delivered' ? 'rgba(44,32,24,0.08)' : letter.status === 'paired' ? 'rgba(184,134,11,0.12)' : 'rgba(196,168,130,0.25)',
                        color: letter.status === 'delivered' ? '#6B5744' : letter.status === 'paired' ? '#8B6A10' : '#9B8878'
                      }}>{letter.status}</span>
                    </div>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', lineHeight: 1.5 }}>
                      {letter.content?.slice(0, 90)}…
                    </p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#9B8878', marginTop: 6, opacity: 0.6 }}>
                      {formatDistanceToNow(new Date(letter.createdAt), { addSuffix: true })}
                    </p>
                    {letter.status === 'paired' && letter.recipient && (
                      <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#8B6A10', marginTop: 4, fontWeight: 500 }}>→ {letter.recipient?.penName}</p>
                    )}
                  </motion.div>

                  {/* Deliver button for paired letters */}
                  {letter.status === 'paired' && (
                    <div style={{ background: 'rgba(184,134,11,0.06)', border: '1px dashed rgba(184,134,11,0.25)', borderRadius: '0 0 12px 12px', padding: '12px 16px', marginTop: -4 }}>
                      <input value={adminNote} onChange={e => setAdminNote(e.target.value)}
                        placeholder="Personal note from Sunday (optional)…"
                        style={{ width: '100%', background: 'white', border: '1px solid rgba(44,32,24,0.1)', borderRadius: 8, padding: '8px 12px', fontFamily: 'DM Sans', fontSize: '12px', color: '#2C2018', outline: 'none', marginBottom: 8 }} />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => handleDeliver(letter)} disabled={delivering === letter._id}
                          className="btn-dark" style={{ padding: '7px 14px', fontSize: '10px', gap: 5 }}>
                          <Send size={11} />{delivering === letter._id ? 'Delivering…' : 'Deliver'}
                        </button>
                        <button onClick={() => handleDelete(letter._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4, padding: '7px' }}>
                          <Trash2 size={12} style={{ color: '#8B3A2A' }} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delivered status */}
                  {letter.status === 'delivered' && (
                    <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.5 }}>
                      <CheckCircle size={12} style={{ color: '#6B5744' }} />
                      <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#6B5744' }}>Delivered to {letter.recipient?.penName}</p>
                    </div>
                  )}
                </div>
              ))}
              {filteredLetters.length === 0 && (
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#9B8878', textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
                  {filter === 'submitted' ? 'No letters waiting.' : filter === 'paired' ? 'None paired yet.' : filter === 'delivered' ? 'None delivered yet.' : 'No letters yet.'}
                </p>
              )}
            </div>
          </div>

          {/* Right: recipient picker */}
          <div>
            <span style={sectionLabel}>
              {selectedLetter ? `Pick recipient for ${selectedLetter.author?.penName}` : 'Select a letter first'}
            </span>

            {selectedLetter ? (
              <>
                {/* Letter preview */}
                <div style={{ background: '#F5F0E8', border: '1px solid rgba(44,32,24,0.1)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B8878', marginBottom: 6 }}>Letter from</p>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#2C2018', marginBottom: 4 }}>
                    {selectedLetter.author?.penName}
                    <span style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', fontStyle: 'normal', marginLeft: 8 }}>({selectedLetter.author?.realName})</span>
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', lineHeight: 1.5 }}>
                    "{selectedLetter.content?.slice(0, 140)}…"
                  </p>
                </div>

                {/* Recipient list */}
                <div style={{ maxHeight: 360, overflowY: 'auto', paddingRight: 4, marginBottom: 16 }}>
                  {eligibleRecipients.map(p => (
                    <motion.div key={p._id} whileHover={{ x: 2 }}
                      onClick={() => setSelectedRecipient(selectedRecipient?._id === p._id ? null : p)}
                      style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', borderRadius: 10, marginBottom: 8, cursor: 'pointer',
                        background: selectedRecipient?._id === p._id ? '#2C2018' : '#FDFAF4',
                        border: `1px solid ${selectedRecipient?._id === p._id ? '#2C2018' : 'rgba(44,32,24,0.08)'}`,
                        transition: 'all 0.15s',
                      }}>
                      <div>
                        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: selectedRecipient?._id === p._id ? '#EDE8DF' : '#2C2018' }}>{p.penName}</p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: selectedRecipient?._id === p._id ? 'rgba(237,232,223,0.6)' : '#9B8878', marginTop: 2 }}>
                          {p.lettersReceived} received · {p.lettersWritten} written
                        </p>
                      </div>
                      {selectedRecipient?._id === p._id && <CheckCircle size={15} color="#EDE8DF" />}
                    </motion.div>
                  ))}
                  {eligibleRecipients.length === 0 && (
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#9B8878', textAlign: 'center', padding: '24px 0', opacity: 0.6 }}>No eligible recipients.</p>
                  )}
                </div>

                {selectedRecipient && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                    <button onClick={handlePair} disabled={pairing} className="btn-dark" style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
                      <Link2 size={13} />
                      {pairing ? 'Pairing…' : `Pair → ${selectedRecipient.penName}`}
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <div style={{ background: '#F5F0E8', border: '1px dashed rgba(44,32,24,0.15)', borderRadius: 14, padding: '48px 32px', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: '2rem', marginBottom: 12 }}>✉</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#6B5744' }}>
                  Click an unmatched letter to begin pairing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
