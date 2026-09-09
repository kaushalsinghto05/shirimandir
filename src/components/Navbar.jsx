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
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const navTextColor = scrolled ? 'text-charcoal-900' : 'text-ivory-50';
  const navHoverColor = scrolled ? 'hover:text-copper-600' : 'hover:text-copper-400';
  const bgClass = scrolled ? 'glass-warm shadow-warm' : 'bg-transparent';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-copper-400 via-copper-500 to-temple-gold-600 flex items-center justify-center text-ivory-50 text-xl font-bold mr-3 shadow-copper-glow">
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
              <span className={`text-[10px] md:text-xs uppercase tracking-widest ${scrolled ? 'text-charcoal-500' : 'text-ivory-200'}`}>
                Sacred Temples • Verified Sevas
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`text-sm font-medium transition-all duration-300 ${activeTab === link.id ? 'text-copper-500' : `${navTextColor} ${navHoverColor}`}`}
              >
                {link.label}
              </button>
            ))}
            
            {/* More Dropdown */}
            <div className="relative" onMouseLeave={() => setMoreDropdownOpen(false)}>
              <button 
                onMouseEnter={() => setMoreDropdownOpen(true)}
                className={`flex items-center space-x-1 text-sm font-medium transition-all duration-300 ${['panchang', 'library', 'astro', 'store'].includes(activeTab) ? 'text-copper-500' : `${navTextColor} ${navHoverColor}`}`}
              >
                <span>More</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {moreDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 rounded-xl bg-ivory-50 shadow-elevated border border-ivory-200 py-2 animate-fade-in-up">
                  {moreLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => { setActiveTab(link.id); setMoreDropdownOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-100 hover:text-copper-600 transition-colors"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <button onClick={onOpenWishlist} className={`relative p-2 rounded-full transition-all duration-300 hover:bg-black/5 ${navTextColor}`}>
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
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-300 ${isAdminMode ? 'bg-charcoal-900 text-ivory-50 border-charcoal-900' : (scrolled ? 'border-charcoal-200 text-charcoal-700 hover:bg-ivory-100' : 'border-ivory-200/30 text-ivory-50 hover:bg-white/10')}`}
            >
              Admin
            </button>

            {user ? (
              <div className="relative" onMouseLeave={() => setProfileDropdownOpen(false)}>
                <button 
                  onMouseEnter={() => setProfileDropdownOpen(true)}
                  className={`flex items-center space-x-2 transition-all duration-300 ${navTextColor}`}
                >
                  <div className="w-8 h-8 rounded-full bg-copper-100 flex items-center justify-center border-2 border-copper-400">
                    <User className="w-4 h-4 text-copper-600" />
                  </div>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 rounded-xl bg-ivory-50 shadow-elevated border border-ivory-200 py-2 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-ivory-200 mb-2">
                      <p className="text-sm font-semibold text-charcoal-900">{user.name || 'Devotee'}</p>
                      <p className="text-xs text-charcoal-500 truncate">{user.email || 'devotee@example.com'}</p>
                    </div>
                    <button onClick={() => { setActiveTab('account'); onOpenAccount?.(); setProfileDropdownOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-charcoal-700 hover:bg-ivory-100 hover:text-copper-600 transition-colors">
                      <LayoutDashboard className="w-4 h-4 mr-3 text-charcoal-400" /> Dashboard
                    </button>
                    <button onClick={() => { onLogout(); setProfileDropdownOpen(false); }} className="flex items-center w-full px-4 py-2 text-sm text-vermilion-600 hover:bg-vermilion-50 transition-colors">
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

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={onOpenWishlist} className={`relative p-1 ${navTextColor}`}>
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-vermilion-500 text-ivory-50 text-[10px] font-bold flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button onClick={() => setMobileMenuOpen(true)} className={navTextColor}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-ivory-50 h-full shadow-elevated animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-ivory-200">
              <span className="font-display font-bold text-xl text-charcoal-900">Menu</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-charcoal-500 hover:bg-ivory-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
              {[...navLinks, ...moreLinks].map(link => (
                <button
                  key={link.id}
                  onClick={() => { setActiveTab(link.id); setMobileMenuOpen(false); }}
                  className={`block w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === link.id ? 'bg-copper-50 text-copper-600' : 'text-charcoal-700 hover:bg-ivory-100'}`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-ivory-200 space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-sm font-medium text-charcoal-700">Admin Mode</span>
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isAdminMode ? 'bg-copper-500' : 'bg-charcoal-200'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isAdminMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {user ? (
                <>
                  <button onClick={() => { setActiveTab('account'); onOpenAccount?.(); setMobileMenuOpen(false); }} className="w-full flex items-center px-4 py-3 text-charcoal-700 hover:bg-ivory-100 rounded-xl transition-colors">
                    <User className="w-5 h-5 mr-3 text-copper-500" /> Account Dashboard
                  </button>
                  <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="w-full flex items-center px-4 py-3 text-vermilion-600 hover:bg-vermilion-50 rounded-xl transition-colors">
                    <LogOut className="w-5 h-5 mr-3" /> Logout
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}
                  className="w-full bg-temple-gold-400 hover:bg-temple-gold-500 text-charcoal-900 font-semibold py-3 rounded-xl shadow-warm transition-all"
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
