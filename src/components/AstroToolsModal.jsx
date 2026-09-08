import React, { useState } from 'react';
import { X, Compass, Stars, Sun, Clock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { ASTRO_TOOLS } from '../data/mockData';

export default function AstroToolsModal({ isOpen, onClose }) {
  const [activeTool, setActiveTool] = useState('kundli-milan');
  const [boyName, setBoyName] = useState('Rahul');
  const [girlName, setGirlName] = useState('Ananya');
  const [milanCalculated, setMilanCalculated] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-sanctum-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-sanctum-lg border border-gold-500/30 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-sanctum-950 text-white p-6 border-b border-gold-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Vedic Jyotish & Astro Tools</h3>
              <p className="text-xs text-sandstone-300">Kundli Milan, Sade Sati & Muhurta Calculations</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sanctum-900 border border-white/20 text-white hover:bg-sanctum-850"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tool Nav Pills */}
        <div className="bg-sandstone-100 p-3 border-b border-sandstone-200 flex flex-wrap gap-2">
          {ASTRO_TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTool(t.id);
                setMilanCalculated(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTool === t.id
                  ? 'bg-sanctum-950 text-gold-300 shadow-sm'
                  : 'bg-white text-sandstone-700 hover:bg-sandstone-200'
              }`}
            >
              {t.name.split(' (')[0]}
            </button>
          ))}
        </div>

        {/* Tool Workspace Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {activeTool === 'kundli-milan' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-serif font-bold text-base text-sanctum-950">Vedic Ashta Koota Kundli Milan</h4>
                <p className="text-xs text-sandstone-600">Calculates the 36 Gunas based on Nakshatra and Moon placement.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200">
                  <span className="text-xs font-bold text-sandstone-700 block mb-2 uppercase">Boy's Birth Details</span>
                  <input
                    type="text"
                    value={boyName}
                    onChange={(e) => setBoyName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sandstone-300 bg-white mb-2"
                  />
                  <select className="w-full px-3 py-2 text-xs rounded-xl border border-sandstone-300 bg-white">
                    <option>Rohini Nakshatra (Vrishabha Rashi)</option>
                    <option>Pushya Nakshatra (Karka Rashi)</option>
                    <option>Uttara Phalguni (Simha Rashi)</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200">
                  <span className="text-xs font-bold text-sandstone-700 block mb-2 uppercase">Girl's Birth Details</span>
                  <input
                    type="text"
                    value={girlName}
                    onChange={(e) => setGirlName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sandstone-300 bg-white mb-2"
                  />
                  <select className="w-full px-3 py-2 text-xs rounded-xl border border-sandstone-300 bg-white">
                    <option>Mrigashira Nakshatra (Mithuna Rashi)</option>
                    <option>Swati Nakshatra (Tula Rashi)</option>
                    <option>Revati Nakshatra (Meena Rashi)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMilanCalculated(true)}
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-sanctum-950 font-bold text-xs shadow-gold-glow flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Calculate 36 Guna Milan & Manglik Dosh</span>
              </button>

              {milanCalculated && (
                <div className="p-5 rounded-2xl bg-tulsi-50 border border-tulsi-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-tulsi-800 font-bold uppercase tracking-wide">Compatibility Score:</span>
                      <h5 className="text-2xl font-serif font-bold text-tulsi-950">29.5 / 36 Gunas Matched</h5>
                    </div>
                    <span className="px-3 py-1 bg-tulsi-600 text-white rounded-full text-xs font-bold">
                      Auspicious Match (Uttam)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 border-t border-tulsi-200 text-tulsi-900">
                    <div>Varna: <strong>1/1</strong></div>
                    <div>Vashya: <strong>2/2</strong></div>
                    <div>Tara: <strong>3/3</strong></div>
                    <div>Yoni: <strong>3/4</strong></div>
                    <div>Graha Maitri: <strong>5/5</strong></div>
                    <div>Gana: <strong>5/6</strong></div>
                    <div>Bhakoot: <strong>7/7</strong></div>
                    <div>Nadi: <strong>8/8 (No Nadi Dosh)</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTool === 'sade-sati' && (
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-base text-sanctum-950">Shani Sade Sati & Dhaiya Phase Checker</h4>
              <p className="text-xs text-sandstone-600">Select your Moon Sign (Rashi) to discover current Saturn transit impact and recommended temple remedies.</p>

              <div className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200">
                <label className="block text-xs font-bold text-sandstone-700 uppercase mb-2">Select Your Rashi</label>
                <select className="w-full px-3 py-2 text-xs rounded-xl border border-sandstone-300 bg-white">
                  <option>Kumbha (Aquarius) — Peak (2nd Phase)</option>
                  <option>Meena (Pisces) — Rising (1st Phase)</option>
                  <option>Makara (Capricorn) — Setting (3rd Phase)</option>
                  <option>Vrishchik (Scorpio) — Kantaka Shani</option>
                  <option>Karka (Cancer) — Ashtama Shani</option>
                </select>

                <div className="mt-4 p-3.5 bg-white rounded-xl border border-sandstone-200 text-xs space-y-1 text-sandstone-700">
                  <p><strong>Current Phase:</strong> Shani Transit over Kumbha Rashi.</p>
                  <p><strong>Remedy Recommended:</strong> Taila Abhishek at Shani Shingnapur or Hanuman Chalisa chanting at Mahakaleshwar Jyotirlinga.</p>
                </div>
              </div>
            </div>
          )}

          {activeTool !== 'kundli-milan' && activeTool !== 'sade-sati' && (
            <div className="p-6 text-center bg-sandstone-50 rounded-2xl border border-sandstone-200">
              <Sun className="w-8 h-8 text-gold-600 mx-auto mb-2" />
              <h5 className="font-serif font-bold text-sm text-sanctum-950">Vedic Choghadiya & Muhurta Calculator</h5>
              <p className="text-xs text-sandstone-600 mt-1">Live calculations calibrated to your current sunrise and location coordinates.</p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
