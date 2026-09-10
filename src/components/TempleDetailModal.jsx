import React, { useState } from 'react';
import { X, Heart, Star, MapPin, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

export default function TempleDetailModal({ temple, onClose, onBookSeva, wishlist = [], onToggleWishlist }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!temple) return null;

  const isWishlisted = wishlist && wishlist.includes(temple.id);
  const sevasList = temple.availableSevas || temple.sevas || [];
  const reviewsList = temple.reviews || temple.reviewList || [];
  const timingsList = temple.timings || [];

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-ivory-50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-elevated relative animate-scale-in my-auto border border-ivory-200">
        
        {/* Hero image */}
        <div className="relative h-64 sm:h-72 w-full rounded-t-3xl overflow-hidden">
          <img 
            src={temple.image || temple.imageUrl || '/images/kashi_vishwanath.jpg'} 
            alt={temple.name} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.src = '/images/kashi_vishwanath.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent"></div>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-charcoal-900/60 hover:bg-charcoal-900 text-ivory-50 p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <button 
            onClick={() => onToggleWishlist && onToggleWishlist(temple.id)} 
            className="absolute top-4 right-16 bg-charcoal-900/60 hover:bg-charcoal-900 text-ivory-50 p-2.5 rounded-full transition-all duration-300 backdrop-blur-sm"
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-vermilion-500 text-vermilion-500' : 'text-ivory-50'}`} />
          </button>

          <div className="absolute bottom-6 left-6 right-6 text-ivory-50">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1 drop-shadow-md">{temple.name}</h2>
            <p className="font-sans text-ivory-200 text-sm sm:text-base drop-shadow">{temple.tagline || temple.location}</p>
          </div>
        </div>

        <div className="p-6">
          {temple.trustBadge && (
            <div className="bg-sage-50 border border-sage-200 rounded-2xl p-4 flex items-center justify-between space-x-3 mb-6">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-6 h-6 text-sage-600 flex-shrink-0" />
                <div>
                  <p className="font-sans text-sage-700 font-semibold">{temple.trustBadge.trustName}</p>
                  <span className="font-sans text-xs text-charcoal-600">
                    Verified {temple.trustBadge.trustType || temple.trustBadge.type || 'Government Trust'}
                  </span>
                </div>
              </div>
              {(temple.trustBadge.verificationUrl || temple.trustBadge.link) && (
                <a 
                  href={temple.trustBadge.verificationUrl || temple.trustBadge.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-copper-600 hover:text-copper-700 font-semibold px-3 py-1.5 rounded-lg bg-copper-50 hover:bg-copper-100 transition-colors"
                >
                  Visit Official Trust <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {temple.guidedDarshanAvailable && (
            <div className="inline-block bg-copper-50 border border-copper-200 text-copper-600 font-semibold px-4 py-1.5 rounded-full text-xs mb-6">
              ✦ Guided In-Person Darshan Available
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-6 border-b border-ivory-200 mb-6 overflow-x-auto scrollbar-hide">
            {['Overview', 'Timings', 'Sevas', 'Reviews'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-2 text-base sm:text-lg font-sans transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'text-copper-600 border-b-2 border-copper-600 font-semibold' : 'text-charcoal-500 hover:text-charcoal-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[220px]">
            {activeTab === 'overview' && (
              <div className="space-y-4 font-sans text-charcoal-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-ivory-100 p-4 rounded-2xl shadow-warm">
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Deity</p>
                    <p className="font-semibold text-charcoal-900 text-sm mt-0.5">{temple.deity || 'Multiple'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Location</p>
                    <p className="font-semibold text-charcoal-900 text-sm mt-0.5 flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-copper-500 mr-1 shrink-0" />
                      {temple.location}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Rating</p>
                    <p className="font-semibold text-charcoal-900 text-sm mt-0.5 flex items-center">
                      <Star className="w-3.5 h-3.5 text-temple-gold-500 fill-temple-gold-500 mr-1 shrink-0" />
                      {temple.rating} ({typeof temple.reviewCount === 'number' ? temple.reviewCount.toLocaleString('en-IN') : (reviewsList.length || '24K')})
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider">Devotees</p>
                    <p className="font-semibold text-charcoal-900 text-sm mt-0.5">
                      {typeof temple.followersCount === 'number' ? temple.followersCount.toLocaleString('en-IN') : (temple.followers || '180K+')}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-charcoal-700">
                  {temple.tagline ? `${temple.tagline}. Dedicated worship, daily aartis, and live gotra-personalized pujas organized in coordination with the official sanctum trust.` : 'A sacred pilgrimage center of deep Vedic significance.'}
                </p>
              </div>
            )}
            
            {activeTab === 'timings' && (
              <div className="bg-ivory-100 rounded-2xl p-4 shadow-warm">
                 <table className="w-full text-left font-sans text-charcoal-700 text-sm">
                   <thead>
                     <tr className="border-b border-ivory-200 text-charcoal-500">
                       <th className="py-2.5 font-semibold">Ritual / Aarti</th>
                       <th className="py-2.5 font-semibold">Timings</th>
                     </tr>
                   </thead>
                   <tbody>
                     {timingsList.length > 0 ? timingsList.map((t, idx) => (
                       <tr key={idx} className="border-b border-ivory-200/50 last:border-0">
                         <td className="py-3 font-medium text-charcoal-900">
                           {t.name || t.event}
                           {t.type && <span className="text-xs text-charcoal-500 block font-normal">{t.type}</span>}
                         </td>
                         <td className="py-3 font-mono text-copper-600 font-semibold">{t.time}</td>
                       </tr>
                     )) : <tr><td colSpan="2" className="py-3 text-center text-charcoal-500">Daily Darshan: 04:00 AM - 11:00 PM</td></tr>}
                   </tbody>
                 </table>
              </div>
            )}
            
            {activeTab === 'sevas' && (
              <div className="space-y-4">
                {sevasList.length > 0 ? sevasList.map((seva, idx) => (
                  <div key={idx} className="bg-ivory-100 rounded-2xl p-4 sm:p-5 shadow-warm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:-translate-y-0.5 transition-all duration-300 border border-ivory-200">
                    <div>
                      <h4 className="font-sans font-semibold text-charcoal-900 text-base sm:text-lg">{seva.name}</h4>
                      <p className="text-xs text-charcoal-500 mt-1">
                        {seva.duration} {seva.priest && `• Priest: ${seva.priest}`}
                      </p>
                      <p className="font-mono text-copper-600 font-bold mt-2 text-lg">₹{seva.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <button 
                      onClick={() => onBookSeva && onBookSeva(seva)} 
                      className="w-full sm:w-auto bg-copper-400 hover:bg-copper-500 text-ivory-50 px-6 py-2.5 rounded-xl transition-all duration-300 shadow-copper-glow font-medium text-sm focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2 shrink-0"
                    >
                      Book Seva
                    </button>
                  </div>
                )) : <p className="text-center text-charcoal-500 py-6">No sevas available at the moment.</p>}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {reviewsList.length > 0 ? reviewsList.map((rev, idx) => (
                  <div key={idx} className="bg-ivory-100 rounded-2xl p-4 sm:p-5 shadow-warm border border-ivory-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-copper-400 text-ivory-50 flex items-center justify-center font-bold text-sm">
                          {(rev.user || rev.name || 'D').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal-900 text-sm flex items-center gap-1.5">
                            {rev.user || rev.name}
                            {rev.verified && <ShieldCheck className="w-3.5 h-3.5 text-sage-500" />}
                          </p>
                          <p className="text-xs text-charcoal-500">{rev.city} {rev.date && `• ${rev.date}`}</p>
                        </div>
                      </div>
                      <div className="flex text-temple-gold-500">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} className={`w-3.5 h-3.5 ${i < (rev.rating || 5) ? 'fill-current' : 'text-ivory-200'}`} />
                         ))}
                      </div>
                    </div>
                    <p className="text-charcoal-700 text-xs sm:text-sm mt-2 leading-relaxed font-sans">{rev.comment}</p>
                  </div>
                )) : <p className="text-center text-charcoal-500 py-6">No reviews yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
