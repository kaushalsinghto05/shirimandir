import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Building2, 
  Wallet, 
  Lock, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function UnifiedPaymentModal({ 
  bookingData, 
  onClose, 
  onPaymentSuccess 
}) {
  const [activeMethod, setActiveMethod] = useState('upi'); // 'upi', 'cards', 'netbanking', 'wallets'
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [selectedWallet, setSelectedWallet] = useState('Amazon Pay');
  const [isProcessing, setIsProcessing] = useState(false);

  // 10:00 Countdown timer for UPI QR Code
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayNow = (methodName) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);

      // Trigger sacred celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#9E4736', '#1E6B4B', '#FAF4DE']
        });
      } catch (err) {
        // Fallback gracefully
      }

      onPaymentSuccess({
        id: `MV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        taxReceiptNo: `MV-80G-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        amount: bookingData?.totalPayable || 1501,
        method: methodName || (activeMethod === 'upi' ? 'UPI (PhonePe / GPay)' : activeMethod.toUpperCase()),
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        bookingData
      });
    }, 1200);
  };

  const totalAmount = bookingData?.totalPayable || 1501;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden flex flex-col">
        
        {/* Header with Amount & Security Badge */}
        <div className="bg-sanctum-950 text-white p-5 sm:px-7 border-b border-gold-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1">
              <Lock className="w-3 h-3 text-tulsi-400" />
              <span>NPCI & RBI COMPLIANT UNIFIED PAYMENT SHEET</span>
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-white">
                ₹{totalAmount.toLocaleString()}
              </span>
              <span className="text-xs text-sandstone-300">
                • {bookingData?.service?.title || 'Vedic Sanctum Seva'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sanctum-900 border border-white/20 text-white hover:bg-sanctum-850 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 80G Tax Benefit Banner */}
        <div className="bg-tulsi-50 px-5 sm:px-7 py-2.5 border-b border-tulsi-200 flex items-center justify-between text-xs text-tulsi-800">
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-tulsi-600 shrink-0" />
            <span>Eligible for <strong>50% Tax Exemption under Section 80G</strong> of Income Tax Act.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-tulsi-200/60 px-2 py-0.5 rounded">
            Auto-Receipt
          </span>
        </div>

        {/* Unified Tabbed Selector Strip */}
        <div className="grid grid-cols-4 bg-sandstone-100 border-b border-sandstone-200 text-xs font-bold text-sandstone-600">
          <button
            onClick={() => setActiveMethod('upi')}
            className={`py-3.5 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMethod === 'upi'
                ? 'border-gold-600 bg-white text-sanctum-950 shadow-sm'
                : 'border-transparent hover:text-sanctum-950'
            }`}
          >
            <QrCode className="w-4 h-4 text-gold-600" />
            <span>UPI & QR</span>
          </button>

          <button
            onClick={() => setActiveMethod('cards')}
            className={`py-3.5 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMethod === 'cards'
                ? 'border-gold-600 bg-white text-sanctum-950 shadow-sm'
                : 'border-transparent hover:text-sanctum-950'
            }`}
          >
            <CreditCard className="w-4 h-4 text-sandstone-700" />
            <span>Cards</span>
          </button>

          <button
            onClick={() => setActiveMethod('netbanking')}
            className={`py-3.5 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMethod === 'netbanking'
                ? 'border-gold-600 bg-white text-sanctum-950 shadow-sm'
                : 'border-transparent hover:text-sanctum-950'
            }`}
          >
            <Building2 className="w-4 h-4 text-sandstone-700" />
            <span>Netbanking</span>
          </button>

          <button
            onClick={() => setActiveMethod('wallets')}
            className={`py-3.5 flex flex-col sm:flex-row items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeMethod === 'wallets'
                ? 'border-gold-600 bg-white text-sanctum-950 shadow-sm'
                : 'border-transparent hover:text-sanctum-950'
            }`}
          >
            <Wallet className="w-4 h-4 text-sandstone-700" />
            <span>Wallets</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* TAB 1: UPI WITH LIVE QR CODE & APPS */}
          {activeMethod === 'upi' && (
            <div className="space-y-6">
              
              {/* Dynamic QR Code Box with Live 10-Minute Countdown */}
              <div className="bg-sandstone-50 p-5 rounded-3xl border border-sandstone-200 flex flex-col sm:flex-row items-center gap-6">
                
                {/* Visual QR Pattern with Sacred Center Glyph */}
                <div className="relative p-3 bg-white rounded-2xl shadow-sm border border-sandstone-200 shrink-0">
                  <div className="w-40 h-40 bg-sandstone-900 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Simulated Authentic QR Grid */}
                    <div className="grid grid-cols-6 gap-1 w-full h-full opacity-80">
                      {[...Array(36)].map((_, i) => (
                        <div key={i} className={`rounded-sm ${
                          i % 2 === 0 || i % 5 === 0 ? 'bg-gold-400' : 'bg-sanctum-950'
                        }`}></div>
                      ))}
                    </div>

                    {/* Sacred Om at Center of QR */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-sanctum-950 border-2 border-gold-400 flex items-center justify-center shadow-lg">
                        <span className="text-gold-400 font-serif font-bold text-lg">ॐ</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-center font-bold text-sandstone-500 mt-2 uppercase tracking-wider">
                    Scan with any UPI App
                  </p>
                </div>

                {/* QR Instructions & Live Timer */}
                <div className="flex-1 space-y-3 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>QR Expires in: <strong className="font-mono text-sm">{formatTimer(timeLeft)}</strong></span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-sanctum-950">
                    Scan to Pay ₹{totalAmount.toLocaleString()}
                  </h4>
                  <p className="text-xs text-sandstone-600 leading-relaxed">
                    Open Google Pay, PhonePe, Paytm, or BHIM on your mobile phone and scan this sacred dynamic code.
                  </p>

                  <button
                    onClick={() => handlePayNow('UPI Dynamic QR')}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl bg-tulsi-600 hover:bg-tulsi-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Simulate Successful QR Payment</span>
                  </button>
                </div>

              </div>

              {/* One-Tap App Intent Buttons */}
              <div>
                <span className="text-xs font-bold text-sandstone-500 uppercase tracking-wider block mb-2.5">
                  Or Pay Directly with UPI Apps
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { name: 'Google Pay', icon: '🟢', bg: 'hover:border-blue-500' },
                    { name: 'PhonePe', icon: '🟣', bg: 'hover:border-purple-500' },
                    { name: 'Paytm UPI', icon: '🔵', bg: 'hover:border-cyan-500' },
                    { name: 'BHIM UPI', icon: '🟠', bg: 'hover:border-amber-500' }
                  ].map((app) => (
                    <button
                      key={app.name}
                      onClick={() => handlePayNow(app.name)}
                      disabled={isProcessing}
                      className={`p-3 rounded-2xl border border-sandstone-200 bg-white hover:bg-sandstone-50 flex items-center justify-center gap-2 text-xs font-bold text-sanctum-950 shadow-sm transition-all ${app.bg}`}
                    >
                      <Smartphone className="w-4 h-4 text-gold-600" />
                      <span>{app.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter UPI VPA ID */}
              <div>
                <label className="block text-xs font-semibold text-sandstone-700 mb-1.5 uppercase">
                  Enter UPI ID / VPA
                </label>
                <div className="flex rounded-xl border border-sandstone-200 overflow-hidden focus-within:border-gold-500">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. devotee@okhdfcbank"
                    className="flex-1 px-4 py-2.5 text-xs bg-white focus:outline-none"
                  />
                  <button
                    onClick={() => handlePayNow(`UPI VPA (${upiId || 'devotee@upi'})`)}
                    disabled={isProcessing}
                    className="bg-sanctum-950 text-gold-300 hover:text-white px-4 py-2.5 text-xs font-bold transition-colors"
                  >
                    Verify & Pay
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CREDIT / DEBIT CARDS */}
          {activeMethod === 'cards' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-sandstone-700 mb-1 uppercase">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4092 8812 3901 5521"
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone-300 text-sm bg-white focus:outline-none focus:border-gold-500"
                />
                <p className="text-[10px] text-sandstone-400 mt-1">Supports RuPay, Visa, Mastercard, American Express</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-sandstone-700 mb-1 uppercase">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="w-full px-4 py-2.5 rounded-xl border border-sandstone-300 text-sm bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-sandstone-700 mb-1 uppercase">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="•••"
                    className="w-full px-4 py-2.5 rounded-xl border border-sandstone-300 text-sm bg-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-sandstone-700 mb-1 uppercase">
                  Cardholder Full Name
                </label>
                <input
                  type="text"
                  placeholder="As printed on card"
                  defaultValue="Kaushal Singh"
                  className="w-full px-4 py-2.5 rounded-xl border border-sandstone-300 text-sm bg-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <button
                onClick={() => handlePayNow('RuPay / Credit Card')}
                disabled={isProcessing}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sanctum-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{totalAmount.toLocaleString()} via Card</span>
              </button>
            </div>
          )}

          {/* TAB 3: NETBANKING */}
          {activeMethod === 'netbanking' && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-sandstone-500 uppercase tracking-wider block">
                Popular Indian Banks
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                  <button
                    key={bank}
                    onClick={() => setSelectedBank(bank)}
                    className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                      selectedBank === bank
                        ? 'border-gold-500 bg-gold-50 text-sanctum-950 shadow-sm'
                        : 'border-sandstone-200 bg-white text-sandstone-700 hover:bg-sandstone-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-gold-600 mb-1" />
                    <span>{bank}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePayNow(`Netbanking (${selectedBank})`)}
                disabled={isProcessing}
                className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sanctum-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Pay ₹{totalAmount.toLocaleString()} via {selectedBank}</span>
              </button>
            </div>
          )}

          {/* TAB 4: WALLETS */}
          {activeMethod === 'wallets' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {['Amazon Pay', 'Paytm Wallet', 'Mobikwik', 'Airtel Money'].map((wallet) => (
                  <label
                    key={wallet}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedWallet === wallet
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-sandstone-200 bg-white hover:bg-sandstone-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Wallet className="w-4 h-4 text-gold-600" />
                      <span className="text-xs font-bold text-sanctum-950">{wallet}</span>
                    </div>
                    <input
                      type="radio"
                      name="wallet"
                      checked={selectedWallet === wallet}
                      onChange={() => setSelectedWallet(wallet)}
                      className="accent-gold-600"
                    />
                  </label>
                ))}
              </div>

              <button
                onClick={() => handlePayNow(`Wallet (${selectedWallet})`)}
                disabled={isProcessing}
                className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sanctum-950 font-bold text-sm shadow-gold-glow flex items-center justify-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                <span>Link & Pay via {selectedWallet}</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer Security Badges */}
        <div className="bg-sandstone-50 px-6 py-3 border-t border-sandstone-200 flex items-center justify-between text-[11px] text-sandstone-500">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-tulsi-600" />
            <span>256-bit SSL Certified Temple Payment Gateway</span>
          </div>
          <span className="font-semibold text-sandstone-600">Razorpay & NPCI Trusted</span>
        </div>

      </div>
    </div>
  );
}
