import React from 'react';
import { X, Heart, Clock, Bell, Trash2, ArrowRight } from 'lucide-react';
import { TEMPLES } from '../data/mockData';

export default function WishlistDrawer({ 
  isOpen, 
  onClose, 
  wishlist, 
  temples = TEMPLES,
  onRemoveFromWishlist, 
  onSelectTemple 
}) {
  if (!isOpen) return null;

  const followedTemples = temples.filter(t => wishlist.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-sanctum-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gold-500/30">
        
        {/* Drawer Header */}
        <div className="p-5 bg-sanctum-950 text-white border-b border-gold-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-terracotta-500 fill-terracotta-500" />
            <div>
              <h3 className="font-serif font-bold text-base text-white">
                Multi-Temple Wishlist
              </h3>
              <p className="text-xs text-sandstone-300">
                {followedTemples.length} followed sanctum{followedTemples.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-sanctum-900 text-sandstone-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Festival Alert Banner */}
        <div className="bg-gold-50 px-4 py-3 border-b border-gold-200 flex items-start gap-2.5 text-xs text-gold-950">
          <Bell className="w-4 h-4 text-gold-700 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-gold-900 font-serif">Auspicious Festival Alerts Active</strong>
            <span>You receive automated SMS & WhatsApp notifications 24 hours before Ekadashi & Pradosh at your followed temples.</span>
          </div>
        </div>

        {/* Wishlist Temple Cards */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {followedTemples.length === 0 ? (
            <div className="text-center py-16 text-sandstone-500">
              <Heart className="w-12 h-12 mx-auto text-sandstone-300 mb-2" />
              <p className="font-semibold text-sanctum-950 text-sm">Your Sanctum Wishlist is Empty</p>
              <p className="text-xs text-sandstone-500 mt-1 max-w-xs mx-auto">
                Explore the temple directory and tap the heart icon on your favorite shrines to follow them.
              </p>
            </div>
          ) : (
            followedTemples.map((temple) => (
              <div
                key={temple.id}
                className="p-3.5 rounded-2xl bg-sandstone-50 border border-sandstone-200 hover:border-gold-400 transition-all flex items-center justify-between gap-3 group"
              >
                <div 
                  onClick={() => {
                    onSelectTemple(temple);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  <img
                    src={temple.image}
                    alt={temple.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold text-gold-700 uppercase">{temple.deity}</span>
                    <h4 className="font-serif font-bold text-xs text-sanctum-950 group-hover:text-gold-700 line-clamp-1">
                      {temple.name}
                    </h4>
                    <span className="text-[11px] text-tulsi-700 font-semibold block mt-0.5">
                      🟢 ~{temple.waitMinutes} min queue
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      onSelectTemple(temple);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-sanctum-950 hover:bg-gold-500 text-gold-300 hover:text-sanctum-950 transition-colors"
                    title="View Temple"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(temple.id)}
                    className="p-2 rounded-xl text-sandstone-400 hover:text-terracotta-600 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-sandstone-100 border-t border-sandstone-200 text-xs text-center text-sandstone-600">
          Syncs with your registered gotra and mobile account
        </div>

      </div>
    </div>
  );
}
