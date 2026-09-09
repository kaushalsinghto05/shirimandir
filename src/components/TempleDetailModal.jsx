import React, { useState } from 'react';
import { X, Heart, Star, MapPin, ShieldCheck } from 'lucide-react';

export default function TempleDetailModal({ temple, onClose, onBookSeva, wishlist, onToggleWishlist }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!temple) return null;

  const isWishlisted = wishlist && wishlist.includes(temple.id);

  return (
    <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-ivory-50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-elevated relative animate-fade-in-up">
        {/* Hero image */}
        <div className="relative h-64 sm:h-72 w-full rounded-t-3xl overflow-hidden">
          <img src={temple.imageUrl || '/images/placeholder.jpg'} alt={temple.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent"></div>
          
          <button onClick={onClose} className="absolute top-4 right-4 bg-charcoal-900/50 hover:bg-charcoal-900 text-ivory-50 p-2 rounded-full transition-all duration-300">
            <X className="w-5 h-5" />
          </button>
          
          <button onClick={() => onToggleWishlist(temple.id)} className="absolute top-4 right-14 bg-charcoal-900/50 hover:bg-charcoal-900 text-ivory-50 p-2 rounded-full transition-all duration-300">
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-vermilion-500 text-vermilion-500' : ''}`} />
          </button>

          <div className="absolute bottom-6 left-6 text-ivory-50">
            <h2 className="font-display text-3xl font-bold mb-1">{temple.name}</h2>
            <p className="font-sans text-ivory-200">{temple.tagline}</p>
          </div>
        </div>

        <div className="p-6">
          {temple.trustBadge && (
            <div className="bg-sage-400/10 border border-sage-400/30 rounded-2xl p-4 flex items-center space-x-3 mb-6">
              <ShieldCheck className="w-6 h-6 text-sage-600" />
              <div>
                <p className="font-sans text-sage-600 font-semibold">{temple.trustBadge.trustName}</p>
                <div className="flex items-center space-x-2">
                  <span className="font-sans text-sm text-charcoal-700">Verified {temple.trustBadge.type}</span>
                  {temple.trustBadge.link && (
                    <a href={temple.trustBadge.link} className="text-sm text-copper-500 hover:text-copper-600 underline">View Certificate</a>
                  )}
                </div>
              </div>
            </div>
          )}

          {temple.guidedDarshanAvailable && (
            <div className="inline-block bg-copper-400/10 text-copper-600 font-semibold px-4 py-1.5 rounded-full mb-6">
              Guided Darshan Available
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-6 border-b border-ivory-200 mb-6 overflow-x-auto scrollbar-hide">
            {['Overview', 'Timings', 'Sevas', 'Reviews'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-2 text-lg font-sans transition-colors whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'text-copper-600 border-b-2 border-copper-600 font-semibold' : 'text-charcoal-500 hover:text-charcoal-900'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[250px]">
            {activeTab === 'overview' && (
              <div className="space-y-4 font-sans text-charcoal-700">
                <div className="grid grid-cols-2 gap-4 bg-ivory-100 p-4 rounded-2xl shadow-warm">
                  <div>
                    <p className="text-sm text-charcoal-500">Deity</p>
                    <p className="font-semibold text-charcoal-900">{temple.deity || 'Multiple'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-copper-500" />
                    <span>{temple.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-temple-gold-500 fill-temple-gold-500" />
                    <span>{temple.rating} ({temple.reviews} reviews)</span>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Followers</p>
                    <p className="font-semibold text-charcoal-900">{temple.followers || '10K+'}</p>
                  </div>
                </div>
                <p>{temple.description || 'A sacred place of worship and devotion.'}</p>
              </div>
            )}
            
            {activeTab === 'timings' && (
              <div className="bg-ivory-100 rounded-2xl p-4 shadow-warm">
                 <table className="w-full text-left font-sans text-charcoal-700">
                   <thead>
                     <tr className="border-b border-ivory-200">
                       <th className="py-3 font-semibold">Event</th>
                       <th className="py-3 font-semibold">Time</th>
                     </tr>
                   </thead>
                   <tbody>
                     {temple.timings ? temple.timings.map((t, idx) => (
                       <tr key={idx} className="border-b border-ivory-200/50 last:border-0">
                         <td className="py-3">{t.event}</td>
                         <td className="py-3">{t.time}</td>
                       </tr>
                     )) : <tr><td colSpan="2" className="py-3 text-center">Timings unavailable</td></tr>}
                   </tbody>
                 </table>
              </div>
            )}
            
            {activeTab === 'sevas' && (
              <div className="space-y-4">
                {temple.sevas ? temple.sevas.map((seva, idx) => (
                  <div key={idx} className="bg-ivory-100 rounded-2xl p-4 sm:p-5 shadow-warm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:-translate-y-0.5 transition-all duration-300">
                    <div>
                      <h4 className="font-sans font-semibold text-charcoal-900 text-lg">{seva.name}</h4>
                      <p className="text-sm text-charcoal-500 mt-1">{seva.duration} • Priest: {seva.priest}</p>
                      <p className="font-mono text-copper-600 font-bold mt-2">₹{seva.price}</p>
                    </div>
                    <button onClick={() => onBookSeva(seva)} className="w-full sm:w-auto bg-copper-400 hover:bg-copper-500 text-ivory-50 px-6 py-2.5 rounded-xl transition-all duration-300 shadow-copper-glow font-medium focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2">
                      Book Seva
                    </button>
                  </div>
                )) : <p className="text-center text-charcoal-500">No sevas available at the moment.</p>}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {temple.reviewList ? temple.reviewList.map((rev, idx) => (
                  <div key={idx} className="bg-ivory-100 rounded-2xl p-5 shadow-warm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-copper-400 text-ivory-50 flex items-center justify-center font-bold text-lg">
                          {rev.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal-900 flex items-center gap-2">
                            {rev.name}
                            {rev.verified && <ShieldCheck className="w-4 h-4 text-sage-500" />}
                          </p>
                          <p className="text-xs text-charcoal-500">{rev.city}</p>
                        </div>
                      </div>
                      <div className="flex text-temple-gold-500">
                         {[...Array(5)].map((_, i) => (
                           <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-ivory-200'}`} />
                         ))}
                      </div>
                    </div>
                    <p className="text-charcoal-700 text-sm mt-2">{rev.comment}</p>
                  </div>
                )) : <p className="text-center text-charcoal-500">No reviews yet.</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
