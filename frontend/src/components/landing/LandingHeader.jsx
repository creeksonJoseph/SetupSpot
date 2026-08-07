import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';

export default function LandingHeader({ isScrolled, isLoggedIn }) {
  const location = useLocation();
  const isExploreActive = location.pathname === '/explore';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-out ${
          isScrolled
            ? 'bg-[#ffffff]/95 backdrop-blur-md shadow-sm border-b border-[#E2E8F0]'
            : 'bg-[#f7f9fb]/90 backdrop-blur-md border-b border-[#E2E8F0]'
        }`}
      >
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-10 h-14 md:h-16">
          {/* Official SetupSpot Brand Logo — Takes you to Landing Page */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/Logo.png"
              alt="SetupSpot Logo"
              className="w-8 h-8 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-bold text-[#0F172A] tracking-tight font-sans">
              SetupSpot
            </span>
          </Link>

          {/* Navigation Links (Desktop Center) */}
          <div className="hidden md:flex items-center gap-lg">
            <Link
              to="/explore"
              className={
                isExploreActive
                  ? "text-[#0066ff] border-b-2 border-[#0066ff] pb-1 text-xs font-semibold uppercase tracking-wider transition-colors"
                  : "text-[#475569] border-b-2 border-transparent pb-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-[#0066ff]"
              }
            >
              Explore
            </Link>
          </div>

          {/* Desktop Actions (>= md) */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                to="/explore"
                className="bg-[#0066ff] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#0050cb] transition-all shadow-xs"
              >
                Open App
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold uppercase tracking-wider text-[#475569] hover:text-[#0066ff] transition-colors duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#0066ff] text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#0050cb] transition-all shadow-xs"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions (< md) */}
          <div className="flex md:hidden items-center gap-1.5">
            {!isLoggedIn && isExploreActive && (
              <Link
                to="/search"
                className="flex items-center justify-center w-9 h-9 rounded-full text-slate-700 hover:text-[#0066ff] hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Search setups"
                title="Search setups"
              >
                <Search size={20} />
              </Link>
            )}

            {isLoggedIn ? (
              <Link
                to="/explore"
                className="bg-[#0066ff] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-xs"
              >
                Open App
              </Link>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-[#0F172A] hover:text-[#0066ff] rounded-lg transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Dark Overlay Background & Compact Popup Menu for Guests */}
      {!isLoggedIn && mobileMenuOpen && (
        <>
          {/* Dark Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Compact Popup Card positioned top right below navbar */}
          <div className="fixed top-16 right-4 z-50 w-48 bg-white rounded-2xl p-2 shadow-2xl border border-[#E2E8F0] md:hidden animate-fade-in-up">
            <div className="flex flex-col gap-1">
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#0F172A] hover:text-[#0066ff] py-2.5 px-3 rounded-xl hover:bg-[#f7f9fb] transition-colors flex items-center justify-between"
              >
                <span>Search Setups</span>
                <Search size={16} className="text-slate-400" />
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#0F172A] hover:text-[#0066ff] py-2.5 px-3 rounded-xl hover:bg-[#f7f9fb] transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-[#0F172A] hover:text-[#0066ff] py-2.5 px-3 rounded-xl hover:bg-[#f7f9fb] transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
