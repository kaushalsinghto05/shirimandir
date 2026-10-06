import React, { useState } from 'react';
import { 
  Shield, LogOut, Activity, IndianRupee, Users, Package, 
  FileText, CheckCircle2, AlertTriangle, Upload, Eye, Check, X, Clock, Video, Lock 
} from 'lucide-react';
import { templeService, prasadService, bookingService, adminService } from '../services/api';

export default function AdminDashboard({ onExitAdmin, templesData = [], onUpdateWaitTime }) {
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry', 'temples', 'prasad', 'proofs', 'refunds'
  
  // Local state for interactive administration
  const [temples, setTemples] = useState(templesData);
  const [selectedProofBooking, setSelectedProofBooking] = useState(null);
  const [proofMediaUrlInput, setProofMediaUrlInput] = useState('');
  const [proofNotesInput, setProofNotesInput] = useState('');
  
  // Sample pending bookings needing proof
  const [pendingProofBookings, setPendingProofBookings] = useState([
    {
      id: 2,
      booking_code: 'BK-TB-2026-4412',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      puja_title: 'Kalyanotsavam & Suprabhata Archana Seva',
      devotee_name: 'Kaushal Singh',
      gotra: 'Kashyap',
      scheduled_date: '2026-10-15',
      status: 'confirmed',
      proof_media_url: null
    }
  ]);

  // Sample Prasad items awaiting FSSAI verification
  const [prasadQueue, setPrasadQueue] = useState([
    {
      id: 5,
      name: 'Panchamrit & Tulsi Arka Pure Ghee Bottle (250ml)',
      temple_name: 'Shri Kashi Vishwanath Temple',
      price: 180,
      stock_qty: 60,
      is_edible: true,
      fssai_license_no: '12723999000188',
      fssai_verified: false,
      is_active: false
    },
    {
      id: 1,
      name: 'Kashi Vishwanath Sacred Peda & Dry Fruit Box (400g)',
      temple_name: 'Shri Kashi Vishwanath Temple',
      price: 450,
      stock_qty: 120,
      is_edible: true,
      fssai_license_no: '12723999000142',
      fssai_verified: true,
      is_active: true
    }
  ]);

  // Sample refund queue
  const [refundQueue, setRefundQueue] = useState([
    {
      id: 1,
      refund_code: 'REF-2026-0041',
      devotee: 'Kaushal Singh (+91 98765 43210)',
      target: 'Kalyanotsavam Seva (BK-TB-2026-4412)',
      requested_amount_inr: 3150,
      eligible_amount_inr: 3087,
      policy_tier: '>48h_full_refund_less_gateway_fee',
      reason: 'Family travel delayed due to unforeseen emergency',
      status: 'requested'
    }
  ]);

  // 1. Temple Affiliation Update (Enforces affiliation_proof_doc requirement)
  const handleUpdateTempleTier = (templeId, newTier) => {
    setTemples(prev => prev.map(t => {
      if (t.id === templeId) {
        if (['partnered', 'official'].includes(newTier) && !t.affiliation_proof_doc && !t.trustBadge) {
          alert(`Compliance Violation: Cannot promote temple to '${newTier}' without signed affiliation proof document on file. Please upload proof document first.`);
          return t;
        }
        return { ...t, verification_status: newTier };
      }
      return t;
    }));
  };

  // 2. Prasad FSSAI Verification
  const handleApproveFSSAI = (itemId) => {
    setPrasadQueue(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, fssai_verified: true, is_active: true };
      }
      return item;
    }));
    alert('FSSAI License verified and authenticated. Prasad is now live in store.');
  };

  // 3. Upload Booking Proof & Mark Completed
  const handleCompleteBookingWithProof = (e) => {
    e.preventDefault();
    if (!selectedProofBooking || !proofMediaUrlInput.trim()) {
      alert('Compliance Rule: A puja booking can ONLY be marked as "completed" once photo or video proof of service is attached.');
      return;
    }

    setPendingProofBookings(prev => prev.map(b => {
      if (b.id === selectedProofBooking.id) {
        return {
          ...b,
          status: 'completed',
          proof_media_url: proofMediaUrlInput.trim(),
          proof_notes: proofNotesInput.trim() || 'Consecrated Vedic ritual performed in sanctum sanctorum.'
        };
      }
      return b;
    }));

    alert(`Puja Booking #${selectedProofBooking.booking_code} marked COMPLETED. Devotee can now view verified sanctum proof media in their dashboard.`);
    setSelectedProofBooking(null);
    setProofMediaUrlInput('');
    setProofNotesInput('');
  };

  // 4. Refund Review
  const handleReviewRefund = (refundId, status) => {
    setRefundQueue(prev => prev.map(r => {
      if (r.id === refundId) {
        return { ...r, status };
      }
      return r;
    }));
    alert(`Refund Request #${refundId} marked as ${status.toUpperCase()}. Payout scheduled.`);
  };

  return (
    <div className="min-h-screen bg-ivory-50 pb-20 font-sans text-charcoal-900 animate-fade-in">
      
      {/* Admin Top Header */}
      <div className="bg-charcoal-950 text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 border-b border-charcoal-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-temple-gold-500/20 text-temple-gold-400 border border-temple-gold-500/30">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-wide">
                Shiri Mandir Compliance & Operations Portal
              </h1>
              <p className="text-xs text-charcoal-400 mt-0.5">
                Statutory Governance • Real-Time Inventory • Proof-of-Service Audits
              </p>
            </div>
          </div>

          <button 
            onClick={onExitAdmin}
            className="flex items-center gap-2 bg-charcoal-800 hover:bg-charcoal-700 px-4 py-2 rounded-xl transition-colors text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Exit Admin Mode
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 space-y-8">
        
        {/* Compliance Telemetry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Volume Consecrated', value: '₹5,55,000', icon: IndianRupee, color: 'text-copper-600', bg: 'bg-copper-50', sub: 'Stored in integer paise' },
            { label: 'Proof-of-Service Compliance', value: '100.0%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Zero unproven completions' },
            { label: 'FSSAI Queue (Edible Items)', value: '1 Pending', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Mandatory 14-digit license' },
            { label: 'Refund Requests Pending', value: `${refundQueue.filter(r => r.status === 'requested').length} Requests`, icon: Clock, color: 'text-vermilion-600', bg: 'bg-vermilion-50', sub: 'Auto-enforced timeframes' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-xs border border-ivory-200">
              <div className="flex items-center gap-3.5">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-charcoal-500 font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-charcoal-900 font-mono mt-0.5">{stat.value}</p>
                  <p className="text-[10px] text-charcoal-400 mt-0.5">{stat.sub}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-ivory-200 flex overflow-x-auto gap-2 text-xs font-bold">
          {[
            { id: 'temples', label: '1. Temple Affiliation Review' },
            { id: 'prasad', label: '2. Prasad FSSAI Approvals' },
            { id: 'proofs', label: '3. Puja Proof-of-Service Upload' },
            { id: 'refunds', label: '4. Refund Request Review Queue' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === t.id 
                  ? 'bg-charcoal-900 text-white shadow-xs' 
                  : 'text-charcoal-600 hover:bg-ivory-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SECTION 1: TEMPLE AFFILIATION REVIEW */}
        {activeTab === 'temples' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900">
                  Temple Affiliation & Verification Management
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Rule: "partnered" or "official" requires a signed affiliation_proof_doc on file before it can be set. Never default to implying affiliation.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ivory-200 bg-ivory-50 text-charcoal-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Temple Name</th>
                    <th className="py-3 px-4">Current Verification Tier</th>
                    <th className="py-3 px-4">Affiliation Document on File</th>
                    <th className="py-3 px-4">Wait Time Telemetry</th>
                    <th className="py-3 px-4 text-right">Promote / Change Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {temples?.map(t => {
                    const status = t.verification_status || (t.trustBadge ? 'official' : 'independent');
                    const hasDoc = Boolean(t.affiliation_proof_doc || t.trustBadge);
                    return (
                      <tr key={t.id} className="hover:bg-ivory-50/60 transition-colors">
                        <td className="py-4 px-4 font-bold text-charcoal-900">
                          {t.name}
                          <span className="block text-[11px] text-charcoal-500 font-normal">{t.location}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            status === 'official' ? 'bg-emerald-100 text-emerald-800' :
                            status === 'partnered' ? 'bg-amber-100 text-amber-800' :
                            'bg-charcoal-100 text-charcoal-700'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {hasDoc ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              MOU / Doc on File
                            </span>
                          ) : (
                            <span className="text-charcoal-400 italic">No document on file</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <input 
                            type="number"
                            defaultValue={t.current_wait_minutes || t.waitMinutes || 20}
                            className="w-16 p-1.5 border border-ivory-300 rounded-lg text-center font-mono font-bold"
                            onBlur={(e) => onUpdateWaitTime && onUpdateWaitTime(t.id, parseInt(e.target.value, 10))}
                          /> min
                        </td>
                        <td className="py-4 px-4 text-right space-x-1.5">
                          {['independent', 'partnered', 'official'].map(tier => (
                            <button
                              key={tier}
                              onClick={() => handleUpdateTempleTier(t.id, tier)}
                              disabled={status === tier}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                                status === tier 
                                  ? 'bg-ivory-200 text-charcoal-400 cursor-default' 
                                  : 'bg-white border border-ivory-300 text-charcoal-700 hover:bg-charcoal-900 hover:text-white'
                              }`}
                            >
                              {tier}
                            </button>
                          ))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 2: PRASAD FSSAI APPROVALS */}
        {activeTab === 'prasad' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal-900">
                Prasad Food Safety & 14-Digit FSSAI License Manager
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Rule: prasad_items.fssai_license_no mandatory for any is_edible item; item stays inactive until verified by admin. No fake urgency.
              </p>
            </div>

            <div className="space-y-4">
              {prasadQueue.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-charcoal-900 text-sm">{item.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.fssai_verified ? 'bg-emerald-100 text-emerald-800' : 'bg-vermilion-100 text-vermilion-800'
                      }`}>
                        {item.fssai_verified ? 'Verified & Active' : 'Awaiting FSSAI Verification'}
                      </span>
                    </div>

                    <p className="text-charcoal-500">{item.temple_name}</p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-ivory-300 text-charcoal-800 font-bold">
                        FSSAI: {item.fssai_license_no || 'Missing'}
                      </span>
                      <span className="text-charcoal-600">
                        Real Stock: <strong className="font-mono">{item.stock_qty}</strong> units
                      </span>
                      <span className="text-copper-600 font-bold font-mono">
                        ₹{item.price}
                      </span>
                    </div>
                  </div>

                  <div>
                    {!item.fssai_verified ? (
                      <button
                        onClick={() => handleApproveFSSAI(item.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Verify FSSAI & Activate
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <Check className="w-4 h-4" /> Live on Public Store
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 3: PUJA PROOF-OF-SERVICE UPLOAD */}
        {activeTab === 'proofs' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal-900">
                Consecrated Seva Proof-of-Service Portal
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Rule: bookings.proof_media_url — puja can ONLY be marked "completed" if photo/video proof is attached for the devotee.
              </p>
            </div>

            <div className="space-y-4">
              {pendingProofBookings.map(b => (
                <div key={b.id} className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-charcoal-900">#{b.booking_code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-charcoal-900">{b.puja_title}</h4>
                    <p className="text-charcoal-500">{b.temple_name}</p>
                    <p className="text-charcoal-600">
                      Devotee: <strong>{b.devotee_name}</strong> (Gotra: {b.gotra}) • Scheduled: {b.scheduled_date}
                    </p>

                    {b.proof_media_url && (
                      <p className="text-emerald-700 font-mono text-[11px] pt-1">
                        Proof attached: {b.proof_media_url}
                      </p>
                    )}
                  </div>

                  <div>
                    {b.status !== 'completed' ? (
                      <button
                        onClick={() => setSelectedProofBooking(b)}
                        className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-temple-gold-400" />
                        Attach Proof & Complete Puja
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Completed with Verified Proof
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Modal Drawer */}
            {selectedProofBooking && (
              <div className="p-6 rounded-2xl bg-ivory-100 border border-ivory-300 space-y-4 animate-scale-in">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-charcoal-900 text-sm">
                    Upload Proof of Service for #{selectedProofBooking.booking_code}
                  </h3>
                  <button onClick={() => setSelectedProofBooking(null)} className="text-charcoal-400">✕</button>
                </div>

                <form onSubmit={handleCompleteBookingWithProof} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">
                      Sanctum Photo / Video Proof Media URL (or S3 Object URL) *
                    </label>
                    <input 
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/... or https://bucket.s3.ap-south-1.amazonaws.com/..."
                      value={proofMediaUrlInput}
                      onChange={e => setProofMediaUrlInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-xs outline-none focus:border-copper-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-charcoal-700 mb-1">
                      Archaka Consecration Notes *
                    </label>
                    <textarea 
                      rows={2}
                      required
                      placeholder="State exact Vedic mantras, bilva count, or archana completed..."
                      value={proofNotesInput}
                      onChange={e => setProofNotesInput(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-ivory-300 text-charcoal-900 text-xs outline-none focus:border-copper-500"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedProofBooking(null)}
                      className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                    >
                      Verify Proof & Mark Completed
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* SECTION 4: REFUND REQUEST REVIEW QUEUE */}
        {activeTab === 'refunds' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal-900">
                Statutory Refund & Cancellation Queue
              </h2>
              <p className="text-xs text-charcoal-500 mt-0.5">
                Rule: refund_requests table + auto-enforced cancellation policy shown pre-payment. Deductions calculated mathematically.
              </p>
            </div>

            <div className="space-y-4">
              {refundQueue.map(r => (
                <div key={r.id} className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-charcoal-900">#{r.refund_code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'rejected' ? 'bg-vermilion-100 text-vermilion-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <p className="font-semibold text-charcoal-900">{r.target}</p>
                    <p className="text-charcoal-500">Devotee: {r.devotee}</p>
                    <p className="text-charcoal-600 italic">"{r.reason}"</p>

                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-charcoal-600">
                        Paid: <strong className="font-mono">₹{r.requested_amount_inr}</strong>
                      </span>
                      <span className="text-emerald-700 font-bold">
                        Calculated Payout: <strong className="font-mono">₹{r.eligible_amount_inr}</strong>
                      </span>
                      <span className="text-[10px] bg-ivory-200 text-charcoal-600 px-2 py-0.5 rounded">
                        Tier: {r.policy_tier}
                      </span>
                    </div>
                  </div>

                  {r.status === 'requested' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReviewRefund(r.id, 'approved')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm"
                      >
                        Approve Payout
                      </button>
                      <button
                        onClick={() => handleReviewRefund(r.id, 'rejected')}
                        className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-200 text-xs"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
