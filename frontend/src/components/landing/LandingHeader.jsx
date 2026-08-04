import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingHeader({ isScrolled, isLoggedIn }) {
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-[#ffffff]/95 backdrop-blur-md shadow-xs border-b border-[#E2E8F0]'
          : 'bg-[#f7f9fb]/90 backdrop-blur-md border-b border-[#E2E8F0]'
      }`}
    >
      <div className="flex justify-between items-center max-w-container-max mx-auto px-md h-16">
        {/* Official SetupSpot Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            alt="SetupSpot Logo"
            className="w-9 h-9 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
            src="/favicon_io/android-chrome-192x192.png"
          />
          <span className="text-xl font-bold text-[#0F172A] tracking-tight font-sans">
            SetupSpot
          </span>
        </Link>

        {/* Navigation Links (Center) */}
        <div className="hidden md:flex items-center gap-lg">
          <Link
            to="/explore"
            className="text-[#0066ff] border-b-2 border-[#0066ff] pb-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-[#0050cb] hover:border-[#0050cb]"
          >
            Explore
          </Link>
        </div>

        {/* Actions (Right) */}
        <div className="flex items-center gap-md">
          {isLoggedIn ? (
            <Link
              to="/explore"
              className="bg-[#0066ff] text-[#ffffff] text-xs font-semibold uppercase tracking-wider px-6 py-2 rounded-full hover:bg-[#0050cb] transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
            >
              Open App
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-xs font-semibold uppercase tracking-wider text-[#475569] hover:text-[#0066ff] transition-colors duration-200 hidden sm:block"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="bg-[#0066ff] text-[#ffffff] text-xs font-semibold uppercase tracking-wider px-6 py-2 rounded-full hover:bg-[#0050cb] transition-all duration-200 hover:-translate-y-0.5 shadow-xs"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
