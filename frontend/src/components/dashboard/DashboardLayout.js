import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Heart, Trophy, Award, User, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard',          icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { to: '/dashboard/scores',   icon: <Target size={18} />,          label: 'My Scores' },
  { to: '/dashboard/charity',  icon: <Heart size={18} />,           label: 'My Charity' },
  { to: '/dashboard/draws',    icon: <Trophy size={18} />,          label: 'Draws' },
  { to: '/dashboard/winnings', icon: <Award size={18} />,           label: 'Winnings' },
  { to: '/dashboard/profile',  icon: <User size={18} />,            label: 'Profile' },
];

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/5">
        <div className="font-display text-xl font-bold gradient-text">Golf Heroes</div>
        <div className="text-xs text-white/30 mt-1">Player Dashboard</div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20' : 'text-white/50 hover:text-white hover:bg-white/5'}`
            }>
            {icon} {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5 space-y-1">
        {isAdmin && (
          <NavLink to="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gold-400 hover:bg-gold-500/10 transition-all">
            <Shield size={18} /> Admin Panel
          </NavLink>
        )}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
          <div className="w-8 h-8 bg-brand-500/20 rounded-full flex items-center justify-center text-brand-400 font-bold text-sm flex-shrink-0">
            {user?.fullName?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.fullName}</div>
            <div className="text-xs text-white/30 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-dark-900 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark-800/60 border-r border-white/5 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-dark-800 border-r border-white/5 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-dark-800/60">
          <span className="font-display font-bold gradient-text">Golf Heroes</span>
          <button onClick={() => setOpen(true)} className="text-white/60 p-1"><Menu size={22} /></button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
