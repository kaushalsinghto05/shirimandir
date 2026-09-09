import React from 'react';
import { Star, ShieldCheck, MapPin, Users, Activity } from 'lucide-react';
import { PANCHANG_TODAY } from '../data/mockData';

export default function HeroSanctum({ 
  onExplorePujas, 
  onViewDarshanQueue, 
  selectedDeityFilter, 
  setSelectedDeityFilter 
}) {
  const deities = ['All', 'Lord Shiva', 'Shri Ram', 'Maa Durga', 'Hanuman', 'Balaji'];

  return (
    <div className="relative min-h-screen bg-charcoal-900 bg-hero-mesh overflow-hidden flex flex-col justify-center pb-16 pt-24 lg:pt-32">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-copper-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-temple-gold-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Panchang Marquee Bar */}
      <div className="absolute top-0 left-0 w-full z-10 glass-dark border-b border-white/10 overflow-hidden hidden md:block">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center whitespace-nowrap overflow-x-auto scrollbar-hide animate-fade-in">
          <div className="flex items-center space-x-8 text-xs text-ivory-200 font-medium">
            <span className="flex items-center text-temple-gold-400"><Activity className="w-3 h-3 mr-1" /> Today's Panchang</span>
            <span>Tithi: {PANCHANG_TODAY?.tithi || 'Shukla Paksha Ekadashi'}</span>
            <span>Nakshatra: {PANCHANG_TODAY?.nakshatra || 'Rohini'}</span>
            <span className="text-sage-400">Abhijit Muhurat: {PANCHANG_TODAY?.abhijitMuhurat || '11:45 AM - 12:30 PM'}</span>
            <span className="text-vermilion-400">Rahu Kaal: {PANCHANG_TODAY?.rahuKaal || '01:30 PM - 03:00 PM'}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
        {/* Center Content */}
        <div className="max-w-3xl mx-auto animate-fade-in-up">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-copper-400/30 bg-copper-500/10 text-copper-300 text-xs font-semibold uppercase tracking-wider mb-8">
            <span className="mr-2">✦</span> Vedic Temple Tradition Reimagined
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-ivory-50 leading-tight mb-6">
            Connect Your Soul to India's<br />
            <span className="text-gradient-copper">Holiest Sanctums</span>
          </h1>

          <p className="text-base md:text-lg text-ivory-200 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience divine blessings from your home. We facilitate personalized gotra recitation, sacred chadhava offerings, and authentic prasad delivery directly from ancient temples to your doorstep.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12">
            <button 
              onClick={onExplorePujas}
              className="w-full sm:w-auto bg-copper-500 hover:bg-copper-400 text-charcoal-900 font-semibold px-8 py-3.5 rounded-xl shadow-copper-glow hover:-translate-y-0.5 transition-all duration-300"
            >
              Explore 108+ Live Pujas
            </button>
            <button 
              onClick={onViewDarshanQueue}
              className="w-full sm:w-auto group flex items-center justify-center px-8 py-3.5 rounded-xl border border-ivory-200/30 text-ivory-50 hover:bg-white/5 transition-all duration-300 hover:-translate-y-0.5"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-sage-400 animate-pulse-slow mr-3"></span>
              Live Darshan Queue
            </button>
          </div>

          {/* Deity Filter Tabs */}
          <div className="w-full overflow-x-auto scrollbar-hide pb-4 snap-x-mandatory">
            <div className="flex items-center justify-center space-x-3 min-w-max px-4">
              {deities.map(deity => (
                <button
                  key={deity}
                  onClick={() => setSelectedDeityFilter?.(deity)}
                  className={`snap-center px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedDeityFilter === deity ? 'bg-temple-gold-500 text-charcoal-900 shadow-warm' : 'bg-white/10 text-ivory-100 hover:bg-white/20'}`}
                >
                  {deity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Stats Strip */}
        <div className="w-full max-w-5xl mx-auto mt-16 glass-dark rounded-3xl p-6 md:p-8 animate-fade-in-up delay-200 border border-white/10 shadow-dark">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-x-0 md:divide-x divide-white/10">
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="w-6 h-6 text-copper-400 mb-2" />
              <div className="text-2xl font-display font-bold text-ivory-50">1.2M+</div>
              <div className="text-xs text-ivory-200 uppercase tracking-wider">Devotees</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <Star className="w-6 h-6 text-temple-gold-400 mb-2" />
              <div className="text-2xl font-display font-bold text-ivory-50">4.94/5</div>
              <div className="text-xs text-ivory-200 uppercase tracking-wider">Rating</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <MapPin className="w-6 h-6 text-vermilion-400 mb-2" />
              <div className="text-2xl font-display font-bold text-ivory-50">500+</div>
              <div className="text-xs text-ivory-200 uppercase tracking-wider">Temples</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <ShieldCheck className="w-6 h-6 text-sage-400 mb-2" />
              <div className="text-2xl font-display font-bold text-ivory-50">100%</div>
              <div className="text-xs text-ivory-200 uppercase tracking-wider">Authentic</div>
            </div>
          </div>
        </div>

        {/* Press Logos */}
        <div className="w-full mt-16 animate-fade-in">
          <p className="text-xs text-ivory-400 uppercase tracking-widest mb-6">Featured In</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="font-display font-bold text-lg text-ivory-100">ECONOMIC TIMES</span>
            <span className="font-display font-bold text-lg text-ivory-100">THE HINDU</span>
            <span className="font-display font-bold text-lg text-ivory-100">TIMES OF INDIA</span>
            <span className="font-display font-bold text-lg text-ivory-100">LIVEMINT</span>
            <span className="font-display font-bold text-lg text-ivory-100">DAINIK BHASKAR</span>
          </div>
        </div>

      </div>
    </div>
  );
}
