import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export default function ProtectedRoute({ 
  user, 
  allowedRoles, 
  requireCompleted = true, 
  children 
}) {
  const token = localStorage.getItem('shirimandir_token');
  const savedUserStr = localStorage.getItem('shirimandir_user');

  // 1. Session check: if not authenticated, redirect to /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const activeUser = user || (savedUserStr ? JSON.parse(savedUserStr) : null);

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  // 2. Profile completion check: must complete profile before any dashboard
  if (requireCompleted && !activeUser.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  // 3. Role check: devotees must not access admin or super_admin routes
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(activeUser.role)) {
    const userDashboard = activeUser.role === 'super_admin'
      ? '/super-admin/dashboard'
      : (activeUser.role === 'admin' ? '/admin/dashboard' : '/devotee/dashboard');

    return (
      <div className="min-h-screen bg-[#FEFDFB] flex items-center justify-center p-4 font-sans text-charcoal-900">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-vermilion-200 shadow-sm text-center">
          <div className="w-14 h-14 bg-vermilion-50 text-vermilion-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-vermilion-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold font-display text-charcoal-900 mb-2">
            403 — Access Forbidden
          </h2>
          <p className="text-xs text-charcoal-600 mb-6 leading-relaxed">
            Your current account role is <span className="font-bold text-copper-600 font-mono">[{activeUser.role}]</span>. 
            This area requires one of <span className="font-bold font-mono">[{allowedRoles.join(', ')}]</span> permissions.
          </p>
          <div className="space-y-2">
            <Link
              to={userDashboard}
              className="w-full bg-charcoal-900 hover:bg-charcoal-800 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all block text-center"
            >
              Return to My Authorized Dashboard
            </Link>
            <Link
              to="/"
              className="w-full border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 py-2.5 px-4 rounded-xl text-xs font-medium transition-all block text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
