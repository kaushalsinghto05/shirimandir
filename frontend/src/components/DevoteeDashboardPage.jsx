import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Home, ArrowLeft } from 'lucide-react';
import UserAccountDashboard from './UserAccountDashboard';
import Receipt80GModal from './Receipt80GModal';
import TempleDetailModal from './TempleDetailModal';
import { authService } from '../services/api';
import { TEMPLES } from '../data/mockData';

export default function DevoteeDashboardPage({ user, onLogout }) {
  const [receiptModalData, setReceiptModalData] = useState(null);
  const [activeTempleModal, setActiveTempleModal] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('shirimandir_wishlist');
      return saved ? JSON.parse(saved) : ['kashi-vishwanath'];
    } catch {
      return ['kashi-vishwanath'];
    }
  });

  return (
    <div className="min-h-screen bg-[#FEFDFB] font-sans text-charcoal-900">
      
      {/* Top Header Navigation for Devotee Dashboard */}
      <header className="bg-white border-b border-ivory-300 sticky top-0 z-30 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4a15a] to-[#c87d43] text-white flex items-center justify-center font-bold text-base shadow-xs">
                ॐ
              </div>
              <span className="font-display font-bold text-lg text-charcoal-900 hidden sm:inline">
                Shiri Mandir
              </span>
            </Link>
            <span className="text-charcoal-300 hidden sm:inline">•</span>
            <span className="text-xs font-semibold text-copper-600 bg-copper-50 px-2.5 py-1 rounded-full border border-copper-200">
              Devotee Dashboard
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-ivory-300 text-charcoal-700 hover:bg-ivory-100 text-xs font-medium transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Explore Temples</span>
            </Link>
            
            <button
              onClick={onLogout || authService.logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-white text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Devotee Dashboard View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserAccountDashboard
          user={user}
          onOpenReceipt={(rcp) => setReceiptModalData(rcp)}
          wishlist={wishlist}
          temples={TEMPLES}
          onSelectTemple={(temple) => setActiveTempleModal(temple)}
        />
      </main>

      {/* 80G Receipt Modal */}
      {receiptModalData && (
        <Receipt80GModal
          isOpen={Boolean(receiptModalData)}
          onClose={() => setReceiptModalData(null)}
          receiptData={receiptModalData}
        />
      )}

      {/* Temple Detail Modal */}
      {activeTempleModal && (
        <TempleDetailModal
          isOpen={Boolean(activeTempleModal)}
          onClose={() => setActiveTempleModal(null)}
          temple={activeTempleModal}
        />
      )}
    </div>
  );
}
