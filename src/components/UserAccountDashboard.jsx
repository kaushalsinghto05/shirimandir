import React, { useState } from 'react';
import { 
  User, Phone, MapPin, Video, FileText, CheckCircle2, Clock, 
  RotateCcw, ShieldCheck, Lock, Check, Package, AlertCircle, ExternalLink 
} from 'lucide-react';
import ProofMediaViewerModal from './ProofMediaViewerModal';
import RefundRequestModal from './RefundRequestModal';
import { authService } from '../services/api';

export default function UserAccountDashboard({ user, onOpenReceipt, wishlist, temples, onSelectTemple }) {
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'orders', 'refunds', 'privacy'
  const [selectedProofBooking, setSelectedProofBooking] = useState(null);
  const [selectedRefundTarget, setSelectedRefundTarget] = useState(null);
  const [refundItemType, setRefundItemType] = useState('booking');

  // Privacy consent state
  const [consentOptIn, setConsentOptIn] = useState(Boolean(user?.consent_data_sharing));
  const [consentUpdatedMsg, setConsentUpdatedMsg] = useState('');

  // Sample or state bookings
  const [bookings, setBookings] = useState([
    {
      id: 1,
      booking_code: 'BK-KV-2026-9081',
      puja_title: 'Maha Rudrabhishek with Sacred Ganga Jal & Bilva Patra',
      temple_name: 'Shri Kashi Vishwanath Temple',
      scheduled_date: '2026-10-01',
      sankalp_name: user?.name || 'Kaushal Singh',
      sankalp_gotra: user?.gotra || 'Kashyap',
      sankalp_nakshatra: 'Moola',
      status: 'completed',
      total_amount_inr: 2400,
      base_amount_inr: 2100,
      proof_media_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      proof_media_type: 'photo',
      proof_notes: 'Namakam & Chamakam Vedic chants completed with bilva archana in sanctum.'
    },
    {
      id: 2,
      booking_code: 'BK-TB-2026-4412',
      puja_title: 'Kalyanotsavam & Suprabhata Archana Seva',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      scheduled_date: '2026-10-15',
      sankalp_name: user?.name || 'Kaushal Singh',
      sankalp_gotra: user?.gotra || 'Kashyap',
      sankalp_nakshatra: 'Moola',
      status: 'confirmed',
      total_amount_inr: 3150,
      base_amount_inr: 3100,
      proof_media_url: null,
      proof_notes: null
    }
  ]);

  // Sample Prasad orders
  const [orders, setOrders] = useState([
    {
      id: 1,
      order_code: 'ORD-SM-2026-1049',
      item_name: 'Kashi Vishwanath Sacred Peda & Dry Fruit Mahaprasad Box (400g)',
      fssai_license_no: '12723999000142',
      base_amount_inr: 450,
      shipping_fee_inr: 50,
      platform_fee_inr: 20,
      total_amount_inr: 520,
      status: 'dispatched',
      tracking_number: 'DELHIVERY-99281920',
      courier_partner: 'Delhivery Express',
      destination: 'Plot 42, Ganga Vihar, Varanasi (221002)'
    }
  ]);

  // Sample refund requests
  const [refundRequests, setRefundRequests] = useState([
    {
      id: 1,
      refund_code: 'REF-2026-0041',
      target: 'Kalyanotsavam Seva (BK-TB-2026-4412)',
      requested_amount_inr: 3150,
      eligible_amount_inr: 3087,
      deduction_fee_inr: 63,
      policy_tier: '>48h_full_refund_less_gateway_fee',
      status: 'requested',
      reason: 'Family travel delayed due to unforeseen emergency',
      created_at: '2026-10-06'
    }
  ]);

  const handleToggleConsent = async () => {
    const nextVal = !consentOptIn;
    setConsentOptIn(nextVal);
    try {
      await authService.updateConsent(nextVal);
      setConsentUpdatedMsg(nextVal ? 'Explicit consent granted for priest ritual chanting.' : 'Consent withdrawn. Ritual records will remain anonymized.');
      setTimeout(() => setConsentUpdatedMsg(''), 4000);
    } catch {
      setConsentUpdatedMsg('Preference updated locally.');
      setTimeout(() => setConsentUpdatedMsg(''), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 animate-fade-in font-sans">
      
      {/* Devotee Header */}
      <div className="bg-ivory-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-ivory-200 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-copper-500 text-white flex items-center justify-center text-3xl font-display font-bold shadow-copper-glow">
          {user?.name?.charAt(0) || 'D'}
        </div>
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-900">{user?.name || 'Devotee Account'}</h1>
            <span className="bg-sage-100 text-sage-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Devotee
            </span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs text-charcoal-600">
            <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-ivory-300">
              <Phone className="w-3 h-3 text-copper-500"/> {user?.phone || '+91 98765 43210'}
            </span>
            <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-ivory-300">
              <User className="w-3 h-3 text-copper-500"/> Gotra: <strong>{user?.gotra || 'Kashyap'}</strong>
            </span>
            <span className="bg-white px-3 py-1 rounded-full border border-ivory-300">
              Rashi: <strong>{user?.rashi || 'Dhanu'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 sm:space-x-6 border-b border-ivory-200 mb-8 scrollbar-hide text-sm font-bold">
        {[
          { id: 'bookings', label: `My Puja Bookings (${bookings.length})` },
          { id: 'orders', label: `Prasad Orders (${orders.length})` },
          { id: 'refunds', label: `Refund Requests (${refundRequests.length})` },
          { id: 'privacy', label: 'Privacy & Data Consent' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)}
            className={`pb-3.5 px-1 whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.id 
                ? 'text-copper-600 border-copper-600' 
                : 'text-charcoal-400 hover:text-charcoal-800 border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[350px]">
        
        {/* TAB 1: PUJA BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.map(b => (
              <div 
                key={b.id} 
                className="p-5 sm:p-6 rounded-2xl bg-white border border-ivory-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-ivory-300 transition-all"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      b.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {b.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {b.status}
                    </span>
                    <span className="font-mono text-xs text-charcoal-400">#{b.booking_code}</span>
                    <span className="text-xs text-charcoal-500">• Scheduled: {b.scheduled_date}</span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-charcoal-900">{b.puja_title}</h3>
                  <p className="text-xs text-charcoal-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-copper-500" /> {b.temple_name}
                  </p>

                  <div className="text-xs text-charcoal-600 pt-1">
                    Sankalp recited for: <strong>{b.sankalp_name}</strong> (Gotra: {b.sankalp_gotra}) • Paid: <strong className="font-mono text-copper-600">₹{b.total_amount_inr}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2.5 w-full md:w-auto">
                  {b.status === 'completed' && b.proof_media_url ? (
                    <button
                      onClick={() => setSelectedProofBooking(b)}
                      className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <Video className="w-4 h-4 text-temple-gold-400" />
                      View Proof of Service
                    </button>
                  ) : (
                    <span className="px-3 py-2 text-xs text-charcoal-400 font-medium bg-ivory-100 rounded-xl">
                      Proof in preparation
                    </span>
                  )}

                  {b.status !== 'completed' && b.status !== 'refunded' && (
                    <button
                      onClick={() => {
                        setSelectedRefundTarget(b);
                        setRefundItemType('booking');
                      }}
                      className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl border border-vermilion-200 hover:bg-vermilion-50 text-vermilion-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Request Refund
                    </button>
                  )}

                  <button
                    onClick={() => onOpenReceipt(b)}
                    className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Receipt (80G)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: PRASAD ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map(o => (
              <div 
                key={o.id} 
                className="p-5 sm:p-6 rounded-2xl bg-white border border-ivory-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-ivory-300 transition-all text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-sage-100 text-sage-800">
                      {o.status}
                    </span>
                    <span className="font-mono text-charcoal-400">#{o.order_code}</span>
                  </div>

                  <h3 className="font-bold text-sm text-charcoal-900">{o.item_name}</h3>
                  
                  {/* FSSAI Badge */}
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    FSSAI License: {o.fssai_license_no}
                  </div>

                  {/* Itemized charges */}
                  <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 space-y-1 text-charcoal-600 max-w-md">
                    <div className="flex justify-between">
                      <span>Base Sacred Item:</span>
                      <span className="font-mono">₹{o.base_amount_inr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping & Packaging:</span>
                      <span className="font-mono">₹{o.shipping_fee_inr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Seva Support:</span>
                      <span className="font-mono">₹{o.platform_fee_inr}</span>
                    </div>
                    <div className="flex justify-between font-bold text-charcoal-900 pt-1 border-t border-ivory-200">
                      <span>Total Itemized Paid:</span>
                      <span className="font-mono text-copper-600">₹{o.total_amount_inr}</span>
                    </div>
                  </div>

                  <p className="text-charcoal-500">
                    Shipment: <span className="font-semibold text-charcoal-800">{o.courier_partner} ({o.tracking_number})</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={() => alert(`Tracking ${o.tracking_number} via ${o.courier_partner}: Out for delivery.`)}
                    className="px-4 py-2 rounded-xl bg-charcoal-900 text-white font-medium text-xs flex items-center justify-center gap-1.5"
                  >
                    Track Shipment
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRefundTarget(o);
                      setRefundItemType('order');
                    }}
                    className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal-700 font-medium text-xs hover:bg-ivory-100"
                  >
                    Cancel / Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: REFUND REQUESTS */}
        {activeTab === 'refunds' && (
          <div className="space-y-4 text-xs">
            {refundRequests.map(r => (
              <div 
                key={r.id} 
                className="p-5 rounded-2xl bg-white border border-ivory-200 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-charcoal-900 text-sm">#{r.refund_code}</span>
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase text-[10px]">
                      {r.status}
                    </span>
                  </div>
                  <span className="text-charcoal-400">Filed on {r.created_at}</span>
                </div>

                <p className="font-semibold text-charcoal-800">{r.target}</p>
                <p className="text-charcoal-600 italic bg-ivory-50 p-2.5 rounded-xl border border-ivory-200">
                  "{r.reason}"
                </p>

                <div className="grid grid-cols-3 gap-2 bg-ivory-100 p-3 rounded-xl border border-ivory-200 text-center">
                  <div>
                    <span className="text-charcoal-500 block text-[10px]">Original Paid</span>
                    <span className="font-mono font-bold text-charcoal-800">₹{r.requested_amount_inr}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-500 block text-[10px]">Policy Deduction</span>
                    <span className="font-mono font-bold text-vermilion-600">-₹{r.deduction_fee_inr}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-500 block text-[10px]">Eligible Payout</span>
                    <span className="font-mono font-bold text-emerald-600">₹{r.eligible_amount_inr}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: PRIVACY & DATA CONSENT */}
        {activeTab === 'privacy' && (
          <div className="p-6 rounded-3xl bg-white border border-ivory-200 space-y-5 max-w-2xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-copper-50 text-copper-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-charcoal-900 text-base">
                  Devotee Data Protection & Ritual Sharing Preferences
                </h3>
                <p className="text-charcoal-500">Statutory Consent Compliance Audit</p>
              </div>
            </div>

            <p className="text-charcoal-700 leading-relaxed font-sans">
              Under Shiri Mandir’s ethical privacy charter, your personal identifiers (full name, phone number, physical address) are <strong>never shared with external temple archakas by default</strong>. 
            </p>

            <div className="p-4 rounded-2xl bg-ivory-100 border border-ivory-300 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-bold text-charcoal-900 text-sm">
                  Transmit Gotra & Name for Sanctum Sankalp
                </p>
                <p className="text-charcoal-500 text-xs">
                  Allows priest to chant your exact gotra and name during the ceremony.
                </p>
              </div>

              <button
                onClick={handleToggleConsent}
                className={`w-12 h-7 rounded-full p-1 transition-colors relative shrink-0 ${
                  consentOptIn ? 'bg-copper-500' : 'bg-charcoal-300'
                }`}
              >
                <div 
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    consentOptIn ? 'translate-x-5' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

            {consentUpdatedMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {consentUpdatedMsg}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 space-y-2 text-[11px] text-charcoal-600">
              <span className="font-bold text-charcoal-800 uppercase tracking-wider block">Security Guarantees:</span>
              <p>• Data sharing defaults to FALSE for every newly created account.</p>
              <p>• When opt-in is disabled, temple partner screens display masked identifiers ("Devotee [Anonymized] - Gotra: Kashyap").</p>
              <p>• All consent updates are cryptographically timestamped and IP-logged.</p>
            </div>
          </div>
        )}

      </div>

      {/* Proof Media Viewer Modal */}
      {selectedProofBooking && (
        <ProofMediaViewerModal 
          booking={selectedProofBooking} 
          onClose={() => setSelectedProofBooking(null)} 
        />
      )}

      {/* Refund Request Modal */}
      {selectedRefundTarget && (
        <RefundRequestModal 
          targetItem={selectedRefundTarget} 
          itemType={refundItemType}
          onClose={() => setSelectedRefundTarget(null)}
          onSuccess={(newReq) => {
            if (newReq) setRefundRequests(prev => [newReq, ...prev]);
            setSelectedRefundTarget(null);
          }}
        />
      )}

    </div>
  );
}
