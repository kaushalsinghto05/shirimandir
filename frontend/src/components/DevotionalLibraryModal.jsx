import React, { useState, useEffect } from 'react';
import { X, BookOpen, PlayCircle, PauseCircle, Clock, Volume2, RotateCcw, ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { DEVOTIONAL_LIBRARY } from '../data/mockData';

const TRACK_VERSES = {
  'lib-shiv-tandav': {
    sanskrit: 'जटाटवीगलज्जलप्रवाहपावितस्थले गलेऽवलम्ब्य लम्बितां भुजङ्गतुङ्गमालिकाम्।\nडमड्डमड्डमड्डमन्निनादवड्डमर्वयं चकार चण्डताण्डवं तनोतु नः शिवः शिवम्॥',
    meaning: 'May Lord Shiva, whose neck is consecrated by the flow of the celestial Ganga cascading from His matted locks, bestow eternal auspiciousness upon all beings.',
    rag: 'Bhairav & Shankara',
    chantsCount: 108
  },
  'lib-hanuman-chalisa': {
    sanskrit: 'श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि।\nबरनउँ रघुबर बिमल जसु जो दायकु फल चारि॥\nबुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।\nबल बुधि बिद्या देहु मोहिं, हरहु कलेस बिकार॥',
    meaning: 'Cleansing the mirror of mind with the dust of Guru\'s lotus feet, I recall the Son of the Wind to grant strength, supreme wisdom, and dispel all distress.',
    rag: 'Kalyan & Mishra Kafi',
    chantsCount: 108
  },
  'lib-vishnu-sahasranamam': {
    sanskrit: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं\nविश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्।\nलक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं\nवन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥',
    meaning: 'Salutations to Bhagwan Vishnu, embodiment of serenity, resting on the cosmic serpent Shesha, sole protector of the multiverse who dispels all fear of worldly existence.',
    rag: 'Mohanam & Charukesi',
    chantsCount: 1000
  },
  'lib-madhurashtakam': {
    sanskrit: 'अधरं मधुरं वदनं मधुरं नयनं मधुरं हसितं मधुरम्।\nहृदयं मधुरं गमनं मधुरं मधुराधिपतेरखिलं मधुरम्॥',
    meaning: 'Sweet are His lips, sweet His radiant face, sweet His compassionate eyes and tender smile. Everything pertaining to the Lord of Divine Sweetness is sweet.',
    rag: 'Mishra Khamaj',
    chantsCount: 108
  },
  'lib-durga-suktam': {
    sanskrit: 'जातवेदसे सुनवाम सोममरातीयतो निदहाति वेदः।\nस नः पर्षदति दुर्गाणि विश्वा नावेव सिन्धुं दुरितात्यग्निः॥',
    meaning: 'We offer sacred oblation to the Goddess of Divine Fire. May Maa Durga ferry us across all storms and hardships like a stalwart ship across ocean waves.',
    rag: 'Darbari & Bilawal',
    chantsCount: 108
  }
};

export default function DevotionalLibraryModal({ isOpen, onClose }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [jaapCounter, setJaapCounter] = useState(0);
  const [progress, setProgress] = useState(15);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress(p => (p >= 100 ? 0 : p + 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  if (!isOpen) return null;

  const filters = ['All', 'Stotrams', 'Chalisas', 'Suktams', 'Ashtakams', 'Vedic Mantras'];

  const filteredItems = DEVOTIONAL_LIBRARY?.filter(item => 
    activeFilter === 'All' || item.category === activeFilter
  ) || [];

  const playTempleBell = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio synthesis not permitted:', e);
    }
  };

  const playShankhDrone = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(136.1, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 2.0);
    } catch (e) {
      console.warn('Audio synthesis not permitted:', e);
    }
  };

  const handleSelectTrack = (item) => {
    setSelectedTrack(item);
    setIsPlaying(true);
    setProgress(5);
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="bg-ivory-50 rounded-3xl w-full max-w-2xl h-[85vh] shadow-elevated relative animate-scale-in flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-ivory-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {selectedTrack ? (
              <button 
                onClick={() => { setSelectedTrack(null); setIsPlaying(false); }}
                className="p-2 hover:bg-ivory-100 rounded-full transition-colors text-charcoal-600"
                title="Back to library"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="bg-copper-100 p-2.5 rounded-xl">
                <BookOpen className="w-6 h-6 text-copper-600" />
              </div>
            )}
            <div>
              <h2 className="font-display text-2xl font-bold text-charcoal-900">
                {selectedTrack ? selectedTrack.title : 'Devotional Library'}
              </h2>
              {selectedTrack && (
                <p className="text-xs text-charcoal-500">{selectedTrack.deity} • {selectedTrack.author}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-charcoal-400 hover:text-charcoal-900 bg-ivory-100 hover:bg-ivory-200 p-2.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic View: Detail Player or Card Grid */}
        {selectedTrack ? (
          <div className="flex-1 overflow-y-auto p-6 bg-ivory-50 space-y-6">
            
            {/* Audio Player Card */}
            <div className="bg-white rounded-3xl p-6 border border-ivory-200 shadow-warm">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-copper-200">
                  <img 
                    src={selectedTrack.thumbnail || '/images/deity_shiva.jpg'} 
                    alt={selectedTrack.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/images/deity_shiva.jpg'; }}
                  />
                </div>
                <div className="flex-1 w-full text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-copper-50 text-copper-700 font-bold border border-copper-200">
                      {selectedTrack.category}
                    </span>
                    <span className="text-xs text-charcoal-400">
                      Raga: {TRACK_VERSES[selectedTrack.id]?.rag || 'Vedic Chhanda'}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-charcoal-900">{selectedTrack.title}</h3>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-ivory-200 rounded-full h-2 mt-3 overflow-hidden cursor-pointer">
                    <div 
                      className="bg-copper-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-charcoal-400 font-mono">
                    <span>{Math.floor((progress * 4.5) / 60)}:{(Math.floor(progress * 4.5) % 60).toString().padStart(2, '0')}</span>
                    <span>{selectedTrack.duration}</span>
                  </div>
                </div>
              </div>

              {/* Player Controls */}
              <div className="flex items-center justify-between border-t border-ivory-100 pt-5 mt-5">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={playTempleBell}
                    title="Ring Temple Bell (Ghanti)"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-ivory-100 hover:bg-copper-100 hover:text-copper-700 text-charcoal-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Bell className="w-3.5 h-3.5 text-copper-600" /> Bell 🔔
                  </button>
                  <button 
                    onClick={playShankhDrone}
                    title="Sacred Conch Sound (Shankh Naad)"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-ivory-100 hover:bg-copper-100 hover:text-copper-700 text-charcoal-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-copper-600" /> Shankh 🐚
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-copper-500 hover:bg-copper-600 text-white flex items-center justify-center shadow-copper-glow transition-all hover:scale-105"
                  >
                    {isPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6 ml-0.5" />}
                  </button>
                </div>

                {/* 108 Jaap Counter */}
                <div className="flex items-center gap-2 bg-ivory-100 px-3 py-1.5 rounded-xl border border-ivory-200">
                  <span className="text-[11px] text-charcoal-600 font-medium">Jaap:</span>
                  <span className="font-mono font-bold text-copper-600 text-xs">{jaapCounter}/108</span>
                  <button 
                    onClick={() => setJaapCounter(c => Math.min(108, c + 1))}
                    className="px-1.5 py-0.5 bg-white text-charcoal-800 rounded font-bold text-xs hover:bg-copper-50"
                  >
                    +1
                  </button>
                  <button 
                    onClick={() => setJaapCounter(0)}
                    title="Reset Jaap count"
                    className="text-charcoal-400 hover:text-charcoal-700 ml-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Sacred Lyrics & Meaning Card */}
            <div className="bg-white rounded-3xl p-6 border border-ivory-200 space-y-4">
              <h4 className="font-bold text-charcoal-900 text-sm flex items-center gap-2">
                <span>ॐ</span> Sanskrit Mool Paath & Translation
              </h4>
              <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200 font-serif text-charcoal-800 text-base leading-loose whitespace-pre-line text-center">
                {TRACK_VERSES[selectedTrack.id]?.sanskrit || 'ॐ नमो भगवते वासुदेवाय नमः'}
              </div>
              <div className="p-4 rounded-xl bg-copper-50/50 border border-copper-100 text-xs text-charcoal-700 leading-relaxed">
                <span className="font-bold text-copper-700 block mb-1">Spiritual Meaning:</span>
                {TRACK_VERSES[selectedTrack.id]?.meaning || 'Devotional surrender to the Supreme Divine.'}
              </div>
            </div>

          </div>
        ) : (
          <>
            {/* Category Filter Tabs */}
            <div className="px-6 pt-4 pb-2 bg-white shrink-0">
              <div className="flex overflow-x-auto space-x-2 scrollbar-hide pb-2">
                {filters.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      activeFilter === filter 
                        ? 'bg-copper-500 text-white shadow-sm' 
                        : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Devotional Tracks Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-ivory-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleSelectTrack(item)}
                    className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-ivory-200 hover:shadow-warm hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                      <img 
                        src={item.thumbnail || '/images/deity_shiva.jpg'} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        onError={(e) => { e.target.src = '/images/deity_shiva.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-charcoal-900/20 group-hover:bg-charcoal-900/40 transition-colors flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-white opacity-90 group-hover:scale-110 transition-all" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <h4 className="font-sans font-bold text-charcoal-900 text-sm truncate group-hover:text-copper-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-charcoal-500 mt-0.5 truncate">{item.deity}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-[11px] text-charcoal-400 truncate max-w-[90px]">{item.author}</p>
                        <div className="flex items-center gap-1 text-[11px] font-medium text-copper-600 bg-copper-50 px-2 py-0.5 rounded-md border border-copper-100">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredItems.length === 0 && (
                  <div className="col-span-full py-12 text-center text-charcoal-500 text-sm">
                    No devotional items found in this category.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
