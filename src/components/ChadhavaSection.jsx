import React from 'react';
import { Package, Plus } from 'lucide-react';
import { CHADHAVA_ITEMS, AASHIRWAD_ADDONS } from '../data/mockData';

export default function ChadhavaSection({ onOfferChadhava }) {
  return (
    <section className="py-16 lg:py-24 bg-ivory-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-900 mb-4">
            Sacred Chadhava & Prasadam
          </h2>
          <p className="text-lg text-charcoal-700 font-sans max-w-2xl mx-auto">
            Offer holy items to the deity and receive blessed prasadam delivered straight to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-16">
          {CHADHAVA_ITEMS.map((item) => (
            <div 
              key={item.id}
              className="bg-ivory-100 rounded-2xl shadow-warm hover:-translate-y-0.5 hover:shadow-warm-lg transition-all duration-300 p-6 sm:p-8 flex flex-col md:flex-row gap-6"
            >
              <div className="w-full md:w-2/5 shrink-0">
                <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-sm relative">
                  <img 
                    src={item.image || `/images/chadhava-${item.id}.jpg`} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1604514757626-4d05e81d7732?auto=format&fit=crop&w=400&q=80'; }}
                  />
                  {item.hasDelivery && (
                    <div className="absolute top-2 left-2 bg-ivory-50/90 backdrop-blur px-2.5 py-1 rounded-full flex items-center text-xs font-semibold text-charcoal-900 shadow-sm border border-ivory-200">
                      <Package className="w-3.5 h-3.5 mr-1.5 text-copper-500" />
                      Prasad Delivered
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-copper-600 uppercase tracking-wider mb-1">
                    {item.templeName} • {item.deity}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-charcoal-900 mb-3">
                    {item.name}
                  </h3>
                  <p className="text-sm text-charcoal-700 font-sans mb-4 leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="font-mono text-xl font-bold text-copper-500">
                    ₹{item.price}
                  </div>
                  <button
                    onClick={() => onOfferChadhava && onOfferChadhava(item)}
                    className="py-2.5 px-6 border-2 border-copper-400 text-copper-600 hover:bg-copper-400 hover:text-ivory-50 font-sans font-semibold rounded-xl transition-all duration-300 focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2 active:translate-y-0"
                  >
                    Offer Chadhava
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-ivory-200 pt-12">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-charcoal-900">
              Aashirwad Add-ons
            </h3>
            <span className="text-sm font-sans text-charcoal-500">Enhance your offering</span>
          </div>
          
          <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 scrollbar-hide snap-x-mandatory">
            {AASHIRWAD_ADDONS.map((addon) => (
              <div 
                key={addon.id}
                className="min-w-[200px] bg-ivory-100 rounded-xl shadow-warm border border-ivory-200/50 p-4 flex flex-col snap-start hover:border-copper-300 transition-colors"
              >
                <div className="h-24 w-full rounded-lg overflow-hidden mb-3 bg-ivory-200">
                  <img 
                    src={addon.image || `/images/addon-${addon.id}.jpg`} 
                    alt={addon.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=200&q=80'; }}
                  />
                </div>
                <h4 className="font-sans font-semibold text-charcoal-900 text-sm mb-1 leading-tight">{addon.name}</h4>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <span className="font-mono text-sm font-bold text-copper-500">₹{addon.price}</span>
                  <button 
                    className="p-1.5 rounded-full bg-ivory-200 text-charcoal-700 hover:bg-copper-100 hover:text-copper-600 transition-colors"
                    title="Add to offering"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
