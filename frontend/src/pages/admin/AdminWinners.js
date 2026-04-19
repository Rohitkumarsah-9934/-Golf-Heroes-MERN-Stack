import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, DollarSign, Eye } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminWinners() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ verificationStatus: '', paymentStatus: '' });
  const [notes, setNotes] = useState({});
  const [working, setWorking] = useState(null);

  const load = () => {
    const q = new URLSearchParams(filter).toString();
    api.get(`/admin/winners?${q}`).then(r => setWinners(r.data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [filter]);

  const verify = async (id, status) => {
    setWorking(id);
    try {
      await api.put(`/admin/winners/${id}/verify`, { verificationStatus: status, adminNotes: notes[id] || '' });
      toast.success(`Winner ${status}!`);
      load();
    } catch { toast.error('Failed'); } finally { setWorking(null); }
  };

  const markPaid = async (id) => {
    setWorking(id);
    try {
      await api.put(`/admin/winners/${id}/pay`);
      toast.success('Marked as paid!');
      load();
    } catch { toast.error('Failed'); } finally { setWorking(null); }
  };

  const tierBadge = t => t === 'jackpot' ? <span className="badge-gold">🏆 Jackpot</span>
    : t === 'match4' ? <span className="badge-green">⭐ 4-Match</span>
    : <span className="badge-green">✨ 3-Match</span>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold">Winners Management</h1>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {[
          { key: 'verificationStatus', opts: ['', 'pending', 'submitted', 'approved', 'rejected'], label: 'Verification' },
          { key: 'paymentStatus', opts: ['', 'pending', 'paid'], label: 'Payment' },
        ].map(({ key, opts, label }) => (
          <select key={key} className="input w-auto py-2 text-sm"
            value={filter[key]} onChange={e => setFilter(p => ({ ...p, [key]: e.target.value }))}>
            <option value="">{label}: All</option>
            {opts.slice(1).map(o => <option key={o} value={o} className="capitalize">{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
          </select>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 card animate-pulse" />)}</div>
      ) : winners.length === 0 ? (
        <div className="card text-center py-12 text-white/30">No winners found for selected filters.</div>
      ) : (
        <div className="space-y-4">
          {winners.map((w, i) => (
            <motion.div key={w._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold">{w.user?.fullName}</span>
                    <span className="text-white/40 text-xs">{w.user?.email}</span>
                    {tierBadge(w.prizeTier)}
                  </div>
                  <div className="text-xs text-white/40">{w.draw?.title} · {w.draw?.drawMonth ? new Date(w.draw.drawMonth).toLocaleDateString('en-GB',{month:'long',year:'numeric'}) : ''}</div>
                  {w.entry?.scores && (
                    <div className="text-xs text-white/30 mt-1">Scores: {w.entry.scores.join(', ')}</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-bold text-gold-400 text-xl">£{w.prizeAmount?.toFixed(2)}</div>
                  <div className={`badge-${w.paymentStatus === 'paid' ? 'green' : 'gray'} mt-1`}>{w.paymentStatus}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className={`badge-${w.verificationStatus === 'approved' ? 'green' : w.verificationStatus === 'rejected' ? 'red' : w.verificationStatus === 'submitted' ? 'brand' : 'gray'}`}>
                  {w.verificationStatus}
                </span>
                {w.proofUrl && (
                  <a href={`http://localhost:5000${w.proofUrl}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300">
                    <Eye size={12} /> View Proof
                  </a>
                )}
              </div>

              {/* Actions */}
              {w.verificationStatus === 'submitted' && (
                <div className="mt-4 space-y-2">
                  <input type="text" className="input text-sm py-2" placeholder="Admin notes (optional)"
                    value={notes[w._id] || ''} onChange={e => setNotes(p => ({ ...p, [w._id]: e.target.value }))} />
                  <div className="flex gap-2">
                    <button onClick={() => verify(w._id, 'approved')} disabled={working === w._id}
                      className="btn-primary py-1.5 text-sm flex items-center gap-1">
                      <CheckCircle size={14} /> Approve
                    </button>
                    <button onClick={() => verify(w._id, 'rejected')} disabled={working === w._id}
                      className="flex items-center gap-1 text-sm text-red-400 border border-red-500/20 hover:bg-red-500/10 px-4 py-1.5 rounded-xl transition-all">
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </div>
              )}

              {w.verificationStatus === 'approved' && w.paymentStatus === 'pending' && (
                <button onClick={() => markPaid(w._id)} disabled={working === w._id}
                  className="mt-3 btn-gold py-1.5 text-sm flex items-center gap-1 w-fit">
                  <DollarSign size={14} /> Mark as Paid
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
