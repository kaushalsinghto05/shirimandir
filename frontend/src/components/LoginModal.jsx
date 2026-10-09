import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { authService } from '../services/api';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('quick'); // 'quick' | 'email' | 'register' | 'phone'
  const [email, setEmail] = useState('kaushal@example.com');
  const [password, setPassword] = useState('HarHarMahadev@123');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('1234');
  const [otpStep, setOtpStep] = useState(1); // 1 = enter phone, 2 = enter otp
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register form state
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gotra: 'Kashyap',
    rashi: 'Mesh',
    consent_data_sharing: false
  });

  if (!isOpen) return null;

  const handleQuickLogin = async (role = 'devotee') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const emailToUse = role === 'admin' ? 'admin@shirimandir.org' : 'kaushal@example.com';
      const res = await authService.login(emailToUse, 'HarHarMahadev@123');
      if (res.ok && res.data?.data?.user) {
        setSuccessMsg(`Welcome, ${res.data.data.user.name}! 🙏`);
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(res.data.data.user);
        }, 600);
      } else {
        // Fallback local devotee state
        const fallbackUser = role === 'admin'
          ? { id: 4, name: 'Mandir Chief Administrator', email: 'admin@shirimandir.org', role: 'admin' }
          : { id: 1, name: 'Kaushal Singh', email: 'kaushal@example.com', phone: '+91 98765 43210', gotra: 'Kashyap', role: 'devotee' };
        onLoginSuccess(fallbackUser);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication error');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.login(email.trim(), password);
      if (res.ok && res.data?.data?.user) {
        setSuccessMsg(`Welcome back, ${res.data.data.user.name}! 🙏`);
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(res.data.data.user);
        }, 600);
      } else {
        setErrorMsg(res.data?.error || 'Invalid email or password. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) {
      setErrorMsg('Name, email, and password are required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.register(regForm);
      if (res.ok && res.data?.data?.user) {
        setSuccessMsg(`Account created! Welcome to Shiri Mandir, ${res.data.data.user.name}. 🙏`);
        setTimeout(() => {
          setLoading(false);
          onLoginSuccess(res.data.data.user);
        }, 700);
      } else {
        setErrorMsg(res.data?.error || 'Registration failed.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Registration error');
      setLoading(false);
    }
  };

  const handlePhoneVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        id: 1,
        name: 'Kaushal Singh',
        phone: `+91 ${phone}`,
        email: 'kaushal@example.com',
        gotra: 'Kashyap',
        role: 'devotee'
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="relative max-w-md w-full bg-ivory-50 rounded-3xl shadow-elevated p-6 sm:p-8 animate-scale-in border border-ivory-200">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-charcoal-400 hover:text-charcoal-900 transition-colors p-1 rounded-full hover:bg-ivory-200"
        >
          <X className="w-5 h-5" />
        </button>
        
        {/* Header with Sacred Symbol */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-copper-400 to-copper-600 text-ivory-50 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-copper-glow">
            <span className="text-2xl font-bold">ॐ</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-charcoal-900 mb-1">Sanctum Authentication</h2>
          <p className="text-charcoal-500 font-sans text-xs">
            Login to book authentic pujas, receive consecrated prasad & view live darshan
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-ivory-200/70 p-1 rounded-xl mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('quick'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'quick' ? 'bg-white text-copper-600 shadow-xs' : 'text-charcoal-600 hover:text-charcoal-900'}`}
          >
            Quick 1-Click
          </button>
          <button
            type="button"
            onClick={() => { setMode('email'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'email' ? 'bg-white text-copper-600 shadow-xs' : 'text-charcoal-600 hover:text-charcoal-900'}`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-1.5 rounded-lg transition-all ${mode === 'register' ? 'bg-white text-copper-600 shadow-xs' : 'text-charcoal-600 hover:text-charcoal-900'}`}
          >
            New Devotee
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-vermilion-50 border border-vermilion-200 text-vermilion-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: QUICK 1-CLICK ACCESS */}
        {mode === 'quick' && (
          <div className="space-y-3.5 animate-fade-in">
            <div className="p-3.5 bg-copper-50/60 rounded-2xl border border-copper-200/70">
              <p className="text-xs text-copper-900 font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-copper-600" /> Pre-Configured Seeded Accounts
              </p>
              <p className="text-[11px] text-charcoal-600">
                Instantly authenticate with pre-loaded database accounts without manual entry.
              </p>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('devotee')}
              className="w-full bg-gradient-to-r from-copper-500 to-copper-600 text-white p-3.5 rounded-xl font-medium text-xs hover:from-copper-600 hover:to-copper-700 transition-all flex items-center justify-between shadow-copper-glow group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  KS
                </div>
                <div>
                  <p className="font-bold text-sm">Kaushal Singh (Devotee)</p>
                  <p className="text-[10px] text-white/80">kaushal@example.com • Gotra: Kashyap</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleQuickLogin('admin')}
              className="w-full bg-charcoal-900 text-white p-3.5 rounded-xl font-medium text-xs hover:bg-charcoal-800 transition-all flex items-center justify-between group border border-charcoal-700"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-temple-gold-500/20 text-temple-gold-400 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <div>
                  <p className="font-bold text-sm">Mandir Administrator</p>
                  <p className="text-[10px] text-charcoal-400">admin@shirimandir.org • Operations & Audits</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* MODE 2: EMAIL LOGIN */}
        {mode === 'email' && (
          <form onSubmit={handleEmailLogin} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="devotee@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper-500 hover:bg-copper-600 text-white py-3 rounded-xl font-medium text-xs transition-all shadow-copper-glow flex items-center justify-center gap-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Sanctum'}
            </button>
          </form>
        )}

        {/* MODE 3: NEW REGISTRATION */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 animate-fade-in text-xs">
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={regForm.name}
                onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                placeholder="Devotee Full Name"
                className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                  placeholder="name@mail.com"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={regForm.password}
                  onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={regForm.phone}
                  onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Gotra</label>
                <select
                  value={regForm.gotra}
                  onChange={e => setRegForm({ ...regForm, gotra: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none bg-white"
                >
                  <option value="Kashyap">Kashyap</option>
                  <option value="Bharadwaj">Bharadwaj</option>
                  <option value="Vatsa">Vatsa</option>
                  <option value="Sandilya">Sandilya</option>
                  <option value="Garg">Garg</option>
                  <option value="Vashishta">Vashishta</option>
                </select>
              </div>
            </div>

            <div className="pt-1 flex items-start gap-2">
              <input
                type="checkbox"
                id="consent-reg"
                checked={regForm.consent_data_sharing}
                onChange={e => setRegForm({ ...regForm, consent_data_sharing: e.target.checked })}
                className="mt-0.5 rounded text-copper-500 focus:ring-copper-400"
              />
              <label htmlFor="consent-reg" className="text-[11px] text-charcoal-600 leading-tight">
                I consent to sharing my Sankalp name and gotra with mandir priests for ritual chanting.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-copper-500 hover:bg-copper-600 text-white py-3 rounded-xl font-medium text-xs transition-all shadow-copper-glow mt-2"
            >
              {loading ? 'Creating Account...' : 'Complete Devotee Registration'}
            </button>
          </form>
        )}

        {/* Footer Security Badges */}
        <div className="mt-6 pt-4 border-t border-ivory-200 flex items-center justify-between text-[11px] text-charcoal-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-copper-500" /> 256-Bit SSL Encrypted
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> DPDP Act 2023 Compliant
          </span>
        </div>
      </div>
    </div>
  );
}
