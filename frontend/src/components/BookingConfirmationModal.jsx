import React, { useEffect } from 'react';
import { X, Check, Share2, Receipt } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BookingConfirmationModal({ confirmationData, onClose, onOpenReceipt, onGoToDashboard }) {
  useEffect(() => {
    if (confirmationData) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7FA67A', '#C17F59', '#D94F30']
      });
    }
  }, [confirmationData]);

  if (!confirmationData) return null;

  const steps = [
    { id: 1, label: 'Booking Confirmed', date: 'Today', status: 'complete' },
    { id: 2, label: 'Puja Scheduled', date: confirmationData.date || 'Pending', status: 'current' },
    { id: 3, label: 'Puja Performed & Video Uploaded', date: 'Pending', status: 'pending' },
    { id: 4, label: 'Prasad Dispatched', date: 'Pending', status: 'pending' },
    { id: 5, label: 'Prasad Delivered', date: 'Pending', status: 'pending' }
  ];

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="relative max-w-lg w-full bg-ivory-50 rounded-3xl shadow-elevated p-8 animate-scale-in my-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-charcoal-500 hover:text-charcoal-900 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-sage-400 text-ivory-50 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-sage-400/30">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-display text-charcoal-900 mb-2">Booking Confirmed!</h2>
          <p className="text-charcoal-500 font-sans">May the blessings be with you.</p>
        </div>

        <div className="bg-ivory-100 p-5 rounded-2xl border border-ivory-200 mb-8">
          <div className="flex justify-between items-center border-b border-ivory-200 pb-3 mb-3">
            <span className="text-charcoal-500 text-sm">Booking ID</span>
            <span className="font-mono font-medium text-charcoal-900">{confirmationData.bookingId || 'BKG-XYZ123'}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-charcoal-500 text-sm">Service</span>
              <span className="font-medium text-charcoal-900">{confirmationData.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500 text-sm">Devotees</span>
              <span className="font-medium text-charcoal-900">{confirmationData.devotees}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-charcoal-500 text-sm">Amount Paid</span>
              <span className="font-mono font-medium text-charcoal-900">₹{confirmationData.amount}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="font-medium text-charcoal-900 mb-4">Prasad Delivery Timeline</h3>
          <div className="space-y-0 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ivory-200 before:to-transparent">
            {steps.map((step) => (
              <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active py-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-ivory-50 bg-ivory-200 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
                  step.status === 'complete' ? 'bg-sage-400' : step.status === 'current' ? 'bg-copper-400 animate-pulse-slow' : 'bg-ivory-200'
                }`}>
                  {step.status === 'complete' && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-ivory-200 bg-ivory-50 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium text-sm ${step.status === 'pending' ? 'text-charcoal-500' : 'text-charcoal-900'}`}>{step.label}</h4>
                  </div>
                  <time className="text-xs text-charcoal-500 font-mono">{step.date}</time>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button onClick={onGoToDashboard} className="w-full bg-copper-400 text-ivory-50 py-3 rounded-xl font-medium shadow-copper-glow hover:bg-copper-500 transition-all hover:-translate-y-0.5">
            Go to Dashboard
          </button>
          <div className="flex space-x-3">
            <button onClick={onOpenReceipt} className="flex-1 flex items-center justify-center py-3 rounded-xl border border-copper-400 text-copper-600 font-medium hover:bg-copper-400/5 transition-all">
              <Receipt className="w-4 h-4 mr-2" /> Receipt
            </button>
            <button className="flex-1 flex items-center justify-center py-3 rounded-xl border border-ivory-200 text-charcoal-700 font-medium hover:bg-ivory-100 transition-all">
              <Share2 className="w-4 h-4 mr-2" /> Share Blessings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
