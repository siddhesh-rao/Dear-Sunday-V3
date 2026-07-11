import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminAPI, promptsAPI, participantsAPI } from '../utils/api';
import Navbar from '../components/ui/Navbar';
import { formatDistanceToNow, format } from 'date-fns';
import { Trash2, Eye, EyeOff, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const inputStyle = {
  width: '100%', padding: '11px 14px', borderRadius: 10,
  background: '#EDE8DF', border: '1px solid rgba(44,32,24,0.12)',
  fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#2C2018', outline: 'none', marginBottom: 12,
};

function PromptForm({ initial, onSave, onCancel }) {
  const nextSunday = new Date();
  nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
  nextSunday.setHours(23, 59, 0, 0);

  const [form, setForm] = useState(initial || {
    title: '', body: '', isActive: true,
    submissionDeadline: nextSunday.toISOString().slice(0, 16)
  });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setLoading(true);
    try { await onSave(form); } finally { setLoading(false); }
  };

  return (
    <div style={{ background: '#F5F0E8', borderRadius: 14, padding: '20px 22px', marginBottom: 16, border: '1px solid rgba(44,32,24,0.1)' }}>
      <input value={form.title} onChange={set('title')} placeholder="The prompt (the question)…" style={inputStyle} />
      <textarea value={form.body} onChange={set('body')} placeholder="Optional context…" rows={2} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9B8878', display: 'block', marginBottom: 5 }}>Deadline</label>
        <input type="datetime-local" value={form.submissionDeadline} onChange={set('submissionDeadline')} style={{ ...inputStyle, marginBottom: 0 }} />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'DM Sans', fontSize: '12px', color: '#6B5744', cursor: 'pointer', marginBottom: 16 }}>
        <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
        Set as active prompt
      </label>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={loading} className="btn-dark" style={{ padding: '9px 20px', fontSize: '10px' }}>
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878', background: 'rgba(44,32,24,0.06)', border: 'none', borderRadius: 8, padding: '9px 16px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

export default function AdminDash() {
  const [analytics, setAnalytics] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [tab, setTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminAPI.getAnalytics(), promptsAPI.getAll(), participantsAPI.getAll()])
      .then(([a, p, parts]) => {
        setAnalytics(a); setPrompts(p.prompts || []); setParticipants(parts.participants || []);
      }).finally(() => setLoading(false));
  }, []);

  const createPrompt = async (form) => {
    try { const d = await promptsAPI.create(form); setPrompts(p => [d.prompt, ...p]); setShowForm(false); toast.success('Prompt created'); }
    catch (err) { toast.error(err.message); }
  };
  const updatePrompt = async (id, form) => {
    try { const d = await promptsAPI.update(id, form); setPrompts(p => p.map(x => x._id === id ? d.prompt : x)); setEditId(null); toast.success('Updated'); }
    catch (err) { toast.error(err.message); }
  };
  const deletePrompt = async (id) => {
    if (!confirm('Delete?')) return;
    try { await promptsAPI.delete(id); setPrompts(p => p.filter(x => x._id !== id)); } catch {}
  };
  const toggleActive = async (prompt) => {
    try { const d = await promptsAPI.update(prompt._id, { ...prompt, isActive: !prompt.isActive }); setPrompts(p => p.map(x => x._id === prompt._id ? d.prompt : x)); } catch {}
  };
  const toggleParticipant = async (id) => {
    try { const d = await participantsAPI.toggle(id); setParticipants(p => p.map(x => x._id === id ? { ...x, isActive: d.isActive } : x)); } catch {}
  };

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'prompts', label: 'Prompts' },
    { id: 'participants', label: 'Participants' },
  ];

  const sectionLabel = { fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 16 };

  return (
    <div style={{ minHeight: '100vh', background: '#EDE8DF' }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '88px 24px 60px' }}>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <div>
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9B8878', marginBottom: 6 }}>Admin</p>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.2rem', color: '#2C2018', fontWeight: 400 }}>Sunday dashboard</h1>
          </div>
          <Link to="/admin/pairing">
            <button className="btn-dark" style={{ fontSize: '10px', padding: '10px 20px' }}>Manage pairings →</button>
          </Link>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid rgba(44,32,24,0.1)', paddingBottom: 0 }}>
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              fontFamily: 'DM Sans', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
              color: tab === id ? '#2C2018' : '#9B8878',
              borderBottom: tab === id ? '2px solid #2C2018' : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.2s'
            }}>{label}</button>
          ))}
        </div>

        {loading && <div style={{ height: 200, borderRadius: 16, background: '#F5F0E8' }} />}

        {/* Overview */}
        {!loading && tab === 'overview' && analytics && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 36 }}>
              {[
                { label: 'Members', val: analytics.totalParticipants, icon: '✦' },
                { label: 'Total letters', val: analytics.totalLetters, icon: '✉' },
                { label: 'Delivered', val: analytics.totalDelivered, icon: '💌' },
                { label: 'To pair', val: analytics.pendingPairing, icon: '⏳', warn: analytics.pendingPairing > 0 },
                { label: 'To deliver', val: analytics.pendingDelivery, icon: '📬', warn: analytics.pendingDelivery > 0 },
                { label: 'Prompts', val: analytics.totalPrompts, icon: '✒' },
              ].map((s, i) => (
                <div key={i} className="paper-card" style={{ padding: '20px 16px', textAlign: 'center', border: s.warn ? '1px solid rgba(139,58,42,0.2)' : undefined }}>
                  <span style={{ fontSize: '1.3rem', display: 'block', marginBottom: 8 }}>{s.icon}</span>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: s.warn ? '#8B3A2A' : '#2C2018', lineHeight: 1 }}>{s.val}</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9B8878', marginTop: 4 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {analytics.pendingPairing > 0 && (
              <div style={{ background: '#FEF9F0', border: '1px solid rgba(184,134,11,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '0.875rem', color: '#6B4F10' }}>
                  {analytics.pendingPairing} letters waiting to be paired
                </p>
                <Link to="/admin/pairing" style={{ fontFamily: 'DM Sans', fontSize: '11px', fontWeight: 500, color: '#6B4F10', textDecoration: 'underline' }}>Pair now →</Link>
              </div>
            )}

            {analytics.activePrompt && (
              <div className="paper-card" style={{ padding: '20px 24px' }}>
                <p style={sectionLabel}>Active prompt</p>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#2C2018' }}>"{analytics.activePrompt.title}"</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Prompts */}
        {!loading && tab === 'prompts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={sectionLabel}>All prompts</p>
              <button onClick={() => setShowForm(true)} className="btn-dark" style={{ padding: '8px 16px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <PlusCircle size={12} /> New prompt
              </button>
            </div>
            {showForm && <PromptForm onSave={createPrompt} onCancel={() => setShowForm(false)} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {prompts.map(prompt => (
                <div key={prompt._id}>
                  {editId === prompt._id ? (
                    <PromptForm initial={prompt} onSave={f => updatePrompt(prompt._id, f)} onCancel={() => setEditId(null)} />
                  ) : (
                    <div className="paper-card" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 12, border: prompt.isActive ? '1px solid rgba(44,32,24,0.2)' : undefined }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1.05rem', color: '#2C2018' }}>"{prompt.title}"</p>
                          {prompt.isActive && <span style={{ fontFamily: 'DM Sans', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 20, background: '#2C2018', color: '#EDE8DF' }}>Active</span>}
                        </div>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#9B8878' }}>
                          {prompt.totalSubmissions || 0} submissions · {formatDistanceToNow(new Date(prompt.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <button onClick={() => toggleActive(prompt)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>
                          {prompt.isActive ? <Eye size={14} style={{ color: '#2C2018' }} /> : <EyeOff size={14} style={{ color: '#9B8878' }} />}
                        </button>
                        <button onClick={() => setEditId(prompt._id)} style={{ fontFamily: 'DM Sans', fontSize: '11px', color: '#6B5744', background: 'none', border: 'none', cursor: 'pointer' }}>edit</button>
                        <button onClick={() => deletePrompt(prompt._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.4 }}>
                          <Trash2 size={13} style={{ color: '#8B3A2A' }} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {prompts.length === 0 && <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#9B8878', textAlign: 'center', padding: '40px 0' }}>No prompts yet.</p>}
            </div>
          </motion.div>
        )}

        {/* Participants */}
        {!loading && tab === 'participants' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p style={{ ...sectionLabel, marginBottom: 20 }}>{participants.length} members</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {participants.map(p => (
                <div key={p._id} className="paper-card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12, opacity: p.isActive ? 1 : 0.5 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', fontSize: '1rem', color: '#2C2018', marginBottom: 2 }}>{p.penName}</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#9B8878' }}>
                      {p.realName} · {p.email} · ✉ {p.lettersWritten} written · 💌 {p.lettersReceived} received
                    </p>
                  </div>
                  <button onClick={() => toggleParticipant(p._id)}
                    style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 14px', borderRadius: 20, background: 'rgba(44,32,24,0.07)', border: '1px solid rgba(44,32,24,0.1)', color: '#6B5744', cursor: 'pointer', flexShrink: 0 }}>
                    {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ))}
              {participants.length === 0 && <p style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#9B8878', textAlign: 'center', padding: '40px 0' }}>No members yet.</p>}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
