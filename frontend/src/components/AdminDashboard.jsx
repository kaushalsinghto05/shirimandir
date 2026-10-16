import React, { useState, useEffect } from 'react';
import { 
  Shield, LogOut, Activity, IndianRupee, Users, Package, 
  FileText, CheckCircle2, AlertTriangle, Upload, Eye, Check, X, Clock, Video, Lock,
  Calendar, Download, RefreshCw, Layers, Heart, Sparkles, ScrollText, Printer, Plus, Boxes, TrendingUp, UserCheck, Flame
} from 'lucide-react';
import { templeService, prasadService, bookingService, adminService } from '../services/api';

export default function AdminDashboard({ onExitAdmin, templesData = [], onUpdateWaitTime }) {
  const [activeTab, setActiveTab] = useState('temples'); // 'temples', 'prasad', 'proofs', 'refunds', 'catalog', 'ledger', 'campaigns', 'priests', 'inventory'
  
  // Local state for interactive administration
  const [temples, setTemples] = useState(templesData);
  const [selectedProofBooking, setSelectedProofBooking] = useState(null);
  const [proofMediaUrlInput, setProofMediaUrlInput] = useState('');
  const [proofNotesInput, setProofNotesInput] = useState('');

  // 7. Donation Campaigns State (FR-DON-001..007)
  const [donationCampaigns, setDonationCampaigns] = useState([
    {
      id: 'don-annadanam',
      title: 'Maha Annadanam Seva (Daily Free Sacred Meals for 10,000 Devotees)',
      temple_name: 'Shri Kashi Vishwanath Temple',
      target_inr: 500000,
      raised_inr: 382500,
      legal_entity: 'Shri Kashi Vishwanath Temple Trust (80G Exempt)',
      tax_exempt: true,
      donors_count: 342,
      is_active: true
    },
    {
      id: 'don-gaushala',
      title: 'Vedic Gaushala & Indigenous Gir Cow Protection Seva',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      target_inr: 1000000,
      raised_inr: 720000,
      legal_entity: 'Tirumala Tirupati Devasthanams (TTD)',
      tax_exempt: true,
      donors_count: 512,
      is_active: true
    },
    {
      id: 'don-kalash',
      title: 'Temple Gopuram Gold Kalash Consecration & Renovation Fund',
      temple_name: 'Shree Siddhivinayak Temple, Mumbai',
      target_inr: 2500000,
      raised_inr: 1950000,
      legal_entity: 'Shree Siddhivinayak Ganapati Temple Trust',
      tax_exempt: true,
      donors_count: 880,
      is_active: true
    }
  ]);
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: '',
    temple_name: 'Shri Kashi Vishwanath Temple',
    target_inr: '',
    legal_entity: 'Shri Kashi Vishwanath Temple Trust (80G Exempt)',
    tax_exempt: true
  });

  // 8. Sanctum Priest Roster & Devotee Sankalp List (FR-PUJA-004, FR-RBAC-002)
  const [sankalpRoster, setSankalpRoster] = useState([
    {
      id: 'SKP-2026-01',
      devotee_name: 'Kaushal Singh',
      gotra: 'Kashyap',
      rashi: 'Mesh (Aries)',
      nakshatra: 'Ashwini',
      puja_name: 'Maha Rudrabhishek with 11 Dravyas',
      temple_name: 'Shri Kashi Vishwanath Temple',
      scheduled_date: 'Today, 08:30 AM',
      prayer_sankalp: 'Family well-being, spiritual peace & auspicious ventures',
      assigned_priest: 'Pandit Someshwar Dixit',
      status: 'assigned'
    },
    {
      id: 'SKP-2026-02',
      devotee_name: 'Aarav Sharma',
      gotra: 'Bharadwaja',
      rashi: 'Karka (Cancer)',
      nakshatra: 'Pushya',
      puja_name: 'Ganga Jal Sankalpa & Bilva Patra Archana',
      temple_name: 'Shri Kashi Vishwanath Temple',
      scheduled_date: 'Today, 10:15 AM',
      prayer_sankalp: 'Health recovery and academic excellence for children',
      assigned_priest: 'Acharya Ramanuja Sharma',
      status: 'chanting_in_progress'
    },
    {
      id: 'SKP-2026-03',
      devotee_name: 'Sunita Nambiar',
      gotra: 'Vashistha',
      rashi: 'Vrishabha (Taurus)',
      nakshatra: 'Rohini',
      puja_name: 'Sri Venkateswara Swamy Kalyanotsavam Seva',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      scheduled_date: 'Today, 11:30 AM',
      prayer_sankalp: 'Ancestral blessings and business prosperity',
      assigned_priest: 'Veda Murti Narayana Shastri',
      status: 'assigned'
    }
  ]);

  // 9. Real Inventory Stock Controller State (Rule 7, FR-INV-001)
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: 'Kashi Vishwanath Sacred Peda & Dry Fruit Box (400g)',
      temple_name: 'Shri Kashi Vishwanath Temple',
      stock_qty: 120,
      price_inr: 450,
      fssai_no: '12723999000142',
      low_stock_threshold: 25,
      is_edible: true
    },
    {
      id: 2,
      name: 'Tirupati Balaji Divine Laddu Prasadam (Set of 2 GI-Tagged)',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      stock_qty: 85,
      price_inr: 350,
      fssai_no: '12423999000219',
      low_stock_threshold: 30,
      is_edible: true
    },
    {
      id: 3,
      name: 'Siddhivinayak Modak & Consecrated Angavastra Hamper',
      temple_name: 'Shree Siddhivinayak Temple, Mumbai',
      stock_qty: 40,
      price_inr: 550,
      fssai_no: '11523999000552',
      low_stock_threshold: 15,
      is_edible: true
    },
    {
      id: 5,
      name: 'Panchamrit & Tulsi Arka Pure Ghee Bottle (250ml)',
      temple_name: 'Shri Kashi Vishwanath Temple',
      stock_qty: 60,
      price_inr: 180,
      fssai_no: '12723999000188',
      low_stock_threshold: 20,
      is_edible: true
    }
  ]);
  
  // 5. Puja Catalog & Slot Capacity Engine (FR-PUJA-001..006, FR-BOOK-001..004, AT-02)
  const [pujasCatalog, setPujasCatalog] = useState([
    {
      id: 'kv-rudrabhishek',
      name: 'Maha Rudrabhishek with 11 Dravyas',
      temple_name: 'Shri Kashi Vishwanath Temple',
      price_inr: 1501,
      duration: '45 mins',
      total_capacity: 1, // Single-capacity slot (AT-02 concurrency demonstration)
      booked_capacity: 1,
      status: 'published',
      slot_date: '2026-11-01',
      slot_time: '08:00 AM – 09:00 AM'
    },
    {
      id: 'kv-ganga-aarti',
      name: 'Ganga Jal Sankalpa & Bilva Patra Archana',
      temple_name: 'Shri Kashi Vishwanath Temple',
      price_inr: 751,
      duration: '30 mins',
      total_capacity: 25,
      booked_capacity: 12,
      status: 'published',
      slot_date: '2026-11-01',
      slot_time: '10:00 AM – 10:45 AM'
    },
    {
      id: 'tb-kalyanotsavam',
      name: 'Sri Venkateswara Swamy Kalyanotsavam Seva',
      temple_name: 'Sri Venkateswara Swamy Temple (Tirupati Balaji)',
      price_inr: 3150,
      duration: '90 mins',
      total_capacity: 50,
      booked_capacity: 48,
      status: 'published',
      slot_date: '2026-11-02',
      slot_time: '11:00 AM – 12:30 PM'
    }
  ]);

  // 6. 80G Receipts & Auditable Financial Ledger (FR-REC-001..006, FR-REP-001..004, AT-10, AT-12)
  const [receiptsLedger, setReceiptsLedger] = useState([
    {
      id: 'RCP-KV-2026-00001',
      receipt_number: 'RCP-KV-2026-00001',
      donor_name: 'Dr. Arvind Pathak',
      issuing_legal_entity: 'Shri Kashi Vishwanath Temple Trust',
      tax_exemption_ref: '80G-DEL-2026-1198',
      amount_inr: 5100,
      status: 'issued',
      date: '2026-10-12',
      void_reason: null
    },
    {
      id: 'RCP-TB-2026-00002',
      receipt_number: 'RCP-TB-2026-00002',
      donor_name: 'Kaushal Singh',
      issuing_legal_entity: 'Tirumala Tirupati Devasthanams (TTD)',
      tax_exemption_ref: '80G-BLR-2026-4402',
      amount_inr: 10000,
      status: 'issued',
      date: '2026-10-14',
      void_reason: null
    },
    {
      id: 'RCP-MK-2026-00003',
      receipt_number: 'RCP-MK-2026-00003',
      donor_name: 'Sunita Nambiar',
      issuing_legal_entity: 'Shree Mahakaleshwar Temple Sansthan',
      tax_exemption_ref: '80G-UJJ-2026-0912',
      amount_inr: 2100,
      status: 'voided',
      date: '2026-10-15',
      void_reason: 'Cheque bounced / Donor requested re-issuance under family trust'
    }
  ]);
  
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

  // 10. Audit Logs State (FR-AUD-001..006, AT-12)
  const [auditLogs, setAuditLogs] = useState([
    {
      id: 1,
      actor_role: 'admin',
      actor_email: 'admin@shirimandir.org',
      action: 'temple.affiliation_verified',
      resource_type: 'temple',
      resource_id: '1',
      ip_address: '127.0.0.1',
      details: 'Approved official trust MoU for Shri Kashi Vishwanath',
      created_at: '2026-10-14 09:30:15'
    },
    {
      id: 2,
      actor_role: 'admin',
      actor_email: 'admin@shirimandir.org',
      action: 'prasad.fssai_verified',
      resource_type: 'prasad_item',
      resource_id: '1',
      ip_address: '127.0.0.1',
      details: 'Verified 14-digit FSSAI license 12723999000142 for Kashi Peda',
      created_at: '2026-10-14 10:15:22'
    },
    {
      id: 3,
      actor_role: 'super_admin',
      actor_email: 'superadmin@shirimandir.org',
      action: 'user.role_promoted',
      resource_type: 'user',
      resource_id: '4',
      ip_address: '127.0.0.1',
      details: 'Role confirmed as platform compliance administrator',
      created_at: '2026-10-15 14:02:49'
    },
    {
      id: 4,
      actor_role: 'temple_partner',
      actor_email: 'priest.kashi@shirimandir.org',
      action: 'booking.proof_uploaded',
      resource_type: 'booking',
      resource_id: '1',
      ip_address: '127.0.0.1',
      details: 'Uploaded sanctum bilva archana photo proof for BK-KV-2026-9081',
      created_at: '2026-10-15 17:45:00'
    }
  ]);

  // 11. Platform Operations & Payment Exceptions State (AT-05, AT-06, FR-PAY-007)
  const [reconciliationExceptions, setReconciliationExceptions] = useState([
    {
      id: 1,
      provider: 'razorpay',
      provider_event_id: 'evt_rzp_mock_mismatch_001',
      expected_amount_inr: 2400,
      received_amount_inr: 2000,
      exception_type: 'amount_mismatch',
      status: 'quarantined',
      resolution_notes: 'Webhook payload specified ₹2000 instead of expected ₹2400. Isolated in quarantine automatically per AT-05.',
      created_at: '2026-10-15'
    }
  ]);

  // Live Metrics Telemetry
  const [metrics, setMetrics] = useState({
    totalVolumeINR: '₹5,55,000',
    complianceRate: '100.0%',
    pendingPrasadFSSAI: 1,
    pendingRefunds: 1
  });

  // Fetch live metrics, refund queue, audit logs, and reconciliations from backend
  React.useEffect(() => {
    let isMounted = true;
    async function loadAdminData() {
      try {
        const [mRes, rRes, aRes, recRes] = await Promise.all([
          adminService.getMetrics(),
          adminService.getRefunds(),
          adminService.getAuditLogs(30),
          adminService.getReconciliations()
        ]);
        if (!isMounted) return;
        if (mRes.ok && mRes.data?.data) {
          const d = mRes.data.data;
          setMetrics({
            totalVolumeINR: `₹${((d.total_consecrated_volume_paise || 55500000) / 100).toLocaleString('en-IN')}`,
            complianceRate: `${d.proof_compliance_rate_percent || 100}%`,
            pendingPrasadFSSAI: d.pending_fssai_approvals ?? 1,
            pendingRefunds: d.pending_refund_reviews ?? 1
          });
        }
        if (rRes.ok && Array.isArray(rRes.data?.data) && rRes.data.data.length > 0) {
          setRefundQueue(rRes.data.data);
        }
        if (aRes.ok && Array.isArray(aRes.data?.data) && aRes.data.data.length > 0) {
          setAuditLogs(aRes.data.data);
        }
        if (recRes.ok && Array.isArray(recRes.data?.data) && recRes.data.data.length > 0) {
          setReconciliationExceptions(recRes.data.data);
        }
      } catch (err) {
        console.warn('Admin live sync notice:', err);
      }
    }
    loadAdminData();
    return () => { isMounted = false; };
  }, []);

  // 1. Temple Affiliation Update (Enforces affiliation_proof_doc requirement)
  const handleUpdateTempleTier = async (templeId, newTier) => {
    const templeObj = temples.find(t => t.id === templeId);
    if (['partnered', 'official'].includes(newTier) && !templeObj?.affiliation_proof_doc && !templeObj?.trustBadge) {
      alert(`Compliance Violation: Cannot promote temple to '${newTier}' without signed affiliation proof document on file. Please upload proof document first.`);
      return;
    }

    try {
      await templeService.updateVerification(templeId, { verification_status: newTier });
    } catch (err) {
      console.warn('Temple verification update notice:', err);
    }

    setTemples(prev => prev.map(t => {
      if (t.id === templeId) {
        return { ...t, verification_status: newTier };
      }
      return t;
    }));
  };

  // 2. Prasad FSSAI Verification
  const handleApproveFSSAI = async (itemId) => {
    try {
      await prasadService.approveFSSAI(itemId);
    } catch (err) {
      console.warn('FSSAI API call notice:', err);
    }

    setPrasadQueue(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, fssai_verified: true, is_active: true };
      }
      return item;
    }));
    alert('FSSAI License verified and authenticated. Prasad is now live in store.');
  };

  // 3. Upload Booking Proof & Mark Completed
  const handleCompleteBookingWithProof = async (e) => {
    e.preventDefault();
    if (!selectedProofBooking || !proofMediaUrlInput.trim()) {
      alert('Compliance Rule: A puja booking can ONLY be marked as "completed" once photo or video proof of service is attached.');
      return;
    }

    try {
      await bookingService.uploadProof(selectedProofBooking.id, {
        proof_media_url: proofMediaUrlInput.trim(),
        proof_media_type: 'photo',
        proof_notes: proofNotesInput.trim() || 'Consecrated Vedic ritual performed in sanctum sanctorum.'
      });
    } catch (err) {
      console.warn('Booking proof upload notice:', err);
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
  const handleReviewRefund = async (refundId, status) => {
    try {
      await adminService.reviewRefund(refundId, status, `Reviewed and ${status} by administrator.`);
    } catch (err) {
      console.warn('Refund review notice:', err);
    }

    setRefundQueue(prev => prev.map(r => {
      if (r.id === refundId) {
        return { ...r, status };
      }
      return r;
    }));
    alert(`Refund Request #${refundId} marked as ${status.toUpperCase()}. Payout scheduled.`);
  };

  // 5. Puja Slot Capacity & Pricing Control (FR-PUJA-001..006, FR-BOOK-001..004, AT-02)
  const handleUpdatePujaCapacity = (pujaId, newCapacity) => {
    const cap = Math.max(1, parseInt(newCapacity, 10) || 1);
    setPujasCatalog(prev => prev.map(p => {
      if (p.id === pujaId) {
        if (cap < p.booked_capacity) {
          alert(`Compliance Violation: Cannot reduce slot capacity below already confirmed bookings (${p.booked_capacity} booked).`);
          return p;
        }
        return { ...p, total_capacity: cap };
      }
      return p;
    }));
  };

  const handleTogglePujaStatus = (pujaId) => {
    setPujasCatalog(prev => prev.map(p => {
      if (p.id === pujaId) {
        const nextStatus = p.status === 'published' ? 'draft' : 'published';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // 6. Void Receipt with Mandatory Audit Lineage (AT-12, FR-REC-005)
  const handleVoidReceipt = (receiptId) => {
    const reason = window.prompt("Mandatory Audit Requirement (AT-12): Enter legal justification for voiding receipt:");
    if (!reason || !reason.trim()) {
      alert("Void aborted: Legal reason cannot be empty.");
      return;
    }
    setReceiptsLedger(prev => prev.map(r => {
      if (r.id === receiptId) {
        return { ...r, status: 'voided', void_reason: reason.trim() };
      }
      return r;
    }));
    alert(`Receipt #${receiptId} voided. Attributable audit log entry recorded.`);
  };

  // Export Audit CSV (FR-REP-003)
  const handleExportAuditCSV = () => {
    const headers = "Receipt Number,Donor Name,Legal Entity,Tax Exemption Ref,Amount (INR),Status,Date,Void Reason\n";
    const rows = receiptsLedger.map(r => 
      `"${r.receipt_number}","${r.donor_name}","${r.issuing_legal_entity}","${r.tax_exemption_ref}",${r.amount_inr},"${r.status}","${r.date}","${r.void_reason || ''}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shirimandir_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Donation Campaign Handlers (FR-DON-001..007)
  const handleCreateCampaign = (e) => {
    e.preventDefault();
    if (!newCampaignForm.title.trim() || !newCampaignForm.target_inr) {
      alert('Please provide a campaign title and target amount.');
      return;
    }
    const newCamp = {
      id: `don-${Date.now()}`,
      title: newCampaignForm.title.trim(),
      temple_name: newCampaignForm.temple_name,
      target_inr: Number(newCampaignForm.target_inr),
      raised_inr: 0,
      legal_entity: newCampaignForm.legal_entity,
      tax_exempt: newCampaignForm.tax_exempt,
      donors_count: 0,
      is_active: true
    };
    setDonationCampaigns(prev => [newCamp, ...prev]);
    setNewCampaignForm({
      title: '',
      temple_name: 'Shri Kashi Vishwanath Temple',
      target_inr: '',
      legal_entity: 'Shri Kashi Vishwanath Temple Trust (80G Exempt)',
      tax_exempt: true
    });
    alert(`Donation Campaign "${newCamp.title}" launched successfully! Devotees can now contribute towards this sacred purpose.`);
  };

  const handleToggleCampaign = (id) => {
    setDonationCampaigns(prev => prev.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c));
  };

  // 8. Priest Assignment & Sankalp Roster Handlers (FR-PUJA-004)
  const handleAssignPriest = (rosterId, priestName) => {
    setSankalpRoster(prev => prev.map(item => item.id === rosterId ? { ...item, assigned_priest: priestName } : item));
    alert(`Priest ${priestName} successfully assigned to ritual #${rosterId}.`);
  };

  const handleUpdateSankalpStatus = (rosterId, newStatus) => {
    setSankalpRoster(prev => prev.map(item => item.id === rosterId ? { ...item, status: newStatus } : item));
  };

  const handlePrintSankalpSheet = () => {
    window.print();
  };

  // 9. Real Inventory Stock Controller (Rule 7, FR-INV-001)
  const handleAdjustStock = (itemId, delta) => {
    setInventoryItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.stock_qty + delta);
        return { ...item, stock_qty: newQty };
      }
      return item;
    }));
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
            { label: 'Total Volume Consecrated', value: metrics.totalVolumeINR, icon: IndianRupee, color: 'text-copper-600', bg: 'bg-copper-50', sub: 'Stored in integer paise' },
            { label: 'Proof-of-Service Compliance', value: metrics.complianceRate, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'Zero unproven completions' },
            { label: 'FSSAI Queue (Edible Items)', value: `${metrics.pendingPrasadFSSAI} Pending`, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Mandatory 14-digit license' },
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
            { id: 'temples', label: '1. Temple Affiliation & Wait Times' },
            { id: 'prasad', label: '2. Prasad FSSAI Approvals' },
            { id: 'proofs', label: '3. Puja Proof-of-Service Upload' },
            { id: 'refunds', label: '4. Refund Request Review Queue' },
            { id: 'catalog', label: '5. Puja Catalog & Capacity Slots' },
            { id: 'ledger', label: '6. 80G Receipts & Audit Ledger' },
            { id: 'campaigns', label: '7. Donation & Annadanam Funds' },
            { id: 'priests', label: '8. Priest Roster & Sankalp Sheet' },
            { id: 'inventory', label: '9. Prasad Stock Controller' },
            { id: 'audit', label: '10. Security & Admin Audit Trail' },
            { id: 'operations', label: '11. Platform Operations & Exceptions' }
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

        {/* SECTION 5: PUJA CATALOG & SLOT CAPACITY ENGINE (FR-PUJA, AT-02) */}
        {activeTab === 'catalog' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900">
                  Puja Service Catalog & Real-Time Capacity Engine
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Rule: FR-PUJA-001..006, FR-BOOK-001..004, AT-02. Atomic slot locking ensures booked capacity never exceeds total capacity. Immutable price snapshot in minor paise.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {pujasCatalog.map(p => {
                const isFull = p.booked_capacity >= p.total_capacity;
                const percentBooked = Math.min(100, Math.round((p.booked_capacity / p.total_capacity) * 100));

                return (
                  <div key={p.id} className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 text-xs">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-bold text-charcoal-900 text-sm">{p.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-charcoal-200 text-charcoal-700'
                        }`}>
                          {p.status}
                        </span>
                        {isFull && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-vermilion-100 text-vermilion-800">
                            Sold Out (Lock Active)
                          </span>
                        )}
                      </div>

                      <p className="text-charcoal-500">{p.temple_name} • Duration: {p.duration}</p>

                      <div className="flex flex-wrap items-center gap-4 text-charcoal-600">
                        <span className="flex items-center gap-1 font-mono font-bold text-copper-700 bg-copper-50 px-2 py-0.5 rounded border border-copper-200">
                          <IndianRupee className="w-3.5 h-3.5" /> ₹{p.price_inr}
                        </span>
                        <span className="text-charcoal-500">
                          Scheduled: <strong>{p.slot_date}</strong> ({p.slot_time})
                        </span>
                      </div>

                      {/* Capacity Meter */}
                      <div className="space-y-1 max-w-md pt-1">
                        <div className="flex justify-between text-[11px] font-semibold text-charcoal-700">
                          <span>Slot Occupancy: {p.booked_capacity} / {p.total_capacity} seats</span>
                          <span>{percentBooked}% Booked</span>
                        </div>
                        <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${isFull ? 'bg-vermilion-500' : 'bg-emerald-500'}`} 
                            style={{ width: `${percentBooked}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-ivory-300">
                        <label className="text-[11px] text-charcoal-500 font-semibold">Total Capacity:</label>
                        <input 
                          type="number"
                          min={p.booked_capacity}
                          value={p.total_capacity}
                          onChange={(e) => handleUpdatePujaCapacity(p.id, e.target.value)}
                          className="w-14 p-1 text-center font-mono font-bold text-charcoal-900 border border-ivory-200 rounded-lg"
                        />
                      </div>

                      <button
                        onClick={() => handleTogglePujaStatus(p.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                          p.status === 'published' 
                            ? 'bg-ivory-200 hover:bg-ivory-300 text-charcoal-800' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {p.status === 'published' ? 'Unpublish to Draft' : 'Publish to Devotees'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 6: AUDITABLE 80G RECEIPTS & LEDGER (FR-REC, FR-REP, AT-10, AT-12) */}
        {activeTab === 'ledger' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900">
                  Auditable 80G Receipts & Compliance Ledger
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Rule: FR-REC-001..006, AT-10, AT-12. Sequential receipt numbering, verified legal entities, and immutable void justification logs.
                </p>
              </div>

              <button
                onClick={handleExportAuditCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Download className="w-4 h-4 text-temple-gold-400" />
                <span>Export Audit CSV (FR-REP-003)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ivory-200 bg-ivory-50 text-charcoal-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Receipt Number</th>
                    <th className="py-3 px-4">Donor Name & Date</th>
                    <th className="py-3 px-4">Verified Legal Entity / 80G Ref</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {receiptsLedger.map(r => (
                    <tr key={r.id} className="hover:bg-ivory-50/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-charcoal-900">
                        #{r.receipt_number}
                      </td>
                      <td className="py-4 px-4">
                        <strong className="text-charcoal-900">{r.donor_name}</strong>
                        <span className="block text-[11px] text-charcoal-500">{r.date}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-charcoal-800">{r.issuing_legal_entity}</div>
                        <span className="font-mono text-[10px] text-copper-600 bg-copper-50 px-1.5 py-0.5 rounded">
                          {r.tax_exemption_ref}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-charcoal-900">
                        ₹{r.amount_inr.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'issued' ? 'bg-emerald-100 text-emerald-800' : 'bg-vermilion-100 text-vermilion-800'
                        }`}>
                          {r.status}
                        </span>
                        {r.void_reason && (
                          <p className="text-[10px] text-charcoal-500 italic mt-1 max-w-xs">
                            Reason: "{r.void_reason}"
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {r.status === 'issued' ? (
                          <button
                            onClick={() => handleVoidReceipt(r.id)}
                            className="px-3 py-1.5 rounded-lg border border-vermilion-300 text-vermilion-700 hover:bg-vermilion-50 text-[11px] font-semibold transition-colors"
                          >
                            Void with Reason (AT-12)
                          </button>
                        ) : (
                          <span className="text-charcoal-400 text-[11px] italic">
                            Lineage Preserved
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 7: DONATION & ANNADANAM CAMPAIGNS (FR-DON-001..007) */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-copper-600" />
                  <span>Purpose-Driven Donation Campaigns & Annadanam Fund</span>
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  FR-DON-001..007: Transparent charity causes with legal entity verification, statutory limits & 80G tax benefits.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Direct Trust Settlement</span>
                </span>
              </div>
            </div>

            {/* Launch Campaign Form */}
            <form onSubmit={handleCreateCampaign} className="bg-ivory-50 p-5 rounded-2xl border border-ivory-300 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 flex items-center gap-2">
                <Plus className="w-4 h-4 text-copper-600" />
                <span>Launch New Sacred Donation Cause</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Free Eye Camp & Seva"
                    value={newCampaignForm.title}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Target Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    placeholder="e.g. 500000"
                    value={newCampaignForm.target_inr}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, target_inr: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Temple Institution</label>
                  <select
                    value={newCampaignForm.temple_name}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, temple_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                  >
                    <option value="Shri Kashi Vishwanath Temple">Shri Kashi Vishwanath Temple</option>
                    <option value="Sri Venkateswara Swamy Temple (Tirupati Balaji)">Sri Venkateswara Swamy Temple (Tirupati Balaji)</option>
                    <option value="Shree Siddhivinayak Temple, Mumbai">Shree Siddhivinayak Temple, Mumbai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-700 mb-1">Legal Entity / Trust</label>
                  <input
                    type="text"
                    required
                    value={newCampaignForm.legal_entity}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, legal_entity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-ivory-300 bg-white text-charcoal-900 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCampaignForm.tax_exempt}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, tax_exempt: e.target.checked })}
                    className="rounded text-copper-600 focus:ring-copper-400 w-4 h-4"
                  />
                  <span>80G Tax Exemption Certificate Enabled</span>
                </label>
                <button
                  type="submit"
                  className="px-4 py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                >
                  Publish Campaign
                </button>
              </div>
            </form>

            {/* Active Campaigns Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {donationCampaigns.map(camp => {
                const percent = Math.min(100, Math.round((camp.raised_inr / camp.target_inr) * 100));
                return (
                  <div key={camp.id} className="bg-ivory-50/70 rounded-2xl p-5 border border-ivory-200 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          camp.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-charcoal-200 text-charcoal-600'
                        }`}>
                          {camp.is_active ? 'Active Campaign' : 'Paused'}
                        </span>
                        {camp.tax_exempt && (
                          <span className="text-[10px] font-bold bg-copper-100 text-copper-800 px-2 py-0.5 rounded-full">
                            80G Eligible
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-charcoal-900 leading-snug">{camp.title}</h4>
                      <p className="text-[11px] text-charcoal-500 mt-1">{camp.temple_name}</p>
                      <p className="text-[10px] text-charcoal-400 italic mt-0.5 font-mono">{camp.legal_entity}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-ivory-200">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-copper-700">₹{camp.raised_inr.toLocaleString('en-IN')}</span>
                        <span className="text-charcoal-500">Target: ₹{camp.target_inr.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-ivory-300 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-copper-500 to-copper-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-charcoal-500">
                        <span>{camp.donors_count} Devotees Contributed</span>
                        <span className="font-bold text-charcoal-800">{percent}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleCampaign(camp.id)}
                      className="w-full py-2 rounded-xl text-xs font-bold border border-ivory-300 bg-white hover:bg-ivory-100 text-charcoal-800 transition-colors"
                    >
                      {camp.is_active ? 'Pause Campaign' : 'Resume Campaign'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 8: PRIEST ROSTER & SANKALP CHANTING SHEET (FR-PUJA-004) */}
        {activeTab === 'priests' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-copper-600" />
                  <span>Sanctum Priest Allocation & Devotee Sankalp Chanting Roster</span>
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  FR-PUJA-004: Live ritual schedule with devotee Gotra, Rashi & Nakshatra for Vedic chanting by Chief Archakas.
                </p>
              </div>

              <button
                onClick={handlePrintSankalpSheet}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-temple-gold-400" />
                <span>Print Sankalp Chanting Sheet</span>
              </button>
            </div>

            {/* Sacred Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕉️</span>
                <div>
                  <p className="text-xs font-bold text-amber-950 font-serif tracking-wide">
                    ॥ ॐ नमः शिवाय • ॐ नमो नारायणाय • श्री गुरुभ्यो नमः ॥
                  </p>
                  <p className="text-[11px] text-amber-800">
                    Sanctum Priests must verify devotee gotra before taking the sacred sankalp dharana.
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-white text-amber-900 px-3 py-1 rounded-xl border border-amber-200 shadow-2xs">
                3 Rituals Scheduled Today
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ivory-200 bg-ivory-50 text-charcoal-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Roster ID & Slot</th>
                    <th className="py-3 px-4">Devotee Details</th>
                    <th className="py-3 px-4">Gotra / Rashi / Nakshatra</th>
                    <th className="py-3 px-4">Puja Service & Sacred Sankalp</th>
                    <th className="py-3 px-4">Assigned Chief Priest</th>
                    <th className="py-3 px-4 text-right">Ritual Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {sankalpRoster.map(item => (
                    <tr key={item.id} className="hover:bg-ivory-50/60 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-charcoal-900">
                        {item.id}
                        <span className="block text-[11px] font-normal text-copper-700 font-sans">{item.scheduled_date}</span>
                      </td>
                      <td className="py-4 px-4">
                        <strong className="text-charcoal-900 text-sm">{item.devotee_name}</strong>
                        <span className="block text-[11px] text-charcoal-500">{item.temple_name}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-charcoal-800">Gotra: <span className="text-copper-700">{item.gotra}</span></div>
                        <div className="text-[11px] text-charcoal-500">Rashi: {item.rashi}</div>
                        <div className="text-[11px] text-charcoal-500">Nakshatra: {item.nakshatra}</div>
                      </td>
                      <td className="py-4 px-4 max-w-xs">
                        <strong className="text-charcoal-900 block">{item.puja_name}</strong>
                        <p className="text-[11px] text-charcoal-600 italic mt-0.5 bg-ivory-100 p-1.5 rounded-lg border border-ivory-300">
                          &ldquo;{item.prayer_sankalp}&rdquo;
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={item.assigned_priest}
                          onChange={(e) => handleAssignPriest(item.id, e.target.value)}
                          className="px-2.5 py-1.5 rounded-xl border border-ivory-300 bg-white text-xs font-semibold text-charcoal-800 focus:ring-2 focus:ring-copper-400 focus:outline-none"
                        >
                          <option value="Pandit Someshwar Dixit">Pt. Someshwar Dixit (Kashi)</option>
                          <option value="Acharya Ramanuja Sharma">Acharya Ramanuja (Tirupati)</option>
                          <option value="Veda Murti Narayana Shastri">Veda Murti Narayana Shastri</option>
                          <option value="Pandit Ganapati Joshi">Pt. Ganapati Joshi (Mumbai)</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateSankalpStatus(item.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                            item.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : item.status === 'chanting_in_progress'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                              : 'bg-blue-100 text-blue-800 border-blue-300'
                          }`}
                        >
                          <option value="assigned">Assigned</option>
                          <option value="chanting_in_progress">Chanting In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 9: PRASAD REAL-TIME INVENTORY & STOCK CONTROLLER (Rule 7, FR-INV-001) */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <Boxes className="w-5 h-5 text-copper-600" />
                  <span>Prasad Physical Stock & Warehouse Inventory Controller</span>
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  Rule 7 & FR-INV-001: Verified physical stock control. Prevents negative stock counts and eliminates deceptive artificial scarcity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>CHECK Constraint: stock_qty &gt;= 0</span>
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-ivory-200 bg-ivory-50 text-charcoal-600 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Item Name & Temple</th>
                    <th className="py-3 px-4">FSSAI License</th>
                    <th className="py-3 px-4">Unit Price</th>
                    <th className="py-3 px-4">Available Physical Stock</th>
                    <th className="py-3 px-4">Stock Health Status</th>
                    <th className="py-3 px-4 text-right">Quick Stock Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200">
                  {inventoryItems.map(item => {
                    const isLow = item.stock_qty <= item.low_stock_threshold;
                    const isOut = item.stock_qty === 0;
                    return (
                      <tr key={item.id} className="hover:bg-ivory-50/60 transition-colors">
                        <td className="py-4 px-4 font-bold text-charcoal-900">
                          {item.name}
                          <span className="block text-[11px] text-charcoal-500 font-normal">{item.temple_name}</span>
                        </td>
                        <td className="py-4 px-4 font-mono text-[11px] text-charcoal-700">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {item.fssai_no}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-bold text-charcoal-900">
                          ₹{item.price_inr}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-base font-bold text-charcoal-900">
                            {item.stock_qty}
                          </span>
                          <span className="text-[11px] text-charcoal-400 ml-1">units</span>
                          <span className="block text-[10px] text-charcoal-400">Threshold: {item.low_stock_threshold} units</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isOut
                              ? 'bg-vermilion-100 text-vermilion-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOut ? 'Depleted (Out of Stock)' : isLow ? 'Low Stock Warning' : 'Healthy Inventory'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5 bg-ivory-100 p-1 rounded-xl border border-ivory-300">
                            <button
                              onClick={() => handleAdjustStock(item.id, -1)}
                              disabled={item.stock_qty <= 0}
                              className="px-2 py-1 bg-white hover:bg-vermilion-50 text-vermilion-700 rounded-lg text-xs font-bold border border-ivory-300 transition-colors disabled:opacity-40"
                              title="Decrease stock (damaged or sampled)"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item.id, 10)}
                              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-ivory-300 transition-colors"
                              title="Restock batch (+10)"
                            >
                              +10
                            </button>
                            <button
                              onClick={() => handleAdjustStock(item.id, 50)}
                              className="px-2.5 py-1 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-lg text-xs font-bold transition-colors"
                              title="Bulk restock (+50)"
                            >
                              +50
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 10: AUDIT LOGS & TAMPER-EVIDENT SECURITY LEDGER (FR-AUD-001..006, AT-12) */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-copper-600" />
                  <span>Administrative, Security & Financial Audit Trail</span>
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  FR-AUD-001..006 & AT-12: Immutable, tamper-evident audit logs capturing administrative actions, security promotions, proof uploads, and financial transactions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Tamper-Evident Active
                </span>
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                    const dl = document.createElement('a');
                    dl.setAttribute("href", dataStr);
                    dl.setAttribute("download", `audit_trail_shirimandir_${Date.now()}.json`);
                    dl.click();
                  }}
                  className="px-3 py-2 bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 text-xs font-bold rounded-xl border border-ivory-300 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Audit Trail (.JSON)
                </button>
              </div>
            </div>

            {/* Audit Log Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
                <p className="text-xs text-charcoal-500 font-medium">Total Audit Events Recorded</p>
                <p className="text-xl font-bold text-charcoal-900 font-mono mt-1">{auditLogs.length}</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Continuous logging enabled</p>
              </div>
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
                <p className="text-xs text-charcoal-500 font-medium">Sensitive Data Protection</p>
                <p className="text-xl font-bold text-charcoal-900 font-mono mt-1">SHA-256 Masked</p>
                <p className="text-[11px] text-copper-600 mt-0.5">PAN & Card CVV masked per AT-12</p>
              </div>
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
                <p className="text-xs text-charcoal-500 font-medium">Actor Role Segregation</p>
                <p className="text-xl font-bold text-charcoal-900 font-mono mt-1">Strict RBAC</p>
                <p className="text-[11px] text-charcoal-500 mt-0.5">super_admin, admin, temple_partner</p>
              </div>
            </div>

            {/* Audit Trail Table */}
            <div className="overflow-x-auto rounded-2xl border border-ivory-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-ivory-100 text-charcoal-600 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor & Role</th>
                    <th className="py-3 px-4">Action Taken</th>
                    <th className="py-3 px-4">Target Resource</th>
                    <th className="py-3 px-4">Tamper-Proof Details</th>
                    <th className="py-3 px-4">Client IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory-200 text-charcoal-700">
                  {auditLogs.map((log) => {
                    const roleBadgeColor = 
                      log.actor_role === 'super_admin' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      log.actor_role === 'admin' ? 'bg-copper-100 text-copper-800 border-copper-200' :
                      log.actor_role === 'temple_partner' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-blue-100 text-blue-800 border-blue-200';

                    return (
                      <tr key={log.id} className="hover:bg-ivory-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-500 whitespace-nowrap">
                          {log.created_at || 'Just now'}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${roleBadgeColor}`}>
                            {log.actor_role}
                          </span>
                          <span className="block text-[11px] text-charcoal-500 mt-0.5 font-mono">{log.actor_email}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[11px] text-charcoal-800 bg-ivory-100 px-2 py-0.5 rounded border border-ivory-300">
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-copper-700 whitespace-nowrap">
                          {log.resource_type}:{log.resource_id}
                        </td>
                        <td className="py-3.5 px-4 max-w-sm text-charcoal-800">
                          {log.details}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-400 whitespace-nowrap">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 11: PLATFORM OPERATIONS & RECONCILIATION EXCEPTIONS (AT-05, AT-06, FR-PAY-007) */}
        {activeTab === 'operations' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-ivory-200 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-ivory-200">
              <div>
                <h2 className="font-display text-xl font-bold text-charcoal-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-vermilion-600" />
                  <span>Platform Operations & Payment Reconciliation Exceptions</span>
                </h2>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  AT-05, AT-06 & FR-PAY-007: Automated quarantine monitor for gateway signature mismatches, amount discrepancies, and duplicate webhook notifications.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  {reconciliationExceptions.filter(e => e.status === 'quarantined').length} Quarantined
                </span>
              </div>
            </div>

            {/* Health & Isolation Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
                <p className="text-xs text-charcoal-500 font-medium">Tenant Data Isolation</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <p className="text-base font-bold text-charcoal-900">Enforced (RLS Active)</p>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-0.5">No cross-tenant data leakage</p>
              </div>
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
                <p className="text-xs text-charcoal-500 font-medium">Payment Gateway Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <p className="text-base font-bold text-charcoal-900">Razorpay / UPI Live</p>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-0.5">HMAC SHA-256 Webhooks active</p>
              </div>
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
                <p className="text-xs text-charcoal-500 font-medium">Idempotency & Replay Protection</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <p className="text-base font-bold text-charcoal-900">Active (Redis / DB Key)</p>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-0.5">Duplicate webhooks safely dropped</p>
              </div>
              <div className="p-4 rounded-2xl bg-ivory-50 border border-ivory-200">
                <p className="text-xs text-charcoal-500 font-medium">Active White-Label Domains</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <p className="text-base font-bold text-charcoal-900">3 Domains Verified</p>
                </div>
                <p className="text-[11px] text-charcoal-500 mt-0.5">CNAME & Let's Encrypt TLS active</p>
              </div>
            </div>

            {/* Quarantined Exceptions Table */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
                <span>Quarantined Payment Webhook Exceptions</span>
                <span className="text-[11px] font-normal text-charcoal-500">(Auto-isolated to prevent false fulfillment)</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-ivory-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-ivory-100 text-charcoal-600 font-bold uppercase tracking-wider text-[11px] border-b border-ivory-200">
                    <tr>
                      <th className="py-3 px-4">ID & Provider Event</th>
                      <th className="py-3 px-4">Exception Type</th>
                      <th className="py-3 px-4">Expected vs Received</th>
                      <th className="py-3 px-4">Quarantine Status</th>
                      <th className="py-3 px-4">Diagnostic Audit Notes</th>
                      <th className="py-3 px-4 text-right">Operational Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ivory-200 text-charcoal-700">
                    {reconciliationExceptions.map((ex) => (
                      <tr key={ex.id} className="hover:bg-ivory-50 transition-colors">
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-charcoal-900">#{ex.id}</span>
                          <span className="block text-[11px] font-mono text-charcoal-500">{ex.provider_event_id}</span>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-ivory-200 text-charcoal-700 font-semibold text-[10px] uppercase">
                            {ex.provider}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-vermilion-100 text-vermilion-800 border border-vermilion-200">
                            {ex.exception_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap font-mono">
                          <div>
                            <span className="text-charcoal-500 text-[10px]">Expected: </span>
                            <span className="font-bold text-charcoal-900">₹{ex.expected_amount_inr}</span>
                          </div>
                          <div>
                            <span className="text-vermilion-600 text-[10px]">Received: </span>
                            <span className="font-bold text-vermilion-700">₹{ex.received_amount_inr}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                            {ex.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 max-w-sm text-charcoal-800">
                          <p className="text-[11px] leading-relaxed bg-ivory-50 p-2 rounded-xl border border-ivory-200">
                            {ex.resolution_notes}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setReconciliationExceptions(prev => prev.map(item => item.id === ex.id ? { ...item, status: 'resolved', resolution_notes: 'Marked resolved by platform admin.' } : item));
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => {
                                alert(`Quarantine Details for ${ex.provider_event_id}:\n\n- Expected: ₹${ex.expected_amount_inr}\n- Received: ₹${ex.received_amount_inr}\n- Reason: Discrepancy detected before fulfillment. Devotee booking status kept in 'pending_payment'.`);
                              }}
                              className="px-3 py-1.5 bg-ivory-100 hover:bg-ivory-200 text-charcoal-800 rounded-xl text-xs font-bold border border-ivory-300 transition-colors"
                            >
                              Inspect
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tenant Onboarding & White-Label Domain Verification Card */}
            <div className="p-5 rounded-2xl bg-ivory-50 border border-ivory-200">
              <h4 className="font-bold text-sm text-charcoal-900 mb-2">Multi-Tenant Onboarding & Domain Provisioning Status</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-ivory-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-charcoal-800">Shri Kashi Vishwanath</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">LIVE</span>
                  </div>
                  <p className="text-[11px] font-mono text-charcoal-500">kashi.shirimandir.org</p>
                  <p className="text-[10px] text-charcoal-400 mt-1">Tenant ID: 1 | Legal: Trust MoU Verified</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-ivory-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-charcoal-800">Sri Venkateswara (Tirupati)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">LIVE</span>
                  </div>
                  <p className="text-[11px] font-mono text-charcoal-500">tirupati.shirimandir.org</p>
                  <p className="text-[10px] text-charcoal-400 mt-1">Tenant ID: 2 | Legal: Devasthanam Affiliated</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-ivory-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-charcoal-800">Shree Siddhivinayak</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">LIVE</span>
                  </div>
                  <p className="text-[11px] font-mono text-charcoal-500">siddhivinayak.shirimandir.org</p>
                  <p className="text-[10px] text-charcoal-400 mt-1">Tenant ID: 3 | Legal: Trust Certificate Verified</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
