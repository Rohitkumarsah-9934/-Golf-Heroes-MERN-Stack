import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Heart, ExternalLink, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

export default function CharitiesPublic() {
  const [charities, setCharities] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.get(`/charities?search=${search}`)
        .then(r => setCharities(r.data.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="min-h-screen bg-dark-900 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold mb-3">Our <span className="gradient-text">Charities</span></h1>
          <p className="text-white/50 max-w-lg mx-auto">Every subscription supports one of these incredible causes. Choose yours when you subscribe.</p>
        </div>

        <div className="relative mb-10">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input type="text" className="input pl-11 max-w-md mx-auto block" placeholder="Search charities..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-dark-700/50" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {charities.map((c, i) => (
              <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="card-hover">
                {c.isFeatured && <div className="badge-gold mb-3">Featured</div>}
                <div className="w-14 h-14 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 font-bold text-2xl mb-4">
                  {c.name[0]}
                </div>
                <h3 className="font-semibold text-lg mb-2">{c.name}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-3">{c.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-brand-400 text-sm">
                    <Heart size={14} /> £{c.totalRaised?.toLocaleString()} raised
                  </div>
                  {c.websiteUrl && (
                    <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="text-white/30 hover:text-white/60 transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && charities.length === 0 && (
          <div className="text-center py-16 text-white/30">No charities found.</div>
        )}

        <div className="text-center mt-12">
          <Link to="/register" className="btn-gold px-8 py-3">Join & Choose Your Charity</Link>
        </div>
      </div>
    </div>
  );
}
