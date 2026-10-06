import React, { useState } from 'react';
import { X, Heart, Bell, Trash2 } from 'lucide-react';

export default function WishlistDrawer({ isOpen, onClose, wishlist, temples, onRemoveFromWishlist, onSelectTemple }) {
  const [alerts, setAlerts] = useState({});

  if (!isOpen) return null;

  const toggleAlert = (e, id) => {
    e.stopPropagation();
    setAlerts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const wishlistedTemples = temples?.filter(t => wishlist.includes(t.id)) || [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-full sm:w-96 bg-ivory-50 shadow-elevated h-full flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="px-6 py-5 border-b border-ivory-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-vermilion-500 fill-vermilion-500" />
              <h2 className="text-xl font-display font-bold text-charcoal-900">My Temple Wishlist</h2>
            </div>
            <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-900 p-2 bg-ivory-100 hover:bg-ivory-200 rounded-full transition-all duration-300">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistedTemples.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <Heart className="w-16 h-16 text-ivory-200" />
                <div>
                  <p className="text-lg font-semibold text-charcoal-900">No temples in wishlist</p>
                  <p className="text-charcoal-500 text-sm mt-1">Save your favorite temples to access them quickly.</p>
                </div>
              </div>
            ) : (
              wishlistedTemples.map(temple => (
                <div key={temple.id} className="bg-ivory-100 rounded-2xl p-4 shadow-sm border border-ivory-200 hover:shadow-warm transition-all duration-300 cursor-pointer" onClick={() => { onSelectTemple(temple); onClose(); }}>
                  <div className="flex items-start space-x-4">
                    <img 
                      src={temple.image || temple.imageUrl || '/images/kashi_vishwanath.jpg'} 
                      alt={temple.name} 
                      className="w-12 h-12 rounded-xl object-cover" 
                      onError={(e) => { e.target.src = '/images/kashi_vishwanath.jpg'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-charcoal-900 truncate">{temple.name}</h4>
                      <p className="text-xs text-charcoal-500 truncate">{temple.location} • {temple.deity}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-ivory-200 pt-3">
                    <button 
                      onClick={(e) => toggleAlert(e, temple.id)} 
                      className={`flex items-center space-x-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors ${alerts[temple.id] ? 'bg-temple-gold-100 text-temple-gold-600' : 'text-charcoal-500 hover:bg-ivory-200'}`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{alerts[temple.id] ? 'Alerts On' : 'Festival Alert'}</span>
                    </button>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveFromWishlist(temple.id); }}
                      className="text-vermilion-500 hover:text-vermilion-600 p-1.5 hover:bg-vermilion-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-ivory-200 bg-white">
            <button 
              onClick={onClose}
              className="w-full bg-copper-400 hover:bg-copper-500 text-ivory-50 py-3 rounded-xl font-medium transition-all duration-300 shadow-copper-glow focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2"
            >
              Browse Temples
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
