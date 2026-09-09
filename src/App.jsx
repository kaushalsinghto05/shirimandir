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
import StoreModal from './components/StoreModal';
import Footer from './components/Footer';
import { TEMPLES, FEATURED_PUJAS } from './data/mockData';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Devotee Authentication State
  const [user, setUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingServiceToBookAfterLogin, setPendingServiceToBookAfterLogin] = useState(null);

  // Multi-Temple Wishlist State
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('shirimandir_wishlist');
      return saved ? JSON.parse(saved) : ['kashi-vishwanath', 'kedarnath-dham'];
    } catch {
      return ['kashi-vishwanath', 'kedarnath-dham'];
    }
  });

  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);

  // Temple Directory & Live Queue Telemetry State
  const [templesData, setTemplesData] = useState(TEMPLES);
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
  const [storeModalOpen, setStoreModalOpen] = useState(false);

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
    if (tabId === 'store') {
      setStoreModalOpen(true);
      return;
    }
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Share Experience handler (Sanatan Wall)
  const handleShareExperience = () => {
    if (!user) {
      setLoginModalOpen(true);
    } else {
      alert('Thank you! Your experience has been shared with the Sanatan community. 🙏');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-ivory-50 text-charcoal-900 font-sans">

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
            user={user || { name: "Kaushal Singh", gotra: "Kashyap", phone: "+91 98765 43210", rashi: "Dhanu" }}
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
            {/* 1. Hero — Bold headline, CTAs, trust stats, deity filter */}
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

            {/* 2. Verified Temple Trust Badges — transparency layer */}
            <VerifiedTrustBadges temples={templesData} />

            {/* 3. Live Darshan Queue & Wait-Time Gauge */}
            <LiveDarshanQueueSection
              temples={templesData}
              onSelectTemple={(temple) => setActiveTempleModal(temple)}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
            />

            {/* 4. Gotra-Personalized Puja Section */}
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

            {/* 6. Yatra Packages — Multi-day pilgrimages */}
            <YatraPackagesSection
              onBookYatra={handleInitiateBooking}
            />

            {/* 7. Sacred Chadhava & Prasadam with delivery tracker */}
            <ChadhavaSection
              onOfferChadhava={handleInitiateBooking}
            />

            {/* 8. Vedic Astro Tools — Inline section on homepage */}
            <AstroToolsModal isInline={true} />

            {/* 9. Sanatan Wall — Community devotee feed */}
            <SanatanWallSection
              onShareExperience={handleShareExperience}
            />

            {/* 10. Testimonials + Press credibility strip */}
            <TestimonialSection />

            {/* 11. Referral / Community program */}
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
          onBookSeva={(seva) => {
            setActiveTempleModal(null);
            handleInitiateBooking(seva);
          }}
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

      {/* Puja / Chadhava Booking Flow */}
      {activeBookingService && (
        <PujaBookingModal
          service={activeBookingService}
          user={user}
          onClose={() => setActiveBookingService(null)}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {/* Unified Tabbed Payment Sheet */}
      {bookingDataForPayment && (
        <UnifiedPaymentModal
          bookingData={bookingDataForPayment}
          onClose={() => setBookingDataForPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* Booking Confirmation & Prasad Delivery Tracker */}
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

      {/* 80G Tax Exemption Donation Receipt */}
      {receiptModalData && (
        <Receipt80GModal
          receiptData={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      {/* Multi-Temple Wishlist Drawer */}
      <WishlistDrawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        wishlist={wishlist}
        temples={templesData}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onSelectTemple={(temple) => setActiveTempleModal(temple)}
      />

      {/* Panchang Modal */}
      <PanchangModal
        isOpen={panchangModalOpen}
        onClose={() => setPanchangModalOpen(false)}
      />

      {/* Devotional Library Modal */}
      <DevotionalLibraryModal
        isOpen={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
      />

      {/* Astro Tools Modal (when opened from nav) */}
      <AstroToolsModal
        isOpen={astroModalOpen}
        onClose={() => setAstroModalOpen(false)}
      />

      {/* Store Modal */}
      <StoreModal
        isOpen={storeModalOpen}
        onClose={() => setStoreModalOpen(false)}
      />

    </div>
  );
}
