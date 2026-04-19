import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Trophy, Heart, Award, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

const Stat = ({ icon, label, value, color = 'brand', delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card">
    <div className={`w-11 h-11 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-400 mb-4`}>{icon}</div>
    <div className="font-display text-3xl font-bold">{value}</div>
    <div className="text-sm text-white/50 mt-1">{label}</div>
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setStats(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="h-32 card animate-pulse" />)}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Admin <span className="gradient-text">Dashboard</span></h1>
        <p className="text-white/40 text-sm mt-1">Platform overview and key metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Stat icon={<Users size={20} />}     label="Total Users"           value={stats?.totalUsers || 0}                                delay={0}   />
        <Stat icon={<TrendingUp size={20} />} label="Active Subscribers"    value={stats?.activeSubscriptions || 0}     color="brand"  delay={0.05} />
        <Stat icon={<Trophy size={20} />}    label="Total Draws"           value={stats?.totalDraws || 0}               color="gold"   delay={0.1} />
        <Stat icon={<Award size={20} />}     label="Winners Paid"          value={stats?.totalWinners || 0}             color="gold"   delay={0.15} />
        <Stat icon={<Heart size={20} />}     label="Charity Raised"        value={`£${(stats?.totalCharityDonated||0).toFixed(2)}`}     delay={0.2} />
        <Stat icon={<Trophy size={20} />}    label="Total Prize Paid"      value={`£${(stats?.totalPrizePaid||0).toFixed(2)}`} color="gold" delay={0.25} />
      </div>

      <div className="card border-gold-500/10">
        <h2 className="font-display font-bold text-lg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Run Draw', href: '/admin/draws' },
            { label: 'Verify Winners', href: '/admin/winners' },
            { label: 'Manage Users', href: '/admin/users' },
            { label: 'Add Charity', href: '/admin/charities' },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="btn-secondary py-2 text-sm text-center">{label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}
