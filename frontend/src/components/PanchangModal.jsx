import React, { useState } from 'react';
import { X, Calendar, Sparkles, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { PANCHANG_TODAY, PUJA_RECOMMENDATIONS } from '../data/mockData';

const PANCHANG_DAYS = {
  '-1': {
    date: 'Monday, 7 September 2026',
    tithi: 'Shukla Paksha Dashami',
    nakshatra: 'Uttara Ashadha (until 03:15 PM)',
    yoga: 'Atiganda Yoga',
    karana: 'Gara Karana',
    sunrise: '06:07 AM',
    sunset: '06:35 PM',
    abhijitMuhurat: '11:47 AM – 12:37 PM',
    rahuKaal: '07:35 AM – 09:07 AM',
    festival: 'Dashami Vrat & Surya Upasana'
  },
  '0': PANCHANG_TODAY || {
    date: 'Tuesday, 8 September 2026',
    tithi: 'Shukla Paksha Ekadashi (Parivartini Ekadashi)',
    nakshatra: 'Shravana (until 04:32 PM), then Dhanishta',
    yoga: 'Sobhana Yoga',
    karana: 'Bava Karana',
    sunrise: '06:08 AM',
    sunset: '06:34 PM',
    abhijitMuhurat: '11:48 AM – 12:38 PM',
    rahuKaal: '03:20 PM – 04:52 PM',
    festival: 'Parivartini Ekadashi Vrat & Lord Vishnu Maha Sankalpa'
  },
  '1': {
    date: 'Wednesday, 9 September 2026',
    tithi: 'Shukla Paksha Dwadashi (Vamana Jayanti)',
    nakshatra: 'Dhanishta (until 06:10 PM)',
    yoga: 'Sukarma Yoga',
    karana: 'Kaulava Karana',
    sunrise: '06:09 AM',
    sunset: '06:33 PM',
    abhijitMuhurat: '11:49 AM – 12:39 PM',
    rahuKaal: '12:21 PM – 01:53 PM',
    festival: 'Vamana Dwadashi & Tulsi Parikrama'
  }
};

export default function PanchangModal({ isOpen, onClose, onBookService }) {
  const [dayOffset, setDayOffset] = useState(0);

  if (!isOpen) return null;

  const currentPanchang = PANCHANG_DAYS[dayOffset] || PANCHANG_DAYS['0'];

  const handleBookPuja = (puja) => {
    if (onBookService) {
      onClose();
      onBookService({
        id: puja.pujaIds?.[0] || 'panchang-puja',
        name: `${puja.event} Auspicious Puja`,
        templeName: 'Shri Kashi Vishwanath Jyotirlinga',
        location: 'Varanasi, Uttar Pradesh',
        price: 1101,
        description: puja.message,
        packages: [
          { id: 1, name: 'Sankalpa Archana', price: 1101, description: 'Individual Name & Gotra Sankalpa with live video stream' },
          { id: 2, name: 'Maha Pujan & Sanctified Prasad', price: 2101, description: 'Complete family puja + consecrated dry prasad box delivered home' }
        ]
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-ivory-50 rounded-3xl w-full max-w-lg shadow-elevated relative animate-scale-in max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-charcoal-900 text-ivory-50 p-6 rounded-t-3xl flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="relative z-10 flex items-center gap-3">
            <div className="bg-copper-400/20 p-2.5 rounded-xl text-copper-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold">Vedic Panchang</h2>
              <p className="text-xs text-ivory-300">Dainik Tithi, Muhurat & Shubh Kaal</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 text-ivory-300 hover:text-white bg-charcoal-800 hover:bg-charcoal-700 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Day Selector Navigation */}
        <div className="bg-white border-b border-ivory-200 px-6 py-3 flex items-center justify-between shrink-0">
          <button 
            onClick={() => setDayOffset(d => Math.max(-1, d - 1))}
            disabled={dayOffset <= -1}
            className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs transition-colors ${
              dayOffset <= -1 ? 'opacity-40 cursor-not-allowed border-ivory-200 text-charcoal-400' : 'border-ivory-300 hover:bg-ivory-100 text-charcoal-700'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Yesterday
          </button>

          <span className="text-xs font-bold font-sans uppercase tracking-wider text-copper-700 bg-copper-50 px-3 py-1 rounded-full border border-copper-200">
            {dayOffset === 0 ? 'Today (Auspicious)' : dayOffset === 1 ? 'Tomorrow' : 'Yesterday'}
          </span>

          <button 
            onClick={() => setDayOffset(d => Math.min(1, d + 1))}
            disabled={dayOffset >= 1}
            className={`p-1.5 rounded-lg border flex items-center gap-1 text-xs transition-colors ${
              dayOffset >= 1 ? 'opacity-40 cursor-not-allowed border-ivory-200 text-charcoal-400' : 'border-ivory-300 hover:bg-ivory-100 text-charcoal-700'
            }`}
          >
            Tomorrow <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Festival Banner */}
          {currentPanchang?.festival && (
            <div className="bg-gradient-to-r from-copper-50 to-ivory-100 border border-copper-200 p-4 rounded-2xl shadow-xs flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-copper-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-copper-700 uppercase tracking-wider mb-0.5">Festival & Observance</p>
                <p className="font-display text-base font-bold text-charcoal-900">{currentPanchang.festival}</p>
              </div>
            </div>
          )}

          {/* Core Astro Telemetry Grid */}
          <div className="bg-white rounded-2xl border border-ivory-200 p-5 shadow-xs">
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Date</p>
                <p className="font-bold text-charcoal-900">{currentPanchang?.date}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Tithi</p>
                <p className="font-bold text-charcoal-900">{currentPanchang?.tithi}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Nakshatra</p>
                <p className="font-bold text-charcoal-900">{currentPanchang?.nakshatra}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Yoga</p>
                <p className="font-bold text-charcoal-900">{currentPanchang?.yoga}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Karana</p>
                <p className="font-bold text-charcoal-900">{currentPanchang?.karana}</p>
              </div>
              <div>
                <p className="text-charcoal-400 font-medium mb-0.5">Sunrise – Sunset</p>
                <p className="font-bold text-charcoal-900">{currentPanchang?.sunrise} – {currentPanchang?.sunset}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-ivory-100 grid grid-cols-2 gap-6 text-xs">
              <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                <p className="text-emerald-700 font-semibold mb-0.5">Abhijit Muhurat (Auspicious)</p>
                <p className="font-bold text-emerald-900 font-mono">{currentPanchang?.abhijitMuhurat}</p>
              </div>
              <div className="bg-rose-50/60 p-2.5 rounded-xl border border-rose-100">
                <p className="text-rose-700 font-semibold mb-0.5">Rahu Kaal (Avoid Starts)</p>
                <p className="font-bold text-rose-900 font-mono">{currentPanchang?.rahuKaal}</p>
              </div>
            </div>
          </div>

          {/* Recommended Pujas with One-Click Booking */}
          <div className="space-y-3">
            <h3 className="font-display text-lg font-bold text-charcoal-900 flex items-center gap-2">
              <span>🪔</span> Auspicious Puja Recommendations
            </h3>
            
            <div className="space-y-3">
              {(PUJA_RECOMMENDATIONS || [
                { event: 'Health Recovery', message: 'Maha Rudrabhishek at Kashi Vishwanath for vitality and longevity' },
                { event: 'Marriage Anniversary', message: 'Lakshmi-Narayana Seva for continued family harmony' }
              ]).slice(0, 3).map((puja, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-ivory-200 shadow-xs flex flex-col justify-between hover:border-copper-300 transition-colors">
                  <div className="mb-3">
                    <h4 className="font-bold text-charcoal-900 text-sm">{puja.event}</h4>
                    <p className="text-xs text-charcoal-600 mt-1">{puja.message}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleBookPuja(puja)}
                    className="w-full bg-copper-500 hover:bg-copper-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-copper-glow flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Book Recommended Puja
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
