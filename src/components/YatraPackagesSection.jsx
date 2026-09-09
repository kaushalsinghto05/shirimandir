import React from 'react';
import { Star, Clock, Map, Navigation, CalendarDays, Users } from 'lucide-react';
import { YATRA_PACKAGES } from '../data/mockData';

const YatraPackagesSection = ({ onBookYatra }) => {
  return (
    <section className="py-16 lg:py-24 bg-ivory-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-900 mb-4 animate-fade-in-up">
            Sacred Yatra Packages
          </h2>
          <p className="text-lg text-charcoal-700 max-w-2xl mx-auto font-sans animate-fade-in-up">
            Embark on transformative multi-day spiritual journeys meticulously curated for devotion and comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {YATRA_PACKAGES?.map((yatra) => {
            const lowSlots = yatra.slotsLeft < 10;
            return (
              <div 
                key={yatra.id}
                className="group rounded-2xl overflow-hidden bg-ivory-100 shadow-warm hover:-translate-y-1 hover:shadow-elevated transition-all duration-300 flex flex-col"
              >
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={yatra.image} 
                    alt={yatra.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/30 to-transparent"></div>
                  
                  {yatra.badge && (
                    <div className="absolute top-4 left-4 bg-copper-400 text-white text-xs font-bold px-3 py-1.5 rounded-full font-sans uppercase tracking-wide">
                      {yatra.badge}
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 text-ivory-50">
                    <h3 className="text-2xl font-display font-bold mb-1 line-clamp-1">{yatra.title}</h3>
                    <div className="flex items-center gap-1.5 text-sm font-medium font-sans text-ivory-200">
                      <Map className="w-4 h-4" />
                      <span className="line-clamp-1">{yatra.route.join(' → ')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 bg-ivory-200 text-charcoal-700 px-2.5 py-1 rounded-full text-xs font-semibold font-sans">
                      <Clock className="w-3.5 h-3.5" />
                      {yatra.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-ivory-200 text-charcoal-700 px-2.5 py-1 rounded-full text-xs font-semibold font-sans">
                      <Navigation className="w-3.5 h-3.5" />
                      {yatra.templeCount} Temples
                    </span>
                    <span className="inline-flex items-center gap-1 bg-sage-100 text-sage-700 px-2.5 py-1 rounded-full text-xs font-semibold font-sans">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {yatra.rating} ({yatra.reviews})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 mb-6 text-sm font-sans text-charcoal-700">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-copper-500" />
                      <span>{yatra.nextDeparture}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 ${lowSlots ? 'text-vermilion-500' : 'text-copper-500'}`} />
                      <span className={lowSlots ? 'text-vermilion-600 font-medium' : ''}>
                        {yatra.slotsLeft} slots left
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-charcoal-500">Transport: </span>
                      <span className="font-medium">{yatra.transportType}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex items-end gap-2 mb-4">
                      {yatra.originalPrice && (
                        <span className="text-sm font-mono text-charcoal-500 line-through">
                          ₹{yatra.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-xl font-mono font-bold text-charcoal-900">
                        ₹{yatra.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-charcoal-500 font-sans mb-1">/ person</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-2.5 px-4 rounded-xl border-2 border-copper-400 text-copper-600 font-semibold font-sans hover:bg-copper-50 transition-all duration-300 focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2 text-sm text-center">
                        View Itinerary
                      </button>
                      <button 
                        onClick={() => onBookYatra(yatra.id)}
                        className="py-2.5 px-4 rounded-xl bg-copper-400 text-white font-semibold font-sans shadow-copper-glow hover:bg-copper-500 transition-all duration-300 focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2 text-sm text-center"
                      >
                        Book Yatra
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default YatraPackagesSection;
