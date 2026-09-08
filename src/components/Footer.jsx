import React from 'react';
import { ShieldCheck, Heart, Lock, PhoneCall, Mail, Sparkles } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-sanctum-950 text-sandstone-300 pt-16 pb-12 border-t border-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Sanskrit Blessing Banner */}
        <div className="text-center pb-12 border-b border-sanctum-850">
          <p className="font-serif text-gold-400 text-sm sm:text-base tracking-widest uppercase mb-1">
            ॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥
          </p>
          <p className="text-xs text-sandstone-400 italic">
            "May all beings be happy; May all be free from illness; May all see what is auspicious; May no one suffer."
          </p>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12 border-b border-sanctum-850">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-terracotta-600 p-0.5 shadow-gold-glow flex items-center justify-center">
                <div className="w-full h-full bg-sanctum-950 rounded-[14px] flex items-center justify-center">
                  <span className="text-gold-400 font-serif font-bold text-xl">ॐ</span>
                </div>
              </div>
              <span className="font-serif font-bold text-xl tracking-wider text-sandstone-50">
                MANDIR<span className="text-gold-500">VEDA</span>
              </span>
            </div>

            <p className="text-xs text-sandstone-300 leading-relaxed max-w-sm">
              MandirVeda is an authentic spiritual technology ecosystem bridging millions of devotees to ancient Vedic sanctums through personalized Gotra sankalpa pujas, verified chadhava, live darshan telemetry, and sanctified doorstep prasad.
            </p>

            <div className="pt-2 text-[11px] text-tulsi-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tulsi-500 shrink-0" />
              <span>Section 80G Tax Exemption Certified Devasthanam Trust</span>
            </div>
          </div>

          {/* Nav Col 1 */}
          <div>
            <h4 className="font-serif font-bold text-xs text-gold-400 uppercase tracking-wider mb-3">
              Sacred Offerings
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('pujas')} className="hover:text-gold-300 transition-colors">Vedic Pujas & Sevas</button></li>
              <li><button onClick={() => onNavigate('chadhava')} className="hover:text-gold-300 transition-colors">Divine Chadhava Offerings</button></li>
              <li><button onClick={() => onNavigate('temples')} className="hover:text-gold-300 transition-colors">Temple Directory (500+)</button></li>
              <li><button onClick={() => onNavigate('home')} className="hover:text-gold-300 transition-colors">Live Darshan Queue</button></li>
              <li><button onClick={() => onNavigate('store')} className="hover:text-gold-300 transition-colors">Consecrated Malas & Store</button></li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div>
            <h4 className="font-serif font-bold text-xs text-gold-400 uppercase tracking-wider mb-3">
              Devotional Knowledge
            </h4>
            <ul className="space-y-2 text-xs">
              <li><button onClick={() => onNavigate('panchang')} className="hover:text-gold-300 transition-colors">Daily Shubh Panchang</button></li>
              <li><button onClick={() => onNavigate('library')} className="hover:text-gold-300 transition-colors">Aartis & Chalisa Library</button></li>
              <li><button onClick={() => onNavigate('astro')} className="hover:text-gold-300 transition-colors">Vedic Kundli Milan</button></li>
              <li><button onClick={() => onNavigate('astro')} className="hover:text-gold-300 transition-colors">Shani Sade Sati Checker</button></li>
              <li><button onClick={() => onNavigate('library')} className="hover:text-gold-300 transition-colors">Shiv Tandav Stotram</button></li>
            </ul>
          </div>

          {/* Devotee Sevak Desk */}
          <div>
            <h4 className="font-serif font-bold text-xs text-gold-400 uppercase tracking-wider mb-3">
              Devotee Support
            </h4>
            <ul className="space-y-2.5 text-xs text-sandstone-300">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-gold-500" />
                <span>Toll Free: 1800-VEDA-SANCTUM</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gold-500" />
                <span>sevak@mandirveda.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-tulsi-400" />
                <span>256-Bit Encrypted Data</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-sandstone-400 gap-4">
          <p>© 2026 MandirVeda Devasthanam Trust. All spiritual and ritual rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-sandstone-200 cursor-pointer">Privacy Charter</span>
            <span className="hover:text-sandstone-200 cursor-pointer">80G Compliance</span>
            <span className="hover:text-sandstone-200 cursor-pointer">Temple Trust Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
