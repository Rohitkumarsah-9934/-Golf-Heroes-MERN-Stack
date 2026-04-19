import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Star, X, Save } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const empty = { name: '', description: '', websiteUrl: '', logoUrl: '', isFeatured: false };

export default function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, 'new' = create, id = edit
  const [form, setForm] = useState(empty);

  const load = () => api.get('/charities').then(r => setCharities(r.data.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(empty); setEditing('new'); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description, websiteUrl: c.websiteUrl || '', logoUrl: c.logoUrl || '', isFeatured: c.isFeatured }); setEditing(c._id); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing === 'new') {
        await api.post('/admin/charities', form);
        toast.success('Charity created!');
      } else {
        await api.put(`/admin/charities/${editing}`, form);
        toast.success('Charity updated!');
      }
      setEditing(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this charity?')) return;
    try { await api.delete(`/admin/charities/${id}`); toast.success('Deactivated'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Charities</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 py-2"><Plus size={16} />Add Charity</button>
      </div>

      {/* Form */}
      {editing !== null && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card border-brand-500/30">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-bold">{editing === 'new' ? 'New Charity' : 'Edit Charity'}</h3>
            <button onClick={() => setEditing(null)} className="text-white/30 hover:text-white"><X size={18} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Name *</label>
                <input type="text" className="input" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Website URL</label>
                <input type="url" className="input" placeholder="https://" value={form.websiteUrl} onChange={e => setForm(p => ({ ...p, websiteUrl: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea rows={3} className="input resize-none" required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div>
              <label className="label">Logo URL</label>
              <input type="url" className="input" placeholder="https://..." value={form.logoUrl} onChange={e => setForm(p => ({ ...p, logoUrl: e.target.value }))} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-brand-500" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
              <span className="text-sm text-white/70">Featured on homepage</span>
            </label>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex items-center gap-2 py-2"><Save size={15} />Save</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary py-2">Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-28 card animate-pulse" />)}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {charities.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.name}</h3>
                  {c.isFeatured && <Star size={14} className="text-gold-400" fill="currentColor" />}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(c)} className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(c._id)} className="text-white/30 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="text-white/40 text-xs line-clamp-2 mb-3">{c.description}</p>
              <div className="text-brand-400 text-xs font-medium">£{c.totalRaised?.toLocaleString()} raised</div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
