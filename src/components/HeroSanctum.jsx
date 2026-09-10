import React, { useState, useEffect } from 'react';
import { Star, ShieldCheck, MapPin, Users, Activity, Sparkles, Play } from 'lucide-react';
import { PANCHANG_TODAY } from '../data/mockData';

export default function HeroSanctum({ 
  onExplorePujas, 
  onViewDarshanQueue, 
  selectedDeityFilter, 
  setSelectedDeityFilter 
}) {
  const deities = ['All', 'Lord Shiva', 'Shri Ram', 'Maa Durga', 'Hanuman', 'Balaji'];
  const [activeStatIndex, setActiveStatIndex] = useState(0);

  const stats = [
    { icon: Users, value: '1.2M+', label: 'Devotees Served', color: 'text-copper-400' },
    { icon: Star, value: '4.94/5', label: 'Average Rating', color: 'text-temple-gold-400' },
    { icon: MapPin, value: '500+', label: 'Sacred Temples', color: 'text-vermilion-400' },
    { icon: ShieldCheck, value: '100%', label: 'Authentic & Verified', color: 'text-sage-400' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatIndex(prev => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  return (
    <div className="relative min-h-screen bg-charcoal-900 overflow-hidden flex flex-col justify-center pb-16 pt-24 lg:pt-32">
      
      {/* Multi-layer Background */}
      <div className="absolute inset-0 z-0">
        {/* Base mesh gradient */}
        <div className="absolute inset-0 bg-hero-mesh" />
        
        {/* Radial glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-copper-500/15 rounded-full blur-[150px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-temple-gold-500/15 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-vermilion-500/5 rounded-full blur-[200px]" />
        
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-[15%] text-temple-gold-500/10 text-8xl font-display animate-float select-none pointer-events-none" style={{ animationDelay: '0s' }}>ॐ</div>
        <div className="absolute bottom-32 left-[10%] text-copper-400/10 text-7xl font-display animate-float select-none pointer-events-none" style={{ animationDelay: '2s' }}>☸</div>
        <div className="absolute top-1/3 right-[8%] text-temple-gold-400/8 text-6xl font-display animate-float select-none pointer-events-none" style={{ animationDelay: '4s' }}>🕉</div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(212,188,124,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Panchang Marquee Bar */}
      <div className="absolute top-0 left-0 w-full z-20 bg-charcoal-950/80 backdrop-blur-xl border-b border-temple-gold-500/20 overflow-hidden">
        <div className="relative overflow-hidden py-2.5">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-10 text-xs text-ivory-200 font-medium px-6">
                <span className="flex items-center text-temple-gold-400 font-semibold">
                  <Activity className="w-3.5 h-3.5 mr-1.5" /> Today's Panchang
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-copper-400" />
                  Tithi: {PANCHANG_TODAY?.tithi || 'Shukla Paksha Ekadashi'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-copper-400" />
                  Nakshatra: {PANCHANG_TODAY?.nakshatra || 'Rohini'}
                </span>
                <span className="flex items-center gap-1.5 text-sage-400">
                  <span className="w-1 h-1 rounded-full bg-sage-400" />
                  Abhijit Muhurat: {PANCHANG_TODAY?.abhijitMuhurat || '11:45 AM - 12:30 PM'}
                </span>
                <span className="flex items-center gap-1.5 text-vermilion-400">
                  <span className="w-1 h-1 rounded-full bg-vermilion-400" />
                  Rahu Kaal: {PANCHANG_TODAY?.rahuKaal || '01:30 PM - 03:00 PM'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-temple-gold-400" />
                  Festival: {PANCHANG_TODAY?.festival || 'Parivartini Ekadashi'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
        {/* Center Content */}
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          
          {/* Top Badge */}
          <div className="inline-flex items-center px-5 py-2 rounded-full border border-copper-400/30 bg-copper-500/10 text-copper-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 mr-2 animate-pulse-slow" />
            Vedic Temple Tradition Reimagined
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-ivory-50 leading-[1.1] mb-6">
            Connect Your Soul to
            <br />
            <span className="relative inline-block">
              <span className="text-gradient-copper">India's Holiest Sanctums</span>
              <span className="absolute -bottom-2 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-copper-400/60 to-transparent" />
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg lg:text-xl text-ivory-200/90 mb-12 max-w-2xl mx-auto leading-relaxed font-sans">
            Experience divine blessings from your home. Personalized gotra recitation, sacred chadhava offerings & authentic prasad delivery from ancient temples to your doorstep.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-14">
            <button 
              onClick={onExplorePujas}
              className="w-full sm:w-auto group relative bg-gradient-to-r from-copper-500 to-copper-400 hover:from-copper-400 hover:to-copper-300 text-charcoal-900 font-bold px-10 py-4 rounded-2xl shadow-copper-glow hover:shadow-[0_0_40px_-5px_rgba(193,127,89,0.5)] hover:-translate-y-1 transition-all duration-300 text-base"
            >
              <span className="flex items-center justify-center gap-2">
                Explore 108+ Live Pujas
                <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
            <button 
              onClick={onViewDarshanQueue}
              className="w-full sm:w-auto group flex items-center justify-center px-10 py-4 rounded-2xl border border-ivory-200/30 text-ivory-50 hover:bg-white/10 hover:border-ivory-200/50 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm text-base font-medium"
            >
              <span className="relative flex items-center justify-center w-3 h-3 mr-3">
                <span className="absolute inline-flex w-full h-full rounded-full bg-sage-400 opacity-40 animate-ping-slow" />
                <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-sage-400" />
              </span>
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
                  className={`snap-center px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedDeityFilter === deity 
                      ? 'bg-gradient-to-r from-temple-gold-500 to-temple-gold-400 text-charcoal-900 shadow-warm font-semibold scale-105' 
                      : 'bg-white/8 text-ivory-100 hover:bg-white/15 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {deity}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Stats Strip */}
        <div className="w-full max-w-5xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-dark rounded-3xl p-6 md:p-8 border border-white/10 shadow-dark relative overflow-hidden">
            {/* Inner subtle glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-temple-gold-400/40 to-transparent" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`flex flex-col items-center justify-center text-center py-2 transition-all duration-500 ${
                      index > 0 ? 'md:border-l md:border-white/10' : ''
                    } ${activeStatIndex === index ? 'scale-105' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${
                      activeStatIndex === index ? 'ring-2 ring-white/10' : ''
                    }`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl md:text-3xl font-display font-bold text-ivory-50">{stat.value}</div>
                    <div className="text-xs text-ivory-300 uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Press Logos */}
        <div className="w-full mt-16 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-xs text-ivory-400/60 uppercase tracking-[0.2em] mb-8 font-sans">Trusted & Featured In</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 hover:opacity-60 grayscale hover:grayscale-0 transition-all duration-700">
            {['ECONOMIC TIMES', 'THE HINDU', 'TIMES OF INDIA', 'LIVEMINT', 'DAINIK BHASKAR'].map(name => (
              <span key={name} className="font-display font-bold text-lg text-ivory-100 tracking-wide">{name}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
