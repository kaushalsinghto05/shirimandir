import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Activity, 
  Calendar, 
  Eye, 
  Volume2, 
  CheckCircle2 
} from 'lucide-react';
import { PANCHANG_TODAY } from '../data/mockData';

export default function HeroSanctum({ 
  onExplorePujas, 
  onViewDarshanQueue, 
  selectedDeityFilter, 
  setSelectedDeityFilter 
}) {
  const deities = ['All', 'Lord Shiva', 'Shri Ram', 'Maa Durga', 'Hanuman', 'Balaji'];
  const [activeTempleIndex, setActiveTempleIndex] = useState(0);

  const featuredTemples = [
    {
      name: 'Tirupati Balaji',
      location: 'Tirumala, Andhra Pradesh',
      image: '/images/tirupati_balaji.jpg',
      status: 'Live Aarti & Darshan',
      viewers: '18.4k',
      deity: 'Lord Venkateswara'
    },
    {
      name: 'Ayodhya Ram Mandir',
      location: 'Ayodhya, Uttar Pradesh',
      image: '/images/ayodhya_ram_mandir.jpg',
      status: 'Sandhya Aarti Active',
      viewers: '24.9k',
      deity: 'Shri Ram'
    },
    {
      name: 'Kashi Vishwanath',
      location: 'Varanasi, Uttar Pradesh',
      image: '/images/kashi_vishwanath.jpg',
      status: 'Maha Shringar Live',
      viewers: '15.2k',
      deity: 'Lord Shiva'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTempleIndex(prev => (prev + 1) % featuredTemples.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredTemples.length]);

  const currentTemple = featuredTemples[activeTempleIndex];

  return (
    <div className="relative min-h-[85vh] lg:min-h-[90vh] bg-gradient-to-br from-[#1e1b3a] via-[#241e4a] to-[#2d2560] overflow-hidden flex flex-col justify-between pt-16 md:pt-20 pb-10 sm:pb-14 w-full max-w-full text-white">
      
      {/* ── Background Sacred Atmosphere & Watermark ── */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        
        {/* Soft Glowing Ambient Lights */}
        <div className="absolute -top-24 left-1/4 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-[#d4a15a]/15 rounded-full blur-[90px] sm:blur-[160px] animate-pulse-slow" />
        <div className="absolute top-1/3 right-[-10%] w-[320px] sm:w-[600px] h-[320px] sm:h-[600px] bg-[#4a3b8c]/25 rounded-full blur-[100px] sm:blur-[180px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-[260px] sm:w-[450px] h-[260px] sm:h-[450px] bg-[#d4a15a]/10 rounded-full blur-[80px] sm:blur-[140px]" />

        {/* Rotating Sacred Mandala Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[750px] lg:w-[950px] h-[420px] sm:h-[750px] lg:h-[950px] opacity-[0.05] animate-spin-slow pointer-events-none">
          <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#d4a15a]">
            <circle cx="200" cy="200" r="190" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="200" cy="200" r="160" stroke="currentColor" strokeWidth="1" />
            <circle cx="200" cy="200" r="130" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
            <circle cx="200" cy="200" r="90" stroke="currentColor" strokeWidth="1" />
            <circle cx="200" cy="200" r="50" stroke="currentColor" strokeWidth="1.5" />
            {/* Eight-Petal Sacred Pattern */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => (
              <g key={idx} transform={`rotate(${angle} 200 200)`}>
                <path d="M200 40 Q215 110 200 150 Q185 110 200 40Z" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.08" />
                <path d="M200 80 Q225 140 200 180 Q175 140 200 80Z" stroke="currentColor" strokeWidth="0.75" />
                <circle cx="200" cy="50" r="4" fill="currentColor" />
              </g>
            ))}
          </svg>
        </div>

        {/* Subtle Watermark Symbols */}
        <div className="hidden sm:block absolute top-28 right-[12%] text-[#d4a15a]/10 text-8xl font-display animate-float" style={{ animationDelay: '0s' }}>ॐ</div>
        <div className="hidden sm:block absolute bottom-24 left-[8%] text-[#d4a15a]/10 text-7xl font-display animate-float" style={{ animationDelay: '2.5s' }}>☸</div>

        {/* Fine Star / Particle Dust Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #d4a15a 1px, transparent 1px)', backgroundSize: '36px 36px' }} />
      </div>

      {/* ── Top Scrolling Panchang Marquee Ticker ── */}
      <div className="relative w-full z-20 bg-[#16142a]/95 backdrop-blur-xl border-b border-[#d4a15a]/20 overflow-hidden">
        <div className="relative overflow-hidden py-2 sm:py-2.5">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center space-x-6 sm:space-x-10 text-xs text-slate-200 font-medium px-4 sm:px-6">
                <span className="flex items-center text-[#d4a15a] font-semibold">
                  <Activity className="w-3.5 h-3.5 mr-1.5 animate-pulse" /> Today's Panchang
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a15a]" />
                  Tithi: <strong className="text-white font-normal">{PANCHANG_TODAY?.tithi || 'Shukla Paksha Ekadashi'}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a15a]" />
                  Nakshatra: <strong className="text-white font-normal">{PANCHANG_TODAY?.nakshatra || 'Rohini'}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Abhijit Muhurat: {PANCHANG_TODAY?.abhijitMuhurat || '11:45 AM - 12:30 PM'}
                </span>
                <span className="flex items-center gap-1.5 text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Rahu Kaal: {PANCHANG_TODAY?.rahuKaal || '01:30 PM - 03:00 PM'}
                </span>
                <span className="flex items-center gap-1.5 text-[#f5d89f]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d4a15a]" />
                  Shubh Yog: {PANCHANG_TODAY?.festival || 'Siddhi Yoga Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Hero Content Area ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (Headline, Tagline, CTAs, Trust Row) */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left min-w-0 animate-fade-in-up">
            
            {/* Brand Moniker & Tagline */}
            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-widest text-[#d4a15a]/80 uppercase mb-3">
              <span>Shiri Mandir</span>
              <span className="text-[#d4a15a]/40">•</span>
              <span>Sacred Temples • Verified Sevas</span>
            </div>

            {/* Pill-shaped Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#d4a15a]/40 bg-[#d4a15a]/10 text-[#f5d89f] text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-5 sm:mb-6 shadow-[0_0_15px_rgba(212,161,90,0.15)] backdrop-blur-sm max-w-full">
              <Sparkles className="w-3.5 h-3.5 text-[#d4a15a] animate-pulse-slow flex-shrink-0" />
              <span className="truncate">✨ VEDIC TEMPLE TRADITION REIMAGINED</span>
            </div>

            {/* Large Serif Headline (2 lines with gold keyword) */}
            <h1 className="font-display text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.14] sm:leading-[1.12] mb-4 sm:mb-6 tracking-tight">
              Connect With{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a15a] via-[#f7dfa9] to-[#d4a15a] drop-shadow-[0_2px_12px_rgba(212,161,90,0.35)]">
                Sacred Traditions
              </span>
              <br />
              <span className="text-white/95">At India's Holiest Temples</span>
            </h1>

            {/* Supporting Subtext */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-xl mb-7 sm:mb-9 leading-relaxed font-sans font-light">
              Experience divine blessings from home. Book authentic pujas with live gotra sankalp recitation, sacred chadhava offerings, and verified temple prasad delivered to your doorstep.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 sm:gap-4 mb-8 sm:mb-10 w-full max-w-md lg:max-w-none">
              {/* Primary: Solid Gold Gradient */}
              <button 
                onClick={onExplorePujas}
                className="group relative inline-flex items-center justify-center px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-[#1a1733] bg-gradient-to-r from-[#d4a15a] via-[#e5b76e] to-[#c5914a] hover:from-[#e5b76e] hover:to-[#d4a15a] shadow-[0_4px_25px_rgba(212,161,90,0.35)] hover:shadow-[0_6px_30px_rgba(212,161,90,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
              >
                <span>Book a Puja</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              {/* Secondary: Outlined */}
              <button 
                onClick={onViewDarshanQueue}
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white border border-[#d4a15a]/45 hover:bg-[#d4a15a]/15 hover:border-[#d4a15a] transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="relative flex items-center justify-center w-2.5 h-2.5 mr-2.5">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
                </span>
                <span>Explore Temples</span>
              </button>
            </div>

            {/* Trust Indicators Row with Divider Lines */}
            <div className="w-full pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-7">
              {/* 500+ Temples */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#d4a15a]/15 border border-[#d4a15a]/25 flex items-center justify-center text-[#d4a15a]">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-lg font-bold text-white font-display leading-tight">500+</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Temples</div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/15 hidden xs:block" />

              {/* 10,000+ Sevas Completed */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#d4a15a]/15 border border-[#d4a15a]/25 flex items-center justify-center text-[#d4a15a]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-lg font-bold text-white font-display leading-tight">10,000+</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Sevas Completed</div>
                </div>
              </div>

              <div className="h-8 w-px bg-white/15 hidden sm:block" />

              {/* Verified Priests */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#d4a15a]/15 border border-[#d4a15a]/25 flex items-center justify-center text-[#d4a15a]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-base sm:text-lg font-bold text-white font-display leading-tight">100%</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wider font-medium">Verified Priests</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Temple Visual with Gold Rim-Lighting & Floating Live Cards) */}
          <div className="lg:col-span-5 w-full max-w-md sm:max-w-lg lg:max-w-none mx-auto min-w-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative mx-auto">
              
              {/* Outer Golden Halo / Rim-Lighting Glow */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#d4a15a]/40 via-amber-400/20 to-[#d4a15a]/40 rounded-3xl blur-md opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              {/* Temple Image Card Container */}
              <div className="relative rounded-3xl overflow-hidden border border-[#d4a15a]/35 shadow-[0_10px_50px_-10px_rgba(212,161,90,0.35)] bg-[#1e1b3a] aspect-[4/5] sm:aspect-[4/3.8] lg:aspect-[4/5] max-h-[460px] lg:max-h-[500px] w-full">
                
                {/* Visual Image */}
                <img 
                  src={currentTemple.image} 
                  alt={currentTemple.name}
                  className="w-full h-full object-cover object-center transform scale-105 hover:scale-100 transition-transform duration-1000"
                />

                {/* Gradient Vignette & Rim Light overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#16142a] via-[#16142a]/30 to-black/25 pointer-events-none" />
                <div className="absolute inset-0 ring-1 ring-inset ring-[#d4a15a]/30 rounded-3xl pointer-events-none" />

                {/* Floating Card 1 (Top-Left): Live Aarti with Viewer Count */}
                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-20 bg-[#1a1733]/90 backdrop-blur-md border border-[#d4a15a]/30 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-float">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5">
                      Live Aarti • {currentTemple.name}
                    </div>
                    <div className="text-[10px] text-[#f5d89f] flex items-center gap-1 font-medium">
                      <Eye className="w-3 h-3 text-[#d4a15a]" />
                      <span>{currentTemple.viewers} Watching Live</span>
                    </div>
                  </div>
                </div>

                {/* Temple Switcher Indicator Dots (Top-Right) */}
                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 bg-[#1a1733]/80 backdrop-blur-md border border-white/10 px-2.5 py-1.5 rounded-full flex items-center gap-1.5">
                  {featuredTemples.map((t, idx) => (
                    <button
                      key={t.name}
                      onClick={() => setActiveTempleIndex(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeTempleIndex === idx ? 'w-5 bg-[#d4a15a]' : 'w-1.5 bg-white/30 hover:bg-white/50'
                      }`}
                      title={t.name}
                    />
                  ))}
                </div>

                {/* Floating Card 2 (Bottom-Right / Across Bottom): Today's Tithi/Nakshatra Snippet */}
                <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#1a1733]/90 backdrop-blur-md border border-[#d4a15a]/30 p-3.5 rounded-2xl shadow-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#d4a15a]/20 border border-[#d4a15a]/30 flex items-center justify-center text-[#d4a15a]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">Today's Sacred Window</div>
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{PANCHANG_TODAY?.tithi || 'Shukla Ekadashi'}</span>
                        <span className="text-[#d4a15a]">•</span>
                        <span className="text-[#f5d89f] font-normal">{PANCHANG_TODAY?.nakshatra || 'Rohini'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onViewDarshanQueue}
                    className="hidden xs:inline-flex items-center px-3 py-1.5 rounded-lg bg-[#d4a15a]/20 hover:bg-[#d4a15a]/30 text-[#f5d89f] text-xs font-semibold border border-[#d4a15a]/40 transition-colors"
                  >
                    View Queue
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

        {/* ── Deity Filter Navigation ── */}
        <div className="w-full max-w-full overflow-x-auto scrollbar-hide pt-10 sm:pt-14 pb-2 snap-x-mandatory min-w-0">
          <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-3 w-max mx-auto px-4">
            {deities.map(deity => (
              <button
                key={deity}
                onClick={() => setSelectedDeityFilter?.(deity)}
                className={`snap-center px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedDeityFilter === deity 
                    ? 'bg-gradient-to-r from-[#d4a15a] to-[#c28e46] text-[#1a1733] shadow-[0_0_20px_rgba(212,161,90,0.35)] font-bold scale-105' 
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10 hover:border-[#d4a15a]/40'
                }`}
              >
                {deity}
              </button>
            ))}
          </div>
        </div>

        {/* ── Featured Press / Devotee Trust Bar ── */}
        <div className="w-full mt-8 sm:mt-12 min-w-0 text-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p className="text-[10px] sm:text-[11px] text-slate-400 uppercase tracking-[0.25em] mb-4 sm:mb-6 font-medium">
            Trusted By Devotees Across India • Featured In
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 md:gap-14 opacity-50 hover:opacity-75 grayscale hover:grayscale-0 transition-all duration-500 px-4">
            {['ECONOMIC TIMES', 'THE HINDU', 'TIMES OF INDIA', 'LIVEMINT', 'DAINIK BHASKAR'].map(name => (
              <span key={name} className="font-display font-bold text-xs sm:text-sm md:text-base text-slate-200 tracking-wider">
                {name}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
