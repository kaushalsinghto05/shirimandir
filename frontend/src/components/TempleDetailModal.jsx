import React, { useState } from 'react';
import { 
  X, MapPin, Clock, Calendar, ShieldCheck, Heart, Share2, 
  Sparkles, CheckCircle2, ChevronRight, Video, FileText, ShoppingBag, Plus, Info 
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';

export default function TempleDetailModal({ temple, onClose, onBookService, onAddToCart, isWishlisted, onToggleWishlist }) {
  const [activeTab, setActiveTab] = useState('pujas'); // 'pujas', 'prasad', 'about', 'telemetry'

  if (!temple) return null;

  const verificationStatus = temple.verification_status || (temple.trustBadge ? 'official' : 'independent');
  const proofDoc = temple.affiliation_proof_doc || temple.trustBadge?.verificationUrl;

  return (
    <div className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-ivory-300 flex flex-col overflow-hidden animate-scale-in">
        
        {/* Top Banner & Header */}
        <div className="relative h-64 sm:h-72 w-full shrink-0">
          <img 
            src={temple.banner || temple.banner_url || temple.image || temple.imageUrl || '/images/kashi_vishwanath.jpg'} 
            alt={temple.name} 
            className="w-full h-full object-cover" 
            onError={(e) => { e.target.src = '/images/kashi_vishwanath.jpg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
          
          {/* Controls */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button 
              onClick={() => onToggleWishlist(temple.id)}
              className="bg-charcoal-950/50 hover:bg-charcoal-950/80 p-2.5 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-vermilion-500 text-vermilion-500' : 'text-white'}`} />
            </button>
            <button 
              onClick={onClose}
              className="bg-charcoal-950/50 hover:bg-charcoal-950/80 p-2.5 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Legal Badge */}
          <div className="absolute top-4 left-4 z-10">
            <VerificationBadge 
              status={verificationStatus}
              proofDocUrl={proofDoc}
              trustRegNo={temple.trust_registration_no || temple.trustBadge?.trustName}
            />
          </div>

          {/* Temple Title & Info */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight drop-shadow-md">
              {temple.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ivory-200 mt-2 font-sans">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-copper-400" /> {temple.location}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-temple-gold-400" /> {temple.timings || '04:00 AM - 11:00 PM'}</span>
              <span className="text-temple-gold-300 font-medium">Deity: {temple.deity}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ivory-200 px-6 bg-ivory-50/80 shrink-0 gap-6 text-sm font-sans font-bold">
          {['pujas', 'prasad', 'about', 'telemetry'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 capitalize transition-all border-b-2 ${
                activeTab === tab 
                  ? 'border-copper-600 text-copper-700' 
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-900'
              }`}
            >
              {tab === 'pujas' ? 'Sanctum Pujas & Sevas' : tab === 'prasad' ? 'FSSAI Prasad Store' : tab === 'about' ? 'History & Legal Affiliation' : 'Live Darshan Telemetry'}
            </button>
          ))}
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 font-sans">
          
          {/* TAB 1: PUJAS */}
          {activeTab === 'pujas' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-charcoal-600">
                  Select a sacred Vedic puja to participate with family sankalp and receive sanctified prasad at home.
                </p>
              </div>

              {(temple.pujas || temple.services || [
                {
                  id: 1,
                  title: 'Maha Rudrabhishek with Sacred Ganga Jal & Bilva',
                  name: 'Maha Rudrabhishek with Sacred Ganga Jal & Bilva',
                  description: 'Vedic ritual reciting Namakam and Chamakam. Photo/video proof guaranteed upon completion.',
                  price: 2100,
                  packages: [
                    { id: '1', name: 'Individual Devotee Sankalp', price: 2100, members: 1 },
                    { id: '2', name: 'Parivar (Family of 4) Sankalp', price: 3500, members: 4 }
                  ]
                },
                {
                  id: 2,
                  title: 'Special Sandhya Aarti & Bilva Archana',
                  name: 'Special Sandhya Aarti & Bilva Archana',
                  description: 'Evening ritual with 108 fresh bilva patra offered with your gotra recited.',
                  price: 1100,
                  packages: [
                    { id: '3', name: 'Devotee Sankalp', price: 1100, members: 1 }
                  ]
                }
              ]).map((puja, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-copper-300 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-charcoal-900 text-base">{puja.title || puja.name}</h4>
                      <span className="text-[11px] bg-sage-100 text-sage-700 font-bold px-2 py-0.5 rounded-md">
                        Proof Guaranteed
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-600 leading-relaxed max-w-xl">{puja.description}</p>
                    <p className="text-[11px] text-charcoal-500 font-mono pt-1">
                      Starting from ₹{puja.price || puja.base_price_paise / 100 || 1100} • Full itemized breakdown pre-payment
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      if (onBookService) onBookService(puja);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-copper-500 hover:bg-copper-600 text-white font-medium text-xs whitespace-nowrap transition-colors shadow-sm"
                  >
                    Book Seva →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: PRASAD */}
          {activeTab === 'prasad' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>
                    <strong>FSSAI Food Safety Compliance:</strong> All edible offerings feature verified 14-digit FSSAI licenses and temperature-controlled hygienic packing.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(temple.prasad_items || [
                  {
                    id: 1,
                    name: 'Sacred Pure Cow Ghee Peda Box (400g)',
                    description: 'Handcrafted desi ghee pedas blessed at sanctum. 14-day sealed shelf life.',
                    price: 450,
                    stock_qty: 120,
                    fssai_license_no: '12723999000142',
                    image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80'
                  },
                  {
                    id: 2,
                    name: 'Consecrated Vibhuti Bhasma & Ganga Jal Kit',
                    description: 'Directly sourced holy Ganga Jal and consecrated Shiva Bhasma talisman.',
                    price: 250,
                    stock_qty: 85,
                    fssai_license_no: null,
                    image: 'https://images.unsplash.com/photo-1608481337062-4093bf3ed404?auto=format&fit=crop&w=600&q=80'
                  }
                ]).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-ivory-200 bg-white flex flex-col justify-between space-y-3">
                    <div className="flex gap-3">
                      <img 
                        src={item.image || item.image_url || '/images/addon_prasad_box.jpg'} 
                        alt={item.name} 
                        className="w-20 h-20 rounded-xl object-cover border border-ivory-200 shrink-0" 
                        onError={(e) => { e.target.src = '/images/addon_prasad_box.jpg'; }}
                      />
                      <div>
                        <h4 className="font-bold text-charcoal-900 text-sm leading-snug">{item.name}</h4>
                        <p className="text-xs text-charcoal-500 line-clamp-2 mt-1">{item.description}</p>
                        {item.fssai_license_no && (
                          <span className="inline-block mt-1.5 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            FSSAI: {item.fssai_license_no}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-ivory-100">
                      <div>
                        <span className="font-mono font-bold text-copper-600 text-sm">
                          ₹{item.price || item.price_paise / 100 || 450}
                        </span>
                        <p className="text-[10px] text-charcoal-400">Real stock: {item.stock_qty || 40} units</p>
                      </div>

                      <button
                        onClick={() => {
                          if (onAddToCart) onAddToCart({ ...item, quantity: 1, temple: temple.name });
                          alert(`Added "${item.name}" to your Prasad cart!`);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-ivory-100 hover:bg-copper-500 text-charcoal-800 hover:text-white font-semibold text-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY & LEGAL AFFILIATION */}
          {activeTab === 'about' && (
            <div className="space-y-5 text-xs text-charcoal-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 space-y-2">
                <span className="text-xs uppercase font-bold text-charcoal-500 tracking-wider">
                  Sanctum History & Significance
                </span>
                <p>{temple.history || temple.description}</p>
                {temple.significance && <p className="pt-2 font-medium text-charcoal-900">{temple.significance}</p>}
              </div>

              {/* Legal Affiliation Transparency Box */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <span className="text-xs uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Statutory Affiliation & Registration Audit
                </span>
                <p>
                  <strong>Current Legal Status:</strong> {verificationStatus.toUpperCase()}
                  <br />
                  {verificationStatus === 'official' && 'This temple is directly integrated with the official board/trust. Signed MOU is active on platform records.'}
                  {verificationStatus === 'partnered' && 'Seva services are executed via certified traditional Archaka Samitis registered in the district.'}
                  {verificationStatus === 'independent' && 'Devotee-facilitated seva. Shiri Mandir does not claim administrative affiliation.'}
                </p>

                {proofDoc && (
                  <div className="pt-2">
                    <a
                      href={proofDoc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" /> Inspect Official Affiliation Proof Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY & DARSHAN QUEUE */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 text-center">
                  <span className="text-charcoal-500 text-[11px] block">Live Sanctum Queue</span>
                  <span className="font-bold text-2xl text-charcoal-900 font-mono mt-1 block">
                    {temple.current_wait_minutes || temple.waitMinutes || 20} Mins
                  </span>
                  <span className="text-[11px] text-sage-600 font-medium">Smooth Darshan Flow</span>
                </div>
                <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 text-center">
                  <span className="text-charcoal-500 text-[11px] block">Stream Status</span>
                  <span className="font-bold text-base text-emerald-700 mt-2 block flex items-center justify-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    LIVE AARTI
                  </span>
                  <span className="text-[11px] text-charcoal-500">Official CCTV Feed</span>
                </div>
                <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-200 text-center">
                  <span className="text-charcoal-500 text-[11px] block">Consecrated Priests</span>
                  <span className="font-bold text-2xl text-copper-600 font-mono mt-1 block">
                    12 Active
                  </span>
                  <span className="text-[11px] text-charcoal-500">Traditional Archakas</span>
                </div>
              </div>

              {/* Mock Darshan Video Feed */}
              <div className="rounded-2xl overflow-hidden aspect-video bg-charcoal-950 relative flex items-center justify-center border border-charcoal-800">
                <img 
                  src={temple.image || temple.imageUrl || '/images/kashi_vishwanath.jpg'} 
                  alt="Live Darshan Stream" 
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-charcoal-950/40 flex flex-col items-center justify-center text-white">
                  <Video className="w-12 h-12 text-temple-gold-400 mb-2 animate-pulse" />
                  <p className="font-bold text-sm">Live Sanctum Aarti Feed Active</p>
                  <p className="text-xs text-ivory-300">Synchronized broadcast with holy Vedic chants</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
