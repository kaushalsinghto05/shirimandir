import React, { useState } from 'react';
import { X, Check, ShieldCheck, AlertCircle, Info, Lock } from 'lucide-react';

const SACRED_ADDONS = [
  { id: '1', name: 'Consecrated Prasad Box (Cow Ghee Peda)', price: 251, price_paise: 25100 },
  { id: '2', name: 'Maha Shringar Bhasma & Ganga Jal Kalash', price: 101, price_paise: 10100 },
  { id: '3', name: 'Certified 99.9% Silver Consecrated Coin (10g)', price: 1100, price_paise: 110000 }
];

export default function PujaBookingModal({ service, user, onClose, onProceedToPayment }) {
  const [step, setStep] = useState(1); // 1 = Package, 2 = Sankalp & Consent, 3 = Itemized Breakdown & Policy Acceptance
  const availablePackages = (service?.packages && service.packages.length > 0)
    ? service.packages
    : [
        { id: 1, name: 'Single Devotee Sankalp', description: 'Puja consecrated for one devotee name & gotra', price: service?.price || 1100, members: 1 },
        { id: 2, name: 'Dampati (Couple) Sankalp', description: 'Performed for husband and wife with sacred dhaga', price: Math.round((service?.price || 1100) * 1.8), members: 2 },
        { id: 3, name: 'Sampoorna Parivar (Family of 4)', description: 'Joint family sankalp with names & nakshatras', price: Math.round((service?.price || 1100) * 2.8), members: 4 }
      ];

  const [selectedPackage, setSelectedPackage] = useState(availablePackages[0]);
  
  // Devotee details
  const [devoteeDetails, setDevoteeDetails] = useState({
    name: user?.name || '',
    gotra: user?.gotra || 'Kashyap',
    rashi: user?.rashi || 'Dhanu',
    nakshatra: user?.nakshatra || 'Moola',
    phone: user?.phone || '+91 98765 43210',
    scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days ahead
    intentions: 'Family wellbeing, spiritual upliftment, and peace'
  });

  // COMPLIANCE: users.consent_data_sharing defaults to false (explicit opt-in only)
  const [consentDataSharing, setConsentDataSharing] = useState(false);
  const [cancellationPolicyAccepted, setCancellationPolicyAccepted] = useState(true);
  const [addons, setAddons] = useState([]);

  if (!service) return null;

  // Pricing arithmetic in integer paise & rupees
  const basePrice = selectedPackage?.price || (selectedPackage?.price_paise ? selectedPackage.price_paise / 100 : service.price || 1100);
  const addonsTotal = addons.reduce((sum, a) => sum + (a.price || 0), 0);
  const platformFee = 50; // ₹50 Seva maintenance fee
  const tax = 0; // Exempt under GST Section 12AA
  const total = basePrice + addonsTotal + platformFee + tax;

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => Math.max(1, prev - 1));

  const handleAddonToggle = (addon) => {
    setAddons(prev => prev.some(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]);
  };

  const handleProceed = () => {
    onProceedToPayment({
      service,
      selectedPackage,
      devoteeDetails,
      addons,
      consent_data_sharing: consentDataSharing,
      cancellationPolicyAccepted,
      itemized_breakdown: {
        basePrice,
        addonsTotal,
        platformFee,
        tax,
        total
      },
      total
    });
  };

  const StepIndicator = ({ num, label, active, completed }) => (
    <div className="flex flex-col items-center flex-1">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
        completed ? 'bg-sage-500 text-white' : active ? 'bg-copper-500 text-white shadow-copper-glow' : 'bg-ivory-200 text-charcoal-400'
      }`}>
        {completed ? <Check className="w-4 h-4" /> : num}
      </div>
      <span className={`text-[11px] mt-1.5 font-medium hidden sm:inline ${active ? 'text-charcoal-900 font-bold' : 'text-charcoal-500'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="relative max-w-2xl w-full max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-ivory-300 animate-scale-in overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-ivory-200 bg-ivory-50 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-charcoal-900">
                {service.name || service.title}
              </h2>
              <p className="text-xs text-charcoal-500 font-sans mt-0.5">
                {service.temple || service.temple_name || 'Sacred Sanctum'} • Authentic Vedic Seva
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-charcoal-400 hover:text-charcoal-900 rounded-full hover:bg-ivory-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between relative px-2">
            <div className="absolute top-4 left-8 right-8 h-0.5 bg-ivory-200 -z-10" />
            <StepIndicator num={1} label="Package Tier" active={step === 1} completed={step > 1} />
            <StepIndicator num={2} label="Sankalp & Privacy" active={step === 2} completed={step > 2} />
            <StepIndicator num={3} label="Itemized Bill & Terms" active={step === 3} completed={step > 3} />
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 font-sans">
          
          {/* STEP 1: Package Selection & Addons */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in-up">
              <div>
                <label className="block text-xs uppercase font-bold text-charcoal-500 tracking-wider mb-2">
                  Select Seva Package Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {availablePackages.map(pkg => (
                    <div 
                      key={pkg.id} 
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all ${
                        selectedPackage?.id === pkg.id 
                          ? 'border-copper-500 bg-copper-50/40 shadow-sm ring-1 ring-copper-400' 
                          : 'border-ivory-200 bg-ivory-50 hover:border-ivory-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-charcoal-900 text-sm">{pkg.name}</h4>
                          <p className="text-xs text-charcoal-500 mt-1 line-clamp-2">{pkg.description}</p>
                          <span className="inline-block mt-2 text-[11px] bg-ivory-200 text-charcoal-700 px-2 py-0.5 rounded-md font-medium">
                            Up to {pkg.members || pkg.max_devotees || 1} Devotees
                          </span>
                        </div>
                        <span className="font-mono text-copper-600 font-bold text-base shrink-0 ml-2">
                          ₹{pkg.price || pkg.price_paise / 100}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sacred Addons */}
              <div>
                <label className="block text-xs uppercase font-bold text-charcoal-500 tracking-wider mb-2">
                  Optional Sacred Offerings & Prasad
                </label>
                <div className="space-y-2">
                  {SACRED_ADDONS.map(addon => {
                    const isSelected = addons.some(a => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleAddonToggle(addon)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                          isSelected ? 'border-copper-400 bg-copper-50/30' : 'border-ivory-200 hover:bg-ivory-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" checked={isSelected} readOnly className="rounded text-copper-500" />
                          <span className="font-medium text-charcoal-800">{addon.name}</span>
                        </div>
                        <span className="font-mono font-bold text-copper-600">+₹{addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                onClick={handleNextStep}
                className="w-full bg-copper-500 hover:bg-copper-600 text-white py-3.5 rounded-xl font-medium text-sm transition-colors mt-4 shadow-sm"
              >
                Continue to Devotee Sankalp & Privacy →
              </button>
            </div>
          )}

          {/* STEP 2: Devotee Sankalp Details & COMPLIANCE CONSENT */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Primary Devotee Name *</label>
                  <input 
                    type="text" 
                    required
                    value={devoteeDetails.name} 
                    onChange={e => setDevoteeDetails({...devoteeDetails, name: e.target.value})} 
                    className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-sm outline-none focus:border-copper-500" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Scheduled Puja Date *</label>
                  <input 
                    type="date" 
                    required
                    value={devoteeDetails.scheduledDate} 
                    onChange={e => setDevoteeDetails({...devoteeDetails, scheduledDate: e.target.value})} 
                    className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-sm outline-none focus:border-copper-500 font-mono" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Gotra</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Kashyap"
                    value={devoteeDetails.gotra} 
                    onChange={e => setDevoteeDetails({...devoteeDetails, gotra: e.target.value})} 
                    className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-sm outline-none focus:border-copper-500" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Rashi</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dhanu"
                    value={devoteeDetails.rashi} 
                    onChange={e => setDevoteeDetails({...devoteeDetails, rashi: e.target.value})} 
                    className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-sm outline-none focus:border-copper-500" 
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Nakshatra</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Moola"
                    value={devoteeDetails.nakshatra} 
                    onChange={e => setDevoteeDetails({...devoteeDetails, nakshatra: e.target.value})} 
                    className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-sm outline-none focus:border-copper-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Sankalp Prayer Intentions</label>
                <textarea 
                  rows={2}
                  value={devoteeDetails.intentions} 
                  onChange={e => setDevoteeDetails({...devoteeDetails, intentions: e.target.value})} 
                  placeholder="Special intentions for health, success, peace..."
                  className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-sm outline-none focus:border-copper-500" 
                />
              </div>

              {/* ═══════════════════════════════════════════════
                  COMPLIANCE RULE: users.consent_data_sharing
                  Explicit opt-in, defaults to false/unchecked!
                 ═══════════════════════════════════════════════ */}
              <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-300 space-y-2 mt-2">
                <div className="flex items-start gap-3">
                  <input 
                    id="consent_checkbox"
                    type="checkbox" 
                    checked={consentDataSharing} 
                    onChange={e => setConsentDataSharing(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-copper-600 focus:ring-copper-400 cursor-pointer"
                  />
                  <label htmlFor="consent_checkbox" className="text-xs text-charcoal-800 font-medium leading-relaxed cursor-pointer select-none">
                    <span className="font-bold text-charcoal-900 block mb-0.5">
                      Explicit Consent for Ritual Data Sharing (Optional Opt-In)
                    </span>
                    I explicitly permit Shiri Mandir to transmit my name, Gotra, and Nakshatra to the certified temple archaka solely for chanting sacred sankalp in the sanctum sanctorum.
                  </label>
                </div>

                {!consentDataSharing && (
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 pl-7 pt-1">
                    <Lock className="w-3.5 h-3.5 text-copper-500" />
                    <span>Default privacy active: Your personal identifiers will remain anonymized during ritual records.</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  onClick={handlePrevStep}
                  className="py-3 px-5 rounded-xl border border-ivory-300 text-charcoal-700 text-sm font-medium"
                >
                  ← Back
                </button>
                <button 
                  onClick={handleNextStep}
                  disabled={!devoteeDetails.name}
                  className="flex-1 py-3 rounded-xl bg-copper-500 hover:bg-copper-600 disabled:opacity-50 text-white font-medium text-sm transition-colors shadow-sm"
                >
                  Review Itemized Bill & Terms →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Full Itemized Breakdown & Pre-Payment Cancellation Terms */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in-up text-xs">
              
              {/* Itemized Price Breakdown */}
              <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 space-y-2">
                <span className="text-xs uppercase font-bold text-charcoal-500 tracking-wider block mb-1">
                  Itemized Price Breakdown (Zero Hidden Fees)
                </span>

                <div className="flex justify-between text-charcoal-700">
                  <span>Base Puja Package ({selectedPackage?.name}):</span>
                  <span className="font-mono font-medium">₹{basePrice}</span>
                </div>

                {addons.map(addon => (
                  <div key={addon.id} className="flex justify-between text-charcoal-700 pl-2">
                    <span>+ {addon.name}:</span>
                    <span className="font-mono font-medium">₹{addon.price}</span>
                  </div>
                ))}

                <div className="flex justify-between text-charcoal-700">
                  <span>Temple Seva Infrastructure & Priest Support Fee:</span>
                  <span className="font-mono font-medium">₹{platformFee}</span>
                </div>

                <div className="flex justify-between text-charcoal-700">
                  <span>GST / Statutory Taxes:</span>
                  <span className="font-mono font-medium">₹0 (Sacred Seva Exempt)</span>
                </div>

                <div className="flex justify-between text-base font-bold text-charcoal-900 pt-2 border-t border-ivory-300">
                  <span>Total Amount Payable:</span>
                  <span className="font-mono text-copper-600">₹{total}</span>
                </div>
              </div>

              {/* ═══════════════════════════════════════════════
                  COMPLIANCE RULE: Pre-Payment Cancellation Policy
                 ═══════════════════════════════════════════════ */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Statutory Cancellation & Refund Policy
                </div>
                <div className="space-y-1 text-[11px] text-amber-900 leading-relaxed font-sans">
                  <p>• <strong>&gt; 48 Hours Prior:</strong> 100% refund (less standard 2% banking gateway fee).</p>
                  <p>• <strong>24 to 48 Hours Prior:</strong> 50% refund (partial samagri procurement fee deducted).</p>
                  <p>• <strong>&lt; 24 Hours Prior:</strong> Non-refundable (priests designated and Vedic ingredients sanctified).</p>
                  <p>• <strong>Proof of Service:</strong> Photo or video proof of completion will be posted to your account.</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60">
                  <input 
                    id="policy_accept"
                    type="checkbox" 
                    checked={cancellationPolicyAccepted} 
                    onChange={e => setCancellationPolicyAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-copper-600"
                  />
                  <label htmlFor="policy_accept" className="text-[11px] text-charcoal-800 font-medium cursor-pointer">
                    I acknowledge and accept the statutory cancellation terms prior to booking.
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handlePrevStep}
                  className="py-3 px-5 rounded-xl border border-ivory-300 text-charcoal-700 text-sm font-medium"
                >
                  ← Back
                </button>
                <button 
                  onClick={handleProceed}
                  disabled={!cancellationPolicyAccepted}
                  className="flex-1 py-3.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 disabled:opacity-50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  Proceed to Secure Payment (₹{total}) →
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
