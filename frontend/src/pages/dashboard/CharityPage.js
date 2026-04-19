import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Check, Search, ExternalLink, Sliders } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function CharityPage() {
  const [charities, setCharities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [pct, setPct] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/charities').then(r => setCharities(r.data.data || [])).catch(() => {});
    api.get('/charities/my-selection').then(r => {
      if (r.data.data) {
        setSelected(r.data.data.charity._id);
        setPct(r.data.data.contributionPercentage);
      }
    }).catch(() => {});
  }, []);

  const filtered = charities.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!selected) return toast.error('Please select a charity first');
    setSaving(true);
    try {
      await api.post('/charities/select', { charityId: selected, contributionPercentage: pct });
      toast.success('Charity selection saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">My Charity</h1>
        <p className="text-white/40 text-sm mt-1">Choose who benefits from your subscription every month.</p>
      </div>

      {/* Contribution slider */}
      <div className="card border-brand-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Sliders size={18} className="text-brand-400" />
          <h3 className="font-semibold">Contribution Percentage</h3>
        </div>
        <div className="flex items-center gap-4">
          <input type="range" min="10" max="100" step="5" value={pct}
            onChange={e => setPct(Number(e.target.value))}
            className="flex-1 accent-brand-500" />
          <div className="w-16 text-center font-display text-2xl font-bold text-brand-400">{pct}%</div>
        </div>
        <p className="text-xs text-white/30 mt-2">Minimum 10% of your subscription fee. The rest funds the prize pool.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" className="input pl-11" placeholder="Search charities..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Charity list */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((c, i) => (
          <motion.div key={c._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            onClick={() => setSelected(c._id)}
            className={`card cursor-pointer transition-all duration-200 relative ${selected === c._id ? 'border-brand-500/60 bg-brand-500/8' : 'border-white/5 hover:border-white/15'}`}>
            {c.isFeatured && <div className="badge-gold absolute top-4 right-4">Featured</div>}
            {selected === c._id && (
              <div className="absolute top-4 right-4 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 font-bold text-xl flex-shrink-0">
                {c.name[0]}
              </div>
              <div>
                <div className="font-semibold pr-8">{c.name}</div>
                <div className="flex items-center gap-1 text-xs text-brand-400">
                  <Heart size={10} /> £{c.totalRaised?.toLocaleString()} raised
                </div>
              </div>
            </div>
            <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{c.description}</p>
            {c.websiteUrl && (
              <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-white/30 hover:text-brand-400 text-xs mt-2 transition-colors">
                Visit website <ExternalLink size={10} />
              </a>
            )}
          </motion.div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saving || !selected} className="btn-primary w-full flex items-center justify-center gap-2">
        {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Heart size={16} /> Save Charity Selection</>}
      </button>
    </div>
  );
}
