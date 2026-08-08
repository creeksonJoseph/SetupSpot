import React from 'react';

export default function FeaturedShowcaseSection({ heroBackLeft, heroBackRight, heroCenter }) {
  return (
    <section className="max-w-container-max mx-auto px-6 sm:px-10 md:px-12 lg:px-16 py-12 reveal-on-scroll">
      <div className="relative w-full max-w-5xl mx-auto pt-8 pb-4">
        {/* Back Left Supporting Photo (Tucked behind back corner at -rotate-6) */}
        <div className="absolute -left-6 sm:-left-12 -top-4 sm:-top-8 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 -rotate-6 z-0 rounded-2xl overflow-hidden border-4 border-[#ffffff] bg-[#ffffff] shadow-xl hidden sm:block transition-all duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:shadow-2xl hover:z-20 cursor-pointer">
          <img
            className="w-full h-full object-cover"
            alt="Minimal mechanical keyboard setup"
            src={heroBackLeft}
          />
        </div>

        {/* Back Right Supporting Photo (Tucked behind back corner at rotate-6) */}
        <div className="absolute -right-6 sm:-right-12 -top-2 sm:-top-6 w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rotate-6 z-0 rounded-2xl overflow-hidden border-4 border-[#ffffff] bg-[#ffffff] shadow-xl hidden sm:block transition-all duration-300 ease-out hover:-translate-y-2 hover:rotate-0 hover:shadow-2xl hover:z-20 cursor-pointer">
          <img
            className="w-full h-full object-cover"
            alt="Organized desk gear and cables"
            src={heroBackRight}
          />
        </div>

        {/* Main Focal Center Desk Photo — Static, no hover motion */}
        <div className="relative z-10 w-full aspect-video rounded-3xl overflow-hidden border-4 border-[#ffffff] shadow-2xl bg-[#ffffff]">
          <img
            className="w-full h-full object-cover"
            alt="Beautifully organized desk setup"
            src={heroCenter}
          />

          {/* Sequential Animated Equipment Tag Callouts */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Tag 1: Mechanical Keyboard (Delay 0.4s) */}
            <div
              className="absolute bottom-[22%] left-[44%] flex flex-col items-center animate-tag-seq"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md mb-2 whitespace-nowrap border border-[#0066ff]/15">
                Mechanical Keyboard
              </div>
              <div className="w-px h-7 bg-white/90 shadow-xs"></div>
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_0_4px_rgba(0,102,255,0.25)]"></div>
            </div>

            {/* Tag 2: Monitor Light Bar (Delay 0.9s) */}
            <div
              className="absolute top-[22%] left-[48%] flex flex-col items-center animate-tag-seq"
              style={{ animationDelay: '0.9s' }}
            >
              <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md mb-2 whitespace-nowrap border border-[#0066ff]/15">
                Monitor Light Bar
              </div>
              <div className="w-px h-8 bg-white/90 shadow-xs"></div>
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_0_4px_rgba(0,102,255,0.25)]"></div>
            </div>

            {/* Tag 3: Widescreen Monitor (Delay 1.4s) */}
            <div
              className="absolute top-[38%] right-[28%] flex flex-col items-center animate-tag-seq"
              style={{ animationDelay: '1.4s' }}
            >
              <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md mb-2 whitespace-nowrap border border-[#0066ff]/15">
                Widescreen Monitor
              </div>
              <div className="w-px h-10 bg-white/90 shadow-xs"></div>
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_0_4px_rgba(0,102,255,0.25)]"></div>
            </div>

            {/* Tag 4: Cable Tray (Delay 1.9s) */}
            <div
              className="absolute bottom-[12%] right-[38%] flex flex-col items-center animate-tag-seq"
              style={{ animationDelay: '1.9s' }}
            >
              <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full shadow-md mb-2 whitespace-nowrap border border-[#0066ff]/15">
                Cable Tray
              </div>
              <div className="w-px h-10 bg-white/90 shadow-xs"></div>
              <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_0_4px_rgba(0,102,255,0.25)]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
