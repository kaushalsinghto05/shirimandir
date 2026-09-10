import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Wallet, Loader2 } from 'lucide-react';

export default function UnifiedPaymentModal({ bookingData, onClose, onPaymentSuccess }) {
  const [activeTab, setActiveTab] = useState('upi');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'upi', label: 'UPI', icon: Smartphone },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'netbanking', label: 'Netbanking', icon: Building },
    { id: 'wallet', label: 'Wallet', icon: Wallet }
  ];

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onPaymentSuccess({ 
        transactionId: 'TXN' + Math.random().toString().slice(2, 10),
        method: activeTab,
        amount: bookingData?.total || 0,
        status: 'success'
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative max-w-lg w-full bg-ivory-50 rounded-3xl shadow-elevated p-6 animate-scale-in">
        <button onClick={onClose} className="absolute top-6 right-6 text-charcoal-500 hover:text-charcoal-900 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-display text-charcoal-900 mb-6 flex justify-between items-center pr-8">
          Complete Payment
          <span className="font-mono text-copper-500">₹{bookingData?.total || 0}</span>
        </h2>

        <div className="bg-ivory-100 p-4 rounded-2xl mb-6 border border-ivory-200 shadow-sm">
          <p className="font-medium text-charcoal-900">{bookingData?.service?.name || 'Service Booking'}</p>
          <p className="text-sm text-charcoal-500 mt-1">{bookingData?.devoteeDetails?.name} • {bookingData?.addons?.length || 0} Addons</p>
        </div>

        <div className="flex space-x-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2.5 min-h-[44px] rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                  activeTab === tab.id ? 'bg-copper-400 text-ivory-50 shadow-md' : 'bg-ivory-200 text-charcoal-700 hover:bg-ivory-200/80'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="min-h-[200px] animate-fade-in">
          {activeTab === 'upi' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Enter UPI ID</label>
                <input type="text" placeholder="example@upi" className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
              </div>
              <div className="text-center text-sm text-charcoal-500 my-4">OR</div>
              <div className="border-2 border-dashed border-ivory-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-ivory-100">
                <div className="w-32 h-32 bg-ivory-200 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-charcoal-500 text-xs">QR Code Placeholder</span>
                </div>
                <p className="text-sm text-charcoal-700 font-medium">Scan to Pay via any UPI app</p>
              </div>
            </div>
          )}

          {activeTab === 'card' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Card Number</label>
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">Expiry</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 mb-1">CVV</label>
                  <input type="password" placeholder="***" className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">Name on Card</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
              </div>
            </div>
          )}

          {activeTab === 'netbanking' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'More Banks'].map(bank => (
                <button key={bank} className="py-4 px-2 border border-ivory-200 rounded-xl hover:border-copper-400 hover:bg-copper-400/5 transition-colors flex flex-col items-center justify-center bg-ivory-100">
                  <Building className="w-6 h-6 text-charcoal-500 mb-2" />
                  <span className="text-xs text-charcoal-700 text-center font-medium">{bank}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-3">
              {['Paytm', 'PhonePe', 'Amazon Pay'].map(wallet => (
                <label key={wallet} className="flex items-center justify-between p-4 border border-ivory-200 rounded-xl hover:border-copper-400 cursor-pointer bg-ivory-100">
                  <div className="flex items-center">
                    <input type="radio" name="wallet" className="text-copper-400 focus:ring-copper-400" />
                    <span className="ml-3 font-medium text-charcoal-900">{wallet}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <button 
          onClick={handlePay}
          disabled={loading}
          className="w-full mt-8 bg-copper-400 text-ivory-50 py-4 rounded-xl font-medium shadow-copper-glow hover:bg-copper-500 transition-all flex justify-center items-center"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ₹${bookingData?.total || 0}`}
        </button>
      </div>
    </div>
  );
}
