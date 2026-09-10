import React, { useState } from 'react';
import { X, BookOpen, PlayCircle, Clock } from 'lucide-react';
import { DEVOTIONAL_LIBRARY } from '../data/mockData';

export default function DevotionalLibraryModal({ isOpen, onClose }) {
  const [activeFilter, setActiveFilter] = useState('All');
  
  if (!isOpen) return null;

  const filters = ['All', 'Stotrams', 'Chalisas', 'Suktams', 'Ashtakams', 'Vedic Mantras'];

  const filteredItems = DEVOTIONAL_LIBRARY?.filter(item => 
    activeFilter === 'All' || item.category === activeFilter
  ) || [];

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-ivory-50 rounded-3xl w-full max-w-2xl h-[85vh] shadow-elevated relative animate-scale-in flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-ivory-200 bg-white rounded-t-3xl flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-copper-100 p-2.5 rounded-xl">
              <BookOpen className="w-6 h-6 text-copper-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-charcoal-900">Devotional Library</h2>
          </div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-900 bg-ivory-100 hover:bg-ivory-200 p-2.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 pt-4 pb-2 bg-white shrink-0">
          <div className="flex overflow-x-auto space-x-2 scrollbar-hide pb-2">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter 
                    ? 'bg-copper-400 text-white shadow-sm' 
                    : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-ivory-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-ivory-200 hover:shadow-warm hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer">
                <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                  <img 
                    src={item.thumbnail || item.image || item.imageUrl || '/images/deity_shiva.jpg'} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { e.target.src = '/images/deity_shiva.jpg'; }}
                  />
                  <div className="absolute inset-0 bg-charcoal-900/20 group-hover:bg-charcoal-900/40 transition-colors flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <h4 className="font-sans font-bold text-charcoal-900 text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-charcoal-500 mt-1 truncate">{item.deity}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-charcoal-400 truncate max-w-[80px]">{item.author}</p>
                    <div className="flex items-center gap-1 text-xs font-medium text-copper-600 bg-copper-50 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3" />
                      {item.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center text-charcoal-500">
                No items found in this category.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
