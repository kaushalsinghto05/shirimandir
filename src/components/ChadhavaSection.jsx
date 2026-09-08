import React from 'react';
import { 
  Flame, 
  Sparkles, 
  ArrowRight, 
  HeartHandshake, 
  ShieldCheck, 
  Check 
} from 'lucide-react';
import { CHADHAVA_ITEMS } from '../data/mockData';

export default function ChadhavaSection({ onOfferChadhava }) {
  return (
    <section className="py-16 bg-white border-b border-sandstone-300/60" id="chadhava-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-100 border border-terracotta-500/30 text-terracotta-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Flame className="w-3.5 h-3.5 text-terracotta-600" />
              <span>Sacred Shringar & Gau Seva</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-sanctum-950">
              Offer Divine Chadhava at Ancient Sanctums
            </h2>
            <p className="text-sm sm:text-base text-sandstone-700 mt-2 max-w-2xl">
              Dedicate silver ornaments, holy vastra, flowers, or feed sacred cows in your family's gotra. Officiated during sanctum aartis with video proof.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-tulsi-700 bg-tulsi-50 px-3.5 py-2 rounded-xl border border-tulsi-500/20">
            <ShieldCheck className="w-4 h-4 text-tulsi-600" />
            <span>100% Guaranteed Sanctum Offering with Receipt</span>
          </div>
        </div>

        {/* Chadhava Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CHADHAVA_ITEMS.map((item) => {
            return (
              <div 
                key={item.id}
                className="bg-sandstone-50 rounded-3xl border border-sandstone-200 overflow-hidden hover:border-gold-500/50 hover:shadow-sanctum transition-all duration-300 flex flex-col group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sanctum-950/80 via-transparent to-transparent"></div>
                  
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-sanctum-950/80 backdrop-blur-md text-gold-300 text-[10px] font-bold uppercase tracking-wider border border-gold-500/30">
                    {item.category}
                  </span>

                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <p className="text-[11px] text-gold-300 font-medium truncate">{item.templeName}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-sanctum-950 leading-snug group-hover:text-gold-700 transition-colors">
                      {item.name}
                    </h3>
                    
                    <p className="text-xs text-sandstone-600 mt-2 line-clamp-2">
                      {item.desc}
                    </p>

                    <div className="mt-3 p-2.5 rounded-xl bg-white border border-sandstone-200/80 text-[11px] text-sandstone-700">
                      <strong className="text-terracotta-600 block mb-0.5">Spiritual Merit:</strong>
                      {item.significance}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="mt-5 pt-4 border-t border-sandstone-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-sandstone-400 block font-semibold">Seva Dakshina</span>
                      <span className="text-xl font-serif font-bold text-sanctum-950">
                        ₹{item.price.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => onOfferChadhava(item)}
                      className="py-2 px-3.5 rounded-xl bg-sanctum-950 hover:bg-gold-500 text-gold-300 hover:text-sanctum-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Offer Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
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
