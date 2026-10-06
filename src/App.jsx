import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSanctum from './components/HeroSanctum';
import VerifiedTrustBadges from './components/VerifiedTrustBadges';
import LiveDarshanQueueSection from './components/LiveDarshanQueueSection';
import FeaturedPujasSection from './components/FeaturedPujasSection';
import GuidedDarshanSection from './components/GuidedDarshanSection';
import YatraPackagesSection from './components/YatraPackagesSection';
import ChadhavaSection from './components/ChadhavaSection';
import AstroToolsModal from './components/AstroToolsModal';
import SanatanWallSection from './components/SanatanWallSection';
import TestimonialSection from './components/TestimonialSection';
import ReferralSection from './components/ReferralSection';
import TempleDirectory from './components/TempleDirectory';
import TempleDetailModal from './components/TempleDetailModal';
import LoginModal from './components/LoginModal';
import PujaBookingModal from './components/PujaBookingModal';
import UnifiedPaymentModal from './components/UnifiedPaymentModal';
import BookingConfirmationModal from './components/BookingConfirmationModal';
import UserAccountDashboard from './components/UserAccountDashboard';
import Receipt80GModal from './components/Receipt80GModal';
import WishlistDrawer from './components/WishlistDrawer';
import AdminDashboard from './components/AdminDashboard';
import PanchangModal from './components/PanchangModal';
import DevotionalLibraryModal from './components/DevotionalLibraryModal';
import PrasadCheckoutModal from './components/PrasadCheckoutModal';
import Footer from './components/Footer';
import { TEMPLES, FEATURED_PUJAS } from './data/mockData';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Devotee Authentication State
  const [user, setUser] = useState({
    id: 1,
    name: 'Kaushal Singh',
    email: 'kaushal@example.com',
    phone: '+91 98765 43210',
    gotra: 'Kashyap',
    rashi: 'Dhanu',
    nakshatra: 'Moola',
    role: 'devotee',
    consent_data_sharing: false
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingServiceToBookAfterLogin, setPendingServiceToBookAfterLogin] = useState(null);

  // Multi-Temple Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('shirimandir_wishlist');
      return saved ? JSON.parse(saved) : ['kashi-vishwanath', 'tirupati-balaji'];
    } catch {
      return ['kashi-vishwanath', 'tirupati-balaji'];
    }
  });
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);

  // Sacred Prasad Cart & Checkout State
  const [prasadCart, setPrasadCart] = useState([
    {
      id: 1,
      name: 'Kashi Vishwanath Sacred Peda & Dry Fruit Mahaprasad Box (400g)',
      temple: 'Shri Kashi Vishwanath Temple',
      price: 450,
      price_paise: 45000,
      stock_qty: 120,
      quantity: 1,
      fssai_license_no: '12723999000142',
      image: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=600&q=80'
    }
  ]);
  const [prasadCheckoutOpen, setPrasadCheckoutOpen] = useState(false);

  // Temple Directory & Live Queue Telemetry State
  const [templesData, setTemplesData] = useState(() => {
    // Enrich with statutory verification status
    return TEMPLES.map(t => {
      let status = 'independent';
      let doc = null;
      let regNo = null;

      if (t.id === 'kashi-vishwanath') {
        status = 'official';
        doc = 'https://storage.shirimandir.org/compliance/docs/kashi_vishwanath_trust_mou_2024.pdf';
        regNo = 'TRUST-KV-UP-7819';
      } else if (t.id === 'tirupati-balaji') {
        status = 'partnered';
        doc = 'https://storage.shirimandir.org/compliance/docs/tirumala_archaka_seva_agreement_2024.pdf';
        regNo = 'AP-TTD-ARCH-2023';
      } else if (t.id === 'siddhivinayak-mumbai') {
        status = 'independent';
        regNo = 'MH-BOM-TRUST-1801';
      }

      return {
        ...t,
        verification_status: status,
        affiliation_proof_doc: doc,
        trust_registration_no: regNo
      };
    });
  });

  const [activeTempleModal, setActiveTempleModal] = useState(null);
  const [selectedDeityFilter, setSelectedDeityFilter] = useState('all');

  // Booking & Payment Stepper Modals
  const [activeBookingService, setActiveBookingService] = useState(null);
  const [bookingDataForPayment, setBookingDataForPayment] = useState(null);
  const [confirmationData, setConfirmationData] = useState(null);
  const [receiptModalData, setReceiptModalData] = useState(null);

  // Secondary Tool Modals
  const [panchangModalOpen, setPanchangModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [astroModalOpen, setAstroModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('shirimandir_wishlist', JSON.stringify(wishlist));
    } catch {
      // Ignored
    }
  }, [wishlist]);

  // Wishlist toggle handler
  const handleToggleWishlist = (templeId) => {
    if (wishlist.includes(templeId)) {
      setWishlist(wishlist.filter(id => id !== templeId));
    } else {
      setWishlist([...wishlist, templeId]);
    }
  };

  const handleRemoveFromWishlist = (templeId) => {
    setWishlist(wishlist.filter(id => id !== templeId));
  };

  // Add to Prasad Cart Handler
  const handleAddToCart = (item) => {
    setPrasadCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setPrasadCheckoutOpen(true);
  };

  // Login & Booking Gate Enforcement
  const handleInitiateBooking = (service) => {
    if (!user) {
      setPendingServiceToBookAfterLogin(service);
      setLoginModalOpen(true);
    } else {
      setActiveBookingService(service);
    }
  };

  const handleLoginSuccess = (devoteeData) => {
    setUser(devoteeData);
    setLoginModalOpen(false);
    if (pendingServiceToBookAfterLogin) {
      setActiveBookingService(pendingServiceToBookAfterLogin);
      setPendingServiceToBookAfterLogin(null);
    }
  };

  const handleLogout = () => {
    setUser(null);
    if (activeTab === 'account') {
      setActiveTab('home');
    }
  };

  // Stepper Transition: Details -> Payment
  const handleProceedToPayment = (payload) => {
    setActiveBookingService(null);
    setBookingDataForPayment(payload);
  };

  // Stepper Transition: Payment -> Confirmation
  const handlePaymentSuccess = (confirmedPayload) => {
    setBookingDataForPayment(null);
    setConfirmationData(confirmedPayload);
  };

  // Telemetry Editor from Admin
  const handleUpdateWaitTime = (templeId, newMinutes) => {
    setTemplesData(prev => prev.map(t => {
      if (t.id === templeId) {
        return {
          ...t,
          waitMinutes: newMinutes,
          current_wait_minutes: newMinutes,
          waitStatus: newMinutes > 30 ? 'Peak Rush' : newMinutes > 20 ? 'Moderate Queue' : 'Smooth Darshan'
        };
      }
      return t;
    }));
  };

  // Handle Tab navigation
  const handleNavClick = (tabId) => {
    if (tabId === 'panchang') {
      setPanchangModalOpen(true);
      return;
    }
    if (tabId === 'library') {
      setLibraryModalOpen(true);
      return;
    }
    if (tabId === 'astro') {
      setAstroModalOpen(true);
      return;
    }
    if (tabId === 'store' || tabId === 'prasad') {
      setPrasadCheckoutOpen(true);
      return;
    }
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 text-charcoal-900 font-sans overflow-x-hidden">

      {/* 1. Global Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavClick}
        user={user}
        onOpenLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setWishlistDrawerOpen(true)}
        isAdminMode={isAdminMode}
        setIsAdminMode={setIsAdminMode}
        onOpenAccount={() => setActiveTab('account')}
      />

      {/* 2. Main Page Render */}
      <main className={`flex-1 ${activeTab !== 'home' ? 'pt-16 md:pt-20' : ''}`}>
        {isAdminMode ? (
          <AdminDashboard
            onExitAdmin={() => setIsAdminMode(false)}
            templesData={templesData}
            onUpdateWaitTime={handleUpdateWaitTime}
          />
        ) : activeTab === 'account' ? (
          <UserAccountDashboard
            user={user}
            onOpenReceipt={(rcp) => setReceiptModalData(rcp)}
            wishlist={wishlist}
            temples={templesData}
            onSelectTemple={(temple) => setActiveTempleModal(temple)}
          />
        ) : activeTab === 'temples' ? (
          <TempleDirectory
            temples={templesData}
            onSelectTemple={(temple) => setActiveTempleModal(temple)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
          />
        ) : activeTab === 'pujas' ? (
          <FeaturedPujasSection
            onBookPuja={handleInitiateBooking}
            selectedDeityFilter={selectedDeityFilter}
          />
        ) : activeTab === 'chadhava' ? (
          <ChadhavaSection
            onOfferChadhava={handleInitiateBooking}
          />
        ) : activeTab === 'yatra' ? (
          <YatraPackagesSection
            onBookYatra={handleInitiateBooking}
          />
        ) : (
          /* ═══════════════════════════════════════════════
             HOMEPAGE — Full Landing Page Section Flow
             ═══════════════════════════════════════════════ */
          <>
            {/* 1. Hero — Bold headline, CTAs, trust stats, floating cards */}
            <HeroSanctum
              onExplorePujas={() => {
                const el = document.getElementById('pujas-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewDarshanQueue={() => {
                const firstTemple = templesData[0];
                setActiveTempleModal(firstTemple);
              }}
              selectedDeityFilter={selectedDeityFilter}
              setSelectedDeityFilter={setSelectedDeityFilter}
            />

            {/* 2. Verified Temple Trust Badges — Statutory transparency layer */}
            <VerifiedTrustBadges temples={templesData} />

            {/* 3. Live Darshan Queue & Wait-Time Gauge */}
            <LiveDarshanQueueSection
              temples={templesData}
              onSelectTemple={(temple) => setActiveTempleModal(temple)}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* 4. Puja Offerings Section */}
            <div id="pujas-section">
              <FeaturedPujasSection
                onBookPuja={handleInitiateBooking}
                selectedDeityFilter={selectedDeityFilter}
              />
            </div>

            {/* 5. Guided In-Person Darshan Assistance */}
            <GuidedDarshanSection
              onBookGuidedDarshan={handleInitiateBooking}
            />

            {/* 6. Yatra Packages */}
            <YatraPackagesSection
              onBookYatra={handleInitiateBooking}
            />

            {/* 7. Sacred Chadhava & Prasadam */}
            <ChadhavaSection
              onOfferChadhava={handleInitiateBooking}
            />

            {/* 8. Vedic Astro Tools */}
            <AstroToolsModal isInline={true} />

            {/* 9. Sanatan Community Wall */}
            <SanatanWallSection
              onShareExperience={() => alert('Thank you! Your experience has been shared with the community. 🙏')}
            />

            {/* 10. Testimonials */}
            <TestimonialSection />

            {/* 11. Referral & Community program */}
            <ReferralSection />
          </>
        )}
      </main>

      {/* 3. Global Footer */}
      <Footer onNavigate={handleNavClick} />

      {/* ═══════════════════════════════════════════════
         MODALS & SLIDE-OVERS
         ═══════════════════════════════════════════════ */}

      {/* Temple Detail Modal */}
      {activeTempleModal && (
        <TempleDetailModal
          temple={activeTempleModal}
          onClose={() => setActiveTempleModal(null)}
          onBookService={(seva) => {
            setActiveTempleModal(null);
            handleInitiateBooking(seva);
          }}
          onAddToCart={handleAddToCart}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
        />
      )}

      {/* Login & OTP Gate Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Puja / Seva Booking Flow */}
      {activeBookingService && (
        <PujaBookingModal
          service={activeBookingService}
          user={user}
          onClose={() => setActiveBookingService(null)}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {/* Unified Tabbed Payment Modal */}
      {bookingDataForPayment && (
        <UnifiedPaymentModal
          bookingData={bookingDataForPayment}
          onClose={() => setBookingDataForPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Booking Confirmation Modal */}
      {confirmationData && (
        <BookingConfirmationModal
          confirmationData={confirmationData}
          onClose={() => setConfirmationData(null)}
          onOpenReceipt={(rcp) => setReceiptModalData(rcp)}
          onGoToDashboard={() => {
            setConfirmationData(null);
            setActiveTab('account');
          }}
        />
      )}

      {/* 80G Tax Exemption Receipt Modal */}
      {receiptModalData && (
        <Receipt80GModal
          booking={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      {/* Dedicated Prasad Cart & Checkout Modal */}
      <PrasadCheckoutModal
        isOpen={prasadCheckoutOpen}
        onClose={() => setPrasadCheckoutOpen(false)}
        cart={prasadCart}
        setCart={setPrasadCart}
        user={user}
        onOrderSuccess={(orderData) => {
          setActiveTab('account');
        }}
      />

      {/* Multi-Temple Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        wishlist={wishlist}
        temples={templesData}
        onRemove={handleRemoveFromWishlist}
        onSelectTemple={(temple) => {
          setWishlistDrawerOpen(false);
          setActiveTempleModal(temple);
        }}
      />

      {/* Secondary Tool Modals */}
      <PanchangModal isOpen={panchangModalOpen} onClose={() => setPanchangModalOpen(false)} />
      <DevotionalLibraryModal isOpen={libraryModalOpen} onClose={() => setLibraryModalOpen(false)} />
      <AstroToolsModal isOpen={astroModalOpen} onClose={() => setAstroModalOpen(false)} />

    </div>
  );
}
