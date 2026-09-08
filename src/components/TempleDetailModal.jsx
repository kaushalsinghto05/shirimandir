import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Users, 
  Radio, 
  Heart, 
  Sparkles, 
  Calendar, 
  Star, 
  CheckCircle2, 
  Share2, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';

export default function TempleDetailModal({ 
  temple, 
  onClose, 
  onBookSeva, 
  wishlist, 
  onToggleWishlist 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, sevas, timings, community
  const isWishlisted = wishlist.includes(temple.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Sticky Header */}
        <div className="relative h-64 sm:h-80 shrink-0 overflow-hidden">
          <img 
            src={temple.image} 
            alt={temple.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-sanctum-950 via-sanctum-950/40 to-transparent"></div>

          {/* Close & Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={() => onToggleWishlist(temple.id)}
              className="p-2.5 rounded-full bg-sanctum-950/70 backdrop-blur-md border border-white/20 text-white hover:text-terracotta-400 transition-colors shadow-sm"
              title="Add to wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'text-terracotta-500 fill-terracotta-500' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-sanctum-950/70 backdrop-blur-md border border-white/20 text-white hover:bg-sanctum-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Darshan Status Tag */}
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sanctum-950/80 backdrop-blur-md border border-tulsi-500/60 text-white text-xs font-semibold">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tulsi-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tulsi-500"></span>
            </span>
            <span>LIVE DARSHAN ONLINE: {temple.onlineDevotees.toLocaleString()} Devotees</span>
          </div>

          {/* Temple Title & Deity */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <span className="px-2.5 py-0.5 rounded-md bg-gold-500 text-sanctum-950 font-bold text-xs uppercase tracking-wider">
              {temple.deity}
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
              {temple.name}
            </h2>
            <p className="text-xs sm:text-sm text-sandstone-300 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
              <span>{temple.location}</span>
              <span>•</span>
              <span className="text-gold-300">★ {temple.rating} ({temple.reviewCount.toLocaleString()} reviews)</span>
            </p>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="bg-sandstone-100 px-6 border-b border-sandstone-200 flex items-center gap-6 text-sm font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-gold-600 text-sanctum-950'
                : 'border-transparent text-sandstone-500 hover:text-sanctum-900'
            }`}
          >
            Live Radar & Overview
          </button>
          <button
            onClick={() => setActiveTab('sevas')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sevas'
                ? 'border-gold-600 text-sanctum-950'
                : 'border-transparent text-sandstone-500 hover:text-sanctum-900'
            }`}
          >
            <span>Available Sevas</span>
            <span className="px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-800 text-[10px]">
              {temple.availableSevas.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('timings')}
            className={`py-3.5 border-b-2 transition-all ${
              activeTab === 'timings'
                ? 'border-gold-600 text-sanctum-950'
                : 'border-transparent text-sandstone-500 hover:text-sanctum-900'
            }`}
          >
            Daily Aarti Timings
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'community'
                ? 'border-gold-600 text-sanctum-950'
                : 'border-transparent text-sandstone-500 hover:text-sanctum-900'
            }`}
          >
            <span>Community Reviews</span>
            <span className="px-2 py-0.5 rounded-full bg-sandstone-200 text-sandstone-700 text-[10px]">
              {temple.reviews.length}
            </span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW & LIVE QUEUE RADAR */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Live Queue Meter Banner */}
              <div className="bg-gradient-to-r from-sanctum-950 via-sanctum-900 to-sanctum-950 text-white p-5 rounded-3xl border border-gold-500/30 shadow-sanctum">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold tracking-widest text-gold-400 uppercase">
                      TELEMETRY RADAR
                    </span>
                    <h4 className="text-xl font-serif font-bold text-white mt-0.5">
                      Sanctum Live Queue: ~{temple.waitMinutes} Minutes
                    </h4>
                    <p className="text-xs text-sandstone-300 mt-1">
                      Status: <strong className="text-tulsi-400">{temple.waitStatus}</strong> • Next Aarti in 45 mins
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <div className="text-xl font-bold text-gold-300">{temple.onlineDevotees.toLocaleString()}</div>
                      <div className="text-[11px] text-sandstone-400">Devotees in Sanctum</div>
                    </div>
                    <button className="px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-sanctum-950 font-bold text-xs shadow-gold-glow flex items-center gap-2 transition-all">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Watch Live Darshan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tagline & History */}
              <div>
                <h4 className="font-serif font-bold text-base text-sanctum-950 mb-1">About the Sacred Sanctum</h4>
                <p className="text-sm text-sandstone-700 leading-relaxed">
                  {temple.tagline}. Renowned as one of the most revered energy vortices, every ritual performed here carries timeless Vedic resonance. Officiated priests ensure your family Gotra and prayer resolutions are invoked with supreme Vedic precision.
                </p>
              </div>

              {/* Sanctum Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-sandstone-50 rounded-2xl border border-sandstone-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-tulsi-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sanctum-900">Doorstep Consecrated Prasad</div>
                    <div className="text-[11px] text-sandstone-500">Shipped via Sacred Post</div>
                  </div>
                </div>

                <div className="p-3 bg-sandstone-50 rounded-2xl border border-sandstone-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-tulsi-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sanctum-900">Live Video Sankalpa</div>
                    <div className="text-[11px] text-sandstone-500">Private Devotee Link</div>
                  </div>
                </div>

                <div className="p-3 bg-sandstone-50 rounded-2xl border border-sandstone-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-tulsi-600 shrink-0" />
                  <div>
                    <div className="font-bold text-sanctum-900">80G Tax Exemption</div>
                    <div className="text-[11px] text-sandstone-500">Instant Digital Receipt</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AVAILABLE SEVAS */}
          {activeTab === 'sevas' && (
            <div className="space-y-4">
              <p className="text-xs text-sandstone-600">
                Select any seva to perform personal Gotra sankalpa. Includes live video darshan & doorstep prasad.
              </p>
              
              <div className="space-y-3">
                {temple.availableSevas.map((seva) => (
                  <div 
                    key={seva.id}
                    className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200 hover:border-gold-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-base text-sanctum-950">
                        {seva.name}
                      </h4>
                      <p className="text-xs text-sandstone-600 mt-0.5">
                        Duration: <strong>{seva.duration}</strong> • Officiated by <strong>{seva.priest}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-xs text-sandstone-400 block">Dakshina</span>
                        <span className="text-xl font-serif font-bold text-sanctum-950">₹{seva.price.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => {
                          onBookSeva({
                            id: seva.id,
                            title: seva.name,
                            templeName: temple.name,
                            templeId: temple.id,
                            price: seva.price,
                            date: "Auspicious Next Tithi",
                            tithiTag: "Sanctum Special",
                            benefits: [
                              "Direct name & gotra invocation by officiated priests",
                              "Holy prasad box delivered to doorstep with Ganga Jal",
                              "80G Tax donation receipt issued instantly"
                            ],
                            packages: [
                              { id: "pkg-1", name: "Individual Sankalpa", price: seva.price, members: 1 },
                              { id: "pkg-2", name: "Family Sankalpa", price: seva.price + 600, members: 4 }
                            ]
                          });
                        }}
                        className="py-2.5 px-5 rounded-xl bg-gold-500 hover:bg-gold-400 text-sanctum-950 font-bold text-xs shadow-gold-glow flex items-center gap-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Book Seva</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DAILY AARTI TIMINGS */}
          {activeTab === 'timings' && (
            <div className="space-y-4">
              <p className="text-xs text-sandstone-600">
                Official daily ritual timings recorded by temple administration.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {temple.timings.map((timing, i) => (
                  <div key={i} className="p-4 bg-sandstone-50 rounded-2xl border border-sandstone-200">
                    <span className="text-[11px] font-bold text-gold-700 uppercase tracking-wider">
                      {timing.type}
                    </span>
                    <h4 className="font-serif font-bold text-base text-sanctum-950 mt-1">
                      {timing.name}
                    </h4>
                    <p className="text-sm font-semibold text-sandstone-700 flex items-center gap-1.5 mt-2">
                      <Clock className="w-4 h-4 text-gold-600" />
                      <span>{timing.time}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: COMMUNITY REVIEWS & DEVOTEE PHOTOS */}
          {activeTab === 'community' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-sanctum-950">Devotee Reviews & Sanctum Feed</h4>
                  <p className="text-xs text-sandstone-600">Recent reviews submitted by verified devotees post prasad delivery</p>
                </div>
                <span className="text-xs font-bold text-tulsi-700 bg-tulsi-50 px-3 py-1 rounded-full border border-tulsi-200">
                  100% Verified Devotees
                </span>
              </div>

              <div className="space-y-3">
                {temple.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-sandstone-50 rounded-2xl border border-sandstone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-800 flex items-center justify-center text-xs font-bold">
                          {rev.user.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-sanctum-950">{rev.user}</div>
                          <div className="text-[10px] text-sandstone-500">{rev.city} • {rev.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-gold-500">
                        {[...Array(rev.rating)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-gold-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-sandstone-700 italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
