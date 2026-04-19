import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Scores from './pages/dashboard/Scores';
import CharityPage from './pages/dashboard/CharityPage';
import DrawsPage from './pages/dashboard/DrawsPage';
import WinningsPage from './pages/dashboard/WinningsPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import SubscribePage from './pages/SubscribePage';
import CharitiesPublic from './pages/CharitiesPublic';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDraws from './pages/admin/AdminDraws';
import AdminCharities from './pages/admin/AdminCharities';
import AdminWinners from './pages/admin/AdminWinners';

// Layouts
import DashboardLayout from './components/dashboard/DashboardLayout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/charities" element={<CharitiesPublic />} />
      <Route path="/subscribe" element={<SubscribePage />} />

      {/* Auth */}
      <Route path="/login"    element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route index          element={<Dashboard />} />
        <Route path="scores"  element={<Scores />} />
        <Route path="charity" element={<CharityPage />} />
        <Route path="draws"   element={<DrawsPage />} />
        <Route path="winnings"element={<WinningsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index              element={<AdminDashboard />} />
        <Route path="users"       element={<AdminUsers />} />
        <Route path="draws"       element={<AdminDraws />} />
        <Route path="charities"   element={<AdminCharities />} />
        <Route path="winners"     element={<AdminWinners />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#0d1410', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' },
            success: { iconTheme: { primary: '#22c55e', secondary: '#080c0a' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#080c0a' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
