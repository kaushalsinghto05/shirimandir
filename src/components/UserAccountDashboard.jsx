import React, { useState } from 'react';
import { MOCK_USER_BOOKINGS, MOCK_CHADHAVA_BOOKINGS } from '../data/mockData';
import { User, Phone, MapPin, Share2, Copy, Video, FileText, CheckCircle2 } from 'lucide-react';

export default function UserAccountDashboard({ user, onOpenReceipt, wishlist, temples, onSelectTemple }) {
  const [activeTab, setActiveTab] = useState('bookings');
  
  // Fake referral program data
  const REFERRAL_PROGRAM = {
    code: 'SHIRI500',
    totalEarned: 1500,
    friendsReferred: 3
  };

  const wishlistedTemples = temples?.filter(t => wishlist?.includes(t.id)) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 animate-fade-in">
      {/* User Header */}
      <div className="bg-ivory-100 rounded-3xl p-8 shadow-warm mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-24 h-24 rounded-full bg-copper-400 flex items-center justify-center text-ivory-50 text-4xl font-display font-bold shadow-copper-glow">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="font-display text-3xl font-bold text-charcoal-900 mb-2">{user?.name || 'User Name'}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-charcoal-600 font-sans text-sm">
            <span className="flex items-center gap-1.5 bg-ivory-200 px-3 py-1 rounded-full"><Phone className="w-3.5 h-3.5"/> {user?.phone || '+91 98765 43210'}</span>
            <span className="flex items-center gap-1.5 bg-ivory-200 px-3 py-1 rounded-full"><User className="w-3.5 h-3.5"/> Gotra: {user?.gotra || 'Kashyap'}</span>
            <span className="flex items-center gap-1.5 bg-ivory-200 px-3 py-1 rounded-full">Rashi: {user?.rashi || 'Leo'}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto space-x-2 sm:space-x-8 border-b border-ivory-200 mb-8 scrollbar-hide">
        {['My Bookings', 'Chadhava History', 'Wishlist', 'Referrals'].map(tab => {
          const tabId = tab.split(' ')[0].toLowerCase();
          return (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tabId)}
              className={`pb-4 px-2 text-base sm:text-lg whitespace-nowrap font-sans font-medium transition-colors ${activeTab === tabId ? 'text-copper-600 border-b-2 border-copper-600' : 'text-charcoal-500 hover:text-charcoal-900'}`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Bookings */}
        {activeTab === 'my' && (
          <div className="space-y-6">
            {MOCK_USER_BOOKINGS?.map((booking, idx) => (
              <div key={idx} className="bg-ivory-100 rounded-2xl p-6 shadow-warm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-sage-100 text-sage-600 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {booking.status || 'Confirmed'}
                    </span>
                    <span className="text-charcoal-400 text-sm">{booking.date}</span>
                  </div>
                  <h3 className="font-sans text-xl font-bold text-charcoal-900">{booking.sevaName}</h3>
                  <p className="text-charcoal-600 text-sm mt-1">{booking.temple}</p>
                  
                  {booking.prasadDelivery && (
                    <div className="mt-4 p-3 bg-ivory-200/50 rounded-xl inline-flex items-center gap-2 text-sm text-charcoal-700">
                      <MapPin className="w-4 h-4 text-copper-500" />
                      Prasad Delivery: <span className="font-medium text-copper-600">{booking.prasadDelivery}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col w-full md:w-auto gap-3">
                  <button onClick={() => onOpenReceipt(booking)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border-2 border-copper-400 text-copper-600 rounded-xl hover:bg-copper-400 hover:text-ivory-50 transition-all duration-300 font-medium">
                    <FileText className="w-4 h-4" />
                    Receipt
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-charcoal-800 text-ivory-50 rounded-xl hover:bg-charcoal-900 transition-all duration-300 font-medium">
                    <Video className="w-4 h-4" />
                    Recording
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chadhava History */}
        {activeTab === 'chadhava' && (
          <div className="space-y-4">
            {MOCK_CHADHAVA_BOOKINGS?.map((item, idx) => (
              <div key={idx} className="bg-ivory-100 rounded-2xl p-5 shadow-warm flex justify-between items-center hover:-translate-y-0.5 transition-all duration-300">
                <div>
                  <h4 className="font-sans font-semibold text-charcoal-900 text-lg">{item.itemName}</h4>
                  <p className="text-sm text-charcoal-500">{item.temple} • {item.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-copper-600 text-lg">₹{item.amount}</p>
                  <p className="text-xs text-sage-600 font-medium">Delivered</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistedTemples.map(temple => (
              <div key={temple.id} className="bg-ivory-100 rounded-2xl overflow-hidden shadow-warm cursor-pointer hover:-translate-y-1 hover:shadow-warm-lg transition-all duration-300" onClick={() => onSelectTemple(temple)}>
                <div className="h-40 relative">
                  <img src={temple.imageUrl || '/images/placeholder.jpg'} alt={temple.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent"></div>
                  <h3 className="absolute bottom-3 left-4 right-4 font-display font-bold text-ivory-50 text-lg">{temple.name}</h3>
                </div>
                <div className="p-4">
                  <p className="text-sm text-charcoal-600 flex items-center gap-1.5 mb-2"><MapPin className="w-3.5 h-3.5"/> {temple.location}</p>
                  <button className="w-full text-copper-600 border border-copper-200 hover:bg-copper-50 py-2 rounded-xl text-sm font-medium transition-colors">
                    View Temple Details
                  </button>
                </div>
              </div>
            ))}
            {wishlistedTemples.length === 0 && (
              <div className="col-span-full py-12 text-center text-charcoal-500">
                No temples in your wishlist yet.
              </div>
            )}
          </div>
        )}

        {/* Referrals */}
        {activeTab === 'referrals' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-ivory-100 rounded-3xl p-8 shadow-warm border border-ivory-200">
              <h3 className="font-display text-2xl font-bold text-charcoal-900 mb-2">Invite & Earn</h3>
              <p className="text-charcoal-600 mb-8 font-sans">Share the blessings. Get ₹500 in your wallet for every friend who books a seva.</p>
              
              <div className="bg-white rounded-2xl p-4 border-2 border-dashed border-copper-300 flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-charcoal-400 font-medium uppercase tracking-wide mb-1">Your Referral Code</p>
                  <p className="font-mono text-2xl font-bold text-copper-600">{REFERRAL_PROGRAM.code}</p>
                </div>
                <button className="p-3 bg-copper-50 hover:bg-copper-100 text-copper-600 rounded-xl transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              
              <button className="w-full bg-copper-400 hover:bg-copper-500 text-ivory-50 py-3.5 rounded-xl font-medium transition-all duration-300 shadow-copper-glow flex items-center justify-center gap-2">
                <Share2 className="w-5 h-5" />
                Share via WhatsApp
              </button>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="bg-charcoal-900 rounded-3xl p-8 shadow-dark text-ivory-50 flex items-center justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-ivory-200 font-medium mb-1">Total Earned</p>
                  <p className="font-mono text-4xl font-bold text-temple-gold-400">₹{REFERRAL_PROGRAM.totalEarned}</p>
                </div>
                <div className="w-24 h-24 bg-temple-gold-500/10 rounded-full flex items-center justify-center relative z-10">
                  <Star className="w-10 h-10 text-temple-gold-400" />
                </div>
                {/* Decorative blob */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-temple-gold-500/5 rounded-full blur-2xl"></div>
              </div>
              
              <div className="bg-ivory-100 rounded-3xl p-6 shadow-warm border border-ivory-200">
                <p className="text-charcoal-500 font-medium mb-1">Friends Referred</p>
                <p className="font-sans text-3xl font-bold text-charcoal-900">{REFERRAL_PROGRAM.friendsReferred}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Just a local icon since it's not imported at the top
const Star = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);
