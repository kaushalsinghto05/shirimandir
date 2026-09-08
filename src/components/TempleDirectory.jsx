import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Heart, 
  MapPin, 
  Clock, 
  Sparkles, 
  Radio, 
  ShieldCheck, 
  ArrowRight,
  Star,
  Users
} from 'lucide-react';
import { TEMPLES } from '../data/mockData';

export default function TempleDirectory({ 
  temples = TEMPLES,
  onSelectTemple, 
  wishlist, 
  onToggleWishlist 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDeity, setSelectedDeity] = useState('All');
  const [filterLiveDarshanOnly, setFilterLiveDarshanOnly] = useState(false);

  const states = ['All', 'Uttar Pradesh', 'Madhya Pradesh', 'Uttarakhand', 'Andhra Pradesh', 'Assam'];
  const deities = ['All', 'Lord Shiva', 'Lord Rama', 'Lord Venkateswara', 'Goddess Kamakhya'];

  const filteredTemples = temples.filter((temple) => {
    const matchesSearch = 
      temple.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      temple.deity.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === 'All' || temple.state === selectedState;
    const matchesDeity = selectedDeity === 'All' || temple.deity.toLowerCase().includes(selectedDeity.toLowerCase());
    const matchesLive = !filterLiveDarshanOnly || temple.hasLiveDarshan;

    return matchesSearch && matchesState && matchesDeity && matchesLive;
  });

  return (
    <div className="py-12 bg-sandstone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-600" />
            <span>Sacred Geography</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-sanctum-950">
            Ancient Temple Directory & Sanctums
          </h1>
          <p className="text-sm sm:text-base text-sandstone-700 mt-1 max-w-2xl">
            Explore 500+ verified Devasthanams across India. Check live darshan queues, daily aarti schedules, and book authentic sevas.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-5 rounded-3xl border border-sandstone-200 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-sandstone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by temple name (e.g. Kashi, Kedarnath), deity, or city..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-sandstone-50 border border-sandstone-200 text-sm focus:outline-none focus:border-gold-500 focus:bg-white transition-colors"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-sandstone-50 border border-sandstone-200 text-sm text-sandstone-800 focus:outline-none focus:border-gold-500"
            >
              <option value="All">All States (India)</option>
              {states.filter(s => s !== 'All').map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            {/* Deity Filter */}
            <select
              value={selectedDeity}
              onChange={(e) => setSelectedDeity(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-sandstone-50 border border-sandstone-200 text-sm text-sandstone-800 focus:outline-none focus:border-gold-500"
            >
              <option value="All">All Deities</option>
              {deities.filter(d => d !== 'All').map(dt => (
                <option key={dt} value={dt}>{dt}</option>
              ))}
            </select>

            {/* Live Darshan Toggle */}
            <button
              onClick={() => setFilterLiveDarshanOnly(!filterLiveDarshanOnly)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold border transition-all ${
                filterLiveDarshanOnly
                  ? 'bg-tulsi-50 border-tulsi-500 text-tulsi-700 shadow-sm'
                  : 'bg-sandstone-50 border-sandstone-200 text-sandstone-700 hover:bg-sandstone-100'
              }`}
            >
              <Radio className={`w-4 h-4 ${filterLiveDarshanOnly ? 'text-tulsi-600' : 'text-sandstone-400'}`} />
              <span>Live Darshan Active</span>
            </button>

          </div>

          <div className="flex items-center justify-between text-xs text-sandstone-500 pt-2 border-t border-sandstone-100">
            <span>Showing <strong>{filteredTemples.length}</strong> sanctums found</span>
            <span className="text-gold-700 font-medium">Click on any temple to view Live Darshan & Timings</span>
          </div>
        </div>

        {/* Temples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemples.map((temple) => {
            const isWishlisted = wishlist.includes(temple.id);

            return (
              <div
                key={temple.id}
                onClick={() => onSelectTemple(temple)}
                className="bg-white rounded-3xl border border-sandstone-200 overflow-hidden shadow-sanctum hover:shadow-sanctum-lg transition-all duration-300 flex flex-col cursor-pointer group"
              >
                {/* Image Cover */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={temple.image}
                    alt={temple.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sanctum-950/90 via-sanctum-950/20 to-transparent"></div>

                  {/* Top Pill Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sanctum-950/80 backdrop-blur-md border border-tulsi-500/50 text-white text-[11px] font-semibold">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tulsi-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-tulsi-500"></span>
                      </span>
                      <span>🟢 ~{temple.waitMinutes} min queue</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(temple.id);
                      }}
                      className="p-2 rounded-full bg-sanctum-950/70 backdrop-blur-md border border-white/20 text-white hover:text-terracotta-400 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'text-terracotta-500 fill-terracotta-500' : ''}`} />
                    </button>
                  </div>

                  {/* Title and Deity */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-xs font-semibold text-gold-300 tracking-wide block">
                      {temple.deity}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-gold-300 transition-colors truncate">
                      {temple.name}
                    </h3>
                    <p className="text-xs text-sandstone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-gold-400" />
                      <span>{temple.location}</span>
                    </p>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-sandstone-600 line-clamp-2">
                      {temple.tagline}
                    </p>

                    {/* Stats bar */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 bg-sandstone-50 rounded-xl border border-sandstone-200">
                        <span className="text-[10px] text-sandstone-500 block">Devotee Rating</span>
                        <span className="font-bold text-sanctum-900 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-gold-500 text-gold-500" />
                          <span>{temple.rating} ({temple.reviewCount.toLocaleString()})</span>
                        </span>
                      </div>

                      <div className="p-2 bg-sandstone-50 rounded-xl border border-sandstone-200">
                        <span className="text-[10px] text-sandstone-500 block">Devotees Following</span>
                        <span className="font-bold text-sanctum-900 flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-sanctum-700" />
                          <span>{(temple.followersCount / 1000).toFixed(0)}k Sevaks</span>
                        </span>
                      </div>
                    </div>

                    {/* Available Sevas Count */}
                    <div className="flex items-center justify-between text-xs text-tulsi-700 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-tulsi-600" />
                        <span>{temple.availableSevas.length} Sevas Available</span>
                      </span>
                      <span className="text-terracotta-600 font-semibold">
                        80G Tax Exempt
                      </span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="mt-5 pt-4 border-t border-sandstone-100 flex items-center justify-between text-xs font-bold text-sanctum-950 group-hover:text-gold-700">
                    <span>Explore Temple & Timings</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
