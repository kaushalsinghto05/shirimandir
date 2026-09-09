import React from 'react';
import { X, Calendar, Sparkles } from 'lucide-react';
import { PANCHANG_TODAY, PUJA_RECOMMENDATIONS } from '../data/mockData';

export default function PanchangModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ivory-50 rounded-3xl w-full max-w-lg shadow-elevated relative animate-scale-in max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-charcoal-900 text-ivory-50 p-6 rounded-t-3xl flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-temple-gold-500/20 p-2 rounded-xl">
              <Calendar className="w-6 h-6 text-temple-gold-400" />
            </div>
            <h2 className="font-display text-2xl font-bold">Today's Panchang</h2>
          </div>
          <button onClick={onClose} className="relative z-10 text-ivory-200 hover:text-white bg-charcoal-800 hover:bg-charcoal-700 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          {/* Decorative pattern */}
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/3 -translate-y-1/3">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path><path d="M2 12h20"></path></svg>
          </div>
        </div>

        <div className="p-6 overflow-y-auto">
          {PANCHANG_TODAY?.festival && (
            <div className="bg-gradient-to-r from-temple-gold-100 to-temple-gold-50 border border-temple-gold-200 p-4 rounded-2xl mb-6 shadow-sm flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-temple-gold-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-temple-gold-600 uppercase tracking-wider mb-1">Today's Festival</p>
                <p className="font-display text-lg font-bold text-charcoal-900">{PANCHANG_TODAY.festival}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-ivory-200 p-5 shadow-sm mb-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Date</p>
                <p className="font-semibold text-charcoal-900">{PANCHANG_TODAY?.date}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Tithi</p>
                <p className="font-semibold text-charcoal-900">{PANCHANG_TODAY?.tithi}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Nakshatra</p>
                <p className="font-semibold text-charcoal-900">{PANCHANG_TODAY?.nakshatra}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Yoga</p>
                <p className="font-semibold text-charcoal-900">{PANCHANG_TODAY?.yoga}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Karana</p>
                <p className="font-semibold text-charcoal-900">{PANCHANG_TODAY?.karana}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Sunrise - Sunset</p>
                <p className="font-semibold text-charcoal-900">{PANCHANG_TODAY?.sunrise} - {PANCHANG_TODAY?.sunset}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-ivory-200 grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Abhijit Muhurat</p>
                <p className="font-semibold text-sage-600">{PANCHANG_TODAY?.abhijitMuhurat}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Rahu Kaal</p>
                <p className="font-semibold text-vermilion-500">{PANCHANG_TODAY?.rahuKaal}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-xl font-bold text-charcoal-900">Personalized Puja Recommendations</h3>
            {PUJA_RECOMMENDATIONS?.map((puja, idx) => (
              <div key={idx} className="bg-ivory-100 rounded-2xl p-5 border border-ivory-200 shadow-warm">
                <h4 className="font-sans font-bold text-charcoal-900 mb-1">{puja.event}</h4>
                <p className="text-sm text-charcoal-600 mb-4">{puja.message}</p>
                <button className="w-full bg-copper-400 hover:bg-copper-500 text-ivory-50 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 shadow-copper-glow">
                  Book Recommended Puja
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
