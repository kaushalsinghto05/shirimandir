import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Link } from 'react-router-dom';
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

// Authentication & Route Guard Components
import LoginPage from './components/LoginPage';
import CompleteProfilePage from './components/CompleteProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import DevoteeDashboardPage from './components/DevoteeDashboardPage';

import { authService } from './services/api';
import { TEMPLES, FEATURED_PUJAS } from './data/mockData';

/**
 * Root Gateway Component: Evaluates authentication state on app load and on "/" route.
 * 1. Reads saved token.
 * 2. If no token -> goes to /login.
 * 3. If token exists -> calls GET /api/auth/me (handled in App useEffect).
 * 4. While check is running, shows loading screen.
 * 5. If /me returns 401 (invalid/expired) -> goes to /login.
 * 6. If valid:
 *    - profile_completed = false -> /complete-profile
 *    - profile_completed = true  -> dashboard by role
 */
function AppRootGate({ user, authLoading }) {
  const token = localStorage.getItem('shirimandir_token');

  // 4. While check is running, show loading screen. Do NOT redirect until it finishes.
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FEFDFB] flex flex-col items-center justify-center font-sans text-charcoal-900">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#d4a15a] to-[#c87d43] text-white flex items-center justify-center font-bold text-2xl shadow-md animate-pulse mb-4">
          ॐ
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-charcoal-800">
          <span className="w-2 h-2 rounded-full bg-copper-500 animate-ping"></span>
          <span>Verifying sanctum session...</span>
        </div>
        <p className="text-xs text-charcoal-500 mt-1">Authenticating devotee credentials</p>
      </div>
    );
  }

  // 2. If no token -> go to /login.
  // 5. If /me returns 401 -> clear token, go to /login.
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 6. If valid:
  // - profile_completed = false -> /complete-profile
  if (!user.profile_completed) {
    return <Navigate to="/complete-profile" replace />;
  }

  // - profile_completed = true  -> dashboard by role
  if (user.role === 'super_admin') {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Navigate to="/devotee/dashboard" replace />;
}

export default function App() {
  const navigate = useNavigate();

  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState('home');

  // Authentication State
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const savedUserStr = localStorage.getItem('shirimandir_user');
      return savedUserStr ? JSON.parse(savedUserStr) : null;
    } catch {
      return null;
    }
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

  // Initial App Load Verification: Checks token and calls GET /api/auth/me
  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('shirimandir_token');

    if (!token) {
      setUser(null);
      setAuthLoading(false);
      return;
    }

    // Call GET /api/auth/me to verify session
    authService.getProfile()
      .then(res => {
        if (!isMounted) return;
        if (res.ok && res.data?.data) {
          const verifiedUser = res.data.data.user || res.data.data;
          setUser(verifiedUser);
          localStorage.setItem('shirimandir_user', JSON.stringify(verifiedUser));
        } else {
          // 401 or invalid token
          localStorage.removeItem('shirimandir_token');
          localStorage.removeItem('shirimandir_user');
          setUser(null);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        console.warn('Auth verification notice:', err);
        localStorage.removeItem('shirimandir_token');
        localStorage.removeItem('shirimandir_user');
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setAuthLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

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
      navigate('/login');
    } else if (!user.profile_completed) {
      navigate('/complete-profile');
    } else {
      setActiveBookingService(service);
    }
  };

  // Called when user completes login/register or profile update
  const handleUserAuthenticated = (userData) => {
    setUser(userData);
    localStorage.setItem('shirimandir_user', JSON.stringify(userData));
    setAuthLoading(false);
  };

  // Logout handler
  const handleLogout = () => {
    authService.logout();
    setUser(null);
    navigate('/login', { replace: true });
  };

  // Role dashboard router helper
  const handleOpenAccount = () => {
    if (!user) {
      navigate('/login');
    } else if (!user.profile_completed) {
      navigate('/complete-profile');
    } else if (user.role === 'super_admin') {
      navigate('/super-admin/dashboard');
    } else if (user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/devotee/dashboard');
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

  // Render Modals helper
  const renderSharedModals = () => (
    <>
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

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(devoteeData) => {
          handleUserAuthenticated(devoteeData);
          setLoginModalOpen(false);
          if (pendingServiceToBookAfterLogin) {
            setActiveBookingService(pendingServiceToBookAfterLogin);
            setPendingServiceToBookAfterLogin(null);
          }
        }}
      />

      {activeBookingService && (
        <PujaBookingModal
          service={activeBookingService}
          user={user}
          onClose={() => setActiveBookingService(null)}
          onProceedToPayment={handleProceedToPayment}
        />
      )}

      {bookingDataForPayment && (
        <UnifiedPaymentModal
          bookingData={bookingDataForPayment}
          onClose={() => setBookingDataForPayment(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {confirmationData && (
        <BookingConfirmationModal
          confirmationData={confirmationData}
          onClose={() => setConfirmationData(null)}
          onOpenReceipt={(rcp) => setReceiptModalData(rcp)}
          onGoToDashboard={() => {
            setConfirmationData(null);
            handleOpenAccount();
          }}
        />
      )}

      {receiptModalData && (
        <Receipt80GModal
          booking={receiptModalData}
          onClose={() => setReceiptModalData(null)}
        />
      )}

      <PrasadCheckoutModal
        isOpen={prasadCheckoutOpen}
        onClose={() => setPrasadCheckoutOpen(false)}
        cart={prasadCart}
        setCart={setPrasadCart}
        user={user}
        onOrderSuccess={() => {
          setPrasadCheckoutOpen(false);
          setPrasadCart([]);
          handleOpenAccount();
        }}
      />

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

      <PanchangModal
        isOpen={panchangModalOpen}
        onClose={() => setPanchangModalOpen(false)}
        onBookService={handleInitiateBooking}
      />
      <DevotionalLibraryModal isOpen={libraryModalOpen} onClose={() => setLibraryModalOpen(false)} />
      <AstroToolsModal isOpen={astroModalOpen} onClose={() => setAstroModalOpen(false)} />
    </>
  );

  // Full Temple Showcase / Exploration View
  const renderExploreView = () => (
    <div className="min-h-screen flex flex-col bg-ivory-50 text-charcoal-900 font-sans overflow-x-hidden">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavClick}
        user={user}
        onOpenLogin={() => navigate('/login')}
        onLogout={handleLogout}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setWishlistDrawerOpen(true)}
        isAdminMode={false}
        setIsAdminMode={() => navigate('/admin/dashboard')}
        onOpenAccount={handleOpenAccount}
      />

      <main className={`flex-1 ${activeTab !== 'home' ? 'pt-16 md:pt-20' : ''}`}>
        {activeTab === 'account' ? (
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
          <>
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

            <VerifiedTrustBadges temples={templesData} />

            <LiveDarshanQueueSection
              temples={templesData}
              onSelectTemple={(temple) => setActiveTempleModal(temple)}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
            />

            <div id="pujas-section">
              <FeaturedPujasSection
                onBookPuja={handleInitiateBooking}
                selectedDeityFilter={selectedDeityFilter}
              />
            </div>

            <GuidedDarshanSection
              onBookGuidedDarshan={handleInitiateBooking}
            />

            <YatraPackagesSection
              onBookYatra={handleInitiateBooking}
            />

            <ChadhavaSection
              onOfferChadhava={handleInitiateBooking}
            />

            <AstroToolsModal isInline={true} />

            <SanatanWallSection
              onShareExperience={() => alert('Thank you! Your experience has been shared with the community. 🙏')}
            />

            <TestimonialSection />

            <ReferralSection />
          </>
        )}
      </main>

      <Footer onNavigate={handleNavClick} />
      {renderSharedModals()}
    </div>
  );

  return (
    <Routes>
      {/* 1. App Load & Root Route Gate */}
      <Route
        path="/"
        element={<AppRootGate user={user} authLoading={authLoading} />}
      />

      {/* 2. Public Temple Discovery & Darshan Explorer */}
      <Route
        path="/explore"
        element={renderExploreView()}
      />
      <Route
        path="/home"
        element={renderExploreView()}
      />

      {/* 3. Login & Registration (Email only) */}
      <Route
        path="/login"
        element={
          <LoginPage
            currentUser={user}
            authLoading={authLoading}
            onAuthSuccess={handleUserAuthenticated}
          />
        }
      />

      {/* 4. Mandatory Devotee Profile Completion Gate */}
      <Route
        path="/complete-profile"
        element={
          <ProtectedRoute user={user} authLoading={authLoading} requireCompleted={false}>
            <CompleteProfilePage
              currentUser={user}
              onProfileUpdated={handleUserAuthenticated}
            />
          </ProtectedRoute>
        }
      />

      {/* 5. Devotee Dashboard */}
      <Route
        path="/devotee/dashboard"
        element={
          <ProtectedRoute user={user} authLoading={authLoading} allowedRoles={['devotee', 'admin', 'super_admin']}>
            <DevoteeDashboardPage
              user={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* 6. Admin Dashboard (Devotees strictly blocked with 403) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute user={user} authLoading={authLoading} allowedRoles={['admin', 'super_admin']}>
            <div className="min-h-screen flex flex-col bg-ivory-50 text-charcoal-900 font-sans">
              <header className="bg-white border-b border-ivory-300 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4a15a] to-[#c87d43] text-white flex items-center justify-center font-bold text-base shadow-xs">
                    ॐ
                  </div>
                  <div>
                    <span className="font-display font-bold text-lg text-charcoal-900">Shiri Mandir</span>
                    <span className="ml-2 text-xs bg-[#d4a15a]/20 text-[#8a5b1a] font-bold px-2 py-0.5 rounded-full">
                      Admin Portal
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate('/explore')}
                    className="text-xs font-semibold text-charcoal-700 hover:text-charcoal-900 border border-ivory-300 px-3.5 py-1.5 rounded-xl hover:bg-ivory-100 transition-colors"
                  >
                    Explore Temples
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold bg-charcoal-900 hover:bg-charcoal-800 text-white px-3.5 py-1.5 rounded-xl transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </header>
              <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                <AdminDashboard
                  onExitAdmin={() => navigate('/explore')}
                  templesData={templesData}
                  onUpdateWaitTime={handleUpdateWaitTime}
                />
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* 7. Super Admin Dashboard (Devotee & Admin blocked) */}
      <Route
        path="/super-admin/dashboard"
        element={
          <ProtectedRoute user={user} authLoading={authLoading} allowedRoles={['super_admin']}>
            <SuperAdminDashboard
              currentUser={user}
              onLogout={handleLogout}
            />
          </ProtectedRoute>
        }
      />

      {/* 8. Fallback: Unknown routes redirect to Home gate */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
