import React from 'react';
import { ShieldCheck, ExternalLink, MapPin } from 'lucide-react';

const VerifiedTrustBadges = ({ temples = [] }) => {
  const verifiedTemples = temples.filter(t => t.trustBadge);

  return (
    <section className="py-16 lg:py-24 bg-ivory-50 relative">
      {/* Section divider at top */}
      <div className="absolute top-0 left-0 right-0 section-divider" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-charcoal-900 mb-4 animate-fade-in-up">
            Every Temple Verified at Source
          </h2>
          <p className="text-lg text-charcoal-700 max-w-2xl mx-auto font-sans animate-fade-in-up">
            We partner directly with official temple trusts to ensure your offerings and services are 100% authentic and transparent.
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x-mandatory scrollbar-hide pb-8 sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:overflow-visible">
          {verifiedTemples.map((temple, index) => (
            <div 
              key={temple.id || index}
              className="min-w-[85vw] sm:min-w-0 snap-start bg-ivory-100 rounded-2xl shadow-warm hover:-translate-y-0.5 hover:shadow-warm-lg hover:border-copper-400 border border-transparent transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Temple Image */}
              <div className="relative h-44 w-full flex-shrink-0 overflow-hidden">
                <img 
                  src={temple.image || temple.imageUrl || `/images/temple-${temple.id}.jpg`}
                  alt={temple.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => { e.target.src = '/images/kashi_vishwanath.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/20 to-transparent" />
                
                {/* Verified badge on image */}
                <div className="absolute top-3 left-3 bg-sage-500/90 backdrop-blur-sm text-ivory-50 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </div>

                {/* Temple name + location on image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-display font-bold text-ivory-50 leading-snug line-clamp-2">{temple.name}</h3>
                  <p className="text-xs text-ivory-200/90 font-sans flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    {temple.location}
                  </p>
                </div>
              </div>
              
              {/* Trust Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* Deity */}
                  <p className="text-sm text-charcoal-500 font-sans">{temple.deity}</p>

                  {/* Trust Name Card */}
                  <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                    <p className="text-sm font-semibold text-charcoal-900 font-sans">
                      {temple.trustBadge.trustName}
                    </p>
                    <span className="inline-block mt-1.5 text-xs font-medium px-2.5 py-1 bg-copper-50 text-copper-600 rounded-full font-sans border border-copper-100">
                      {temple.trustBadge.trustType || temple.trustBadge.type}
                    </span>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center gap-2 text-sage-600 bg-sage-50/60 p-2.5 rounded-xl border border-sage-100/50">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium font-sans">✓ Verified Official Source</span>
                  </div>
                </div>

                {/* Visit Official Site Link */}
                {temple.trustBadge.verificationUrl && (
                  <a 
                    href={temple.trustBadge.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-copper-600 hover:text-copper-500 transition-colors group font-sans mt-4"
                  >
                    Visit Official Site
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VerifiedTrustBadges;
