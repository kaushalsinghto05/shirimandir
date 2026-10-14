import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage({ currentUser, authLoading = false, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to redirect user to appropriate destination based on profile & role
  const redirectDestination = (u) => {
    if (!u) return '/login';
    if (!u.profile_completed) {
      return '/complete-profile';
    }
    if (u.role === 'super_admin') {
      return '/super-admin/dashboard';
    }
    if (u.role === 'admin') {
      return '/admin/dashboard';
    }
    return '/devotee/dashboard';
  };

  // Check if session expired query parameter is present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === '1') {
      setErrorMsg('Your session has expired. Please log in again.');
    }
  }, [location.search]);

  // If already logged in, redirect forward immediately (waits until auth check finishes)
  useEffect(() => {
    if (authLoading) return;
    const token = localStorage.getItem('shirimandir_token');
    const activeUser = currentUser || (() => {
      try {
        const savedUserStr = localStorage.getItem('shirimandir_user');
        return savedUserStr ? JSON.parse(savedUserStr) : null;
      } catch {
        return null;
      }
    })();

    if (token && activeUser && activeUser.id) {
      navigate(redirectDestination(activeUser), { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Validate email format
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMsg('Please enter a valid email format (e.g. devotee@example.com).');
      return;
    }

    // 2. Validate password minimum length (8 characters)
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await authService.login(trimmedEmail, password);
        if (res.ok && res.data?.data) {
          const userObj = res.data.data.user || res.data.data;
          setSuccessMsg(`Authentication successful! Welcome back, ${userObj.name || userObj.email}.`);
          if (onAuthSuccess) onAuthSuccess(userObj);
          setTimeout(() => {
            navigate(redirectDestination(userObj), { replace: true });
          }, 300);
        } else {
          setErrorMsg(res.data?.error || res.error || 'Invalid email or password.');
          setLoading(false);
        }
      } else {
        // Register flow: new registrations default to 'devotee' and profile_completed = false
        const res = await authService.register({ email: trimmedEmail, password });
        if (res.ok && res.data?.data) {
          const userObj = res.data.data.user || res.data.data;
          setSuccessMsg('Account created successfully! Proceeding to complete your profile...');
          if (onAuthSuccess) onAuthSuccess(userObj);
          setTimeout(() => {
            navigate('/complete-profile', { replace: true });
          }, 400);
        } else {
          setErrorMsg(res.data?.error || res.error || 'Registration failed. Email may already be in use.');
          setLoading(false);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network request failed. Please check your connection.');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FEFDFB] flex flex-col items-center justify-center font-sans text-charcoal-900">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a15a] to-[#c87d43] text-white flex items-center justify-center font-bold text-2xl shadow-md animate-pulse mb-4">
          ॐ
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-800">
          <span className="w-2 h-2 rounded-full bg-copper-500 animate-ping"></span>
          <span>Checking session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFDFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-charcoal-900">
      
      {/* Top Brand Nav */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-12 h-12 bg-gradient-to-br from-[#d4a15a] to-[#c87d43] text-white rounded-2xl flex items-center justify-center shadow-md font-bold text-2xl group-hover:scale-105 transition-transform">
            ॐ
          </div>
        </Link>
        <h1 className="text-3xl font-display font-bold text-charcoal-900 tracking-tight">
          Shiri Mandir Sanctum Access
        </h1>
        <p className="mt-1 text-xs text-charcoal-500">
          Vedic Devotion • Transparent Sevas • Statutory Compliance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-ivory-300 sm:px-10">
          
          {/* Tabs: Login / Register */}
          <div className="flex bg-ivory-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-copper-600 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-copper-600 shadow-xs'
                  : 'text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-vermilion-50 border border-vermilion-200 text-vermilion-700 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form (Email + Password only) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="devotee@example.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-charcoal-400 mt-1">Must be a valid email format.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  autoComplete={activeTab === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-charcoal-400 mt-1">Minimum 8 characters required (bcrypt encrypted).</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Processing...</span>
              ) : activeTab === 'login' ? (
                <>
                  <span>Sign In to Sanctum</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Create Devotee Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick seeded demo helper */}
          <div className="mt-6 pt-5 border-t border-ivory-200">
            <p className="text-[11px] font-semibold text-charcoal-600 mb-2">
              Pre-Configured Seeded Accounts (for demo testing):
            </p>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEmail('kaushal@example.com');
                  setPassword('HarHarMahadev@123');
                  setActiveTab('login');
                }}
                className="p-1.5 rounded-lg bg-ivory-100 hover:bg-copper-50 text-charcoal-700 border border-ivory-200 text-center"
              >
                Devotee
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@shirimandir.org');
                  setPassword('HarHarMahadev@123');
                  setActiveTab('login');
                }}
                className="p-1.5 rounded-lg bg-ivory-100 hover:bg-copper-50 text-charcoal-700 border border-ivory-200 text-center"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin@shirimandir.org');
                  setPassword('HarHarMahadev@123');
                  setActiveTab('login');
                }}
                className="p-1.5 rounded-lg bg-ivory-100 hover:bg-copper-50 text-charcoal-700 border border-ivory-200 text-center"
              >
                Super Admin
              </button>
            </div>
          </div>

          {/* Bottom Security Seals */}
          <div className="mt-6 pt-4 border-t border-ivory-200 flex items-center justify-between text-[10px] text-charcoal-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-copper-500" /> Bcrypt Hash Protection
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> DPDP Act 2023 Compliant
            </span>
          </div>

        </div>

        <div className="text-center mt-4">
          <Link to="/" className="text-xs text-charcoal-500 hover:text-copper-600 underline">
            ← Return to Shiri Mandir Home
          </Link>
        </div>
      </div>
    </div>
  );
}
