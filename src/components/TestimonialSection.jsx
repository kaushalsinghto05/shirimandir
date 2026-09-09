import React, { useRef } from 'react';
import { Star, Play, ChevronLeft, ChevronRight, BadgeCheck } from 'lucide-react';
import { TESTIMONIALS } from '../data/mockData';

export default function TestimonialSection() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -400 : 400;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-charcoal-900 overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/black-linen-2.png')] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-temple-gold-400 mb-4">
              What Devotees Say
            </h2>
            <p className="text-lg text-charcoal-300 font-sans">
              Join thousands of families experiencing divine blessings through authentic spiritual services.
            </p>
          </div>
          
          <div className="hidden md:flex items-center gap-3 mt-6 md:mt-0">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-charcoal-700 text-ivory-200 hover:bg-charcoal-800 hover:text-temple-gold-400 transition-colors focus:ring-2 focus:ring-temple-gold-400/50"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-charcoal-700 text-ivory-200 hover:bg-charcoal-800 hover:text-temple-gold-400 transition-colors focus:ring-2 focus:ring-temple-gold-400/50"
              aria-label="Next Testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 scrollbar-hide snap-x-mandatory"
        >
          {TESTIMONIALS.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="min-w-[320px] sm:min-w-[400px] w-[320px] sm:w-[400px] bg-ivory-100 rounded-2xl p-6 sm:p-8 shadow-warm snap-start flex flex-col hover:-translate-y-0.5 transition-transform duration-300"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-temple-gold-400 text-temple-gold-400" />
                ))}
              </div>
              
              <blockquote className="text-charcoal-800 font-sans italic text-lg leading-relaxed flex-1 mb-6">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center justify-between mt-auto pt-6 border-t border-ivory-200">
                <div className="flex items-center gap-3">
                  <img 
                    src={testimonial.avatar || `https://i.pravatar.cc/150?u=${testimonial.id}`} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-ivory-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-bold text-charcoal-900">{testimonial.name}</span>
                      {(testimonial.verified || testimonial.verifiedDevotee) && (
                        <BadgeCheck className="w-4 h-4 text-sage-500" title="Verified Devotee" />
                      )}
                    </div>
                    <span className="text-xs text-charcoal-500 font-sans block">{testimonial.city}</span>
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-400 font-semibold block mt-0.5">
                      {testimonial.pujaName} • {testimonial.date}
                    </span>
                  </div>
                </div>
                
                {testimonial.hasVideo && (
                  <button className="flex flex-col items-center gap-1 text-copper-600 hover:text-copper-700 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-copper-100 flex items-center justify-center group-hover:bg-copper-200 transition-colors">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                    <span className="text-[10px] font-semibold tracking-wide uppercase">Watch</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Press/News Strip */}
        <div className="mt-16 pt-12 border-t border-charcoal-800 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-charcoal-500 mb-6 font-semibold">Featured In</span>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Placeholder logos for press */}
            <div className="text-xl font-display font-bold text-ivory-200">The Times of India</div>
            <div className="text-xl font-display font-bold text-ivory-200">Hindustan Times</div>
            <div className="text-xl font-display font-bold text-ivory-200">NDTV</div>
            <div className="text-xl font-display font-bold text-ivory-200">Dainik Bhaskar</div>
          </div>
        </div>
      </div>
    </section>
  );
}
