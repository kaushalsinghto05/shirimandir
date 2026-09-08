import React from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Globe2, 
  Star, 
  Video, 
  ArrowRight, 
  Clock, 
  MapPin,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { PANCHANG_TODAY } from '../data/mockData';

export default function HeroSanctum({ 
  onExplorePujas, 
  onViewDarshanQueue, 
  selectedDeityFilter, 
  setSelectedDeityFilter 
}) {
  const deities = [
    { id: 'all', label: 'All Sanctums', symbol: '🕉️' },
    { id: 'Lord Shiva', label: 'Lord Shiva', symbol: '🔱' },
    { id: 'Lord Rama', label: 'Shri Ram & Vishnu', symbol: '🏹' },
    { id: 'Goddess', label: 'Maa Durga & Shakti', symbol: '🌺' },
    { id: 'Lord Hanuman', label: 'Shri Hanuman', symbol: '🚩' },
    { id: 'Lord Venkateswara', label: 'Tirupati Balaji', symbol: '🪷' },
  ];

  return (
    <div className="relative bg-sanctum-950 text-sandstone-50 overflow-hidden border-b border-gold-500/20">
      
      {/* 1. Auspicious Tithi & Muhurta Marquee Banner */}
      <div className="bg-gradient-to-r from-sanctum-900 via-terracotta-700/80 to-sanctum-900 border-b border-gold-500/30 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sandstone-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
            </span>
            <span className="font-semibold text-gold-300 font-serif tracking-wide">TODAY'S PANCHANG:</span>
            <span className="text-sandstone-100">{PANCHANG_TODAY.tithi}</span>
            <span className="hidden md:inline text-gold-400/60">•</span>
            <span className="hidden md:inline text-sandstone-200">Nakshatra: {PANCHANG_TODAY.nakshatra}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-medium text-gold-200/90">
            <div className="flex items-center gap-1.5 bg-sanctum-950/60 px-2.5 py-1 rounded-full border border-gold-500/20">
              <Clock className="w-3.5 h-3.5 text-gold-400" />
              <span>Abhijit Muhurat: <strong>{PANCHANG_TODAY.abhijitMuhurat}</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-terracotta-300 bg-sanctum-950/60 px-2.5 py-1 rounded-full border border-terracotta-500/30">
              <span>Rahu Kaal: {PANCHANG_TODAY.rahuKaal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Sacred Geometric & Starfield Aura */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-b from-gold-500/30 via-terracotta-600/20 to-transparent blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-gold-500/10 blur-2xl"></div>
      </div>

      {/* Main Architectural Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Subtle Sacred Sanctum Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sanctum-900/90 border border-gold-500/40 text-gold-300 text-xs font-semibold tracking-wider uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Vedic Temple Tradition Reimagined</span>
          </div>

          {/* Majestic Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-sandstone-50 leading-tight">
            Connect Your Soul to India's <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-terracotta-300">
              Holiest Sanctums
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-sandstone-200 leading-relaxed font-normal">
            Book personalized Vedic Pujas officiated with your <strong>Gotra recitation</strong>, offer sacred <strong>Chadhava</strong> at 500+ ancient temples, and receive consecrated <strong>Prasad at your doorstep</strong> with live video sankalpa.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExplorePujas}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-sanctum-950 font-bold text-base shadow-gold-glow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-5 h-5" />
              <span>Explore 108+ Live Pujas</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onViewDarshanQueue}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-sanctum-900 hover:bg-sanctum-850 border border-gold-500/40 hover:border-gold-400 text-gold-300 font-semibold text-base transition-all duration-300 shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tulsi-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tulsi-500"></span>
              </span>
              <span>Live Darshan Queue & Timings</span>
            </button>
          </div>

          {/* Deity Quick Filter Tabs */}
          <div className="mt-10 pt-6 border-t border-sanctum-850">
            <p className="text-xs text-sandstone-300 uppercase tracking-wider font-semibold mb-3">
              Browse Sanctums by Deity
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {deities.map((item) => {
                const isSelected = selectedDeityFilter === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedDeityFilter(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-gold-500 text-sanctum-950 font-bold shadow-gold-glow'
                        : 'bg-sanctum-900/90 text-sandstone-200 hover:text-gold-300 hover:bg-sanctum-850 border border-gold-500/20'
                    }`}
                  >
                    <span>{item.symbol}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 2. Trust-Stat Sanctum Strip */}
        <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-sanctum-900/95 border border-gold-500/25 rounded-3xl p-6 sm:p-8 shadow-sanctum-lg backdrop-blur-md">
          
          <div className="text-center p-2 border-r-0 md:border-r border-sanctum-800">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-gold-300 flex items-center justify-center gap-1">
              <span>1.2M+</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-sandstone-100 mt-1">Devotees Blessed</p>
            <p className="text-[11px] text-sandstone-300">Across 42+ Countries</p>
          </div>

          <div className="text-center p-2 border-r-0 md:border-r border-sanctum-800">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-gold-300 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-gold-400 text-gold-400" />
              <span>4.94 / 5.0</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-sandstone-100 mt-1">Devotee Rating</p>
            <p className="text-[11px] text-sandstone-300">98,000+ Verified Reviews</p>
          </div>

          <div className="text-center p-2 border-r-0 md:border-r border-sanctum-800">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-gold-300">
              500+
            </div>
            <p className="text-xs sm:text-sm font-semibold text-sandstone-100 mt-1">Ancient Devasthanams</p>
            <p className="text-[11px] text-sandstone-300">Verified Temple Trusts</p>
          </div>

          <div className="text-center p-2">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-tulsi-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-6 h-6 text-tulsi-500" />
              <span>100%</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-sandstone-100 mt-1">Authentic Sankalpa</p>
            <p className="text-[11px] text-sandstone-300">Live Video & Certified Prasad</p>
          </div>

        </div>

        {/* 3. Press Mentions Strip */}
        <div className="mt-8 text-center">
          <p className="text-[11px] uppercase tracking-widest text-sandstone-400 font-semibold mb-3">
            Covered & Recognized Across Leading Media
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-60 hover:opacity-85 transition-opacity">
            <span className="font-serif text-sm tracking-wider font-bold text-sandstone-300">ECONOMIC TIMES</span>
            <span className="font-serif text-sm tracking-wider font-bold text-sandstone-300">THE HINDU</span>
            <span className="font-serif text-sm tracking-wider font-bold text-sandstone-300">TIMES OF INDIA</span>
            <span className="font-serif text-sm tracking-wider font-bold text-sandstone-300">LIVEMINT</span>
            <span className="font-serif text-sm tracking-wider font-bold text-sandstone-300">DAINIK BHASKAR</span>
          </div>
        </div>

      </div>
    </div>
  );
}
