import React from 'react';
import { X, ShoppingBag, Plus } from 'lucide-react';
import { AASHIRWAD_ADDONS } from '../data/mockData';

export default function StoreModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-ivory-50 rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-elevated relative animate-scale-in flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-ivory-200 bg-white rounded-t-3xl flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-sage-100 p-2.5 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-sage-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-charcoal-900">Sanctum Store</h2>
          </div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-900 bg-ivory-100 hover:bg-ivory-200 p-2.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-ivory-50">
          <p className="text-charcoal-600 mb-6 font-sans">
            Enhance your spiritual journey with sacred offerings and blessed items directly from the temple.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {AASHIRWAD_ADDONS?.map((product, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-warm border border-ivory-200 flex flex-col hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300">
                <div className="h-40 bg-ivory-100 relative">
                  <img src={product.imageUrl || '/images/placeholder.jpg'} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                    <span className="font-mono font-bold text-copper-600">₹{product.price}</span>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h4 className="font-sans font-bold text-charcoal-900 text-lg mb-1">{product.name}</h4>
                  <p className="text-sm text-charcoal-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  <button className="w-full flex items-center justify-center gap-2 bg-ivory-100 hover:bg-copper-400 text-charcoal-700 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-300">
                    <Plus className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
