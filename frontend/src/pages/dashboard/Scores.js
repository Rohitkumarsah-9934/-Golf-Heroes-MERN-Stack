import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Save, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ score: '', scoreDate: '', notes: '' });
  const [editScore, setEditScore] = useState('');
  const { isSubscribed } = useAuth();

  const load = () => api.get('/scores').then(r => setScores(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/scores', form);
      toast.success('Score added!');
      setShowAdd(false);
      setForm({ score: '', scoreDate: '', notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add score');
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/scores/${id}`, { score: Number(editScore) });
      toast.success('Score updated!');
      setEditId(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this score?')) return;
    try {
      await api.delete(`/scores/${id}`);
      toast.success('Score deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Scores</h1>
          <p className="text-white/40 text-sm mt-1">Latest 5 Stableford scores (1–45). One per date.</p>
        </div>
        {isSubscribed && !showAdd && (
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 py-2">
            <Plus size={16} /> Add Score
          </button>
        )}
      </div>

      {!isSubscribed && (
        <div className="card border-gold-500/20 text-center py-8">
          <p className="text-white/50 mb-4">Active subscription required to add scores.</p>
          <a href="/subscribe" className="btn-gold py-2 px-6">Subscribe Now</a>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card border-brand-500/30">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold">Add New Score</h3>
              <button onClick={() => setShowAdd(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Stableford Score</label>
                  <input type="number" min="1" max="45" className="input" placeholder="e.g. 32"
                    value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} required />
                </div>
                <div>
                  <label className="label">Date Played</label>
                  <input type="date" className="input" max={new Date().toISOString().split('T')[0]}
                    value={form.scoreDate} onChange={e => setForm(p => ({ ...p, scoreDate: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <input type="text" className="input" placeholder="e.g. Sunningdale, windy day"
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex items-center gap-2 py-2"><Save size={15} /> Save Score</button>
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary py-2">Cancel</button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rolling limit info */}
      <div className="flex items-center gap-2 text-xs text-white/30 bg-dark-700/30 rounded-xl px-4 py-3">
        <Calendar size={14} />
        {scores.length}/5 scores stored. Adding a 6th will automatically remove the oldest.
      </div>

      {/* Scores list */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 card animate-pulse" />)}</div>
      ) : scores.length === 0 ? (
        <div className="card text-center py-12 text-white/30">
          <Target className="mx-auto mb-3 opacity-30" size={40} />
          <div>No scores yet. Add your first Stableford score above.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {scores.map((s, i) => (
            <motion.div key={s._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="card flex items-center gap-4 py-4">
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center">
                <span className="font-display font-black text-xl text-brand-400">{s.score}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium">{new Date(s.scoreDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                {s.notes && <div className="text-xs text-white/30 mt-0.5">{s.notes}</div>}
              </div>
              <div className="flex items-center gap-2">
                {editId === s._id ? (
                  <>
                    <input type="number" min="1" max="45" className="input w-20 py-1.5 text-center text-sm"
                      value={editScore} onChange={e => setEditScore(e.target.value)} />
                    <button onClick={() => handleUpdate(s._id)} className="text-brand-400 hover:text-brand-300 p-1"><Save size={16} /></button>
                    <button onClick={() => setEditId(null)} className="text-white/30 hover:text-white p-1"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditId(s._id); setEditScore(s.score); }}
                      className="text-white/30 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(s._id)}
                      className="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Target({ className, size }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
