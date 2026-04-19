import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BarChart2, Users, Trophy, Heart, Award, LogOut, Menu, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/admin',            icon: <LayoutDashboard size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/users',      icon: <Users size={18} />,           label: 'Users' },
  { to: '/admin/draws',      icon: <Trophy size={18} />,          label: 'Draws' },
  { to: '/admin/charities',  icon: <Heart size={18} />,           label: 'Charities' },
  { to: '/admin/winners',    icon: <Award size={18} />,           label: 'Winners' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <div className="font-display text-xl font-bold gradient-text">Golf Heroes</div>
        <div className="text-xs text-gold-400 mt-1">Admin Panel</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`
            }>{icon}{label}</NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="px-4 py-2 text-sm text-white/50 mb-2">{user?.fullName}</div>
        <NavLink to="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <BarChart2 size={18} /> User Dashboard
        </NavLink>
        <button onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      <aside className="hidden lg:flex flex-col w-64 bg-dark-800/60 border-r border-white/5">
        <Sidebar />
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-800 border-r border-white/5 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-dark-800/60">
          <span className="font-display font-bold text-gold-400">Admin</span>
          <button onClick={() => setOpen(true)} className="text-white/60 p-1"><Menu size={22} /></button>
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>
    </div>
  );
}
