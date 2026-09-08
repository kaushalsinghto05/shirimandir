import React, { useState } from 'react';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  Video, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export default function TestimonialSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const next = () => {
    setCurrentIndex((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const item = TESTIMONIALS[currentIndex];

  return (
    <section className="py-16 bg-sanctum-900 text-sandstone-50 border-b border-gold-500/20 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Devotee Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-sandstone-50">
            Blessed Stories from 42+ Countries
          </h2>
          <p className="text-sandstone-300 text-sm mt-1">
            Read firsthand accounts of divine connectivity, live sankalpa recordings, and sacred prasad unboxing.
          </p>
        </div>

        {/* Carousel Card */}
        <div className="bg-sanctum-950/80 border border-gold-500/30 rounded-3xl p-6 sm:p-10 shadow-sanctum-lg backdrop-blur-md relative">
          
          <Quote className="absolute top-6 right-6 w-14 h-14 text-gold-500/15" />

          <div className="flex flex-col md:flex-row items-center gap-8">
            
            {/* Avatar & Badges */}
            <div className="flex flex-col items-center text-center shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden p-1 bg-gradient-to-tr from-gold-500 to-terracotta-500 shadow-gold-glow">
                <img 
                  src={item.avatar} 
                  alt={item.name}
                  className="w-full h-full object-cover rounded-[14px]"
                />
              </div>

              <div className="mt-3 flex items-center gap-1 text-gold-400">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold-400" />
                ))}
              </div>

              {item.hasVideo && (
                <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sanctum-900 border border-gold-500/40 text-[10px] text-gold-300 font-semibold cursor-pointer hover:bg-sanctum-850">
                  <Video className="w-3 h-3 text-tulsi-400" />
                  <span>Watch Video Sankalpa</span>
                </div>
              )}
            </div>

            {/* Testimonial Quote & Devotee details */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 text-gold-300 text-xs font-medium mb-3 border border-gold-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-tulsi-400" />
                <span>Verified Booking: {item.pujaName}</span>
              </div>

              <p className="text-base sm:text-lg text-sandstone-100 font-serif italic leading-relaxed">
                "{item.quote}"
              </p>

              <div className="mt-4 pt-4 border-t border-sanctum-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-serif font-bold text-base text-gold-300">
                    {item.name}
                  </h4>
                  <p className="text-xs text-sandstone-400">
                    {item.city} • Blessed on {item.date}
                  </p>
                </div>

                {/* Navigation Arrows */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={prev}
                    className="p-2 rounded-xl bg-sanctum-900 border border-gold-500/30 hover:border-gold-400 text-sandstone-200 hover:text-gold-300 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-sandstone-400 px-2 font-mono">
                    {currentIndex + 1} / {TESTIMONIALS.length}
                  </span>
                  <button
                    onClick={next}
                    className="p-2 rounded-xl bg-sanctum-900 border border-gold-500/30 hover:border-gold-400 text-sandstone-200 hover:text-gold-300 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
