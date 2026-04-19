import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Trash2, Shield, User } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = (q = '') => {
    setLoading(true);
    api.get(`/admin/users?search=${q}&limit=50`)
      .then(r => setUsers(r.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setTimeout(() => load(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user permanently?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      load(search);
    } catch { toast.error('Failed to delete'); }
  };

  const viewUser = async (id) => {
    try {
      const { data } = await api.get(`/admin/users/${id}`);
      setSelected(data.data);
    } catch { toast.error('Failed to load user'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Users</h1>
        <span className="badge-gray">{users.length} shown</span>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" className="input pl-11" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 card animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {users.map((u, i) => (
            <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="card py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400 font-bold flex-shrink-0">
                {u.fullName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{u.fullName}</div>
                <div className="text-xs text-white/40 truncate">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                {u.role === 'admin' ? <span className="badge-gold flex items-center gap-1"><Shield size={10} />Admin</span>
                  : <span className="badge-gray flex items-center gap-1"><User size={10} />User</span>}
                <span className={`badge-${u.subscription?.status === 'active' ? 'green' : 'gray'}`}>
                  {u.subscription?.status || 'No Sub'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => viewUser(u._id)} className="text-white/30 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"><Eye size={15} /></button>
                <button onClick={() => handleDelete(u._id)} className="text-white/30 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* User detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="card max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">{selected.fullName}</h3>
              <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                ['Email', selected.email],
                ['Role', selected.role],
                ['Phone', selected.phone || '—'],
                ['Handicap', selected.handicap ?? '—'],
                ['Subscription', selected.subscription?.status || 'None'],
                ['Plan', selected.subscription?.plan || '—'],
                ['Joined', new Date(selected.createdAt).toLocaleDateString()],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-white/40">{l}</span>
                  <span className="font-medium capitalize">{v}</span>
                </div>
              ))}
              {selected.scores?.length > 0 && (
                <div>
                  <div className="text-white/40 mb-2">Scores</div>
                  <div className="flex gap-2 flex-wrap">
                    {selected.scores.map(s => (
                      <div key={s._id} className="bg-brand-500/10 rounded-lg px-3 py-1 text-brand-400 text-sm font-bold">{s.score}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
