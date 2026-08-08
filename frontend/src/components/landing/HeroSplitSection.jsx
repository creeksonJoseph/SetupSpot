import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSplitSection({ isLoggedIn, col1Images, col2Images, col3Images }) {
  const mobileImages = [...col1Images, ...col2Images, ...col3Images];

  return (
    <>
      {/* Mobile Hero View (< md) */}
      <section className="pt-24 pb-6 px-6 sm:px-10 bg-[#f7f9fb] md:hidden">
        <h1 className="text-4xl font-extrabold text-[#0F172A] tracking-tight leading-tight">
          Curate your setup.
        </h1>
        <p className="text-base text-[#475569] leading-relaxed mt-4">
          Browse thousands of curated workspaces, tag mechanical keyboards &amp; gear specs, and save inspiration into custom collections.
        </p>
        <div className="mt-6 flex flex-row items-center gap-2.5">
          <Link
            to="/explore"
            className="flex-1 bg-[#0066ff] text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-full text-center shadow-sm hover:bg-[#0050cb] transition-colors truncate"
          >
            Explore Setups
          </Link>
          <Link
            to={isLoggedIn ? "/create" : "/signup"}
            className="flex-1 bg-white text-[#0F172A] border border-[#E2E8F0] text-[11px] sm:text-xs font-bold uppercase tracking-wider py-2.5 px-3 rounded-full text-center shadow-xs hover:border-[#0066ff] hover:text-[#0066ff] transition-colors truncate"
          >
            {isLoggedIn ? "Share Setup" : "Create Account"}
          </Link>
        </div>
        <div className="mt-8">
          <div className="flex overflow-x-auto gap-3 pb-4 snap-x no-scrollbar">
            {mobileImages.map((img, idx) => (
              <div
                key={idx}
                className="shrink-0 w-40 aspect-[4/5] rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white snap-center"
              >
                <img
                  src={img}
                  alt={`Setup ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Desktop Hero View (>= md) */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#f7f9fb] hidden md:block">
        <div className="max-w-container-max mx-auto px-6 sm:px-10 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20">
          {/* Left Column: Text & Actions (5 cols on lg) */}
          <div className="lg:col-span-5 text-left space-y-6 lg:pl-2">
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

            {/* Column 3: Upward Marquee */}
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
    </>
  );
}
