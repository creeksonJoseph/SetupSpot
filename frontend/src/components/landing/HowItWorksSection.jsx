import React from 'react';

export default function HowItWorksSection({ stepDiscover, stepTag, stepSave }) {
  return (
    <section
      className="max-w-container-max mx-auto px-4 md:px-gutter space-y-12 md:space-y-xl mb-xl relative pt-8 border-t border-[#E2E8F0]/60 md:border-t-0"
      id="how-it-works"
    >
      {/* Scroll Connector Line (Desktop Only) */}
      <div className="absolute left-1/2 top-24 bottom-24 w-0.5 -translate-x-1/2 hidden lg:block z-0 pointer-events-none">
        <div className="h-full w-full bg-[#E2E8F0] relative rounded-full">
          <div
            className="absolute top-0 left-0 w-full bg-[#0066ff] transition-all duration-100 ease-out rounded-full"
            id="scroll-line"
            style={{ height: "0%" }}
          ></div>
        </div>
      </div>

      {/* Feature 01: Discover */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 reveal-on-scroll">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#0066ff] bg-[#f7f9fb] flex items-center justify-center shadow-md">
            <div className="w-4 h-4 rounded-full bg-[#0066ff]"></div>
          </div>
        </div>
        <div className="w-full md:w-1/2 order-1 md:order-1 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
          <img
            className="w-full h-64 md:h-80 object-cover transition-transform duration-500 ease-out hover:scale-102"
            alt="An expansive view of workspace setups"
            src={stepDiscover}
          />
        </div>
        <div className="w-full md:w-1/2 order-2 md:order-2 space-y-3 lg:pl-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Discover inspiration
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Endless scrolls of pristine home offices, high-performance gaming rigs, and cozy coding nooks. Find exactly the vibe you need to upgrade your own space.
          </p>
        </div>
      </div>

      {/* Feature 02: Tag */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 reveal-on-scroll">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
          <div className="w-5 h-5 rounded-full bg-[#0066ff] shadow-md border-4 border-[#f7f9fb]"></div>
        </div>
        <div className="w-full md:w-1/2 order-2 md:order-1 space-y-3 lg:pr-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Identify the gear
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Ever wonder what monitor arm or mechanical switch someone is using? Our interactive tagging system lets you click right through to the hardware specs.
          </p>
        </div>
        <div className="w-full md:w-1/2 order-1 md:order-2 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
          <img
            className="w-full h-64 md:h-80 object-cover transition-transform duration-500 ease-out hover:scale-102"
            alt="Interactive tagging system overlay on desk setup"
            src={stepTag}
          />
        </div>
      </div>

      {/* Feature 03: Save */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10 reveal-on-scroll">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
          <div className="w-5 h-5 rounded-full bg-[#0066ff] shadow-md border-4 border-[#f7f9fb]"></div>
        </div>
        <div className="w-full md:w-1/2 order-1 md:order-1 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] shadow-md transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
          <img
            className="w-full h-64 md:h-80 object-cover transition-transform duration-500 ease-out hover:scale-102"
            alt="Digital mood boards and curated collections"
            src={stepSave}
          />
        </div>
        <div className="w-full md:w-1/2 order-2 md:order-2 space-y-3 lg:pl-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Curate collections
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Save your favorite setups into personal collections. Build mood boards for your upcoming office renovation or dream PC build.
          </p>
        </div>
      </div>
    </section>
  );
}
