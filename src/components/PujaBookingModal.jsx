import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const AASHIRWAD_ADDONS = [
  { id: '1', name: 'Extra Prasad Box', price: 251 },
  { id: '2', name: 'Bhasma/Vibhuti', price: 101 },
  { id: '3', name: 'Silver Coin (10g)', price: 1100 }
];

export default function PujaBookingModal({ service, user, onClose, onProceedToPayment }) {
  const [step, setStep] = useState(1);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [devoteeDetails, setDevoteeDetails] = useState({
    name: user?.name || '', gotra: user?.gotra || '', rashi: user?.rashi || '', phone: user?.phone || '', address: ''
  });
  const [addons, setAddons] = useState([]);

  if (!service) return null;

  const handleNextStep = () => setStep(prev => prev + 1);
  const handleProceed = () => {
    const total = (selectedPackage?.price || 0) + addons.reduce((sum, addon) => sum + addon.price, 0);
    onProceedToPayment({ service, selectedPackage, devoteeDetails, addons, total });
  };

  const handleAddonToggle = (addon) => {
    setAddons(prev => prev.some(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]);
  };

  const StepIndicator = ({ num, label, active, completed }) => (
    <div className="flex flex-col items-center flex-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
        completed ? 'bg-sage-400 text-ivory-50' : active ? 'bg-copper-400 text-ivory-50 shadow-copper-glow' : 'bg-ivory-200 text-charcoal-500'
      }`}>
        {completed ? <Check className="w-5 h-5" /> : num}
      </div>
      <span className={`text-xs mt-2 font-medium hidden sm:inline ${active ? 'text-charcoal-900' : 'text-charcoal-500'}`}>{label}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative max-w-2xl w-full max-h-[90vh] bg-ivory-50 rounded-3xl shadow-elevated flex flex-col animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-charcoal-500 hover:text-charcoal-900 transition-colors z-10 rounded-full hover:bg-ivory-100">
          <X className="w-5 h-5" />
        </button>
        
        <div className="p-6 border-b border-ivory-200">
          <h2 className="text-2xl font-display text-charcoal-900 text-center mb-6">{service.name} Booking</h2>
          <div className="flex justify-between relative px-4">
            <div className="absolute top-5 left-12 right-12 h-0.5 bg-ivory-200 -z-10" />
            <StepIndicator num={1} label="Select Package" active={step === 1} completed={step > 1} />
            <StepIndicator num={2} label="Devotee Details" active={step === 2} completed={step > 2} />
            <StepIndicator num={3} label="Review" active={step === 3} completed={step > 3} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in-up">
              {service.packages?.map(pkg => (
                <div 
                  key={pkg.id} 
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${
                    selectedPackage?.id === pkg.id ? 'border-copper-400 bg-copper-400/5 shadow-warm' : 'border-ivory-200 bg-ivory-100 hover:border-copper-400/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-charcoal-900">{pkg.name}</h3>
                      <p className="text-sm text-charcoal-500 mt-1">{pkg.description}</p>
                      <p className="text-xs text-charcoal-500 mt-2">Up to {pkg.members} devotees</p>
                    </div>
                    <span className="font-mono text-copper-600 font-bold">₹{pkg.price}</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleNextStep}
                disabled={!selectedPackage}
                className="w-full bg-copper-400 text-ivory-50 py-4 rounded-xl font-medium shadow-copper-glow hover:bg-copper-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">Primary Devotee Name</label>
                  <input type="text" value={devoteeDetails.name} onChange={e => setDevoteeDetails({...devoteeDetails, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">Phone Number</label>
                  <input type="tel" value={devoteeDetails.phone} onChange={e => setDevoteeDetails({...devoteeDetails, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">Gotra</label>
                  <input type="text" value={devoteeDetails.gotra} onChange={e => setDevoteeDetails({...devoteeDetails, gotra: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">Rashi</label>
                  <input type="text" value={devoteeDetails.rashi} onChange={e => setDevoteeDetails({...devoteeDetails, rashi: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">Prasad Delivery Address</label>
                  <textarea value={devoteeDetails.address} onChange={e => setDevoteeDetails({...devoteeDetails, address: e.target.value})} rows="3" className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
                </div>
              </div>
              <button 
                onClick={handleNextStep}
                className="w-full bg-copper-400 text-ivory-50 py-4 rounded-xl font-medium shadow-copper-glow hover:bg-copper-500 transition-all mt-6"
              >
                Review Booking
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-ivory-100 p-5 rounded-2xl border border-ivory-200">
                <h3 className="font-medium text-charcoal-900 mb-4 border-b border-ivory-200 pb-2">Booking Summary</h3>
                <div className="flex justify-between mb-2">
                  <span className="text-charcoal-700">{selectedPackage?.name}</span>
                  <span className="font-mono text-charcoal-900">₹{selectedPackage?.price}</span>
                </div>
                <div className="text-sm text-charcoal-500 mb-4">For: {devoteeDetails.name} • {devoteeDetails.gotra} Gotra</div>
                
                <h4 className="text-sm font-medium text-charcoal-700 mt-4 mb-2">Add Blessings</h4>
                <div className="space-y-2">
                  {AASHIRWAD_ADDONS.map(addon => (
                    <label key={addon.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-ivory-50 cursor-pointer transition-colors border border-transparent hover:border-ivory-200">
                      <div className="flex items-center">
                        <input type="checkbox" checked={addons.some(a => a.id === addon.id)} onChange={() => handleAddonToggle(addon)} className="rounded text-copper-400 focus:ring-copper-400 border-ivory-200" />
                        <span className="ml-3 text-sm text-charcoal-700">{addon.name}</span>
                      </div>
                      <span className="font-mono text-sm text-charcoal-900">+₹{addon.price}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-ivory-200">
                  <span className="font-medium text-charcoal-900">Total Payable</span>
                  <span className="font-mono text-xl text-copper-600 font-bold">
                    ₹{(selectedPackage?.price || 0) + addons.reduce((sum, a) => sum + a.price, 0)}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={handleProceed}
                className="w-full bg-copper-400 text-ivory-50 py-4 rounded-xl font-medium shadow-copper-glow hover:bg-copper-500 transition-all"
              >
                Proceed to Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
