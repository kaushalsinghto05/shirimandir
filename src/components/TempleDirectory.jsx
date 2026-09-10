import React, { useState } from 'react';
import { Search, MapPin, Star, Heart, ShieldCheck, Clock } from 'lucide-react';

export default function TempleDirectory({ temples, onSelectTemple, wishlist, onToggleWishlist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Uttar Pradesh', 'Madhya Pradesh', 'Uttarakhand', 'Andhra Pradesh', 'Assam'];

  const filteredTemples = temples?.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.deity?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || t.location.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  const getWaitTimeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'low': return 'bg-sage-400 text-ivory-50';
      case 'medium': return 'bg-temple-gold-400 text-charcoal-900';
      case 'high': return 'bg-vermilion-500 text-ivory-50';
      default: return 'bg-charcoal-200 text-charcoal-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900 mb-6 text-center">Explore Sacred Temples</h2>
        
        <div className="max-w-2xl mx-auto relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-charcoal-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-ivory-100 border-none rounded-2xl shadow-warm focus:ring-2 focus:ring-copper-400/50 text-charcoal-900 font-sans transition-all duration-300"
            placeholder="Search temples, cities, deities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full font-sans text-sm transition-all duration-300 ${activeFilter === filter ? 'bg-copper-400 text-ivory-50 shadow-copper-glow' : 'bg-ivory-100 text-charcoal-700 hover:bg-ivory-200'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemples?.map(temple => {
          const isWishlisted = wishlist && wishlist.includes(temple.id);
          
          return (
            <div key={temple.id} className="bg-ivory-100 rounded-2xl shadow-warm overflow-hidden hover:-translate-y-0.5 hover:shadow-warm-lg transition-all duration-300 flex flex-col">
              <div className="relative h-48 w-full cursor-pointer" onClick={() => onSelectTemple(temple)}>
                <img src={temple.image || temple.imageUrl || '/images/kashi_vishwanath.jpg'} alt={temple.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/images/kashi_vishwanath.jpg'; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 to-transparent"></div>
                
                {temple.trustBadge && (
                  <div className="absolute top-4 left-4 bg-sage-400/90 backdrop-blur-sm text-ivory-50 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </div>
                )}
                
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist(temple.id); }}
                  className="absolute top-4 right-4 bg-charcoal-900/40 hover:bg-charcoal-900/60 p-2 rounded-full transition-all duration-300 backdrop-blur-sm"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-vermilion-500 text-vermilion-500' : 'text-ivory-50'}`} />
                </button>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div className="text-ivory-50">
                    <h3 className="font-display text-xl font-bold">{temple.name}</h3>
                    <p className="font-sans text-sm text-ivory-200">{temple.deity}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center text-charcoal-500 text-sm">
                      <MapPin className="w-4 h-4 mr-1 text-copper-500" />
                      {temple.location}
                    </div>
                    <div className="flex items-center text-sm font-semibold text-charcoal-900">
                      <Star className="w-4 h-4 text-temple-gold-500 fill-temple-gold-500 mr-1" />
                      {temple.rating} <span className="text-charcoal-500 font-normal ml-1">({typeof temple.reviewCount === 'number' ? temple.reviewCount.toLocaleString('en-IN') : (Array.isArray(temple.reviews) ? temple.reviews.length : '12K')})</span>
                    </div>
                  </div>
                  
                  {(temple.waitMinutes !== undefined || temple.waitTime) && (
                    <div className="mb-5 flex items-center gap-2">
                      <span className="text-xs text-charcoal-500 font-sans flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Wait Time:
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getWaitTimeColor(temple.waitStatus || temple.waitTimeStatus)}`}>
                        {temple.waitMinutes ? `${temple.waitMinutes} mins` : temple.waitTime}
                      </span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => onSelectTemple(temple)}
                  className="w-full border-2 border-copper-400 text-copper-600 hover:bg-copper-400 hover:text-ivory-50 py-2.5 rounded-xl font-medium transition-all duration-300 focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2"
                >
                  View Temple
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredTemples?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-charcoal-500 text-lg">No temples found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
