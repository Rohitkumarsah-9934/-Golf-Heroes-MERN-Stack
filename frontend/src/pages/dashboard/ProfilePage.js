import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, CreditCard, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, isSubscribed } = useAuth();
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '', handicap: user?.handicap || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/me', form);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    setSavingPw(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  const handlePortal = async () => {
    try {
      const { data } = await api.post('/subscriptions/portal');
      window.location.href = data.url;
    } catch { toast.error('Could not open billing portal'); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel subscription at period end?')) return;
    setCancelling(true);
    try {
      await api.post('/subscriptions/cancel');
      toast.success('Subscription will cancel at period end.');
    } catch { toast.error('Failed to cancel'); }
    finally { setCancelling(false); }
  };

  const sub = user?.subscription;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-3xl font-bold">My Profile</h1>

      {/* Profile form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
        <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2"><User size={18} className="text-brand-400" /> Personal Info</h2>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input" value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="email" className="input pl-11 opacity-50 cursor-not-allowed" value={user?.email} disabled />
            </div>
            <p className="text-xs text-white/30 mt-1">Email cannot be changed.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="tel" className="input pl-11" placeholder="+44 7700 000000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Handicap</label>
              <input type="number" min="0" max="54" className="input" placeholder="e.g. 12" value={form.handicap} onChange={e => setForm(p => ({ ...p, handicap: e.target.value }))} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 py-2">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />} Save Changes
          </button>
        </form>
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
        <h2 className="font-display font-bold text-lg mb-5">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {['currentPassword', 'newPassword', 'confirm'].map((field, i) => (
            <div key={field}>
              <label className="label">{['Current Password', 'New Password', 'Confirm New Password'][i]}</label>
              <input type="password" className="input" placeholder="••••••••" value={pwForm[field]} onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))} required />
            </div>
          ))}
          <button type="submit" disabled={savingPw} className="btn-secondary flex items-center gap-2 py-2">
            {savingPw ? <div className="w-4 h-4 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" /> : <Save size={15} />} Update Password
          </button>
        </form>
      </motion.div>

      {/* Subscription */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
        <h2 className="font-display font-bold text-lg mb-5 flex items-center gap-2"><CreditCard size={18} className="text-gold-400" /> Subscription</h2>
        {sub ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Plan', value: sub.plan?.charAt(0).toUpperCase() + sub.plan?.slice(1) },
                { label: 'Status', value: <span className={`badge-${sub.status === 'active' ? 'green' : 'gray'}`}>{sub.status}</span> },
                { label: 'Renewal Date', value: sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : '—' },
                { label: 'Cancel at Period End', value: sub.cancelAtPeriodEnd ? 'Yes' : 'No' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="text-xs text-white/40">{label}</div>
                  <div className="font-medium mt-0.5">{value}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button onClick={handlePortal} className="btn-secondary py-2 text-sm">Manage Billing</button>
              {sub.status === 'active' && !sub.cancelAtPeriodEnd && (
                <button onClick={handleCancel} disabled={cancelling} className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300 px-4 py-2 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-all">
                  <AlertTriangle size={14} /> Cancel Subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-white/40 mb-4">No active subscription.</p>
            <a href="/subscribe" className="btn-gold py-2 px-6">Subscribe Now</a>
          </div>
        )}
      </motion.div>
    </div>
  );
}
