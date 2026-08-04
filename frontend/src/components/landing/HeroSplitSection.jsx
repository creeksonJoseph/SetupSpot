import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSplitSection({ isLoggedIn, col1Images, col2Images, col3Images }) {
  return (
    <section className="relative pt-24 pb-12 overflow-hidden bg-[#f7f9fb]">
      <div className="max-w-container-max mx-auto px-md md:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20">
        {/* Left Column: Text & Actions (5 cols on lg) */}
        <div className="lg:col-span-5 text-left space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12]">
            Curate your setup.
          </h1>

          <p className="text-lg md:text-xl text-[#475569] max-w-xl leading-relaxed font-normal">
            Browse thousands of curated workspaces, tag mechanical keyboards & gear specs, and save inspiration into custom collections.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              to="/explore"
              className="bg-[#0066ff] text-[#ffffff] text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-full hover:bg-[#0050cb] transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              Explore All Setups
            </Link>
            <Link
              to={isLoggedIn ? "/create" : "/signup"}
              className="bg-[#ffffff] text-[#0F172A] border border-[#E2E8F0] text-xs font-semibold uppercase tracking-wider px-8 py-3.5 rounded-full hover:border-[#0066ff] hover:text-[#0066ff] transition-all duration-200 hover:-translate-y-0.5 shadow-xs w-full sm:w-auto text-center"
            >
              {isLoggedIn ? "Share Your Setup" : "Create Account"}
            </Link>
          </div>
        </div>

        {/* Right Column: 3 Seamless Infinite Marquee Columns (7 cols on lg) */}
        <div className="lg:col-span-7 relative flex justify-center lg:justify-end gap-3.5 sm:gap-4 overflow-hidden h-[460px] sm:h-[500px] pointer-events-none select-none">
          {/* Column 1: Upward Marquee */}
          <div className="flex flex-col gap-4 w-36 sm:w-44 lg:w-44 shrink-0 overflow-hidden h-full">
            <div className="flex flex-col gap-4 shrink-0 animate-marquee-up">
              {col1Images.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0">
                  <img src={img} alt={`Setup ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 shrink-0 animate-marquee-up" aria-hidden="true">
              {col1Images.map((img, idx) => (
                <div key={`dup-${idx}`} className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0">
                  <img src={img} alt={`Setup ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Downward Marquee */}
          <div className="flex flex-col gap-4 w-36 sm:w-44 lg:w-44 shrink-0 overflow-hidden h-full">
            <div className="flex flex-col gap-4 shrink-0 animate-marquee-down">
              {col2Images.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0">
                  <img src={img} alt={`Setup ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 shrink-0 animate-marquee-down" aria-hidden="true">
              {col2Images.map((img, idx) => (
                <div key={`dup-${idx}`} className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0">
                  <img src={img} alt={`Setup ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Upward Marquee (Fills space between text & right edge) */}
          <div className="hidden sm:flex flex-col gap-4 w-36 sm:w-44 lg:w-44 shrink-0 overflow-hidden h-full">
            <div className="flex flex-col gap-4 shrink-0 animate-marquee-up-slow">
              {col3Images.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0">
                  <img src={img} alt={`Setup ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4 shrink-0 animate-marquee-up-slow" aria-hidden="true">
              {col3Images.map((img, idx) => (
                <div key={`dup-${idx}`} className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0">
                  <img src={img} alt={`Setup ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
