import React from 'react';
import { 
  Radio, 
  Clock, 
  Users, 
  Eye, 
  ArrowUpRight, 
  Bell, 
  Heart,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TEMPLES } from '../data/mockData';

export default function LiveDarshanQueueSection({ 
  temples = TEMPLES,
  onSelectTemple, 
  wishlist, 
  onToggleWishlist 
}) {
  return (
    <section className="py-14 bg-[#FAF7F2] border-b border-sandstone-300/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tulsi-50 border border-tulsi-500/30 text-tulsi-700 text-xs font-semibold mb-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tulsi-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tulsi-500"></span>
              </span>
              <span>EXCLUSIVE FEATURE • LIVE SANCTUM RADAR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-sanctum-950">
              Live Darshan Queue & Sanctum Wait-Time Gauge
            </h2>
            <p className="text-sm text-sandstone-700 mt-1 max-w-2xl">
              Real-time sanctum crowd density, waiting minutes, and active virtual streams directly monitored by Temple Devasthanams.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-sandstone-600 bg-white px-3.5 py-2 rounded-xl border border-sandstone-200 shadow-sm">
            <Radio className="w-4 h-4 text-tulsi-600 animate-pulse" />
            <span>Telemetry updated 1 min ago</span>
          </div>
        </div>

        {/* Temple Queue Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {temples.slice(0, 3).map((temple) => {
            const isWishlisted = wishlist.includes(temple.id);
            const isPeak = temple.waitMinutes > 30;
            const isModerate = temple.waitMinutes > 20 && temple.waitMinutes <= 30;

            return (
              <div 
                key={temple.id}
                className="bg-white rounded-3xl border border-sandstone-200 overflow-hidden shadow-sanctum hover:shadow-sanctum-lg transition-all duration-300 flex flex-col group"
              >
                {/* Image Header with Live Badge */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={temple.image} 
                    alt={temple.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sanctum-950/90 via-sanctum-950/30 to-transparent"></div>

                  {/* Live Status Pill */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-sanctum-950/80 backdrop-blur-md border border-tulsi-500/50 text-white text-[11px] font-semibold">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tulsi-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-tulsi-500"></span>
                    </span>
                    <span>LIVE DARSHAN ACTIVE</span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(temple.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-sanctum-950/70 backdrop-blur-md border border-white/20 text-white hover:text-terracotta-400 transition-colors"
                    title={isWishlisted ? "Remove from wishlist" : "Add to multi-temple wishlist"}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'text-terracotta-500 fill-terracotta-500' : ''}`} />
                  </button>

                  {/* Temple Name over Gradient */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <p className="text-[11px] font-medium text-gold-300 tracking-wide">{temple.deity}</p>
                    <h3 className="text-base font-serif font-bold text-white truncate">{temple.name}</h3>
                    <p className="text-xs text-sandstone-300">{temple.location}</p>
                  </div>
                </div>

                {/* Queue & Wait Time Indicator Bar */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    
                    {/* Visual Wait-Time Gauge */}
                    <div className="bg-sandstone-50 p-3.5 rounded-2xl border border-sandstone-200/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-sandstone-600 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gold-600" />
                          <span>Sanctum Queue Wait Time:</span>
                        </span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                          isPeak 
                            ? 'bg-red-100 text-red-700' 
                            : isModerate 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-tulsi-100 text-tulsi-700'
                        }`}>
                          {temple.waitStatus}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-serif font-bold text-sanctum-950">
                          ~{temple.waitMinutes} mins
                        </span>
                        <span className="text-xs text-sandstone-500">estimated physical darshan wait</span>
                      </div>

                      {/* Progress bar visual */}
                      <div className="w-full h-2 bg-sandstone-200 rounded-full mt-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isPeak 
                              ? 'bg-red-500 w-3/4' 
                              : isModerate 
                                ? 'bg-amber-500 w-1/2' 
                                : 'bg-tulsi-500 w-1/4'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Online Devotees & Upcoming Aarti */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-sandstone-200">
                        <span className="text-sandstone-500 text-[10px] block">Devotees Online</span>
                        <span className="font-bold text-sanctum-900 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3 text-gold-600" />
                          <span>{temple.onlineDevotees.toLocaleString()} Devotees</span>
                        </span>
                      </div>

                      <div className="p-2.5 bg-white rounded-xl border border-sandstone-200">
                        <span className="text-sandstone-500 text-[10px] block">Next Daily Aarti</span>
                        <span className="font-bold text-sanctum-900 truncate block mt-0.5" title={temple.timings[1]?.name}>
                          {temple.timings[1]?.name || 'Sandhya Aarti'}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Action CTA */}
                  <div className="mt-5 pt-4 border-t border-sandstone-100 flex items-center gap-2">
                    <button
                      onClick={() => onSelectTemple(temple)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-sanctum-950 hover:bg-sanctum-900 text-gold-300 hover:text-gold-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Sanctum & Sevas</span>
                    </button>

                    <button
                      onClick={() => onSelectTemple(temple)}
                      className="p-2.5 rounded-xl bg-sandstone-100 hover:bg-sandstone-200 text-sanctum-800 transition-colors"
                      title="Open Temple Page"
                    >
                      <ArrowUpRight className="w-4 h-4" />
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
