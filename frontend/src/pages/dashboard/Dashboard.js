import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Trophy, Heart, Award, AlertCircle, ArrowRight, CheckCircle, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, sub, color = 'brand', delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card">
    <div className={`w-11 h-11 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-400 mb-4`}>{icon}</div>
    <div className="text-2xl font-display font-bold">{value}</div>
    <div className="text-sm font-medium mt-1">{label}</div>
    {sub && <div className="text-xs text-white/30 mt-1">{sub}</div>}
  </motion.div>
);

export default function Dashboard() {
  const { user, isSubscribed, loadUser } = useAuth();
  const [scores, setScores] = useState([]);
  const [draws, setDraws] = useState([]);
  const [winnings, setWinnings] = useState([]);
  const [charity, setCharity] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ FIX: After Stripe redirect, verify session and refresh user
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) return;

    const verify = async () => {
      setVerifying(true);
      try {
        // Retry up to 5 times — webhook might be slightly delayed
        let attempts = 0;
        let success = false;
        while (attempts < 5 && !success) {
          attempts++;
          try {
            const { data } = await api.get(`/subscriptions/verify-session?session_id=${sessionId}`);
            if (data.success) {
              success = true;
              toast.success('🎉 Subscription activated! Welcome to Golf Heroes!');
              await loadUser(); // Refresh auth context with new subscription
            }
          } catch (e) {
            // ignore per-attempt error, retry
          }
          if (!success && attempts < 5) {
            await new Promise(r => setTimeout(r, 1500)); // wait 1.5s between retries
          }
        }
        if (!success) {
          toast.error('Could not verify payment. Please contact support if charged.');
        }
      } finally {
        setVerifying(false);
        // Clean URL — remove session_id from URL
        navigate('/dashboard', { replace: true });
      }
    };

    verify();
  }, []); // eslint-disable-line

  const loadData = useCallback(async () => {
    api.get('/scores').then(r => setScores(r.data.data || [])).catch(() => {});
    api.get('/draws').then(r => setDraws(r.data.data?.slice(0, 3) || [])).catch(() => {});
    api.get('/winners/my-winnings').then(r => setWinnings(r.data.data || [])).catch(() => {});
    api.get('/charities/my-selection').then(r => setCharity(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const totalWon = winnings.filter(w => w.paymentStatus === 'paid').reduce((a, b) => a + b.prizeAmount, 0);
  const sub = user?.subscription;

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader size={40} className="text-brand-400 animate-spin" />
        <div className="font-display text-xl font-bold">Activating your subscription...</div>
        <div className="text-white/40 text-sm">Please wait, verifying your payment</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">
          Good to see you, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-white/40 mt-1 text-sm">Here's your Golf Heroes overview</p>
      </div>

      {/* Subscription alert */}
      {!isSubscribed && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-gold-500/10 border border-gold-500/20 rounded-2xl px-5 py-4">
          <AlertCircle size={20} className="text-gold-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-gold-400 text-sm">No active subscription</div>
            <div className="text-xs text-white/40">Subscribe to enter monthly draws and support your charity.</div>
          </div>
          <Link to="/subscribe" className="btn-gold py-2 text-sm flex-shrink-0">Subscribe</Link>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Target size={20} />} label="Scores Entered" value={scores.length} sub="of 5 max" delay={0} />
        <StatCard icon={<Trophy size={20} />} label="Draws" value={draws.length} sub="published" color="gold" delay={0.1} />
        <StatCard icon={<Award size={20} />} label="Total Won" value={`£${totalWon.toFixed(2)}`} sub="paid out" color="gold" delay={0.2} />
        <StatCard icon={<Heart size={20} />} label="Charity" value={charity ? '✓' : '—'} sub={charity?.charity?.name || 'Not selected'} delay={0.3} />
      </div>

      {/* Active subscription banner */}
      {isSubscribed && sub && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card border-brand-500/20 bg-brand-500/5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-brand-400" />
              <div>
                <div className="font-medium capitalize">{sub.plan} Plan — <span className="text-brand-400">Active</span></div>
                <div className="text-xs text-white/40">
                  Renews: {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-GB') : '—'}
                </div>
              </div>
            </div>
            <Link to="/dashboard/profile" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Recent scores + draws */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold">Recent Scores</h2>
            <Link to="/dashboard/scores" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          {scores.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-sm">
              No scores yet.{' '}
              <Link to="/dashboard/scores" className="text-brand-400">Add your first score</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {scores.slice(0, 5).map(s => (
                <div key={s._id} className="flex items-center justify-between bg-dark-700/40 rounded-xl px-4 py-3">
                  <span className="text-white/60 text-sm">{new Date(s.scoreDate).toLocaleDateString('en-GB')}</span>
                  <span className="font-display font-bold text-brand-400 text-lg">{s.score}</span>
                  <span className="text-white/30 text-xs">Stableford</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold">Latest Draws</h2>
            <Link to="/dashboard/draws" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">View all <ArrowRight size={14} /></Link>
          </div>
          {draws.length === 0 ? (
            <div className="text-center py-6 text-white/30 text-sm">No draws published yet.</div>
          ) : (
            <div className="space-y-2">
              {draws.map(d => (
                <div key={d._id} className="flex items-center justify-between bg-dark-700/40 rounded-xl px-4 py-3">
                  <div>
                    <div className="text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-white/30">
                      {new Date(d.drawMonth).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gold-400 font-bold text-sm">£{d.totalPool?.toFixed(2)}</div>
                    <div className="badge-green text-xs">Published</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
