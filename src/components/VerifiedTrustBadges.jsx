import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

const VerifiedTrustBadges = ({ temples = [] }) => {
  return (
    <section className="py-16 lg:py-24 bg-ivory-50 relative border-t border-ivory-200 section-divider">
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
          {temples.map((temple, index) => {
            if (!temple.trustBadge) return null;
            return (
              <div 
                key={temple.id || index}
                className="min-w-[85vw] sm:min-w-0 snap-start bg-ivory-100 rounded-2xl p-6 shadow-warm hover:-translate-y-0.5 hover:shadow-warm-lg hover:border-copper-400 border border-transparent transition-all duration-300"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-display font-bold text-charcoal-900">{temple.name}</h3>
                  <p className="text-sm text-charcoal-500 font-sans">{temple.deity}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-ivory-50 rounded-xl border border-ivory-200">
                    <p className="text-sm font-semibold text-charcoal-900 font-sans">
                      {temple.trustBadge.trustName}
                    </p>
                    <span className="inline-block mt-1 text-xs font-medium px-2 py-1 bg-charcoal-100 text-charcoal-700 rounded-full font-sans">
                      {temple.trustBadge.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sage-600 bg-sage-50/50 p-2 rounded-lg">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium font-sans">✓ Verified Official Source</span>
                  </div>

                  {temple.trustBadge.verificationUrl && (
                    <a 
                      href={temple.trustBadge.verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-copper-600 hover:text-copper-500 transition-colors group font-sans"
                    >
                      Visit Official Site
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default VerifiedTrustBadges;
