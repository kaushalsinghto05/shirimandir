import React from 'react';
import { X, Sparkles, Moon, Sun, Star } from 'lucide-react';
import { ASTRO_TOOLS } from '../data/mockData';

export default function AstroToolsModal({ isOpen, onClose, isInline = false }) {
  if (!isInline && !isOpen) return null;

  const isModal = !isInline;

  const ICONS = {
    'Daily Horoscope': Sun,
    'Panchang': Moon,
    'Matchmaking': Star,
    'Numerology': Sparkles
  };

  const Content = () => (
    <div className={`w-full max-w-7xl mx-auto ${isModal ? 'p-6 sm:p-8' : 'px-4 sm:px-6 lg:px-8 py-16 lg:py-24'}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-display text-charcoal-900 mb-4">Vedic Astro Tools & AI Kundli</h2>
        <p className="text-charcoal-500 max-w-2xl mx-auto">Discover cosmic insights and guidance through ancient Vedic wisdom combined with modern precision.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 bg-ivory-50 border border-ivory-200 rounded-3xl p-6 md:p-8 shadow-warm">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-copper-400/10 text-copper-600 rounded-xl flex items-center justify-center mr-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-display text-charcoal-900">AI Kundli Generator</h3>
              <p className="text-charcoal-500 text-sm">Generate detailed birth charts instantly</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Birth Date</label>
              <input type="date" className="w-full px-4 py-2 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Birth Time</label>
              <input type="time" className="w-full px-4 py-2 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">Birth Place</label>
              <input type="text" placeholder="e.g. New Delhi" className="w-full px-4 py-2 rounded-xl border border-ivory-200 focus:ring-copper-400 focus:border-copper-400" />
            </div>
          </div>
          <button className="w-full sm:w-auto px-8 py-3 bg-copper-400 text-ivory-50 rounded-xl font-medium shadow-copper-glow hover:bg-copper-500 transition-all hover:-translate-y-0.5">
            Generate Kundli
          </button>
        </div>

        <div className="bg-charcoal-900 text-ivory-50 rounded-3xl p-6 md:p-8 shadow-dark flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-display mb-2">Book Live Vedic Consultant</h3>
            <p className="text-ivory-200 text-sm mb-6">Connect with expert astrologers for personalized guidance.</p>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {['Today 4 PM', 'Today 6 PM', 'Tomorrow 10 AM', 'Tomorrow 2 PM'].map(slot => (
                <button key={slot} className="py-2 px-3 border border-charcoal-700 rounded-lg text-sm text-ivory-100 hover:border-copper-400 hover:text-copper-400 transition-colors">
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <button className="w-full py-3 bg-copper-400 text-ivory-50 rounded-xl font-medium hover:bg-copper-500 transition-all">
            Book Consultation <span className="font-mono ml-2">₹501</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {(ASTRO_TOOLS || [
          { name: 'Daily Horoscope', description: 'Read your personalized daily reading based on moon sign.' },
          { name: 'Panchang', description: 'Daily Hindu calendar for auspicious timings and tithis.' },
          { name: 'Matchmaking', description: 'Vedic Kundli matching for marriage and relationships.' },
          { name: 'Numerology', description: 'Discover the power of your numbers and life path.' }
        ]).map((tool, idx) => {
          const Icon = ICONS[tool.name] || Sparkles;
          return (
            <div key={idx} className="bg-ivory-50 border border-ivory-200 p-6 rounded-2xl hover:border-copper-400/50 hover:shadow-warm transition-all hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-ivory-100 text-copper-500 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h4 className="font-medium text-charcoal-900 mb-2">{tool.name}</h4>
              <p className="text-sm text-charcoal-500 mb-4">{tool.description}</p>
              <button className="text-copper-600 font-medium text-sm hover:text-copper-700 transition-colors">Open {tool.name} →</button>
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto scrollbar-hide pb-4">
        <div className="flex space-x-6 min-w-max px-2">
          {['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].map((sign, i) => (
            <div key={sign} className="flex flex-col items-center group cursor-pointer">
              <div className="w-14 h-14 rounded-full bg-ivory-100 border border-ivory-200 flex items-center justify-center mb-2 group-hover:border-copper-400 group-hover:bg-copper-400/5 transition-all">
                <span className="text-xl">{['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'][i]}</span>
              </div>
              <span className="text-xs font-medium text-charcoal-700 group-hover:text-copper-600 transition-colors">{sign}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="relative max-w-5xl w-full bg-ivory-50 rounded-3xl shadow-elevated animate-scale-in my-8 max-h-[90vh] overflow-y-auto scrollbar-hide">
          <button onClick={onClose} className="absolute top-6 right-6 text-charcoal-500 hover:text-charcoal-900 transition-colors z-10 bg-ivory-100 rounded-full p-2">
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
