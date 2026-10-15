import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { authService, getStoredToken, clearStoredAuth } from '../services/api';

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

  // Check if session expired query parameter is present or session was marked expired
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const hasExpiredParam = params.get('expired') === '1';
    let hasExpiredSession = false;
    try {
      hasExpiredSession = sessionStorage.getItem('shirimandir_session_expired') === '1';
    } catch {}

    if (hasExpiredParam || hasExpiredSession) {
      setErrorMsg('Your session has expired. Please log in again.');
      clearStoredAuth();
      try {
        sessionStorage.removeItem('shirimandir_session_expired');
      } catch {}
    }
  }, [location.search]);

  // Synchronize browser autofilled credentials with component state
  useEffect(() => {
    const syncAutofill = () => {
      const emailEl = document.querySelector('input[type="email"]');
      const passEl = document.querySelector('input[type="password"]');
      if (emailEl && emailEl.value && !email) {
        setEmail(emailEl.value);
      }
      if (passEl && passEl.value && !password) {
        setPassword(passEl.value);
      }
    };

    const t1 = setTimeout(syncAutofill, 80);
    const t2 = setTimeout(syncAutofill, 300);
    const t3 = setTimeout(syncAutofill, 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const token = getStoredToken();
  const activeUser = currentUser || (() => {
    try {
      const savedUserStr = localStorage.getItem('shirimandir_user');
      return savedUserStr ? JSON.parse(savedUserStr) : null;
    } catch {
      return null;
    }
  })();

  // 4. While auth check is running, show loading screen. Do NOT redirect until it finishes.
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
        <p className="text-xs text-charcoal-500 mt-1">Verifying your sanctum credentials</p>
      </div>
    );
  }

  // A logged-in user visiting /login is redirected onward, not shown login.
  // ONLY if not expired and token is valid!
  const searchParams = new URLSearchParams(location.search);
  const isExplicitExpired = searchParams.get('expired') === '1';
  if (!isExplicitExpired && token && activeUser && activeUser.id) {
    return <Navigate to={redirectDestination(activeUser)} replace />;
  }

  // Populate Demo Role Credentials into login form (user reviews and clicks Sign In)
  const handleSelectDemoRole = (demoEmail, demoPassword, roleTitle) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setActiveTab('login');
    setErrorMsg('');
    setSuccessMsg(`${roleTitle} credentials loaded. Please click "Sign In to Sanctum" below to log in.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Capture values directly from DOM in case browser autofilled without firing React onChange
    const formEl = e.currentTarget;
    const domEmail = formEl.querySelector('input[type="email"]')?.value || '';
    const domPassword = formEl.querySelector('input[type="password"]')?.value || '';

    const effectiveEmail = (email || domEmail).trim();
    const effectivePassword = password || domPassword;

    if (effectiveEmail && !email) setEmail(effectiveEmail);
    if (effectivePassword && !password) setPassword(effectivePassword);

    // 1. Validate email format
    if (!effectiveEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(effectiveEmail)) {
      setErrorMsg('Please enter a valid email format (e.g. devotee@example.com).');
      return;
    }

    // 2. Validate password minimum length (8 characters)
    if (!effectivePassword) {
      setErrorMsg('Please enter your password.');
      return;
    }
    if (effectivePassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await authService.login(effectiveEmail, effectivePassword);
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
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="email" className="block text-xs font-semibold text-charcoal-700">
                  Email Address
                </label>
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="text-[10px] text-copper-600 hover:text-copper-700 font-medium cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  id="email"
                  name="email"
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
              <label htmlFor="password" className="block text-xs font-semibold text-charcoal-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  id="password"
                  name="password"
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
            <p className="text-[11px] font-semibold text-charcoal-700 mb-2">
              Pre-Configured Seeded Accounts (for demo testing):
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectDemoRole('kaushal@example.com', 'HarHarMahadev@123', 'Devotee')}
                className="py-2.5 px-1.5 rounded-xl bg-ivory-100 hover:bg-copper-100 hover:text-copper-900 text-charcoal-800 font-bold border border-ivory-300 text-center transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center"
              >
                <span>Devotee</span>
                <span className="text-[9px] font-normal text-charcoal-500 truncate max-w-full">kaushal@...</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoRole('admin@shirimandir.org', 'HarHarMahadev@123', 'Admin')}
                className="py-2.5 px-1.5 rounded-xl bg-[#d4a15a]/20 hover:bg-[#d4a15a]/35 text-[#8a5b1a] font-bold border border-[#d4a15a]/40 text-center transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center"
              >
                <span>Admin</span>
                <span className="text-[9px] font-normal text-[#8a5b1a]/80 truncate max-w-full">admin@...</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectDemoRole('superadmin@shirimandir.org', 'HarHarMahadev@123', 'Super Admin')}
                className="py-2.5 px-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold border border-charcoal-900 text-center transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex flex-col items-center justify-center"
              >
                <span>Super Admin</span>
                <span className="text-[9px] font-normal text-charcoal-300 truncate max-w-full">superadmin@...</span>
              </button>
            </div>
            <p className="text-[10px] text-charcoal-500 mt-2 text-center">
              Click any role above to pre-fill the form, then click &ldquo;Sign In to Sanctum&rdquo;.
            </p>
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
