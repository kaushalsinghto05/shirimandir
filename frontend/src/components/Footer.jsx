import React, { useState } from 'react';
import { ChevronDown, Mail, Phone, MessageCircle, Instagram, Youtube, Facebook, Twitter } from 'lucide-react';

const COLUMNS = [
  {
    title: "Quick Links",
    links: [
      { label: "Home", tabId: "home" },
      { label: "Temples", tabId: "temples" },
      { label: "Pujas & Sevas", tabId: "pujas" },
      { label: "Chadhava", tabId: "chadhava" },
      { label: "Yatra Packages", tabId: "yatras" },
      { label: "Account", tabId: "account" }
    ]
  },
  {
    title: "Popular Yatras",
    links: [
      { label: "Char Dham", tabId: "yatras" },
      { label: "Panch Jyotirlinga", tabId: "yatras" },
      { label: "Shakti Peeth", tabId: "yatras" },
      { label: "Vaishno Devi", tabId: "yatras" },
      { label: "Rameswaram", tabId: "yatras" }
    ]
  },
  {
    title: "Services",
    links: [
      { label: "Live Darshan", tabId: "services" },
      { label: "Guided Darshan", tabId: "services" },
      { label: "Panchang", tabId: "panchang" },
      { label: "Astro Tools", tabId: "astro" },
      { label: "Devotional Library", tabId: "library" },
      { label: "Store", tabId: "store" }
    ]
  }
];

export default function Footer({ onNavigate }) {
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleLinkClick = (e, tabId) => {
    e.preventDefault();
    if (onNavigate && tabId) {
      onNavigate(tabId);
    }
  };

  return (
    <footer className="bg-charcoal-900 text-ivory-200 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 md:text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl text-temple-gold-400">ॐ</span>
              <h2 className="text-2xl font-display font-bold tracking-wider text-ivory-50">SHIRI MANDIR</h2>
            </div>
            <p className="text-ivory-300 font-sans italic text-sm">India's Most Trusted Temple Devotion Platform</p>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4 items-center">
            <span className="text-ivory-300 font-medium">Newsletter</span>
            <div className="flex w-full sm:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-charcoal-800 text-ivory-50 px-4 py-2.5 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-copper-400 border-none w-full sm:w-64"
              />
              <button className="bg-copper-400 hover:bg-copper-500 text-white px-6 py-2.5 rounded-r-xl transition-all duration-300 font-medium whitespace-nowrap focus:ring-2 focus:ring-copper-400/50 focus:ring-offset-2 focus:ring-offset-charcoal-900 shadow-copper-glow">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 mb-16">
          {COLUMNS.map((col, idx) => (
            <div key={col.title} className="border-b border-charcoal-800 lg:border-none pb-4 lg:pb-0">
              <button 
                className="w-full flex items-center justify-between py-2 lg:py-0 lg:mb-6 lg:pointer-events-none"
                onClick={() => toggleAccordion(idx)}
              >
                <h3 className="font-display text-lg text-temple-gold-400">{col.title}</h3>
                <ChevronDown className={`w-5 h-5 text-ivory-400 lg:hidden transition-transform duration-300 ${openAccordion === idx ? 'rotate-180' : ''}`} />
              </button>
              
              <ul className={`lg:block lg:space-y-3 space-y-3 pt-2 lg:pt-0 overflow-hidden transition-all duration-300 ${openAccordion === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100'}`}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <a 
                      href={`#${link.tabId}`}
                      onClick={(e) => handleLinkClick(e, link.tabId)}
                      className="text-ivory-300 hover:text-copper-400 transition-colors duration-300 text-sm inline-block py-1"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Column */}
          <div className="border-b border-charcoal-800 lg:border-none pb-4 lg:pb-0">
            <button 
              className="w-full flex items-center justify-between py-2 lg:py-0 lg:mb-6 lg:pointer-events-none"
              onClick={() => toggleAccordion(3)}
            >
              <h3 className="font-display text-lg text-temple-gold-400">Contact & Support</h3>
              <ChevronDown className={`w-5 h-5 text-ivory-400 lg:hidden transition-transform duration-300 ${openAccordion === 3 ? 'rotate-180' : ''}`} />
            </button>
            
            <ul className={`lg:block lg:space-y-4 space-y-4 pt-2 lg:pt-0 overflow-hidden transition-all duration-300 ${openAccordion === 3 ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100'}`}>
              <li>
                <a href="mailto:namaste@shirimandir.com" className="flex items-center gap-3 text-ivory-300 hover:text-copper-400 transition-colors duration-300 text-sm group">
                  <span className="p-2 bg-charcoal-800 rounded-lg group-hover:bg-charcoal-700 transition-colors">
                    <Mail className="w-4 h-4" />
                  </span>
                  namaste@shirimandir.com
                </a>
              </li>
              <li>
                <a href="tel:+911800XXXXXXX" className="flex items-center gap-3 text-ivory-300 hover:text-copper-400 transition-colors duration-300 text-sm group">
                  <span className="p-2 bg-charcoal-800 rounded-lg group-hover:bg-charcoal-700 transition-colors">
                    <Phone className="w-4 h-4" />
                  </span>
                  +91 1800-XXX-XXXX
                </a>
              </li>
              <li>
                <button className="flex items-center gap-3 text-ivory-300 hover:text-sage-400 transition-colors duration-300 text-sm group w-full text-left">
                  <span className="p-2 bg-charcoal-800 rounded-lg group-hover:bg-charcoal-700 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                  </span>
                  WhatsApp Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-charcoal-800 mt-8">
          <div className="flex gap-4">
            <button aria-label="Instagram" className="p-2.5 rounded-full bg-charcoal-800 hover:bg-copper-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-copper-400/50">
              <Instagram className="w-5 h-5" />
            </button>
            <button aria-label="YouTube" className="p-2.5 rounded-full bg-charcoal-800 hover:bg-copper-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-copper-400/50">
              <Youtube className="w-5 h-5" />
            </button>
            <button aria-label="Facebook" className="p-2.5 rounded-full bg-charcoal-800 hover:bg-copper-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-copper-400/50">
              <Facebook className="w-5 h-5" />
            </button>
            <button aria-label="Twitter" className="p-2.5 rounded-full bg-charcoal-800 hover:bg-copper-400 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-copper-400/50">
              <Twitter className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-charcoal-500 text-sm mb-2">© 2026 Shiri Mandir. All rights reserved.</p>
            <div className="flex items-center justify-center md:justify-end gap-4 text-sm text-charcoal-500">
              <a href="#privacy" className="hover:text-copper-400 transition-colors">Privacy</a>
              <span>•</span>
              <a href="#terms" className="hover:text-copper-400 transition-colors">Terms</a>
              <span>•</span>
              <a href="#refund" className="hover:text-copper-400 transition-colors">Refund</a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
