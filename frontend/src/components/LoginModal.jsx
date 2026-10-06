import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState(1); // 1: phone, 2: otp, 3: profile
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profile, setProfile] = useState({ name: '', gotra: '', rashi: '', email: '' });

  if (!isOpen) return null;

  const handleSendOtp = () => setStep(2);
  const handleVerifyOtp = () => setStep(3);
  const handleSubmitProfile = () => {
    onLoginSuccess({ ...profile, phone });
  };

  const handleProfileChange = (e) => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all">
      <div className="relative max-w-md w-full bg-ivory-50 rounded-3xl shadow-elevated p-6 sm:p-8 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-charcoal-500 hover:text-charcoal-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-copper-400 text-ivory-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">ॐ</span>
          </div>
          <h2 className="text-2xl font-display text-charcoal-900 mb-2">Welcome, Devotee</h2>
          <p className="text-charcoal-500 font-sans text-sm">
            Login to book pujas, track prasad & manage your spiritual journey
          </p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Phone Number</label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-ivory-200 bg-ivory-100 text-charcoal-700 sm:text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-xl focus:ring-copper-400 focus:border-copper-400 sm:text-sm border-ivory-200"
                  placeholder="Enter your phone number"
                />
              </div>
              <button 
                onClick={handleSendOtp}
                className="mt-6 w-full bg-copper-400 text-ivory-50 py-3 rounded-xl hover:bg-copper-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm-lg shadow-copper-glow font-medium"
              >
                Send OTP
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in-up">
              <label className="block text-sm font-medium text-charcoal-700 mb-2">Enter OTP</label>
              <input
                type="text"
                maxLength="4"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400 text-center tracking-widest text-lg font-mono"
                placeholder="0 0 0 0"
              />
              <button 
                onClick={handleVerifyOtp}
                className="mt-6 w-full bg-copper-400 text-ivory-50 py-3 rounded-xl hover:bg-copper-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm-lg shadow-copper-glow font-medium"
              >
                Verify OTP
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in-up space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Full Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} className="w-full px-4 py-2 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Gotra</label>
                <select name="gotra" value={profile.gotra} onChange={handleProfileChange} className="w-full px-4 py-2 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400">
                  <option value="">Select Gotra</option>
                  <option value="Kashyap">Kashyap</option>
                  <option value="Bharadwaj">Bharadwaj</option>
                  <option value="Vatsa">Vatsa</option>
                  <option value="Sandilya">Sandilya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Rashi</label>
                <select name="rashi" value={profile.rashi} onChange={handleProfileChange} className="w-full px-4 py-2 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400">
                  <option value="">Select Rashi</option>
                  <option value="Mesh">Mesh (Aries)</option>
                  <option value="Vrishabha">Vrishabha (Taurus)</option>
                  <option value="Mithun">Mithun (Gemini)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Email</label>
                <input type="email" name="email" value={profile.email} onChange={handleProfileChange} className="w-full px-4 py-2 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
              </div>
              <button 
                onClick={handleSubmitProfile}
                className="mt-6 w-full bg-copper-400 text-ivory-50 py-3 rounded-xl hover:bg-copper-500 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm-lg shadow-copper-glow font-medium"
              >
                Enter Sanctum
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
