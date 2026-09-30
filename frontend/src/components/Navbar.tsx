import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Activity, Zap } from 'lucide-react';
import { HealthStatus } from '../types';

interface NavbarProps {
  health: HealthStatus | null;
}

export const Navbar: React.FC<NavbarProps> = ({ health }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/corrector', label: 'Corrector' },
    { to: '/how-it-works', label: 'How It Works' },
    { to: '/algorithms', label: 'Algorithms' },
    { to: '/examples', label: 'Examples' },
    { to: '/about', label: 'About' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#080c16]/90 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400/60 group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                SpellSense
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                NLP
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              TextBlob • SymSpell Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right CTA and Mobile Hamburger */}
        <div className="flex items-center gap-3">
          
          {/* Health status pill */}
          <div
            title={
              health
                ? `FastAPI Backend Active (${health.dictionary_terms_loaded.toLocaleString()} lexicon terms)`
                : 'Connecting to Python API...'
            }
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border bg-slate-900/80 border-slate-800"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-300 text-xs">
              {health ? 'API Ready' : 'Connecting'}
            </span>
          </div>

          {/* Desktop Try Corrector CTA */}
          <Link
            to="/corrector"
            onClick={handleLinkClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-950/40 hover:shadow-cyan-500/20 transition-all cursor-pointer min-h-[40px]"
          >
            <span>Try Corrector</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Hamburger Toggle Button (min 44px touch target) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-cyan-400" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Drawer / Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800/90 bg-[#080c16]/98 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 pt-3 pb-5 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={handleLinkClick}
                  className={`block px-4 py-3 rounded-xl text-base font-medium min-h-[44px] flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                </Link>
              );
            })}

            {/* Mobile CTA */}
            <div className="pt-3">
              <Link
                to="/corrector"
                onClick={handleLinkClick}
                className="w-full py-3 px-4 rounded-xl text-center text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white flex items-center justify-center gap-2 min-h-[44px] shadow-lg shadow-cyan-950/50"
              >
                <span>Launch Spelling Corrector</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Health info */}
            <div className="pt-2 px-2 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>FastAPI Backend</span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {health ? `${health.dictionary_terms_loaded.toLocaleString()} terms` : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
