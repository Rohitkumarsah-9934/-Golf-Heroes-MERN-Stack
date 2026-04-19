import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:   { label: 'Pending',   color: 'gray',  icon: <Clock size={14} /> },
  submitted: { label: 'Submitted', color: 'brand', icon: <Clock size={14} /> },
  approved:  { label: 'Approved',  color: 'brand', icon: <CheckCircle size={14} /> },
  rejected:  { label: 'Rejected',  color: 'red',   icon: <XCircle size={14} /> },
};

const payConfig = {
  pending: { label: 'Payment Pending', color: 'gray' },
  paid:    { label: 'Paid ✓',          color: 'brand' },
};

export default function WinningsPage() {
  const [winnings, setWinnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(null);

  const load = () => api.get('/winners/my-winnings').then(r => setWinnings(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleProofUpload = async (winnerId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('proof', file);
    setUploading(winnerId);
    try {
      await api.post(`/winners/${winnerId}/submit-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Proof submitted! Awaiting admin review.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const total = winnings.filter(w => w.paymentStatus === 'paid').reduce((a, b) => a + b.prizeAmount, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">My Winnings</h1>
        <p className="text-white/40 text-sm mt-1">Submit proof to claim your prizes.</p>
      </div>

      {winnings.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card border-gold-500/20">
            <div className="text-white/40 text-sm mb-1">Total Winnings</div>
            <div className="font-display text-3xl font-bold text-gold-400">£{winnings.reduce((a,b) => a+b.prizeAmount,0).toFixed(2)}</div>
          </div>
          <div className="card border-brand-500/20">
            <div className="text-white/40 text-sm mb-1">Total Paid Out</div>
            <div className="font-display text-3xl font-bold text-brand-400">£{total.toFixed(2)}</div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="h-36 card animate-pulse" />)}</div>
      ) : winnings.length === 0 ? (
        <div className="card text-center py-16 text-white/30">
          <Award className="mx-auto mb-3 opacity-30" size={40} />
          No winnings yet. Enter draws and hope your scores match!
        </div>
      ) : (
        <div className="space-y-4">
          {winnings.map((w, i) => {
            const vs = statusConfig[w.verificationStatus] || statusConfig.pending;
            const ps = payConfig[w.paymentStatus] || payConfig.pending;
            return (
              <motion.div key={w._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.05 }}
                className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-display font-bold text-lg">{w.draw?.title}</div>
                    <div className="text-xs text-white/40">{new Date(w.draw?.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-gold-400 text-2xl">£{w.prizeAmount?.toFixed(2)}</div>
                    <div className={`badge-${w.prizeTier === 'jackpot' ? 'gold' : 'green'} mt-1`}>
                      {w.prizeTier === 'jackpot' ? '🏆 Jackpot' : w.prizeTier === 'match4' ? '⭐ 4-Match' : '✨ 3-Match'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`badge-${vs.color} flex items-center gap-1`}>{vs.icon}{vs.label}</div>
                  <div className={`badge-${ps.color === 'gray' ? 'gray' : 'green'}`}>{ps.label}</div>
                </div>

                {w.verificationStatus === 'pending' && (
                  <div className="mt-4 p-4 bg-gold-500/5 border border-gold-500/15 rounded-xl">
                    <div className="text-sm font-medium text-gold-400 mb-2">Submit your proof to claim prize</div>
                    <p className="text-xs text-white/40 mb-3">Upload a screenshot of your scores from your golf platform (max 5MB, image or PDF).</p>
                    <label className={`btn-secondary py-2 text-sm flex items-center gap-2 w-fit cursor-pointer ${uploading === w._id ? 'opacity-50' : ''}`}>
                      {uploading === w._id
                        ? <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                        : <Upload size={14} />}
                      Upload Proof
                      <input type="file" className="hidden" accept="image/*,.pdf"
                        onChange={e => handleProofUpload(w._id, e.target.files[0])} disabled={uploading === w._id} />
                    </label>
                  </div>
                )}

                {w.verificationStatus === 'rejected' && w.adminNotes && (
                  <div className="mt-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
                    Rejection reason: {w.adminNotes}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
