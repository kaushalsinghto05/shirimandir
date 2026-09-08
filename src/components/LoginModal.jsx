import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  Lock 
} from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState('input'); // 'input' or 'otp'
  const [phoneOrEmail, setPhoneOrEmail] = useState('9876543210');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneOrEmail) return;
    setStep('otp');
  };

  const handleOtpChange = (val, index) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-advance focus
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleQuickDevFill = () => {
    setOtp(['1', '0', '0', '8']);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({
        name: "Kaushal Singh",
        phone: `+91 ${phoneOrEmail}`,
        email: "kaushal.singh@mandirveda.com",
        gotra: "Kashyap",
        rashi: "Dhanu (Sagittarius)",
        isVerified: true
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden">
        
        {/* Decorative Arch Top Banner */}
        <div className="bg-gradient-to-r from-sanctum-950 via-sanctum-900 to-sanctum-950 p-6 text-white text-center relative border-b border-gold-500/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-sanctum-950/80 border border-white/20 text-white hover:bg-sanctum-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold-glow mb-3">
            <span className="text-sanctum-950 font-serif font-bold text-2xl">ॐ</span>
          </div>

          <h3 className="text-xl font-serif font-bold text-sandstone-50">
            Devotee Sanctum Sign In
          </h3>
          <p className="text-xs text-sandstone-300 mt-1">
            Access personalized Gotra recitation, live video sankalpa & prasad tracking
          </p>
        </div>

        {/* Modal Form Content */}
        <div className="p-6">
          {step === 'input' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-sandstone-700 mb-2">
                  Mobile Number or Devotee Email
                </label>
                <div className="flex rounded-2xl border border-sandstone-200 overflow-hidden focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20 transition-all">
                  <span className="bg-sandstone-100 px-3.5 py-3 text-sm font-semibold text-sandstone-700 flex items-center border-r border-sandstone-200">
                    +91
                  </span>
                  <input
                    type="text"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full px-4 py-3 text-sm text-sanctum-950 bg-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sanctum-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition-all"
              >
                <span>Continue to OTP Verification</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-sandstone-600">
                  Enter the 4-digit sacred verification code sent to <br />
                  <strong className="text-sanctum-950">+91 {phoneOrEmail}</strong>
                </p>
              </div>

              {/* 4-digit OTP Inputs */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    className="w-12 h-14 text-center font-serif text-2xl font-bold rounded-2xl border-2 border-sandstone-200 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none transition-all"
                    required
                  />
                ))}
              </div>

              {/* Quick Fill Dev Helper */}
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleQuickDevFill}
                  className="text-gold-700 hover:text-gold-800 font-semibold underline underline-offset-2 flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-fill Dev OTP (1008)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-sandstone-500 hover:text-sanctum-900"
                >
                  Change number
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sanctum-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying Sanctum Credentials...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue Booking</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Trust Pledge Note */}
          <div className="mt-6 pt-4 border-t border-sandstone-100 flex items-start gap-2.5 text-[11px] text-sandstone-600">
            <Lock className="w-4 h-4 text-tulsi-600 shrink-0 mt-0.5" />
            <span>
              <strong>Sanctum Confidentiality:</strong> Your family Gotra, birth details, and prayer intentions are kept strictly sacred and never shared commercially.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
