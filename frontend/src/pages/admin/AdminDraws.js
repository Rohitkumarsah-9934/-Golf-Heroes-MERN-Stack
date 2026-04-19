import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Play, CheckCircle, Hash, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusColor = { pending: 'gray', simulated: 'brand', published: 'green', completed: 'gold' };

export default function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [simResult, setSimResult] = useState(null);
  const [form, setForm] = useState({ title: '', drawMonth: '', drawType: 'random' });
  const [working, setWorking] = useState(null);

  const load = () => api.get('/admin/draws').then(r => setDraws(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/draws', form);
      toast.success('Draw created!');
      setShowCreate(false);
      setForm({ title: '', drawMonth: '', drawType: 'random' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleSimulate = async (id) => {
    setWorking(id + '_sim');
    try {
      const { data } = await api.post(`/admin/draws/${id}/simulate`);
      setSimResult(data.data);
      toast.success('Simulation complete!');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Simulation failed'); }
    finally { setWorking(null); }
  };

  const handlePublish = async (id) => {
    if (!window.confirm('Publish this draw? This will create winner records and notify participants.')) return;
    setWorking(id + '_pub');
    try {
      await api.post(`/admin/draws/${id}/publish`);
      toast.success('Draw published!');
      setSimResult(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Publish failed'); }
    finally { setWorking(null); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Draws</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 py-2"><Plus size={16} />Create Draw</button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card border-gold-500/30">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold">New Draw</h3>
            <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="label">Title</label>
              <input type="text" className="input" placeholder="e.g. June 2025 Draw" required
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Draw Month</label>
              <input type="date" className="input" required
                value={form.drawMonth} onChange={e => setForm(p => ({ ...p, drawMonth: e.target.value }))} />
            </div>
            <div>
              <label className="label">Draw Type</label>
              <select className="input" value={form.drawType} onChange={e => setForm(p => ({ ...p, drawType: e.target.value }))}>
                <option value="random">Random</option>
                <option value="algorithmic">Algorithmic</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-3">
              <button type="submit" className="btn-gold py-2">Create Draw</button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary py-2">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Sim result */}
      {simResult && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card border-brand-500/30 bg-brand-500/5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-brand-400">Simulation Results</h3>
            <button onClick={() => setSimResult(null)} className="text-white/30 hover:text-white"><X size={16} /></button>
          </div>
          <div className="flex gap-2 mb-4">
            {simResult.winningNumbers?.map(n => (
              <div key={n} className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center font-display font-bold text-sm">{n}</div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            {[
              ['Entries', simResult.totalEntries],
              ['Jackpot', simResult.winners?.jackpot],
              ['4-Match', simResult.winners?.match4],
              ['3-Match', simResult.winners?.match3],
            ].map(([l, v]) => (
              <div key={l} className="bg-dark-700/40 rounded-xl py-3">
                <div className="text-white/40 text-xs">{l}</div>
                <div className="font-bold text-lg mt-1">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Draws list */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 card animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {draws.map((d, i) => (
            <motion.div key={d._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold">{d.title}</h3>
                    <span className={`badge-${statusColor[d.status] || 'gray'} capitalize`}>{d.status}</span>
                    <span className="badge-gray capitalize">{d.drawType}</span>
                  </div>
                  <div className="text-xs text-white/40">{new Date(d.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} · {d.subscriberCount} players · £{d.totalPool?.toFixed(2)} pool</div>
                  {d.winningNumbers?.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Hash size={12} className="text-white/30" />
                      {d.winningNumbers.map(n => (
                        <span key={n} className="w-7 h-7 bg-dark-600 rounded-lg flex items-center justify-center text-xs font-bold text-brand-400">{n}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {d.status === 'pending' && (
                    <button onClick={() => handleSimulate(d._id)} disabled={working === d._id + '_sim'}
                      className="btn-secondary py-1.5 text-sm flex items-center gap-1">
                      {working === d._id + '_sim' ? <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" /> : <Play size={14} />} Simulate
                    </button>
                  )}
                  {d.status === 'simulated' && (
                    <>
                      <button onClick={() => handleSimulate(d._id)} disabled={!!working} className="btn-secondary py-1.5 text-sm flex items-center gap-1">
                        <Play size={14} /> Re-Simulate
                      </button>
                      <button onClick={() => handlePublish(d._id)} disabled={working === d._id + '_pub'}
                        className="btn-gold py-1.5 text-sm flex items-center gap-1">
                        {working === d._id + '_pub' ? <div className="w-4 h-4 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" /> : <CheckCircle size={14} />} Publish
                      </button>
                    </>
                  )}
                  {(d.status === 'published' || d.status === 'completed') && (
                    <span className="text-brand-400 text-sm flex items-center gap-1"><CheckCircle size={14} /> Published {d.publishedAt ? new Date(d.publishedAt).toLocaleDateString() : ''}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
