import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const plans = [
  { id: 'monthly', label: 'Monthly', price: '£9.99', period: '/month', saving: null, popular: false },
  { id: 'yearly',  label: 'Yearly',  price: '£89.99', period: '/year', saving: 'Save 25%', popular: true },
];

const features = [
  'Enter monthly prize draws', 'Submit up to 5 Stableford scores', 'Support your chosen charity',
  'View draw results and history', 'Proof-based winner verification', 'Access full dashboard',
];

export default function SubscribePage() {
  const [selected, setSelected] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) { navigate('/register'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/subscriptions/create-checkout', { plan: selected });
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-16">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] -translate-x-1/2 bg-brand-500/5 rounded-full blur-3xl" />
      </div>
      <div className="w-full max-w-2xl relative">
        <Link to="/" className="block text-center font-display text-3xl font-bold gradient-text mb-4">Golf Heroes</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold mb-3">Choose Your Plan</h1>
          <p className="text-white/50">Join the community. Play. Win. Give.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {plans.map(({ id, label, price, period, saving, popular }) => (
            <motion.div key={id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: id === 'yearly' ? 0.1 : 0 }}
              onClick={() => setSelected(id)}
              className={`card cursor-pointer transition-all duration-200 relative ${selected === id ? 'border-brand-500/60 bg-brand-500/5' : 'border-white/8 hover:border-white/20'}`}>
              {popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap size={10} /> MOST POPULAR
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-lg">{label}</div>
                  {saving && <div className="badge-gold mt-1">{saving}</div>}
                </div>
                <div className={`w-5 h-5 rounded-full border-2 transition-all ${selected === id ? 'border-brand-500 bg-brand-500' : 'border-white/30'}`}>
                  {selected === id && <Check size={12} className="text-white m-auto mt-0.5" />}
                </div>
              </div>
              <div className="font-display text-4xl font-bold text-white">{price}</div>
              <div className="text-white/40 text-sm">{period}</div>
            </motion.div>
          ))}
        </div>

        <div className="card border-white/5 mb-6">
          <div className="text-sm font-medium text-white/60 mb-4">Everything included:</div>
          <div className="grid grid-cols-2 gap-3">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                <Check size={14} className="text-brand-400 flex-shrink-0" /> {f}
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSubscribe} disabled={loading}
          className="btn-gold w-full text-lg py-4 flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
            : <>Subscribe Now <ArrowRight size={18} /></>}
        </button>
        <p className="text-center text-white/30 text-xs mt-3">Secure payment via Stripe. Cancel anytime.</p>
      </div>
    </div>
  );
}
