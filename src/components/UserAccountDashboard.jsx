import React, { useState } from 'react';
import { 
  User, 
  Sparkles, 
  Flame, 
  Package, 
  FileText, 
  Heart, 
  PhoneCall, 
  MessageSquare, 
  Mail, 
  Video, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Truck,
  ArrowRight,
  Download,
  Bell
} from 'lucide-react';
import { MOCK_USER_BOOKINGS, MOCK_CHADHAVA_BOOKINGS, TEMPLES } from '../data/mockData';

export default function UserAccountDashboard({ 
  user, 
  onOpenReceipt, 
  wishlist, 
  temples = TEMPLES,
  onSelectTemple 
}) {
  const [activeSection, setActiveSection] = useState('pujas'); // 'pujas', 'chadhava', 'prasad', 'receipts', 'wishlist', 'support'

  const gridMenuItems = [
    { id: 'pujas', label: 'My Puja Bookings', count: MOCK_USER_BOOKINGS.length, icon: Sparkles, color: 'text-gold-600 bg-gold-50 border-gold-200' },
    { id: 'chadhava', label: 'My Chadhava Bookings', count: MOCK_CHADHAVA_BOOKINGS.length, icon: Flame, color: 'text-terracotta-600 bg-terracotta-50 border-terracotta-200' },
    { id: 'prasad', label: 'Prasad Trackers', count: '1 Active', icon: Truck, color: 'text-tulsi-600 bg-tulsi-50 border-tulsi-200' },
    { id: 'receipts', label: '80G Tax Receipts', count: '2 Available', icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { id: 'wishlist', label: 'Multi-Temple Wishlist', count: wishlist.length, icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'support', label: 'Priest & Sevak Support', count: '24x7 Help', icon: PhoneCall, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  ];

  const followedTemples = temples.filter(t => wishlist.includes(t.id));

  return (
    <div className="py-12 bg-sandstone-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Devotee Profile Header Banner */}
        <div className="bg-gradient-to-r from-sanctum-950 via-sanctum-900 to-sanctum-950 rounded-3xl p-6 sm:p-8 text-white border border-gold-500/30 shadow-sanctum mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-terracotta-600 p-0.5 shadow-gold-glow shrink-0">
              <div className="w-full h-full bg-sanctum-950 rounded-[14px] flex items-center justify-center text-gold-300 font-serif font-bold text-2xl sm:text-3xl">
                {user?.name?.charAt(0) || 'K'}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  {user?.name || 'Kaushal Singh'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-gold-500/20 border border-gold-500/40 text-gold-300 text-[10px] font-bold uppercase tracking-wider">
                  Devotee Sevak
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-sandstone-300">
                <span>Vedic Gotra: <strong className="text-gold-300">{user?.gotra || 'Kashyap'}</strong></span>
                <span>•</span>
                <span>Rashi: <strong className="text-sandstone-100">{user?.rashi || 'Dhanu (Sagittarius)'}</strong></span>
                <span>•</span>
                <span>Contact: {user?.phone || '+91 98765 43210'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-sanctum-800 pt-4 md:pt-0 md:pl-6">
            <div className="text-left md:text-right">
              <span className="text-[10px] text-sandstone-400 uppercase tracking-wider block font-semibold">Total Divine Sevas</span>
              <span className="text-xl sm:text-2xl font-serif font-bold text-gold-300">4 Consecrated</span>
            </div>
          </div>

        </div>

        {/* ICON-LED GRID NAVIGATION (Distinct Unique Feature) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {gridMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-32 ${
                  isActive
                    ? 'bg-sanctum-950 text-white border-gold-500 shadow-sanctum-lg'
                    : 'bg-white text-sanctum-950 border-sandstone-200 hover:border-gold-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                    isActive ? 'bg-gold-500/20 border-gold-500/40 text-gold-400' : item.color
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isActive ? 'bg-sanctum-800 text-gold-300' : 'bg-sandstone-100 text-sandstone-600'
                  }`}>
                    {item.count}
                  </span>
                </div>

                <div>
                  <h4 className={`text-xs font-bold leading-tight ${
                    isActive ? 'text-white' : 'text-sanctum-950'
                  }`}>
                    {item.label}
                  </h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* SECTION CONTENT CONTAINER */}
        <div className="bg-white rounded-3xl border border-sandstone-200 p-6 sm:p-8 shadow-sm">
          
          {/* SECTION 1: MY PUJA BOOKINGS */}
          {activeSection === 'pujas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-sandstone-100 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-sanctum-950">My Puja Bookings</h3>
                  <p className="text-xs text-sandstone-600">Track scheduled live video streams, priest allocations, and prasad parcels.</p>
                </div>
              </div>

              <div className="space-y-4">
                {MOCK_USER_BOOKINGS.map((bk) => (
                  <div key={bk.id} className="p-5 rounded-2xl bg-sandstone-50 border border-sandstone-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-gold-800 bg-gold-100 px-2 py-0.5 rounded">
                            {bk.id}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            bk.statusBadge === 'Upcoming Live' 
                              ? 'bg-tulsi-100 text-tulsi-800 border border-tulsi-300' 
                              : 'bg-sandstone-200 text-sandstone-700'
                          }`}>
                            {bk.statusBadge}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-base text-sanctum-950 mt-1">
                          {bk.pujaTitle}
                        </h4>
                        <p className="text-xs text-sandstone-600">{bk.templeName}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenReceipt({
                            taxReceiptNo: bk.taxReceiptNo,
                            timestamp: "08 Sep 2026",
                            donorName: user?.name || "Kaushal Singh",
                            gotra: user?.gotra || "Kashyap",
                            templeName: bk.templeName,
                            serviceTitle: bk.pujaTitle,
                            amount: bk.amountPaid
                          })}
                          className="px-3 py-1.5 rounded-xl border border-sandstone-300 hover:border-gold-500 bg-white text-xs font-semibold text-sanctum-900 flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-gold-600" />
                          <span>80G Receipt</span>
                        </button>

                        <a
                          href={bk.streamLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 rounded-xl bg-sanctum-950 hover:bg-sanctum-900 text-gold-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Live Stream</span>
                        </a>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-3 border-t border-sandstone-200/80">
                      <div>
                        <span className="text-sandstone-400 block">Officiating Date & Time:</span>
                        <strong className="text-sanctum-900">{bk.date}</strong>
                      </div>
                      <div>
                        <span className="text-sandstone-400 block">Devotee Gotra Chanted:</span>
                        <strong className="text-sanctum-900">{bk.devotees.join(', ')}</strong>
                      </div>
                      <div>
                        <span className="text-sandstone-400 block">Prasad Parcel Status:</span>
                        <strong className="text-tulsi-700 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5" />
                          <span>{bk.prasadTracking.statusText}</span>
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: MY CHADHAVA BOOKINGS */}
          {activeSection === 'chadhava' && (
            <div className="space-y-6">
              <div className="border-b border-sandstone-100 pb-4">
                <h3 className="font-serif font-bold text-xl text-sanctum-950">My Chadhava & Living Seva Offerings</h3>
                <p className="text-xs text-sandstone-600">Consecrated items offered at sanctums in your gotra.</p>
              </div>

              <div className="space-y-4">
                {MOCK_CHADHAVA_BOOKINGS.map((ch) => (
                  <div key={ch.id} className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-terracotta-700 bg-terracotta-100 px-2 py-0.5 rounded">
                          {ch.id}
                        </span>
                        <span className="text-xs font-semibold text-tulsi-700 bg-tulsi-50 px-2.5 py-0.5 rounded-full border border-tulsi-200">
                          {ch.status}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-sanctum-950 mt-1">
                        {ch.itemName}
                      </h4>
                      <p className="text-xs text-sandstone-600">{ch.templeName} • {ch.date}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-serif font-bold text-sanctum-950">
                        ₹{ch.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => onOpenReceipt({
                          taxReceiptNo: ch.receiptNo,
                          timestamp: ch.date,
                          donorName: ch.devoteeName,
                          gotra: `${ch.gotra} Gotra`,
                          templeName: ch.templeName,
                          serviceTitle: ch.itemName,
                          amount: ch.amount
                        })}
                        className="p-2 rounded-xl bg-white border border-sandstone-300 text-xs font-semibold text-sanctum-900 hover:border-gold-500 shadow-sm"
                        title="Download Receipt"
                      >
                        <FileText className="w-4 h-4 text-gold-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: PRASAD DELIVERY TRACKER */}
          {activeSection === 'prasad' && (
            <div className="space-y-6">
              <div className="border-b border-sandstone-100 pb-4">
                <h3 className="font-serif font-bold text-xl text-sanctum-950">Digital Prasad Delivery Tracker</h3>
                <p className="text-xs text-sandstone-600">Track sanctum dispatch, eco-packaging seals, and sacred courier transit.</p>
              </div>

              {MOCK_USER_BOOKINGS.map((bk) => (
                <div key={bk.id} className="p-6 rounded-3xl bg-sandstone-50 border border-sandstone-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-base text-sanctum-950">
                        {bk.pujaTitle} — Consecrated Prasad
                      </h4>
                      <p className="text-xs text-sandstone-600">
                        Courier: <strong>{bk.prasadTracking.courier}</strong> • Consignment: <span className="font-mono text-gold-800">{bk.prasadTracking.trackingNumber}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-tulsi-100 text-tulsi-800 text-xs font-bold self-start sm:self-center">
                      {bk.prasadTracking.statusText}
                    </span>
                  </div>

                  {/* 5-Step Visual Timeline */}
                  <div className="pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                      {bk.prasadTracking.steps.map((st, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-white border border-sandstone-200 flex flex-col justify-between">
                          <div>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mb-2 ${
                              st.completed ? 'bg-tulsi-600 text-white' : 'bg-sandstone-200 text-sandstone-500'
                            }`}>
                              {st.completed ? '✓' : i + 1}
                            </div>
                            <h5 className="text-xs font-bold text-sanctum-950 leading-snug">{st.label}</h5>
                          </div>
                          <span className="text-[10px] text-sandstone-400 mt-2 block">{st.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 4: 80G TAX RECEIPTS */}
          {activeSection === 'receipts' && (
            <div className="space-y-6">
              <div className="border-b border-sandstone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-serif font-bold text-xl text-sanctum-950">Section 80G Tax Exemption Certificates</h3>
                  <p className="text-xs text-sandstone-600">Official government-recognized donation certificates for filing income tax returns.</p>
                </div>
                <span className="px-3 py-1 bg-tulsi-50 text-tulsi-700 border border-tulsi-200 rounded-full text-xs font-bold">
                  50% Deduction Approved
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-sandstone-100 text-sandstone-700 uppercase font-semibold">
                    <tr>
                      <th className="p-3 rounded-l-xl">Certificate No</th>
                      <th className="p-3">Sanctum / Temple</th>
                      <th className="p-3">Seva Contribution</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3 rounded-r-xl text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sandstone-200">
                    {MOCK_USER_BOOKINGS.map((b) => (
                      <tr key={b.id} className="hover:bg-sandstone-50">
                        <td className="p-3 font-mono font-bold text-gold-800">{b.taxReceiptNo}</td>
                        <td className="p-3 font-medium text-sanctum-900">{b.templeName}</td>
                        <td className="p-3 text-sandstone-600">{b.pujaTitle}</td>
                        <td className="p-3 font-serif font-bold text-sanctum-950">₹{b.amountPaid.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => onOpenReceipt({
                              taxReceiptNo: b.taxReceiptNo,
                              timestamp: "08 Sep 2026",
                              donorName: user?.name || "Kaushal Singh",
                              gotra: user?.gotra || "Kashyap",
                              templeName: b.templeName,
                              serviceTitle: b.pujaTitle,
                              amount: b.amountPaid
                            })}
                            className="px-3 py-1.5 rounded-lg bg-sanctum-950 hover:bg-gold-500 text-gold-300 hover:text-sanctum-950 font-semibold text-[11px] transition-all"
                          >
                            Print PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION 5: MULTI-TEMPLE WISHLIST & FESTIVAL REMINDERS */}
          {activeSection === 'wishlist' && (
            <div className="space-y-6">
              <div className="border-b border-sandstone-100 pb-4">
                <h3 className="font-serif font-bold text-xl text-sanctum-950">Followed Shrines & Festival Reminders</h3>
                <p className="text-xs text-sandstone-600">Temples you follow. You receive automated notifications prior to major tithis and aartis.</p>
              </div>

              {followedTemples.length === 0 ? (
                <div className="text-center py-10 bg-sandstone-50 rounded-3xl border border-sandstone-200">
                  <Heart className="w-10 h-10 text-sandstone-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-sanctum-950">No temples in your wishlist yet</p>
                  <p className="text-xs text-sandstone-500 mt-1">Tap the heart icon on any temple to receive festival reminders.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {followedTemples.map((temple) => (
                    <div 
                      key={temple.id}
                      onClick={() => onSelectTemple(temple)}
                      className="p-4 rounded-2xl bg-sandstone-50 border border-sandstone-200 hover:border-gold-500/50 cursor-pointer flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={temple.image} 
                          alt={temple.name}
                          className="w-14 h-14 rounded-xl object-cover shrink-0" 
                        />
                        <div>
                          <span className="text-[10px] font-bold text-gold-700 uppercase">{temple.deity}</span>
                          <h4 className="font-serif font-bold text-sm text-sanctum-950 truncate max-w-xs">{temple.name}</h4>
                          <span className="text-xs text-tulsi-700 font-medium">🟢 ~{temple.waitMinutes} min live queue</span>
                        </div>
                      </div>

                      <button className="p-2 rounded-xl bg-white border border-sandstone-200 hover:bg-sanctum-950 hover:text-gold-300 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: SUPPORT & HELPLINE */}
          {activeSection === 'support' && (
            <div className="space-y-6">
              <div className="border-b border-sandstone-100 pb-4">
                <h3 className="font-serif font-bold text-xl text-sanctum-950">Dedicated Devotee Helpline & Sevak Desk</h3>
                <p className="text-xs text-sandstone-600">Connect with our head priest advisory or support team regarding rituals and courier tracking.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-sandstone-50 border border-sandstone-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-tulsi-100 text-tulsi-700 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-sanctum-950">Direct WhatsApp Support</h4>
                  <p className="text-xs text-sandstone-600">Instant answers regarding live stream links and Gotra confirmation.</p>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-xs font-bold text-tulsi-700 hover:underline"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>

                <div className="p-5 rounded-2xl bg-sandstone-50 border border-sandstone-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-sanctum-950">Priest Consultation Line</h4>
                  <p className="text-xs text-sandstone-600">Speak with our certified Vedic Acharyas for personalized puja guidance.</p>
                  <span className="inline-block mt-2 text-xs font-bold text-gold-800">
                    Toll Free: 1800-VEDA-SANCTUM
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-sandstone-50 border border-sandstone-200 space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-sanctum-950">Official Trust Email</h4>
                  <p className="text-xs text-sandstone-600">For 80G tax filings, corporate seva contributions, or temple inquiries.</p>
                  <span className="inline-block mt-2 text-xs font-bold text-blue-700">
                    sevak@mandirveda.com
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
