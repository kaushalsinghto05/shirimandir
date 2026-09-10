import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, User, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';

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
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'temples', label: 'Temples' },
    { id: 'pujas', label: 'Pujas & Sevas' },
    { id: 'yatra', label: 'Yatra' },
    { id: 'chadhava', label: 'Chadhava' },
  ];

  const moreLinks = [
    { id: 'panchang', label: 'Panchang' },
    { id: 'library', label: 'Library' },
    { id: 'astro', label: 'Astro Tools' },
    { id: 'store', label: 'Store' },
  ];

  // Only dark hero mode when on home tab AND not scrolled
  const isDarkHero = activeTab === 'home' && !scrolled;
  const navTextColor = isDarkHero ? 'text-ivory-50' : 'text-charcoal-900';
  const navSubTextColor = isDarkHero ? 'text-ivory-200' : 'text-charcoal-500';
  const navHoverColor = isDarkHero ? 'hover:text-copper-400' : 'hover:text-copper-600';
  const bgClass = isDarkHero 
    ? 'bg-transparent' 
    : 'bg-ivory-50/95 backdrop-blur-md shadow-warm border-b border-ivory-200/80';

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer select-none" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper-400 via-copper-500 to-temple-gold-600 flex items-center justify-center text-ivory-50 text-xl font-bold mr-3 shadow-copper-glow flex-shrink-0">
              ॐ
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1">
                <span className={`text-xl md:text-2xl font-display font-bold tracking-wider ${navTextColor}`}>
                  SHIRI
                </span>
                <span className="text-xl md:text-2xl font-bold text-copper-500 tracking-wider">
                  MANDIR
                </span>
              </div>
              <span className={`text-[10px] md:text-xs uppercase tracking-widest ${navSubTextColor}`}>
                Sacred Temples • Verified Sevas
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`text-sm font-medium py-1 transition-all duration-300 relative ${
                    isActive 
                      ? 'text-copper-600 font-bold' 
                      : `${navTextColor} ${navHoverColor}`
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-copper-500 rounded-full animate-fade-in" />
                  )}
                </button>
              );
            })}
            
            {/* More Dropdown */}
            <div className="relative" onMouseLeave={() => setMoreDropdownOpen(false)}>
              <button 
                onMouseEnter={() => setMoreDropdownOpen(true)}
                onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                className={`flex items-center space-x-1 text-sm font-medium py-1 transition-all duration-300 ${
                  ['panchang', 'library', 'astro', 'store'].includes(activeTab) 
                    ? 'text-copper-600 font-bold' 
                    : `${navTextColor} ${navHoverColor}`
                }`}
              >
                <span>More</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {moreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-ivory-50 shadow-elevated border border-ivory-200 py-2 animate-scale-in z-50">
                  {moreLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => { setActiveTab(link.id); setMoreDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2.5 text-sm font-medium text-charcoal-700 hover:bg-ivory-100 hover:text-copper-600 transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-5">
            {/* Wishlist Button */}
            <button 
              onClick={onOpenWishlist} 
              className={`relative p-2 rounded-full transition-all duration-300 hover:bg-black/5 ${navTextColor}`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-vermilion-500 text-ivory-50 text-[10px] font-bold flex items-center justify-center rounded-full border border-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Admin Toggle */}
            <button 
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-300 ${
                isAdminMode 
                  ? 'bg-charcoal-900 text-ivory-50 border-charcoal-900 shadow-sm' 
                  : (isDarkHero 
                      ? 'border-ivory-200/40 text-ivory-100 hover:bg-white/10' 
                      : 'border-ivory-300 text-charcoal-700 hover:bg-ivory-100')
              }`}
            >
              Admin
            </button>

            {/* User Profile or Login */}
            {user ? (
              <div className="relative" onMouseLeave={() => setProfileDropdownOpen(false)}>
                <button 
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center space-x-2 transition-all duration-300 ${navTextColor}`}
                >
                  <div className="w-8 h-8 rounded-full bg-copper-100 flex items-center justify-center border-2 border-copper-400">
                    <User className="w-4 h-4 text-copper-600" />
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-ivory-50 shadow-elevated border border-ivory-200 py-2 animate-scale-in z-50">
                    <div className="px-4 py-2 border-b border-ivory-200 mb-1">
                      <p className="text-sm font-semibold text-charcoal-900">{user.name || 'Devotee'}</p>
                      <p className="text-xs text-charcoal-500 truncate">{user.phone || user.email || 'Devotee Account'}</p>
                    </div>
                    <button 
                      onClick={() => { setActiveTab('account'); onOpenAccount?.(); setProfileDropdownOpen(false); }} 
                      className="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-100 hover:text-copper-600 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 mr-3 text-copper-500" /> Dashboard
                    </button>
                    <button 
                      onClick={() => { onLogout(); setProfileDropdownOpen(false); }} 
                      className="flex items-center w-full px-4 py-2 text-sm text-vermilion-600 hover:bg-vermilion-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="bg-temple-gold-400 hover:bg-temple-gold-500 text-charcoal-900 font-semibold text-sm px-5 py-2 rounded-xl shadow-warm hover:-translate-y-0.5 transition-all duration-300"
              >
                Devotee Login
              </button>
            )}
          </div>

          {/* Mobile Menu & Wishlist Buttons */}
          <div className="md:hidden flex items-center space-x-3">
            <button 
              onClick={onOpenWishlist} 
              className={`relative p-2.5 rounded-full ${navTextColor}`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-vermilion-500 text-ivory-50 text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)} 
              className={`p-2.5 rounded-lg ${navTextColor}`}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-charcoal-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-4/5 max-w-sm bg-ivory-50 h-full shadow-elevated animate-slide-in-right flex flex-col z-10 border-l border-ivory-200">
            <div className="flex items-center justify-between p-4 border-b border-ivory-200">
              <div className="flex items-center space-x-2">
                <span className="text-xl text-copper-600 font-bold">ॐ</span>
                <span className="font-display font-bold text-lg text-charcoal-900">SHIRI MANDIR</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-2 text-charcoal-500 hover:bg-ivory-100 rounded-full"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400 px-4 mb-2">Navigation</div>
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => { setActiveTab(link.id); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    activeTab === link.id 
                      ? 'bg-copper-50 text-copper-600 font-bold' 
                      : 'text-charcoal-700 hover:bg-ivory-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400 px-4 mt-6 mb-2">Sacred Services</div>
              {moreLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => { setActiveTab(link.id); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                    activeTab === link.id 
                      ? 'bg-copper-50 text-copper-600 font-bold' 
                      : 'text-charcoal-700 hover:bg-ivory-100'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-ivory-200 space-y-3 bg-ivory-100/50">
              <div className="flex justify-between items-center px-4 py-2 bg-ivory-50 rounded-xl border border-ivory-200">
                <span className="text-xs font-semibold text-charcoal-700">Admin Mode</span>
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${isAdminMode ? 'bg-copper-500' : 'bg-charcoal-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${isAdminMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {user ? (
                <>
                  <button 
                    onClick={() => { setActiveTab('account'); onOpenAccount?.(); setMobileMenuOpen(false); }} 
                    className="w-full flex items-center px-4 py-2.5 text-charcoal-800 bg-ivory-50 border border-ivory-200 rounded-xl font-medium text-sm"
                  >
                    <User className="w-4 h-4 mr-3 text-copper-500" /> Account Dashboard
                  </button>
                  <button 
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }} 
                    className="w-full flex items-center px-4 py-2.5 text-vermilion-600 bg-vermilion-50 rounded-xl font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-3" /> Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                  className="w-full bg-temple-gold-400 hover:bg-temple-gold-500 text-charcoal-900 font-semibold py-3 rounded-xl shadow-warm transition-all text-sm"
                >
                  Devotee Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
