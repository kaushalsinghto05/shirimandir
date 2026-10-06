import React from 'react';
import { Info, Clock, CheckCircle2, User } from 'lucide-react';
import { FEATURED_PUJAS } from '../data/mockData';

export default function FeaturedPujasSection({ onBookPuja, selectedDeityFilter = 'all' }) {
  const filteredPujas = selectedDeityFilter === 'all' 
    ? FEATURED_PUJAS 
    : FEATURED_PUJAS.filter(p => p.deity && p.deity.toLowerCase().includes(selectedDeityFilter.toLowerCase()));

  return (
    <section className="py-16 lg:py-24 bg-charcoal-900 text-ivory-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-temple-gold-400">
                Gotra-Personalized Pujas
              </h2>
              <div className="relative group cursor-pointer">
                <Info className="w-5 h-5 text-charcoal-500 hover:text-ivory-200 transition-colors" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-3 bg-charcoal-700 rounded-lg text-sm text-ivory-100 shadow-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                  Your family Gotra is recited by name during the sankalpa by the Vedic priest
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-charcoal-700"></div>
                </div>
              </div>
            </div>
            <p className="text-lg text-charcoal-300 font-sans">
              Perform authentic Vedic rituals at ancient temples with live sankalpa streaming.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPujas.map((puja) => (
            <div 
              key={puja.id}
              className="bg-ivory-100 rounded-2xl shadow-warm overflow-hidden flex flex-col sm:flex-row hover:-translate-y-0.5 hover:shadow-warm-lg transition-all duration-300 group"
            >
              <div className="relative w-full sm:w-2/5 h-56 sm:h-auto">
                <img 
                  src={puja.image || `/images/puja-${puja.id}.jpg`} 
                  alt={puja.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596440816045-813c9e6bbbf6?auto=format&fit=crop&w=600&q=80'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/30 to-transparent"></div>
                
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sage-400 text-ivory-50 shadow-sm">
                    LIVE SANKALPA
                  </span>
                  {puja.countdown && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-charcoal-900/80 backdrop-blur text-ivory-100">
                      <Clock className="w-3 h-3 mr-1" />
                      {puja.countdown}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col text-charcoal-900">
                <div className="mb-1 text-xs font-bold tracking-wider text-copper-600 uppercase">
                  {puja.templeName}
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 leading-tight">
                  {puja.title}
                </h3>
                <div className="text-sm text-charcoal-700 font-sans mb-4">
                  Deity: <span className="font-medium text-charcoal-900">{puja.deity}</span>
                </div>
                
                <ul className="space-y-2 mb-6 flex-1">
                  {puja.benefits?.slice(0, 3).map((benefit, idx) => (
                    <li key={idx} className="flex items-start text-sm text-charcoal-700 font-sans">
                      <CheckCircle2 className="w-4 h-4 text-sage-500 mr-2 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 border-t border-ivory-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-mono font-bold text-copper-500">₹{(puja.price || puja.discountedPrice || 1501).toLocaleString('en-IN')}</span>
                      {puja.originalPrice && (
                        <span className="text-sm font-mono text-charcoal-500 line-through">₹{puja.originalPrice.toLocaleString('en-IN')}</span>
                      )}
                    </div>
                    {(puja.discount || puja.discountPercentage) && (
                      <span className="text-xs font-medium text-sage-600">Save {puja.discount || puja.discountPercentage + '%'}</span>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-charcoal-500 font-sans flex items-center justify-end">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {puja.participantsCount} Participating
                    </div>
                    <div className="text-xs font-medium text-sage-600 mt-1">
                      🕉️ Your Gotra recited by name
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onBookPuja && onBookPuja(puja)}
                  className="mt-6 w-full py-3 px-6 bg-copper-500 hover:bg-copper-600 text-ivory-50 font-sans font-semibold rounded-xl transition-all duration-300 shadow-copper-glow focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2 active:translate-y-0"
                >
                  Book This Puja
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
