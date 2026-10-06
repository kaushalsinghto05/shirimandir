import React, { useState } from 'react';
import { Search, MapPin, Star, Heart, Clock, ArrowRight, ShieldCheck, Filter } from 'lucide-react';
import VerificationBadge from './VerificationBadge';

export default function TempleDirectory({ temples, onSelectTemple, wishlist, onToggleWishlist }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [selectedVerification, setSelectedVerification] = useState('All');

  const states = ['All', 'Uttar Pradesh', 'Andhra Pradesh', 'Maharashtra', 'Uttarakhand'];
  const deities = ['All', 'Lord Shiva', 'Lord Venkateswara (Balaji)', 'Lord Ganesha', 'Shri Ram'];
  const verificationTiers = [
    { id: 'All', label: 'All Sanctums' },
    { id: 'official', label: 'Official Trust' },
    { id: 'partnered', label: 'Partnered Samiti' },
    { id: 'independent', label: 'Independent Seva' }
  ];

  const filteredTemples = temples?.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.deity && t.deity.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesState = selectedState === 'All' || t.state === selectedState || t.location.includes(selectedState);
    const matchesDeity = selectedDeity === 'All' || (t.deity && t.deity.toLowerCase().includes(selectedDeity.toLowerCase()));
    const matchesVerification = selectedVerification === 'All' || (t.verification_status || (t.trustBadge ? 'official' : 'independent')) === selectedVerification;

    return matchesSearch && matchesState && matchesDeity && matchesVerification;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 animate-fade-in">
      <div className="mb-10 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-copper-600 bg-copper-50 px-3 py-1 rounded-full border border-copper-200">
          Statutory Directory & Transparency Engine
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-900 mt-3 mb-3">
          Explore Sacred Temple Sanctums
        </h2>
        <p className="text-sm text-charcoal-600 font-sans max-w-2xl mx-auto leading-relaxed">
          Every sanctum is strictly tagged with its statutory legal affiliation tier: Official Trust, Partnered Archaka Samiti, or Independent Seva.
        </p>
        
        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative my-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-charcoal-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3.5 bg-white border border-ivory-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-copper-400/50 text-charcoal-900 font-sans text-sm transition-all"
            placeholder="Search by temple name, deity, or holy city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Multi-Dimensional Filter Controls */}
        <div className="space-y-3 max-w-4xl mx-auto bg-ivory-100/70 p-4 rounded-2xl border border-ivory-200">
          {/* Verification Status Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-charcoal-500 mr-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-copper-600" /> Verification Tier:
            </span>
            {verificationTiers.map(tier => (
              <button
                key={tier.id}
                onClick={() => setSelectedVerification(tier.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedVerification === tier.id 
                    ? 'bg-charcoal-900 text-white shadow-sm' 
                    : 'bg-white text-charcoal-700 border border-ivory-300 hover:bg-ivory-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Deity Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-ivory-200/60">
            <span className="text-xs font-bold text-charcoal-500 mr-2">Deity:</span>
            {deities.map(deity => (
              <button
                key={deity}
                onClick={() => setSelectedDeity(deity)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedDeity === deity 
                    ? 'bg-copper-500 text-white shadow-xs' 
                    : 'bg-white text-charcoal-600 border border-ivory-300 hover:bg-ivory-200'
                }`}
              >
                {deity}
              </button>
            ))}
          </div>

          {/* State Filter */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-ivory-200/60">
            <span className="text-xs font-bold text-charcoal-500 mr-2">State:</span>
            {states.map(state => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedState === state 
                    ? 'bg-sage-600 text-white shadow-xs' 
                    : 'bg-white text-charcoal-600 border border-ivory-300 hover:bg-ivory-200'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Temples */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemples?.map(temple => {
          const isWishlisted = wishlist && wishlist.includes(temple.id);
          const verificationStatus = temple.verification_status || (temple.trustBadge ? 'official' : 'independent');
          
          return (
            <div 
              key={temple.id} 
              className="bg-white rounded-3xl shadow-sm border border-ivory-200 overflow-hidden hover:-translate-y-1 hover:shadow-warm-lg transition-all duration-300 flex flex-col"
            >
              {/* Image & Badges */}
              <div 
                className="relative h-52 w-full cursor-pointer overflow-hidden" 
                onClick={() => onSelectTemple(temple)}
              >
                <img 
                  src={temple.image || temple.imageUrl || temple.image_url || '/images/kashi_vishwanath.jpg'} 
                  alt={temple.name} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  onError={(e) => { e.target.src = '/images/kashi_vishwanath.jpg'; }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/20 to-transparent" />
                
                {/* Legal Verification Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <VerificationBadge 
                    status={verificationStatus} 
                    proofDocUrl={temple.affiliation_proof_doc || temple.trustBadge?.verificationUrl}
                    trustRegNo={temple.trust_registration_no || temple.trustBadge?.trustName}
                  />
                </div>
                
                {/* Wishlist Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist(temple.id); }}
                  className="absolute top-4 right-4 bg-charcoal-950/50 hover:bg-charcoal-950/80 p-2.5 rounded-full transition-all duration-300 backdrop-blur-md"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-vermilion-500 text-vermilion-500' : 'text-white'}`} />
                </button>
                
                {/* Title & Deity */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display text-lg sm:text-xl font-bold leading-snug drop-shadow-sm">{temple.name}</h3>
                  <p className="font-sans text-xs text-ivory-200 mt-0.5">{temple.deity}</p>
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-charcoal-600 mb-3">
                    <div className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-copper-500" />
                      {temple.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-temple-gold-500 fill-temple-gold-500" />
                      <span className="font-bold text-charcoal-900">{temple.rating || 4.9}</span>
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-600 font-sans line-clamp-2 leading-relaxed mb-4">
                    {temple.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-ivory-200 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-charcoal-600 font-sans">
                    <Clock className="w-3.5 h-3.5 text-sage-600" />
                    <span>Wait: <strong>{temple.current_wait_minutes || temple.waitMinutes || 15}m</strong></span>
                  </div>

                  <button 
                    onClick={() => onSelectTemple(temple)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-copper-600 hover:text-copper-700 font-sans transition-colors"
                  >
                    View Pujas & Prasad <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
