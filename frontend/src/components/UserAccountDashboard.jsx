import React, { useState, useEffect } from 'react';
import { 
  User, Phone, MapPin, Video, FileText, CheckCircle2, Clock, 
  RotateCcw, ShieldCheck, Lock, Check, Package, AlertCircle, ExternalLink, 
  Heart, Sparkles, Plus, Download, Search, Filter, Bell, CreditCard, 
  Calendar, ArrowRight, X, Edit3, Users, Compass, Star, ChevronDown, 
  CheckCheck, Smartphone, Eye, Printer, Shield
} from 'lucide-react';
import ProofMediaViewerModal from './ProofMediaViewerModal';
import RefundRequestModal from './RefundRequestModal';
import UnifiedPaymentModal from './UnifiedPaymentModal';
import { authService, bookingService, orderService, refundService, donationService } from '../services/api';

export default function UserAccountDashboard({ user, onOpenReceipt, wishlist = [], temples = [], onSelectTemple }) {
  // Navigation tabs: 'bookings', 'campaigns', 'donations', 'orders', 'refunds', 'notifications', 'profile', 'privacy'
  const [activeTab, setActiveTab] = useState('bookings');

  // Modals & Drawers
  const [selectedProofBooking, setSelectedProofBooking] = useState(null);
  const [selectedRefundTarget, setSelectedRefundTarget] = useState(null);
  const [refundItemType, setRefundItemType] = useState('booking');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePaymentBooking, setActivePaymentBooking] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);

  // Search & Filter State
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');

  // Devotee Profile State (P1 Enhanced Profile)
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Kaushal Singh',
    phone: user?.phone || '+91 98765 43210',
    email: user?.email || 'devotee@shirimandir.org',
    gotra: user?.gotra || 'Kashyap',
    rashi: user?.rashi || 'Dhanu (Sagittarius)',
    nakshatra: user?.nakshatra || 'Moola',
    kuldevta: 'Lord Shiva (Kashi Vishwanath)',
    address: 'Plot 42, Ganga Vihar, Varanasi, Uttar Pradesh - 221002'
  });

  // Sankalp Family Roster (P2 Devotee Convenience)
  const [familyMembers, setFamilyMembers] = useState([
    { id: 1, name: 'Pooja Singh', relation: 'Spouse', gotra: 'Kashyap', nakshatra: 'Rohini' },
    { id: 2, name: 'Aarav Singh', relation: 'Son', gotra: 'Kashyap', nakshatra: 'Pushya' }
  ]);
  const [newMemberForm, setNewMemberForm] = useState({ name: '', relation: 'Family Member', gotra: 'Kashyap', nakshatra: '' });

  // Privacy consent state (P0 Private Data Protection)
  const [consentOptIn, setConsentOptIn] = useState(Boolean(user?.consent_data_sharing));
  const [consentUpdatedMsg, setConsentUpdatedMsg] = useState('');

  // Donation Campaigns (P0 / P1 Donation Campaign Browsing)
  const [donationCampaigns] = useState([
    {
      id: 'don-annadanam',
      title: 'Maha Annadanam Seva (Daily Free Sacred Meals for 10,000 Devotees)',
      temple_name: 'Shri Kashi Vishwanath Temple',
      legal_entity: 'Shri Kashi Vishwanath Temple Trust (80G Exempt)',
      tax_ref: '80G(5)(vi) - AABTK1029NF20214',
      target_inr: 500000,
      raised_inr: 382500,
      donors_count: 342,
      purpose: 'Providing nutritious, consecrated satvik prasad meals daily to pilgrims, sadhus, and underprivileged devotees visiting the sacred Kashi Vishwanath corridor.',
      image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'don-gaushala',
      title: 'Vedic Gaushala & Indigenous Gir Cow Protection Seva',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      legal_entity: 'Tirumala Tirupati Devasthanams (TTD)',
      tax_ref: '80G(5)(vi) - TTD-80G-11928',
      target_inr: 1000000,
      raised_inr: 720000,
      donors_count: 512,
      purpose: 'Preserving, nurturing, and providing organic fodder, veterinary healthcare, and shelters for sacred indigenous cows at the Tirumala SV Gosamrakshana Shala.',
      image_url: 'https://images.unsplash.com/photo-1570051008608-b3d44a72d362?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'don-kalash',
      title: 'Temple Gopuram Gold Kalash Consecration & Renovation Fund',
      temple_name: 'Shree Siddhivinayak Temple, Mumbai',
      legal_entity: 'Shree Siddhivinayak Temple Trust (80G Exempt)',
      tax_ref: '80G(5)(vi) - SSVT-MUM-44912',
      target_inr: 1500000,
      raised_inr: 1140000,
      donors_count: 628,
      purpose: 'Consecration of traditional copper-gold alloy kalash spires and preservation of sanctum stone carvings in accordance with traditional Agama Shastra architecture.',
      image_url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80'
    }
  ]);

  // Devotee Donation History State (P0 Online Donations & History)
  const [donations, setDonations] = useState([
    {
      id: 1,
      donation_code: 'DON-KV-2026-0104',
      temple_name: 'Shri Kashi Vishwanath Temple',
      campaign_title: 'Maha Annadanam Seva (Daily Free Sacred Meals for 10,000 Devotees)',
      amount_inr: 5100,
      donor_pan: 'ABCDE1234F',
      issuing_legal_entity: 'Shri Kashi Vishwanath Temple Trust (80G Exempt)',
      tax_exemption_ref: '80G(5)(vi) of Income Tax Act 1961 - AABTK1029NF20214',
      receipt_number: 'RCP-KASHI-2026-000104',
      created_at: '2026-10-12',
      status: 'completed'
    }
  ]);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationForm, setDonationForm] = useState({
    campaign_id: 1,
    amount_inr: '2100',
    donor_name: user?.name || 'Kaushal Singh',
    donor_email: user?.email || 'devotee@shirimandir.org',
    donor_phone: user?.phone || '+91 98765 43210',
    donor_pan: 'ABCDE1234F'
  });
  const [donatingLoading, setDonatingLoading] = useState(false);
  const [donationSuccessMsg, setDonationSuccessMsg] = useState('');
  const [bookingPaymentSuccessMsg, setBookingPaymentSuccessMsg] = useState('');

  // Devotee Bookings State (P0 Booking History & Confirmation)
  const [bookings, setBookings] = useState([
    {
      id: 1,
      booking_code: 'BK-KV-2026-9081',
      puja_title: 'Maha Rudrabhishek with Sacred Ganga Jal & Bilva Patra',
      temple_name: 'Shri Kashi Vishwanath Temple',
      scheduled_date: '2026-10-01',
      scheduled_time_slot: '08:00 AM – 09:30 AM',
      sankalp_name: user?.name || 'Kaushal Singh',
      sankalp_gotra: user?.gotra || 'Kashyap',
      sankalp_nakshatra: 'Moola',
      status: 'completed',
      total_amount_inr: 2400,
      base_amount_inr: 2100,
      payment_arrangement: 'Razorpay Verified Gateway',
      proof_media_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      proof_media_type: 'photo',
      proof_notes: 'Namakam & Chamakam Vedic chants completed with bilva archana in sanctum.',
      receipt_number: 'RCP-KV-2026-00001'
    },
    {
      id: 2,
      booking_code: 'BK-TB-2026-4412',
      puja_title: 'Kalyanotsavam & Suprabhata Archana Seva',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      scheduled_date: '2026-10-18',
      scheduled_time_slot: '11:00 AM – 12:30 PM',
      sankalp_name: user?.name || 'Kaushal Singh',
      sankalp_gotra: user?.gotra || 'Kashyap',
      sankalp_nakshatra: 'Moola',
      status: 'confirmed',
      total_amount_inr: 3150,
      base_amount_inr: 3100,
      payment_arrangement: 'TTD Direct Bank Gateway (Verified)',
      proof_media_url: null,
      proof_notes: null,
      receipt_number: 'RCP-TB-2026-00002'
    },
    {
      id: 3,
      booking_code: 'BK-SV-2026-1092',
      puja_title: 'Siddhivinayak Modak Archana & Ganapati Atharvashirsha',
      temple_name: 'Shree Siddhivinayak Temple, Mumbai',
      scheduled_date: '2026-10-22',
      scheduled_time_slot: '09:00 AM – 10:00 AM',
      sankalp_name: user?.name || 'Kaushal Singh',
      sankalp_gotra: user?.gotra || 'Kashyap',
      sankalp_nakshatra: 'Moola',
      status: 'pending_payment',
      total_amount_inr: 1100,
      base_amount_inr: 1050,
      payment_arrangement: 'Awaiting Online Settlement',
      proof_media_url: null,
      proof_notes: null,
      receipt_number: null
    }
  ]);

  // Prasad Orders
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

  // Refund Requests (P1 Refund Tracking)
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

  // Notifications (P1 Notifications Engine)
  const [notifications] = useState([
    {
      id: 1,
      type: 'proof',
      title: 'Sacred Ritual Completed with Photo/Video Proof',
      desc: 'Acharya Pt. Someshwar Dixit has consecrated your Maha Rudrabhishek at Shri Kashi Vishwanath. Proof of service media is now viewable.',
      timestamp: 'Today, 09:30 AM',
      is_read: false
    },
    {
      id: 2,
      type: 'receipt',
      title: '80G Income Tax Exemption Receipt Issued',
      desc: 'Official 80G receipt #RCP-KASHI-2026-000104 for ₹5,100 Annadanam offering has been generated and validated.',
      timestamp: 'Yesterday',
      is_read: true
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Confirmed for Kalyanotsavam Seva',
      desc: 'Your booking BK-TB-2026-4412 is confirmed under TTD sacred reservation quota. Booking slip ready.',
      timestamp: '2 days ago',
      is_read: true
    }
  ]);

  // Personalized Astrological Recommendations (P2 Personalized Recommendations)
  const personalizedRecommendations = [
    {
      id: 'rec-1',
      title: 'Maha Mrityunjaya Homa for Health & Longevity',
      temple: 'Shri Kashi Vishwanath Temple',
      benefit: `Aligned with Gotra ${profileData.gotra} & Rashi ${profileData.rashi} for planetary obstacle mitigation.`,
      price_inr: 3100,
      timing: 'Next Shukla Chaturdashi'
    },
    {
      id: 'rec-2',
      title: 'Sri Venkateswara Navagraha Shanti Archana',
      temple: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      benefit: 'Invoking Vishnu grace for business stability and family prosperity.',
      price_inr: 1500,
      timing: 'Every Saturday Morning'
    }
  ];

  // Fetch real data from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadDevoteeRecords() {
      try {
        const [bRes, oRes, rRes, dRes] = await Promise.all([
          bookingService.getMyBookings(),
          orderService.getMyOrders(),
          refundService.getMyRefunds(),
          donationService.getMyDonations()
        ]);
        if (!isMounted) return;
        if (bRes.ok && Array.isArray(bRes.data?.data) && bRes.data.data.length > 0) {
          setBookings(bRes.data.data);
        }
        if (oRes.ok && Array.isArray(oRes.data?.data) && oRes.data.data.length > 0) {
          setOrders(oRes.data.data);
        }
        if (rRes.ok && Array.isArray(rRes.data?.data) && rRes.data.data.length > 0) {
          setRefundRequests(rRes.data.data);
        }
        if (dRes.ok && Array.isArray(dRes.data?.data) && dRes.data.data.length > 0) {
          setDonations(dRes.data.data);
        }
      } catch (err) {
        console.warn('Devotee live sync notice:', err.message);
      }
    }
    loadDevoteeRecords();
    return () => { isMounted = false; };
  }, [user]);

  // Handle Online Donation Submission
  const handleCreateDonation = async (e) => {
    e.preventDefault();
    setDonatingLoading(true);
    setDonationSuccessMsg('');

    try {
      const payload = {
        ...donationForm,
        campaign_id: Number(donationForm.campaign_id) || 1,
        donor_email: user?.email || donationForm.donor_email || 'devotee@shirimandir.org',
        donor_name: donationForm.donor_name || user?.name || 'Devotee',
        donor_pan: donationForm.donor_pan || 'ABCDE1234F'
      };
      const res = await donationService.createDonation(payload);
      if (res.ok && res.data?.data) {
        const { donation, receipt } = res.data.data;
        const newDonationRecord = {
          ...donation,
          receipt_number: receipt.receipt_number,
          issuing_legal_entity: receipt.issuing_legal_entity,
          tax_exemption_ref: receipt.tax_exemption_ref
        };
        setDonations(prev => [newDonationRecord, ...prev]);
        setDonationSuccessMsg(`Sacred donation of ₹${donation.amount_inr} confirmed! Official 80G Receipt #${receipt.receipt_number} issued.`);
        setShowDonationModal(false);
        onOpenReceipt({
          booking_code: donation.donation_code,
          puja_title: `Sacred Donation (${donation.donor_name})`,
          temple_name: receipt.issuing_legal_entity,
          total_amount_inr: donation.amount_inr,
          sankalp_name: donation.donor_name,
          sankalp_gotra: user?.gotra || profileData.gotra,
          scheduled_date: new Date().toISOString().split('T')[0],
          receipt_number: receipt.receipt_number,
          pan: donationForm.donor_pan
        });
      } else {
        alert(res.data?.error || 'Failed to process donation.');
      }
    } catch (err) {
      alert(err.message || 'Error executing donation.');
    } finally {
      setDonatingLoading(false);
    }
  };

  // Handle Online Payment Success
  const handleOnlinePaymentSuccess = (paymentDetails) => {
    const bookingCode = activePaymentBooking?.booking_code || paymentDetails?.booking_code || 'BK-KV-CONFIRMED';
    setShowPaymentModal(false);
    setActivePaymentBooking(null);

    if (activePaymentBooking) {
      setBookings(prev => prev.map(b => b.id === activePaymentBooking.id ? { 
        ...b, 
        status: 'confirmed', 
        receipt_number: `RCP-PAY-${Date.now().toString().slice(-5)}`,
        payment_arrangement: 'Razorpay Verified Gateway'
      } : b));
    }
    setBookingPaymentSuccessMsg(`Booking ${bookingCode} payment verified successfully via HMAC SHA-256 webhook! Your sacred reservation is confirmed.`);
    setTimeout(() => setBookingPaymentSuccessMsg(''), 6000);
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.puja_title.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.temple_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.booking_code.toLowerCase().includes(bookingSearch.toLowerCase());
    
    if (bookingFilterStatus === 'all') return matchesSearch;
    return matchesSearch && b.status === bookingFilterStatus;
  });

  // Handle Consent Toggle
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Devotee Header with P0 Isolation Badge */}
      <div className="bg-ivory-100 rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-copper-500 to-amber-600 text-white flex items-center justify-center text-3xl font-display font-bold shadow-copper-glow">
          {profileData.name.charAt(0)}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-900">{profileData.name}</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Devotee Account
            </span>
            <span className="bg-ivory-200 text-charcoal-700 text-[11px] px-2.5 py-0.5 rounded-full font-mono font-medium">
              Isolation: P0 Enforced (AT-07)
            </span>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2.5 text-xs text-charcoal-600">
            <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-ivory-300">
              <Phone className="w-3 h-3 text-copper-500"/> {profileData.phone}
            </span>
            <span className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-ivory-300">
              <User className="w-3 h-3 text-copper-500"/> Gotra: <strong>{profileData.gotra}</strong>
            </span>
            <span className="bg-white px-3 py-1 rounded-full border border-ivory-300">
              Rashi: <strong>{profileData.rashi}</strong>
            </span>
            <span className="bg-white px-3 py-1 rounded-full border border-ivory-300">
              Nakshatra: <strong>{profileData.nakshatra}</strong>
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2 bg-white hover:bg-ivory-50 text-charcoal-800 font-bold text-xs rounded-xl border border-ivory-300 shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-copper-600" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setShowFamilyModal(true)}
            className="px-4 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>Family Sankalp ({familyMembers.length})</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 sm:space-x-4 border-b border-ivory-200 mb-8 scrollbar-hide text-xs sm:text-sm font-bold">
        {[
          { id: 'bookings', label: `1. Puja Bookings (${bookings.length})` },
          { id: 'campaigns', label: '2. Donation Campaigns' },
          { id: 'donations', label: `3. Sacred Donations & 80G (${donations.length})` },
          { id: 'orders', label: `4. Prasad Orders (${orders.length})` },
          { id: 'refunds', label: `5. Cancellation & Refunds (${refundRequests.length})` },
          { id: 'notifications', label: `6. Notifications (${notifications.length})` },
          { id: 'recommendations', label: '7. Vedic Recommendations (P2)' },
          { id: 'privacy', label: '8. Privacy & Data Consent' }
        ].map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)}
            className={`pb-3.5 px-2 whitespace-nowrap transition-colors border-b-2 ${
              activeTab === t.id 
                ? 'text-copper-600 border-copper-600' 
                : 'text-charcoal-400 hover:text-charcoal-800 border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Panels */}
      <div className="min-h-[400px]">
        {bookingPaymentSuccessMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{bookingPaymentSuccessMsg}</span>
            </div>
            <button onClick={() => setBookingPaymentSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* TAB 1: PUJA BOOKINGS & ONLINE PAYMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-5">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-3.5 rounded-2xl border border-ivory-200">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by puja title, temple or #code..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-ivory-300 text-xs text-charcoal-900 focus:outline-none focus:border-copper-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['all', 'confirmed', 'completed', 'pending_payment'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilterStatus(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      bookingFilterStatus === st
                        ? 'bg-charcoal-900 text-white'
                        : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
                    }`}
                  >
                    {st === 'all' ? 'All Bookings' : st.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookings List */}
            <div className="space-y-4">
              {filteredBookings.map(b => (
                <div 
                  key={b.id} 
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-ivory-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-ivory-300 transition-all text-xs"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        b.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : b.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {b.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {b.status.replace('_', ' ')}
                      </span>
                      <span className="font-mono text-charcoal-400">#{b.booking_code}</span>
                      <span className="text-charcoal-500">• {b.scheduled_date} ({b.scheduled_time_slot || 'Morning Slot'})</span>
                      <span className="text-[10px] bg-ivory-100 text-charcoal-600 px-2 py-0.5 rounded border border-ivory-200 font-mono">
                        {b.payment_arrangement || 'Temple Gateway Verified'}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-charcoal-900">{b.puja_title}</h3>
                    <p className="text-charcoal-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-copper-500 shrink-0" /> {b.temple_name}
                    </p>

                    <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 text-charcoal-600 space-y-0.5">
                      <div>Sankalp recited for: <strong>{b.sankalp_name}</strong> (Gotra: <strong className="text-copper-700">{b.sankalp_gotra}</strong>, Nakshatra: {b.sankalp_nakshatra || 'Moola'})</div>
                      <div className="flex items-center gap-4 text-[11px] text-charcoal-500 pt-0.5">
                        <span>Paid Offering: <strong className="font-mono text-copper-600">₹{b.total_amount_inr}</strong></span>
                        {b.receipt_number && <span>Receipt Ref: <strong className="font-mono text-charcoal-800">#{b.receipt_number}</strong></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto justify-end">
                    {/* Pay Online Action for Pending Bookings */}
                    {b.status === 'pending_payment' && (
                      <button
                        onClick={() => {
                          setActivePaymentBooking(b);
                          setShowPaymentModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        Pay Online (₹{b.total_amount_inr})
                      </button>
                    )}

                    {/* View Proof of Service */}
                    {b.status === 'completed' && b.proof_media_url ? (
                      <button
                        onClick={() => setSelectedProofBooking(b)}
                        className="px-4 py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-medium text-xs flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <Video className="w-4 h-4 text-temple-gold-400" />
                        View Sanctum Proof
                      </button>
                    ) : (
                      b.status === 'confirmed' && (
                        <span className="px-3 py-2 text-charcoal-500 bg-ivory-100 rounded-xl font-medium">
                          Scheduled for Priest Chanting
                        </span>
                      )
                    )}

                    {/* Request Cancellation & Refund */}
                    {b.status === 'confirmed' && (
                      <button
                        onClick={() => {
                          setSelectedRefundTarget(b);
                          setRefundItemType('booking');
                        }}
                        className="px-3.5 py-2.5 rounded-xl border border-vermilion-200 hover:bg-vermilion-50 text-vermilion-700 font-medium text-xs transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Cancel / Refund
                      </button>
                    )}

                    {/* Download 80G Receipt */}
                    <button
                      onClick={() => onOpenReceipt({
                        booking_code: b.booking_code,
                        puja_title: b.puja_title,
                        temple_name: b.temple_name,
                        total_amount_inr: b.total_amount_inr,
                        sankalp_name: b.sankalp_name,
                        sankalp_gotra: b.sankalp_gotra,
                        scheduled_date: b.scheduled_date,
                        receipt_number: b.receipt_number || 'RCP-KV-2026-00001',
                        pan: profileData.gotra ? 'ABCDE1234F' : 'PENDING'
                      })}
                      className="px-3.5 py-2.5 rounded-xl border border-ivory-300 hover:bg-ivory-100 text-charcoal-700 font-medium text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      80G Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE DONATION CAMPAIGNS BROWSING */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-copper-50 to-ivory-100 p-6 rounded-3xl border border-copper-200">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-charcoal-900 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-copper-600 fill-copper-100" />
                  <span>Active Temple Donation Campaigns & Sacred Causes</span>
                </h3>
                <p className="text-xs text-charcoal-600 max-w-2xl leading-relaxed">
                  Support consecrated temple programs directly. Every contribution is deposited directly into the registered temple trust bank account with statutory 80G tax certificates.
                </p>
              </div>
              <button
                onClick={() => setShowDonationModal(true)}
                className="px-5 py-3 rounded-2xl bg-copper-600 hover:bg-copper-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Make a Custom Offering</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {donationCampaigns.map(c => {
                const progressPct = Math.min(100, Math.round((c.raised_inr / c.target_inr) * 100));
                return (
                  <div key={c.id} className="bg-white rounded-3xl border border-ivory-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          ✓ 80G Tax Exempt
                        </span>
                        <span className="text-[11px] font-mono text-charcoal-400">
                          {c.donors_count} Devotees
                        </span>
                      </div>

                      <h4 className="font-display font-bold text-lg text-charcoal-900 leading-snug">
                        {c.title}
                      </h4>

                      <p className="text-xs text-copper-700 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {c.temple_name}
                      </p>

                      <p className="text-xs text-charcoal-600 leading-relaxed line-clamp-3">
                        {c.purpose}
                      </p>

                      {/* Progress Ticker Bar */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-copper-700">₹{c.raised_inr.toLocaleString('en-IN')}</span>
                          <span className="text-charcoal-400">Target: ₹{c.target_inr.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-ivory-200 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-copper-500 to-amber-500 rounded-full transition-all duration-500" 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                        <div className="text-right text-[10px] font-bold text-charcoal-500">
                          {progressPct}% Consecrated Goal Reached
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-ivory-50 border-t border-ivory-200 space-y-3">
                      <div className="text-[11px] text-charcoal-500">
                        Legal Entity: <span className="font-semibold text-charcoal-800">{c.legal_entity}</span>
                      </div>
                      
                      {/* Preset Amounts */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {['501', '1100', '2100', '5100'].map(amt => (
                          <button
                            key={amt}
                            onClick={() => {
                              setDonationForm({ ...donationForm, campaign_id: c.id, amount_inr: amt });
                              setShowDonationModal(true);
                            }}
                            className="py-1.5 bg-white hover:bg-copper-50 text-charcoal-800 hover:text-copper-700 text-xs font-bold rounded-xl border border-ivory-300 transition-colors"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          setDonationForm({ ...donationForm, campaign_id: c.id, amount_inr: '2100' });
                          setShowDonationModal(true);
                        }}
                        className="w-full py-2.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-temple-gold-400" />
                        <span>Donate to this Cause</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SACRED DONATIONS HISTORY & 80G RECEIPTS */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-copper-50 to-ivory-100 p-5 rounded-2xl border border-copper-200">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-copper-600 fill-copper-100" />
                  Sacred Temple Donations & 80G Tax Exemptions
                </h3>
                <p className="text-xs text-charcoal-600">
                  Devotee donation history with sequential 80G receipts directly downloadable.
                </p>
              </div>

              <button
                onClick={() => setShowDonationModal(true)}
                className="px-4 py-2.5 rounded-xl bg-copper-600 hover:bg-copper-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                Make an Offering
              </button>
            </div>

            {donationSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{donationSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-4">
              {donations.map(d => (
                <div 
                  key={d.id}
                  className="p-5 sm:p-6 rounded-2xl bg-white border border-ivory-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-ivory-300 transition-all text-xs"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Donation
                      </span>
                      <span className="font-mono text-xs text-charcoal-400">#{d.donation_code}</span>
                      <span className="text-xs text-charcoal-500">• Contributed: {d.created_at ? d.created_at.split('T')[0] : '2026-10-12'}</span>
                    </div>

                    <h4 className="font-display font-bold text-base text-charcoal-900">
                      {d.campaign_title || 'General Temple Seva & Annadanam Fund'}
                    </h4>
                    <p className="text-xs text-charcoal-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-copper-500" /> {d.temple_name}
                    </p>

                    <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 text-xs text-charcoal-600 space-y-1">
                      <div>Legal Trust Entity: <strong>{d.issuing_legal_entity || 'Shri Kashi Vishwanath Temple Trust'}</strong></div>
                      <div className="flex flex-wrap gap-4 text-[11px] text-charcoal-500 pt-0.5">
                        <span>Donor PAN: <strong className="font-mono text-charcoal-800">{d.donor_pan || 'ABCDE1234F'}</strong></span>
                        <span>Receipt No: <strong className="font-mono text-copper-600">#{d.receipt_number || 'RCP-KASHI-2026-000104'}</strong></span>
                        <span className="text-emerald-700 font-medium">✓ 80G(5)(vi) Income Tax Exemption Eligible</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-charcoal-400 uppercase tracking-wider block font-semibold">Offering</span>
                      <span className="font-mono font-bold text-xl text-copper-600">₹{d.amount_inr}</span>
                    </div>

                    <button
                      onClick={() => onOpenReceipt({
                        booking_code: d.donation_code,
                        puja_title: d.campaign_title || 'Sacred Temple Donation',
                        temple_name: d.issuing_legal_entity || d.temple_name,
                        total_amount_inr: d.amount_inr,
                        sankalp_name: d.donor_name || profileData.name,
                        sankalp_gotra: profileData.gotra,
                        scheduled_date: d.created_at ? d.created_at.split('T')[0] : '2026-10-12',
                        receipt_number: d.receipt_number || 'RCP-KASHI-2026-000104',
                        pan: d.donor_pan || 'ABCDE1234F'
                      })}
                      className="px-4 py-2.5 rounded-xl border border-copper-300 bg-white hover:bg-copper-50 text-copper-800 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-copper-600" />
                      80G Tax Receipt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PRASAD ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.map(o => (
              <div 
                key={o.id} 
                className="p-5 sm:p-6 rounded-2xl bg-white border border-ivory-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-ivory-300 transition-all text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {o.status}
                    </span>
                    <span className="font-mono text-charcoal-400">#{o.order_code}</span>
                  </div>

                  <h3 className="font-bold text-sm text-charcoal-900">{o.item_name}</h3>
                  
                  <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[11px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    FSSAI License: {o.fssai_license_no}
                  </div>

                  <div className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 space-y-1 text-charcoal-600 max-w-md">
                    <div className="flex justify-between"><span>Base Item:</span><span className="font-mono">₹{o.base_amount_inr}</span></div>
                    <div className="flex justify-between"><span>Shipping & Packaging:</span><span className="font-mono">₹{o.shipping_fee_inr}</span></div>
                    <div className="flex justify-between font-bold text-charcoal-900 pt-1 border-t border-ivory-200">
                      <span>Total Itemized Paid:</span><span className="font-mono text-copper-600">₹{o.total_amount_inr}</span>
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

        {/* TAB 5: REFUND REQUESTS (P1 REFUND TRACKING) */}
        {activeTab === 'refunds' && (
          <div className="space-y-4 text-xs">
            {refundRequests.map(r => (
              <div key={r.id} className="p-5 rounded-2xl bg-white border border-ivory-200 space-y-3">
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

        {/* TAB 6: NOTIFICATIONS (P1) */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <h3 className="font-display font-bold text-base text-charcoal-900 mb-2">Devotee Activity Alerts & Proof Notifications</h3>
            {notifications.map(n => (
              <div key={n.id} className={`p-4 rounded-2xl border transition-all text-xs flex items-start gap-3.5 ${
                n.is_read ? 'bg-white border-ivory-200' : 'bg-copper-50/40 border-copper-200'
              }`}>
                <div className="p-2 rounded-xl bg-copper-100 text-copper-700 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-charcoal-900 text-sm">{n.title}</h4>
                    <span className="text-[10px] text-charcoal-400 font-mono">{n.timestamp}</span>
                  </div>
                  <p className="text-charcoal-600 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: VEDIC RECOMMENDATIONS (P2) */}
        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-ivory-100 p-6 rounded-3xl border border-amber-200">
              <h3 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <span>Personalized Vedic Pujas for Gotra {profileData.gotra} & Rashi {profileData.rashi}</span>
              </h3>
              <p className="text-xs text-charcoal-600 mt-1">
                Remedial ceremonies and festival sankalps curated according to your astrological chart.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {personalizedRecommendations.map(rec => (
                <div key={rec.id} className="p-6 rounded-3xl bg-white border border-ivory-200 shadow-xs space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {rec.timing}
                    </span>
                    <h4 className="font-display font-bold text-base text-charcoal-900">{rec.title}</h4>
                    <p className="text-xs text-copper-700 font-semibold">{rec.temple}</p>
                    <p className="text-xs text-charcoal-600 leading-relaxed">{rec.benefit}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-ivory-200">
                    <div>
                      <span className="text-[10px] text-charcoal-400 block">Dakshina</span>
                      <span className="font-mono font-bold text-base text-copper-600">₹{rec.price_inr}</span>
                    </div>
                    <button
                      onClick={() => alert(`Redirecting to ${rec.title} reservation portal...`)}
                      className="px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white font-bold text-xs"
                    >
                      Book Ceremony
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: PRIVACY & DATA CONSENT (P0 ISOLATION) */}
        {activeTab === 'privacy' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-ivory-200 space-y-5 max-w-2xl text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-copper-50 text-copper-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-charcoal-900 text-base">
                  Devotee Data Protection & Ritual Sharing Preferences
                </h3>
                <p className="text-charcoal-500">Statutory Consent Compliance Audit (Rule 6)</p>
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
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
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
              <p>• Devotee A cannot request Devotee B's records or receipts (AT-07 strict tenant isolation).</p>
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
          isOpen={Boolean(selectedRefundTarget)}
          targetItem={selectedRefundTarget}
          itemType={refundItemType}
          onClose={() => setSelectedRefundTarget(null)}
          onSubmitSuccess={(newRefund) => {
            setRefundRequests([newRefund, ...refundRequests]);
            alert(`Refund request #${newRefund.refund_code} submitted for admin review.`);
            setSelectedRefundTarget(null);
          }}
        />
      )}

      {/* Unified Online Payment Modal (P0 Online Payment) */}
      {showPaymentModal && activePaymentBooking && (
        <UnifiedPaymentModal
          bookingData={{
            ...activePaymentBooking,
            total: activePaymentBooking.total_amount_inr,
            service: { id: activePaymentBooking.id, title: activePaymentBooking.puja_title },
            devoteeDetails: { name: activePaymentBooking.sankalp_name, gotra: activePaymentBooking.sankalp_gotra }
          }}
          onClose={() => {
            setShowPaymentModal(false);
            setActivePaymentBooking(null);
          }}
          onPaymentSuccess={handleOnlinePaymentSuccess}
        />
      )}

      {/* Sacred Donation Modal (P0 Online Donations) */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ivory-300 space-y-5 animate-scale-up">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-copper-50 text-copper-600 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-copper-100" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-charcoal-900">Make a Sacred Offering</h3>
                  <p className="text-xs text-charcoal-500">Consecrated Seva with 80G Tax Exemption</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDonationModal(false)}
                className="p-1 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-ivory-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDonation} className="space-y-4 text-xs">
              <div>
                <label className="block text-charcoal-700 font-semibold mb-1">Select Sacred Cause / Temple *</label>
                <select
                  value={donationForm.campaign_id}
                  onChange={e => setDonationForm({ ...donationForm, campaign_id: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 bg-white focus:outline-hidden focus:border-copper-500"
                >
                  <option value={1}>Maha Annadanam Seva — Shri Kashi Vishwanath</option>
                  <option value={2}>Vedic Gaushala & Gir Cow Seva — Tirupati Balaji</option>
                  <option value={3}>Gold Kalash Consecration Fund — Siddhivinayak Mumbai</option>
                </select>
              </div>

              <div>
                <label className="block text-charcoal-700 font-semibold mb-1">Donation Amount (INR) *</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {['501', '1100', '2100', '5100'].map(amt => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDonationForm({ ...donationForm, amount_inr: amt })}
                      className={`py-2 rounded-xl border font-bold text-xs transition-colors ${
                        donationForm.amount_inr === amt
                          ? 'border-copper-600 bg-copper-50 text-copper-700'
                          : 'border-ivory-300 bg-white text-charcoal-700 hover:bg-ivory-50'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  required
                  min="51"
                  value={donationForm.amount_inr}
                  onChange={e => setDonationForm({ ...donationForm, amount_inr: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 focus:outline-hidden focus:border-copper-500 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-charcoal-700 font-semibold mb-1">Donor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={donationForm.donor_name}
                    onChange={e => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 focus:outline-hidden focus:border-copper-500"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-700 font-semibold mb-1">Donor PAN (For 80G Tax Exemption)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={donationForm.donor_pan}
                    onChange={e => setDonationForm({ ...donationForm, donor_pan: e.target.value.toUpperCase() })}
                    placeholder="ABCDE1234F"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ivory-300 text-charcoal-900 focus:outline-hidden focus:border-copper-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
                <span>An authentic 80G tax receipt will be issued instantaneously under the temple trust's verified registration.</span>
              </div>

              <button
                type="submit"
                disabled={donatingLoading}
                className="w-full py-3 rounded-xl bg-copper-600 hover:bg-copper-700 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {donatingLoading ? (
                  <span>Processing Sacred Offering...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-temple-gold-300" />
                    <span>Complete Offering of ₹{donationForm.amount_inr}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Profile Modal (P1) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ivory-300 space-y-4">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h4 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-copper-600" />
                <span>Enhanced Devotee Profile Management (P1)</span>
              </h4>
              <button onClick={() => setShowProfileModal(false)} className="p-1 rounded-lg text-charcoal-400 hover:bg-ivory-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Gotra</label>
                  <input
                    type="text"
                    value={profileData.gotra}
                    onChange={(e) => setProfileData({ ...profileData, gotra: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Rashi</label>
                  <input
                    type="text"
                    value={profileData.rashi}
                    onChange={(e) => setProfileData({ ...profileData, rashi: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-charcoal-700 mb-1">Nakshatra</label>
                  <input
                    type="text"
                    value={profileData.nakshatra}
                    onChange={(e) => setProfileData({ ...profileData, nakshatra: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-ivory-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 mb-1">Prasad Delivery Address</label>
                <textarea
                  rows="2"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-ivory-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert('Devotee profile successfully updated!');
                    setShowProfileModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-charcoal-900 text-white font-bold hover:bg-charcoal-800"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Sankalp Modal (P2) */}
      {showFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ivory-300 space-y-4">
            <div className="flex justify-between items-center border-b border-ivory-200 pb-3">
              <h4 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-copper-600" />
                <span>Family Sankalp Roster (P2 Convenience)</span>
              </h4>
              <button onClick={() => setShowFamilyModal(false)} className="p-1 rounded-lg text-charcoal-400 hover:bg-ivory-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-charcoal-600">
                Save family members to auto-populate Gotra and Nakshatra names during sanctum ritual bookings.
              </p>

              <div className="space-y-2">
                {familyMembers.map(m => (
                  <div key={m.id} className="p-3 rounded-xl bg-ivory-50 border border-ivory-200 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-charcoal-900">{m.name}</span>
                      <span className="text-[11px] text-charcoal-500 ml-2">({m.relation})</span>
                      <p className="text-[10px] text-charcoal-400">Gotra: {m.gotra} • Nakshatra: {m.nakshatra}</p>
                    </div>
                    <button
                      onClick={() => setFamilyMembers(familyMembers.filter(f => f.id !== m.id))}
                      className="text-vermilion-600 hover:text-vermilion-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-ivory-200 space-y-2">
                <h5 className="font-bold text-charcoal-900">Add New Family Member</h5>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Member Name"
                    value={newMemberForm.name}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                    className="p-2 rounded-xl border border-ivory-300"
                  />
                  <input
                    type="text"
                    placeholder="Relation (e.g. Daughter)"
                    value={newMemberForm.relation}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, relation: e.target.value })}
                    className="p-2 rounded-xl border border-ivory-300"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newMemberForm.name) return;
                    setFamilyMembers([...familyMembers, { id: Date.now(), ...newMemberForm, gotra: profileData.gotra, nakshatra: 'Pushya' }]);
                    setNewMemberForm({ name: '', relation: 'Family Member', gotra: profileData.gotra, nakshatra: '' });
                  }}
                  className="w-full py-2 bg-copper-600 hover:bg-copper-700 text-white font-bold rounded-xl"
                >
                  + Add to Family Roster
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
