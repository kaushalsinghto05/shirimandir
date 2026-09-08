import React from 'react';
import { X, ShoppingBag, Sparkles, ShieldCheck, Check } from 'lucide-react';
import { AASHIRWAD_ADDONS } from '../data/mockData';

export default function StoreModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-sanctum-950 text-white p-6 border-b border-gold-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">MandirVeda Sanctum Store</h3>
              <p className="text-xs text-sandstone-300">Consecrated Malas, Pure Silver Coins & Sacred Items</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sanctum-900 border border-white/20 text-white hover:bg-sanctum-850"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quality Certification Strip */}
        <div className="bg-sandstone-100 px-6 py-2.5 border-b border-sandstone-200 flex items-center justify-between text-xs text-sandstone-700">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-tulsi-600" />
            <span>100% Lab Tested & Sanctum Energized with Certificate of Authenticity</span>
          </span>
          <span className="text-[11px] font-bold text-tulsi-700 bg-tulsi-50 px-2 py-0.5 rounded">
            Free Delivery
          </span>
        </div>

        {/* Products Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AASHIRWAD_ADDONS.map((item) => (
            <div key={item.id} className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200 flex items-center gap-4 group hover:border-gold-500/60 transition-all">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1">
                <h5 className="font-serif font-bold text-xs text-sanctum-950 group-hover:text-gold-700 leading-snug">
                  {item.name}
                </h5>
                <p className="text-[11px] text-sandstone-500 mt-1 line-clamp-2">
                  {item.desc}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-serif font-bold text-sanctum-950">
                    ₹{item.price}
                  </span>
                  <button 
                    onClick={() => alert(`Added ${item.name} to sanctum cart!`)}
                    className="px-3 py-1 bg-sanctum-950 hover:bg-gold-500 text-gold-300 hover:text-sanctum-950 rounded-lg text-[11px] font-bold transition-colors"
                  >
                    Order Sacred
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
