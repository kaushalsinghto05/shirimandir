import React from 'react';
import { X, Calendar, Clock, Sun, Moon, Sparkles, ShieldCheck } from 'lucide-react';
import { PANCHANG_TODAY } from '../data/mockData';

export default function PanchangModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-sanctum-950 text-white p-6 border-b border-gold-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Daily Vedic Panchang</h3>
              <p className="text-xs text-sandstone-300">{PANCHANG_TODAY.date}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sanctum-900 border border-white/20 text-white hover:bg-sanctum-850"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Festival Highlight Banner */}
        <div className="bg-gradient-to-r from-terracotta-50 via-gold-50 to-terracotta-50 px-6 py-3 border-b border-sandstone-200 flex items-center gap-2 text-xs text-sanctum-950">
          <Sparkles className="w-4 h-4 text-terracotta-600 shrink-0" />
          <span>
            Today's Festival: <strong>{PANCHANG_TODAY.festival}</strong>
          </span>
        </div>

        {/* Panchang Grid Elements */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-sandstone-50 border border-sandstone-200">
              <span className="text-[11px] font-bold text-sandstone-500 uppercase tracking-wider block">Tithi</span>
              <strong className="text-sm font-serif text-sanctum-950 mt-0.5 block">{PANCHANG_TODAY.tithi}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-sandstone-50 border border-sandstone-200">
              <span className="text-[11px] font-bold text-sandstone-500 uppercase tracking-wider block">Nakshatra</span>
              <strong className="text-sm font-serif text-sanctum-950 mt-0.5 block">{PANCHANG_TODAY.nakshatra}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-sandstone-50 border border-sandstone-200">
              <span className="text-[11px] font-bold text-sandstone-500 uppercase tracking-wider block">Yoga</span>
              <strong className="text-sm font-serif text-sanctum-950 mt-0.5 block">{PANCHANG_TODAY.yoga}</strong>
            </div>

            <div className="p-3.5 rounded-2xl bg-sandstone-50 border border-sandstone-200">
              <span className="text-[11px] font-bold text-sandstone-500 uppercase tracking-wider block">Karana</span>
              <strong className="text-sm font-serif text-sanctum-950 mt-0.5 block">{PANCHANG_TODAY.karana}</strong>
            </div>
          </div>

          {/* Shubh & Ashubh Muhurtas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            <div className="p-4 rounded-2xl bg-tulsi-50 border border-tulsi-200 space-y-2">
              <span className="text-xs font-bold text-tulsi-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-tulsi-600" />
                <span>Auspicious Timings (Shubh)</span>
              </span>
              <div className="text-xs text-tulsi-950 space-y-1">
                <p>Abhijit Muhurat: <strong>{PANCHANG_TODAY.abhijitMuhurat}</strong></p>
                <p>Brahma Muhurta: <strong>04:30 AM – 05:18 AM</strong></p>
                <p>Amrit Kaal: <strong>08:20 AM – 09:55 AM</strong></p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-red-600" />
                <span>Inauspicious Timings (Ashubh)</span>
              </span>
              <div className="text-xs text-red-950 space-y-1">
                <p>Rahu Kaal: <strong>{PANCHANG_TODAY.rahuKaal}</strong></p>
                <p>Yamaganda: <strong>{PANCHANG_TODAY.yamaganda}</strong></p>
                <p>Gulika Kaal: <strong>12:15 PM – 01:45 PM</strong></p>
              </div>
            </div>

          </div>

          {/* Celestial Rising */}
          <div className="flex items-center justify-around p-3.5 rounded-2xl bg-sandstone-50 border border-sandstone-200 text-xs text-sandstone-700">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Sunrise: <strong>{PANCHANG_TODAY.sunrise}</strong></span>
            </div>
            <div className="h-4 w-px bg-sandstone-300"></div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" />
              <span>Sunset: <strong>{PANCHANG_TODAY.sunset}</strong></span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
