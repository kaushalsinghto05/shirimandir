import React, { useState } from 'react';
import { 
  Bell, 
  Heart, 
  User, 
  Menu, 
  X, 
  ShieldCheck, 
  Flame, 
  Compass, 
  BookOpen, 
  ShoppingBag, 
  Sparkles, 
  Building2,
  Calendar,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  user, 
  onOpenLogin, 
  onLogout, 
  wishlistCount, 
  onOpenWishlist, 
  isAdminMode, 
  setIsAdminMode,
  onOpenAccount
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Flame },
    { id: 'temples', label: 'Temples', icon: Building2 },
    { id: 'pujas', label: 'Pujas & Sevas', icon: Sparkles },
    { id: 'chadhava', label: 'Chadhava', icon: Flame },
    { id: 'panchang', label: 'Panchang', icon: Calendar },
    { id: 'library', label: 'Library', icon: BookOpen },
    { id: 'astro', label: 'Astro Tools', icon: Compass },
    { id: 'store', label: 'Sanctum Store', icon: ShoppingBag },
  ];

  return (
    <header className="sticky top-0 z-40 bg-sanctum-950/95 backdrop-blur-md border-b border-gold-500/20 text-sandstone-50 transition-all shadow-sanctum">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => { setActiveTab('home'); setIsAdminMode(false); }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gold-400 via-gold-500 to-terracotta-600 flex items-center justify-center p-0.5 shadow-gold-glow group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-sanctum-950 rounded-[14px] flex items-center justify-center">
                {/* Sacred Kalash & Lotus Glyph */}
                <span className="text-gold-400 font-serif font-bold text-2xl">ॐ</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-wider text-sandstone-50 group-hover:text-gold-400 transition-colors">
                  MANDIR<span className="text-gold-500 font-extrabold">VEDA</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest bg-gold-500/15 text-gold-300 rounded-full border border-gold-500/30">
                  Vedic Sanctum
                </span>
              </div>
              <p className="text-[11px] text-sandstone-300 tracking-wide font-medium">
                Sacred Temples & Certified Sevas
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id && !isAdminMode;
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveTab(link.id);
                    setIsAdminMode(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/10 text-gold-300 border border-gold-500/40 shadow-sm'
                      : 'text-sandstone-200 hover:text-sandstone-50 hover:bg-sanctum-850'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-400' : 'text-sandstone-300'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Multi-Temple Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-xl bg-sanctum-900 border border-gold-500/25 hover:border-gold-400 text-sandstone-200 hover:text-gold-400 transition-all hover:scale-105"
              title="Followed Temples & Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'text-terracotta-500 fill-terracotta-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta-600 text-[11px] font-bold text-white flex items-center justify-center border-2 border-sanctum-950 animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Admin Dashboard Switcher Pill (Quick Dev/Demo Mode) */}
            <button
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
                isAdminMode
                  ? 'bg-tulsi-500/20 text-tulsi-200 border-tulsi-500'
                  : 'bg-sanctum-900 text-sandstone-300 border-sandstone-700/60 hover:border-gold-500/50 hover:text-gold-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
              <span>{isAdminMode ? 'Exit Admin' : 'Admin Portal'}</span>
            </button>

            {/* Devotee Account / Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sanctum-900 to-sanctum-850 border border-gold-500/30 hover:border-gold-400 text-sandstone-50 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-300 text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left text-xs">
                    <div className="font-semibold text-sandstone-100">{user.name.split(' ')[0]}</div>
                    <div className="text-[10px] text-gold-400">{user.gotra} Gotra</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-sandstone-300" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-sanctum-900 border border-gold-500/30 rounded-2xl shadow-sanctum-lg py-2 z-50 text-sandstone-100">
                    <div className="px-4 py-2 border-b border-sanctum-800">
                      <p className="text-xs text-sandstone-300 font-medium">Logged in Devotee</p>
                      <p className="text-sm font-semibold text-gold-300 truncate">{user.name}</p>
                      <p className="text-xs text-sandstone-300">{user.phone}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAccount();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-sanctum-800 flex items-center gap-2 text-sandstone-200 hover:text-gold-300 transition-colors"
                    >
                      <User className="w-4 h-4 text-gold-400" />
                      <span>Devotee Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        setIsAdminMode(true);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-sanctum-800 flex items-center gap-2 text-sandstone-200 hover:text-gold-300 transition-colors md:hidden"
                    >
                      <ShieldCheck className="w-4 h-4 text-tulsi-500" />
                      <span>Admin Management</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-sanctum-800 flex items-center gap-2 text-terracotta-500 hover:text-terracotta-400 transition-colors border-t border-sanctum-800 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-sanctum-950 font-semibold text-sm shadow-gold-glow hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <User className="w-4 h-4" />
                <span>Devotee Login</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-sanctum-900 border border-sandstone-700 text-sandstone-200 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-sanctum-950 border-b border-gold-500/20 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id && !isAdminMode;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setIsAdminMode(false);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold-500/20 text-gold-300 border border-gold-500/40'
                    : 'text-sandstone-200 hover:bg-sanctum-900'
                }`}
              >
                <Icon className="w-5 h-5 text-gold-400" />
                <span>{link.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-sanctum-850 flex gap-2">
            <button
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-sanctum-900 border border-sandstone-700 text-sandstone-200"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>{isAdminMode ? 'Exit Admin' : 'Admin Portal'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
