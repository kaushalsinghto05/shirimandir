import React, { useState } from 'react';
import { X, Sparkles, Moon, Sun, Star, CheckCircle2, Compass, Shield } from 'lucide-react';
import { ASTRO_TOOLS } from '../data/mockData';

export default function AstroToolsModal({ isOpen, onClose, isInline = false }) {
  const [birthDate, setBirthDate] = useState('1998-05-15');
  const [birthTime, setBirthTime] = useState('06:30');
  const [birthPlace, setBirthPlace] = useState('Varanasi, UP');
  const [kundliResult, setKundliResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState('Today 4 PM');
  const [consultBooked, setConsultBooked] = useState(false);
  const [selectedSign, setSelectedSign] = useState('Sagittarius');

  if (!isInline && !isOpen) return null;

  const isModal = !isInline;

  const ICONS = {
    'Daily Horoscope': Sun,
    'Panchang': Moon,
    'Matchmaking': Star,
    'Numerology': Sparkles
  };

  const ZODIAC_PREDICTIONS = {
    'Aries': 'Today brings leadership opportunities. Chanting the Gayatri Mantra before noon unlocks prosperity in new initiatives.',
    'Taurus': 'Venus bestows domestic harmony. Offer white flowers or mishri to Goddess Lakshmi for financial clarity.',
    'Gemini': 'Mercury enhances quick decisions and intellectual pursuits. Feed green fodder or donate grain for positive speech.',
    'Cancer': 'Moon brings intuitive depth and spiritual connection. Shiva abhishek with milk brings mental tranquility today.',
    'Leo': 'Sun radiates confidence and creative courage. Offer arghya to Surya Dev at sunrise for professional advancement.',
    'Virgo': 'Attention to detail yields long-term dividends. Chanting Vishnu Sahasranama dissolves persistent anxiety.',
    'Libra': 'Balanced relationships and auspicious partnerships flourish. Keep sandalwood fragrance in your workspace.',
    'Scorpio': 'Mars provides resilience against hurdles. Hanuman Chalisa recitation ensures protection and victory.',
    'Sagittarius': 'Jupiter expands wisdom, travel luck, and spiritual growth. Tilak of turmeric and saffron brings supreme grace.',
    'Capricorn': 'Saturn rewards patient persistence and discipline. Lighting a mustard oil lamp under a peepal tree dispels doshas.',
    'Aquarius': 'Innovative endeavors and community impact are blessed. Meditating during Sandhya Aarti grounds divine inspiration.',
    'Pisces': 'Spiritual contemplation and creative insight are at their peak. A visit to a nearby water sanctum brings peace.'
  };

  const handleGenerateKundli = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setKundliResult({
        lagna: 'Dhanu (Sagittarius) Lagna',
        rashi: 'Mithun (Gemini) Moon Sign',
        nakshatra: 'Moola (Pada 3) • Ketu Ruled',
        yoni: 'Shwan (Canine)',
        gana: 'Rakshasa Gana',
        nadi: 'Adi Nadi',
        gemstone: 'Yellow Sapphire (Pukhraj) & Pearl (Moti)',
        ishtaDevata: 'Lord Shiva & Bhagwan Vishnu'
      });
    }, 600);
  };

  const handleBookConsultation = () => {
    setConsultBooked(true);
    setTimeout(() => setConsultBooked(false), 5000);
  };

  const Content = () => (
    <div className={`w-full max-w-7xl mx-auto ${isModal ? 'p-6 sm:p-8' : 'px-4 sm:px-6 lg:px-8 py-16 lg:py-24'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display text-charcoal-900 mb-3 font-bold">Vedic Astro Tools & AI Kundli</h2>
        <p className="text-charcoal-500 max-w-2xl mx-auto text-sm">
          Discover cosmic insights, planetary transits, and divine guidance grounded in ancient Parashara Jyotish & modern astrological precision.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        
        {/* Left Column: AI Kundli Generator */}
        <div className="lg:col-span-2 bg-ivory-50 border border-ivory-200 rounded-3xl p-6 md:p-8 shadow-warm">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-copper-400/10 text-copper-600 rounded-xl flex items-center justify-center mr-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold text-charcoal-900">AI Kundli & Birth Chart</h3>
              <p className="text-charcoal-500 text-xs">Parashara Vedic charts, D-9 Navamsha & planetary strengths</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Birth Date</label>
              <input 
                type="date" 
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Birth Time</label>
              <input 
                type="time" 
                value={birthTime}
                onChange={e => setBirthTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Birth Place</label>
              <input 
                type="text" 
                value={birthPlace}
                onChange={e => setBirthPlace(e.target.value)}
                placeholder="e.g. Varanasi, Uttar Pradesh" 
                className="w-full px-4 py-2.5 rounded-xl border border-ivory-300 text-xs focus:ring-2 focus:ring-copper-400 focus:outline-none" 
              />
            </div>
          </div>

          <button 
            onClick={handleGenerateKundli}
            disabled={isGenerating}
            className="w-full sm:w-auto px-8 py-3 bg-copper-500 hover:bg-copper-600 text-white rounded-xl font-medium text-xs shadow-copper-glow transition-all hover:-translate-y-0.5"
          >
            {isGenerating ? 'Calculating Vedic Ephemeris...' : 'Generate Vedic Kundli'}
          </button>

          {/* Interactive Generated Kundli View */}
          {kundliResult && (
            <div className="mt-6 p-5 rounded-2xl bg-white border border-copper-200 shadow-xs animate-fade-in text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-ivory-200 pb-2">
                <span className="font-bold text-copper-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Parashara Kundli Generated
                </span>
                <span className="font-mono text-charcoal-500">{birthPlace} • {birthDate}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-ivory-50 p-2.5 rounded-xl border border-ivory-200">
                  <p className="text-[10px] text-charcoal-500">Ascendant (Lagna)</p>
                  <p className="font-bold text-charcoal-900 mt-0.5">{kundliResult.lagna}</p>
                </div>
                <div className="bg-ivory-50 p-2.5 rounded-xl border border-ivory-200">
                  <p className="text-[10px] text-charcoal-500">Janma Rashi</p>
                  <p className="font-bold text-charcoal-900 mt-0.5">{kundliResult.rashi}</p>
                </div>
                <div className="bg-ivory-50 p-2.5 rounded-xl border border-ivory-200">
                  <p className="text-[10px] text-charcoal-500">Nakshatra</p>
                  <p className="font-bold text-charcoal-900 mt-0.5">{kundliResult.nakshatra}</p>
                </div>
                <div className="bg-ivory-50 p-2.5 rounded-xl border border-ivory-200">
                  <p className="text-[10px] text-charcoal-500">Ishta Devata</p>
                  <p className="font-bold text-copper-600 mt-0.5">{kundliResult.ishtaDevata}</p>
                </div>
              </div>
              <p className="text-[11px] text-charcoal-600 pt-1">
                Recommended Astrological Gemstone: <strong className="text-charcoal-900">{kundliResult.gemstone}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Book Live Vedic Consultant */}
        <div className="bg-charcoal-900 text-ivory-50 rounded-3xl p-6 md:p-8 shadow-dark flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-display font-bold mb-2">Book Vedic Astrologer</h3>
            <p className="text-ivory-200 text-xs mb-6">Connect 1-on-1 with verified Acharyas for career, marriage & dosha nivaran guidance.</p>
            
            <label className="block text-[11px] text-ivory-300 mb-2 uppercase font-semibold">Available Consultation Slots</label>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {['Today 4 PM', 'Today 6 PM', 'Tomorrow 10 AM', 'Tomorrow 2 PM'].map(slot => (
                <button 
                  key={slot} 
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-2 px-3 border rounded-xl text-xs transition-all ${
                    selectedSlot === slot 
                      ? 'border-copper-400 bg-copper-400/20 text-copper-300 font-bold' 
                      : 'border-charcoal-700 text-ivory-200 hover:border-charcoal-500'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>

            {consultBooked && (
              <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Consultation scheduled for {selectedSlot}! Meeting link sent via SMS.</span>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={handleBookConsultation}
            className="w-full py-3 bg-gradient-to-r from-copper-500 to-copper-600 text-ivory-50 rounded-xl font-bold text-xs hover:from-copper-600 hover:to-copper-700 transition-all shadow-copper-glow flex items-center justify-center gap-2"
          >
            Book Session for {selectedSlot} <span className="font-mono bg-white/20 px-2 py-0.5 rounded ml-1">₹501</span>
          </button>
        </div>
      </div>

      {/* Astro Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {(ASTRO_TOOLS || [
          { name: 'Daily Horoscope', description: 'Read your personalized daily reading based on moon sign.' },
          { name: 'Panchang', description: 'Daily Hindu calendar for auspicious timings and tithis.' },
          { name: 'Matchmaking', description: 'Vedic Kundli matching for marriage and relationships.' },
          { name: 'Numerology', description: 'Discover the power of your numbers and life path.' }
        ]).map((tool, idx) => {
          const Icon = ICONS[tool.name] || Sparkles;
          return (
            <div key={idx} className="bg-ivory-50 border border-ivory-200 p-6 rounded-2xl hover:border-copper-400/50 hover:shadow-warm transition-all hover:-translate-y-0.5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-ivory-100 text-copper-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-semibold text-charcoal-900 mb-1 text-sm">{tool.name}</h4>
                <p className="text-xs text-charcoal-500 mb-4">{tool.description}</p>
              </div>
              <button 
                type="button"
                onClick={() => alert(`${tool.name} tool loaded. Choose your zodiac or date to explore.`)}
                className="text-copper-600 font-semibold text-xs hover:text-copper-700 transition-colors text-left"
              >
                Open {tool.name} →
              </button>
            </div>
          )
        })}
      </div>

      {/* Interactive Zodiac Selector & Prediction */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-ivory-200 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <div>
            <h3 className="font-display text-lg font-bold text-charcoal-900">Daily Vedic Horoscope (Dainik Rashifal)</h3>
            <p className="text-xs text-charcoal-500">Tap your Rashi to reveal today's planetary transit guidance</p>
          </div>
          <span className="text-xs font-mono bg-copper-50 text-copper-700 px-3 py-1 rounded-full font-bold border border-copper-200">
            Current: {selectedSign}
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-hide pb-4">
          <div className="flex space-x-4 min-w-max px-1">
            {[
              { name: 'Aries', symbol: '♈', hindi: 'Mesh' },
              { name: 'Taurus', symbol: '♉', hindi: 'Vrishabh' },
              { name: 'Gemini', symbol: '♊', hindi: 'Mithun' },
              { name: 'Cancer', symbol: '♋', hindi: 'Kark' },
              { name: 'Leo', symbol: '♌', hindi: 'Simha' },
              { name: 'Virgo', symbol: '♍', hindi: 'Kanya' },
              { name: 'Libra', symbol: '♎', hindi: 'Tula' },
              { name: 'Scorpio', symbol: '♏', hindi: 'Vrishchik' },
              { name: 'Sagittarius', symbol: '♐', hindi: 'Dhanu' },
              { name: 'Capricorn', symbol: '♑', hindi: 'Makar' },
              { name: 'Aquarius', symbol: '♒', hindi: 'Kumbh' },
              { name: 'Pisces', symbol: '♓', hindi: 'Meen' }
            ].map((zodiac) => (
              <div 
                key={zodiac.name} 
                onClick={() => setSelectedSign(zodiac.name)}
                className={`flex flex-col items-center cursor-pointer p-3 rounded-2xl transition-all ${
                  selectedSign === zodiac.name 
                    ? 'bg-copper-500 text-white shadow-copper-glow scale-105' 
                    : 'bg-ivory-50 border border-ivory-200 text-charcoal-700 hover:border-copper-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1 text-2xl ${
                  selectedSign === zodiac.name ? 'bg-white/20' : 'bg-ivory-100'
                }`}>
                  {zodiac.symbol}
                </div>
                <span className="text-xs font-bold">{zodiac.name}</span>
                <span className={`text-[10px] ${selectedSign === zodiac.name ? 'text-white/80' : 'text-charcoal-400'}`}>
                  {zodiac.hindi}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Zodiac Message Card */}
        <div className="mt-6 p-5 rounded-2xl bg-ivory-50 border border-ivory-200 flex items-start gap-4 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-copper-100 text-copper-600 flex items-center justify-center shrink-0 font-bold text-lg">
            ॐ
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-charcoal-900 text-sm">
              {selectedSign} Today's Vedic Guidance
            </h4>
            <p className="text-xs text-charcoal-700 leading-relaxed font-sans">
              {ZODIAC_PREDICTIONS[selectedSign] || 'Embrace harmony and mindfulness in daily prayers today.'}
            </p>
          </div>
        </div>
      </div>

    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="relative max-w-5xl w-full bg-ivory-50 rounded-3xl shadow-elevated animate-scale-in my-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-charcoal-500 hover:text-charcoal-900 transition-colors z-10 bg-ivory-100 hover:bg-ivory-200 rounded-full p-2"
          >
            <X className="w-5 h-5" />
          </button>
          <Content />
        </div>
      </div>
    );
  }

  return (
    <section className="bg-ivory-100/50">
      <Content />
    </section>
  );
}
