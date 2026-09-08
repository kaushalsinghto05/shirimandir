import React, { useState } from 'react';
import { X, BookOpen, Play, Pause, Volume2, Sparkles } from 'lucide-react';
import { DEVOTIONAL_LIBRARY } from '../data/mockData';

export default function DevotionalLibraryModal({ isOpen, onClose }) {
  const [selectedTrack, setSelectedTrack] = useState(DEVOTIONAL_LIBRARY[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-sanctum-950 text-white p-6 border-b border-gold-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Vedic Devotional Library</h3>
              <p className="text-xs text-sandstone-300">Aartis, Chalisas, Suktams & Chanted Stotrams</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sanctum-900 border border-white/20 text-white hover:bg-sanctum-850"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Active Player Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-sanctum-950 to-sanctum-900 text-white border border-gold-500/30 shadow-sanctum">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {selectedTrack.thumbnail && (
                  <img
                    src={selectedTrack.thumbnail}
                    alt={selectedTrack.deity}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-500/50 shadow-gold-glow shrink-0"
                  />
                )}
                <div>
                  <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">
                    {selectedTrack.category} • {selectedTrack.deity}
                  </span>
                  <h4 className="text-xl font-serif font-bold text-white mt-0.5">
                    {selectedTrack.title}
                  </h4>
                  <p className="text-xs text-sandstone-300">
                    Composer: {selectedTrack.author} • Duration: {selectedTrack.duration}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 text-sanctum-950 flex items-center justify-center shadow-gold-glow hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-sanctum-950" /> : <Play className="w-5 h-5 fill-sanctum-950 ml-0.5" />}
                </button>
                <span className="text-xs font-semibold text-gold-300">
                  {isPlaying ? 'Chanting Playing...' : 'Listen Audio'}
                </span>
              </div>
            </div>

            {/* Simulated Audio Progress Bar */}
            <div className="mt-4 pt-3 border-t border-sanctum-800">
              <div className="w-full h-1.5 bg-sanctum-800 rounded-full overflow-hidden">
                <div className={`h-full bg-gold-500 rounded-full ${isPlaying ? 'w-2/5' : 'w-0'} transition-all duration-500`}></div>
              </div>
            </div>
          </div>

          {/* Shloka Text Preview */}
          <div className="p-5 rounded-2xl bg-sandstone-50 border border-sandstone-200">
            <h5 className="font-serif font-bold text-sm text-sanctum-950 mb-2">
              Sacred Sanskrit Shloka & English Transliteration:
            </h5>
            <div className="font-serif text-sm text-sandstone-800 italic leading-relaxed space-y-2">
              <p>
                ॥ जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम् ।<br />
                डमड्डमड्डमड्डमन्निनादवड्डमर्वयं चकार चण्डताण्डवं तनोतु नः शिवः शिवम् ॥
              </p>
              <p className="text-xs text-sandstone-600 not-italic">
                "With his neck consecrated by the flow of water that trickles from his hair, and on his neck holding the tall snake like a garland, and of the Damaru sounding Damad-damad-damad-damad, may Lord Shiva bless our existence."
              </p>
            </div>
          </div>

          {/* Track List */}
          <div>
            <h5 className="font-serif font-bold text-sm text-sanctum-950 mb-3">Devotional Stotram Catalog</h5>
            <div className="space-y-2">
              {DEVOTIONAL_LIBRARY.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedTrack(item);
                    setIsPlaying(true);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedTrack.id === item.id
                      ? 'border-gold-500 bg-gold-50/70 shadow-sm'
                      : 'border-sandstone-200 bg-white hover:bg-sandstone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.deity}
                        className="w-11 h-11 rounded-xl object-cover border border-gold-500/40 shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-sanctum-950 text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                        ॐ
                      </div>
                    )}
                    <div>
                      <h6 className="font-serif font-bold text-xs text-sanctum-950">{item.title}</h6>
                      <span className="text-[10px] text-sandstone-500">{item.deity} • {item.author}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-medium text-sandstone-500">{item.duration}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
