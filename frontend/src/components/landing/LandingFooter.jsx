import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingFooter() {
  return (
    <footer className="w-full py-12 bg-[#ffffff] border-t border-[#E2E8F0] reveal-on-scroll">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/Logo.png"
              alt="SetupSpot Logo"
              className="w-8 h-8 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-xl font-bold text-[#0F172A] tracking-tight font-sans">
              SetupSpot
            </span>
          </Link>
          <p className="text-sm text-[#727687]">
            © {new Date().getFullYear()} SetupSpot. All rights reserved.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Explore
          </h3>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors hover:underline underline-offset-4"
          >
            Product
          </Link>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors hover:underline underline-offset-4"
          >
            Discover
          </Link>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors hover:underline underline-offset-4"
          >
            Features
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Company
          </h3>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            to="/explore"
            className="text-sm text-[#475569] hover:text-[#0066ff] transition-colors hover:underline underline-offset-4"
          >
            Careers
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Legal
          </h3>
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
