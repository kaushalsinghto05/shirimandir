import React from 'react';
import { Heart, Clock, Users, PlayCircle, Eye, Info } from 'lucide-react';

const WaitGauge = ({ waitMinutes }) => {
  const isGood = waitMinutes < 20;
  const isMedium = waitMinutes >= 20 && waitMinutes <= 30;
  const isHigh = waitMinutes > 30;

  const color = isGood ? 'text-sage-400' : isMedium ? 'text-temple-gold-400' : 'text-vermilion-500';
  const radius = 50;
  const circumference = Math.PI * radius; // half circle
  // max wait time mapped to 60 for the gauge, clamped to 1
  const fraction = Math.min(waitMinutes / 60, 1);
  const strokeDashoffset = circumference * (1 - fraction);

  return (
    <div className="relative w-32 h-20 mx-auto flex items-end justify-center overflow-hidden">
      <svg className="absolute top-0 left-0 w-32 h-32" viewBox="0 0 120 120">
        <path
          d="M 10,60 A 50,50 0 0,1 110,60"
          fill="none"
          stroke="#E5E7EB" // ivory-200 / gray-200
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 10,60 A 50,50 0 0,1 110,60"
          fill="none"
          className={color}
          stroke="currentColor"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="flex flex-col items-center pb-2 z-10">
        <span className="font-mono text-2xl font-bold text-charcoal-900">{waitMinutes}</span>
        <span className="text-xs text-charcoal-500 font-sans uppercase tracking-wider">Mins</span>
      </div>
    </div>
  );
};

export default function LiveDarshanQueueSection({ temples, onSelectTemple, wishlist = [], onToggleWishlist }) {
  return (
    <section className="py-16 lg:py-24 bg-ivory-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-900 mb-4">
            Live Darshan Queue & Wait Times
          </h2>
          <p className="text-lg text-charcoal-700 font-sans max-w-2xl mx-auto">
            Real-time queue monitoring for top temples. Plan your visit or book online services avoiding the wait.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {temples.map((temple) => {
            const isWishlisted = wishlist.includes(temple.id);
            return (
              <div
                key={temple.id}
                className="bg-ivory-100 rounded-2xl shadow-warm hover:-translate-y-0.5 hover:shadow-warm-lg transition-all duration-300 overflow-hidden flex flex-col group relative"
              >
                <div className="relative h-48 w-full">
                  <img
                    src={temple.image || `/images/temple-${temple.id}.jpg`}
                    alt={temple.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1600100397608-f010f419cb96?auto=format&fit=crop&w=800&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent"></div>
                  
                  <button
                    onClick={() => onToggleWishlist && onToggleWishlist(temple.id)}
                    className="absolute top-4 right-4 p-2 bg-ivory-50/80 backdrop-blur rounded-full text-charcoal-900 hover:text-vermilion-500 transition-all duration-300 z-10"
                    aria-label="Toggle Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-vermilion-500 text-vermilion-500' : ''}`} />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <h3 className="text-xl font-display font-bold text-ivory-50 mb-1">{temple.name}</h3>
                    <p className="text-sm text-ivory-200 font-sans flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {temple.location}
                    </p>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col items-center border-t border-ivory-200/50">
                  <WaitGauge waitMinutes={temple.waitMinutes || 15} />
                  
                  <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-ivory-200/50 text-xs font-semibold text-charcoal-700">
                    <span className="w-2 h-2 rounded-full mr-2 bg-current" style={{ backgroundColor: temple.waitMinutes < 20 ? '#7FA67A' : temple.waitMinutes <= 30 ? '#C17F59' : '#D94F30'}}></span>
                    {temple.waitStatus || 'Moderate Queue'}
                  </div>

                  <div className="mt-6 flex items-center justify-between w-full">
                    <div className="flex items-center text-sm text-charcoal-700 font-sans">
                      <div className="relative flex items-center justify-center w-6 h-6 mr-2">
                        <span className="absolute inline-flex w-full h-full rounded-full bg-sage-400 opacity-20 animate-ping"></span>
                        <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-sage-500"></span>
                      </div>
                      <span>{temple.onlineCount || 102} devotees online</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTemple && onSelectTemple(temple)}
                    className="mt-6 w-full py-3 px-4 border-2 border-copper-400 text-copper-600 hover:bg-copper-400 hover:text-ivory-50 font-sans font-medium rounded-xl transition-all duration-300 flex items-center justify-center focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2 active:translate-y-0"
                  >
                    View Timings & Book
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
