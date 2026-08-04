import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="w-full py-12 bg-[#ffffff] border-t border-[#E2E8F0] reveal-on-scroll">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-md max-w-container-max mx-auto px-md">
        <div className="col-span-2 lg:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              alt="SetupSpot Logo"
              className="w-8 h-8 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
              src="/favicon_io/android-chrome-192x192.png"
            />
            <span className="text-lg font-bold text-[#0F172A] tracking-tight font-sans">
              SetupSpot
            </span>
          </Link>
          <p className="text-sm text-[#727687]">
            © {new Date().getFullYear()} SetupSpot. All rights reserved.
          </p>
        </div>
        <div className="flex flex-col space-y-3">
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
            Product
          </span>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors duration-200"
          >
            Explore
          </Link>
          <Link
            to="/collections"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors duration-200"
          >
            Collections
          </Link>
        </div>
        <div className="flex flex-col space-y-3">
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
            Company
          </span>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors duration-200"
          >
            Community
          </Link>
        </div>
        <div className="flex flex-col space-y-3">
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">
            Legal
          </span>
          <span className="text-sm text-[#475569]">
            Privacy
          </span>
          <span className="text-sm text-[#475569]">
            Terms
          </span>
        </div>
      </div>
    </footer>
  );
}
