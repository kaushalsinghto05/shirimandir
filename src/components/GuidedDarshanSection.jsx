import React from 'react';
import { UserPlus, Sparkles, MapPin } from 'lucide-react';

const GuidedDarshanSection = ({ onBookGuidedDarshan }) => {
  return (
    <section className="py-16 lg:py-24 bg-ivory-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="order-2 lg:order-1 space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-900 mb-4">
                Guided In-Person Darshan Assistance
              </h2>
              <p className="text-lg text-charcoal-700 font-sans">
                Experience a hassle-free spiritual journey. Our local Pandit Ji will physically accompany you, manage queues, and guide you through the authentic temple rituals.
              </p>
            </div>

            <div className="space-y-4">
              {/* Tier 1 */}
              <div className="bg-sage-50 rounded-2xl p-6 border border-sage-200 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold font-sans text-charcoal-900">Self-Guided</h3>
                  <span className="font-mono font-bold text-sage-600 text-lg">Free</span>
                </div>
                <p className="text-sm text-charcoal-700 font-sans mb-4">
                  Digital info pack with map, timings, and rules. Navigate on your own.
                </p>
                <button 
                  onClick={() => onBookGuidedDarshan('self-guided')}
                  className="w-full py-2.5 rounded-xl border-2 border-sage-400 text-sage-600 font-semibold font-sans hover:bg-sage-100 transition-all duration-300 focus:ring-2 focus:ring-sage-400/50 focus:ring-offset-2"
                >
                  Download Info Pack
                </button>
              </div>

              {/* Tier 2 */}
              <div className="bg-ivory-100 rounded-2xl p-6 border-2 border-copper-200 shadow-warm transition-all duration-300 hover:-translate-y-0.5 hover:border-copper-400 hover:shadow-warm-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-copper-500" />
                    <h3 className="text-lg font-bold font-sans text-charcoal-900">Accompanied</h3>
                  </div>
                  <span className="font-mono font-bold text-charcoal-900 text-lg">₹1,501+</span>
                </div>
                <p className="text-sm text-charcoal-700 font-sans mb-4">
                  A local Pandit walks with you, manages offerings, and explains significance.
                </p>
                <button 
                  onClick={() => onBookGuidedDarshan('accompanied')}
                  className="w-full py-2.5 rounded-xl bg-copper-400 text-white font-semibold font-sans shadow-copper-glow hover:bg-copper-500 transition-all duration-300 focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2"
                >
                  Book Accompanied Darshan
                </button>
              </div>

              {/* Tier 3 */}
              <div className="bg-charcoal-900 rounded-2xl p-6 border-2 border-temple-gold-400 shadow-dark transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-temple-gold-400" />
                    <h3 className="text-lg font-bold font-sans text-temple-gold-400">VIP Priority</h3>
                  </div>
                  <span className="font-mono font-bold text-ivory-50 text-lg">₹3,501+</span>
                </div>
                <p className="text-sm text-ivory-200 font-sans mb-4">
                  Skip the main queue. Personal Pandit, special darshan access, and premium prasad.
                </p>
                <button 
                  onClick={() => onBookGuidedDarshan('vip-priority')}
                  className="w-full py-2.5 rounded-xl bg-temple-gold-400 text-charcoal-900 font-semibold font-sans hover:bg-temple-gold-300 transition-all duration-300 focus:ring-2 focus:ring-temple-gold-400/50 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                >
                  Book VIP Experience
                </button>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 h-64 sm:h-96 lg:h-full min-h-[400px] relative rounded-2xl overflow-hidden shadow-elevated">
            <img 
              src="/images/kashi_vishwanath.jpg" 
              alt="Guided Darshan Experience" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2 text-ivory-50 mb-2">
                <MapPin className="w-5 h-5 text-copper-400" />
                <span className="font-medium font-sans">Available in Varanasi, Ayodhya & more</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GuidedDarshanSection;
