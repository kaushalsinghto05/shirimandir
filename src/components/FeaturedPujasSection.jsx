import React, { useState } from 'react';
import { 
  Sparkles, 
  Video, 
  Users, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ShieldCheck, 
  Flame 
} from 'lucide-react';
import { FEATURED_PUJAS } from '../data/mockData';

export default function FeaturedPujasSection({ 
  onBookPuja, 
  selectedDeityFilter 
}) {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Auspicious Pujas' },
    { id: 'health', label: 'Health & Protection' },
    { id: 'wealth', label: 'Wealth & Debt Relief' },
    { id: 'career', label: 'Career & Legal Victory' },
    { id: 'dosha', label: 'Astrological Doshas' },
  ];

  const filteredPujas = FEATURED_PUJAS.filter(puja => {
    if (selectedDeityFilter && selectedDeityFilter !== 'all') {
      if (!puja.deity.toLowerCase().includes(selectedDeityFilter.toLowerCase())) {
        return false;
      }
    }
    if (activeCategory === 'health') return puja.category.toLowerCase().includes('health');
    if (activeCategory === 'wealth') return puja.category.toLowerCase().includes('wealth');
    if (activeCategory === 'career') return puja.category.toLowerCase().includes('legal') || puja.category.toLowerCase().includes('career');
    if (activeCategory === 'dosha') return puja.category.toLowerCase().includes('astrological');
    return true;
  });

  return (
    <section className="py-16 bg-sandstone-50 border-b border-sandstone-300/60" id="pujas-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 text-gold-600" />
            <span>Vedic Sankalpa Sevas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-sanctum-950">
            Auspicious Pujas with Personal Gotra Recitation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-sandstone-700">
            Certified Vedic priests chant your family gotra during the live sanctum ritual. Watch live on private video and receive holy consecrated prasad at your doorstep.
          </p>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-sanctum-950 text-gold-300 shadow-sm border border-gold-500/40'
                    : 'bg-white text-sandstone-700 hover:bg-sandstone-100 border border-sandstone-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pujas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPujas.map((puja) => {
            return (
              <div
                key={puja.id}
                className="bg-white rounded-3xl border border-sandstone-200 overflow-hidden shadow-sanctum hover:shadow-sanctum-lg transition-all duration-300 flex flex-col group border-t-4 border-t-gold-500"
              >
                {/* Image & Live Stream Header */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={puja.image}
                    alt={puja.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sanctum-950/95 via-sanctum-950/40 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sanctum-950/90 backdrop-blur-md border border-tulsi-500/60 text-white text-[11px] font-bold">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tulsi-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-tulsi-500"></span>
                      </span>
                      <span>{puja.badge}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-terracotta-600 text-white text-[11px] font-bold tracking-wide shadow-sm">
                      {puja.discount}
                    </span>
                  </div>

                  {/* Tithi & Countdown info inside banner */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                    <div className="inline-block px-2.5 py-0.5 rounded-md bg-gold-500/90 text-sanctum-950 font-bold text-[10px] uppercase tracking-wider mb-1">
                      {puja.tithiTag}
                    </div>
                    <p className="text-xs text-gold-200 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-400" />
                      <span>{puja.date}</span>
                    </p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    
                    {/* Temple Name */}
                    <div>
                      <span className="text-xs font-semibold text-terracotta-600 uppercase tracking-wide">
                        {puja.templeName}
                      </span>
                      <h3 className="text-xl font-serif font-bold text-sanctum-950 mt-1 leading-snug group-hover:text-gold-700 transition-colors">
                        {puja.title}
                      </h3>
                    </div>

                    {/* Vedic Benefits Checklist */}
                    <div className="space-y-2 bg-sandstone-50 p-4 rounded-2xl border border-sandstone-200/80">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-sandstone-500">
                        Sacred Blessings & Inclusions:
                      </p>
                      <ul className="space-y-1.5">
                        {puja.benefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-sandstone-800">
                            <CheckCircle2 className="w-3.5 h-3.5 text-tulsi-600 mt-0.5 shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Devotees Participated counter */}
                    <div className="flex items-center justify-between text-xs text-sandstone-600 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-gold-600" />
                        <span><strong>{puja.participantsCount.toLocaleString()}</strong> devotees registered</span>
                      </span>
                      <span className="flex items-center gap-1 text-tulsi-700 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-tulsi-600" />
                        <span>Doorstep Prasad Included</span>
                      </span>
                    </div>

                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-6 pt-5 border-t border-sandstone-100 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] text-sandstone-500 block">Dakshina from</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-serif font-bold text-sanctum-950">
                          ₹{puja.price.toLocaleString()}
                        </span>
                        <span className="text-xs text-sandstone-400 line-through">
                          ₹{puja.originalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onBookPuja(puja)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-sanctum-950 font-bold text-sm shadow-gold-glow hover:shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Book Sankalpa</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
