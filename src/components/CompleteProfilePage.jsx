import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Sparkles, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { authService } from '../services/api';

export default function CompleteProfilePage({ currentUser, onProfileUpdated }) {
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [gotra, setGotra] = useState(currentUser?.gotra || 'Kashyap');
  const [rashi, setRashi] = useState(currentUser?.rashi || 'Mesh');
  const [nakshatra, setNakshatra] = useState(currentUser?.nakshatra || 'Ashwini');
  const [consentDataSharing, setConsentDataSharing] = useState(Boolean(currentUser?.consent_data_sharing));
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const navigate = useNavigate();

  // If user already completed their profile, redirect directly to their dashboard
  useEffect(() => {
    const savedUserStr = localStorage.getItem('shirimandir_user');
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.profile_completed) {
          const dest = u.role === 'super_admin' 
            ? '/super-admin/dashboard' 
            : (u.role === 'admin' ? '/admin/dashboard' : '/devotee/dashboard');
          navigate(dest, { replace: true });
        }
      } catch {
        // Continue
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || name.trim().length < 2) {
      setErrorMsg('Please enter your full legal or devotee name (minimum 2 characters).');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.completeProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        gotra,
        rashi,
        nakshatra,
        consent_data_sharing: consentDataSharing
      });

      if (res.ok && res.data?.data?.user) {
        const updatedUser = res.data.data.user;
        setSuccessMsg('Profile completed successfully! Opening your dashboard...');
        if (onProfileUpdated) onProfileUpdated(updatedUser);

        setTimeout(() => {
          const dest = updatedUser.role === 'super_admin'
            ? '/super-admin/dashboard'
            : (updatedUser.role === 'admin' ? '/admin/dashboard' : '/devotee/dashboard');
          navigate(dest, { replace: true });
        }, 500);
      } else {
        setErrorMsg(res.data?.error || res.error || 'Failed to update profile. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error while saving profile.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFDFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-charcoal-900">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-[#d4a15a] to-[#c87d43] text-white rounded-2xl flex items-center justify-center shadow-md font-bold text-2xl mx-auto mb-3">
          ॐ
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900 tracking-tight">
          Complete Your Devotee Profile
        </h1>
        <p className="mt-1 text-xs text-charcoal-500">
          Required before accessing dashboard, Vedic pujas, and consecration records
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm rounded-3xl border border-ivory-300 sm:px-10">
          
          <div className="p-3.5 bg-copper-50/70 rounded-2xl border border-copper-200/80 mb-5">
            <p className="text-xs text-copper-900 font-semibold mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-copper-600" /> Sacred Sankalp Profile Setup
            </p>
            <p className="text-[11px] text-charcoal-600 leading-relaxed">
              Your name and gotra are used for sanctum chanting during live pujas. All dashboards remain locked until this one-time profile is completed.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-vermilion-50 border border-vermilion-200 text-vermilion-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Full Legal / Devotee Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kaushal Singh"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">
                Phone Number (for SMS & Prasad Updates)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Gotra & Rashi */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Gotra</label>
                <select
                  value={gotra}
                  onChange={(e) => setGotra(e.target.value)}
                  className="w-full p-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none bg-white"
                >
                  <option value="Kashyap">Kashyap</option>
                  <option value="Bharadwaj">Bharadwaj</option>
                  <option value="Vatsa">Vatsa</option>
                  <option value="Sandilya">Sandilya</option>
                  <option value="Garg">Garg</option>
                  <option value="Vashishta">Vashishta</option>
                  <option value="Vishwamitra">Vishwamitra</option>
                  <option value="Gautam">Gautam</option>
                  <option value="Other / Unknown">Other / Unknown</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Rashi (Zodiac)</label>
                <select
                  value={rashi}
                  onChange={(e) => setRashi(e.target.value)}
                  className="w-full p-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none bg-white"
                >
                  <option value="Mesh">Mesh (Aries)</option>
                  <option value="Vrishabh">Vrishabh (Taurus)</option>
                  <option value="Mithun">Mithun (Gemini)</option>
                  <option value="Kark">Kark (Cancer)</option>
                  <option value="Simha">Simha (Leo)</option>
                  <option value="Kanya">Kanya (Virgo)</option>
                  <option value="Tula">Tula (Libra)</option>
                  <option value="Vrishchik">Vrishchik (Scorpio)</option>
                  <option value="Dhanu">Dhanu (Sagittarius)</option>
                  <option value="Makar">Makar (Capricorn)</option>
                  <option value="Kumbh">Kumbh (Aquarius)</option>
                  <option value="Meen">Meen (Pisces)</option>
                </select>
              </div>
            </div>

            {/* Nakshatra */}
            <div>
              <label className="block font-semibold text-charcoal-700 mb-1">Birth Nakshatra</label>
              <input
                type="text"
                value={nakshatra}
                onChange={(e) => setNakshatra(e.target.value)}
                placeholder="e.g. Ashwini, Rohini, Moola"
                className="w-full p-2 rounded-xl border border-ivory-300 text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
              />
            </div>

            {/* Privacy Consent Checkbox */}
            <div className="pt-2 flex items-start gap-2.5">
              <input
                type="checkbox"
                id="consent-profile"
                checked={consentDataSharing}
                onChange={(e) => setConsentDataSharing(e.target.checked)}
                className="mt-0.5 rounded text-copper-500 focus:ring-copper-400"
              />
              <label htmlFor="consent-profile" className="text-[11px] text-charcoal-600 leading-tight">
                I consent to sharing my Sankalp name and Gotra with verified mandir archakas for sacred ritual chanting (DPDP Act 2023).
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Saving Profile...</span>
              ) : (
                <>
                  <span>Save Profile & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-ivory-200 flex items-center justify-between text-[10px] text-charcoal-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-copper-500" /> 256-Bit SSL Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" /> DPDP Act 2023 Compliant
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
