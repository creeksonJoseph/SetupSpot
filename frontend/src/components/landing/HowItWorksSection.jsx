import React from 'react';

export default function HowItWorksSection({ stepDiscover, stepTag, stepSave }) {
  return (
    <section
      className="max-w-container-max mx-auto px-md md:px-gutter space-y-xl mb-xl relative pt-8"
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center relative z-10 reveal-on-scroll">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
          <div className="w-10 h-10 rounded-full border-[3px] border-[#0066ff] bg-[#f7f9fb] flex items-center justify-center shadow-md">
            <div className="w-4 h-4 rounded-full bg-[#0066ff]"></div>
          </div>
        </div>
        <div className="order-2 lg:order-1 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
          <img
            className="w-full h-full object-cover aspect-[4/3] transition-transform duration-500 ease-out hover:scale-102"
            alt="Clean minimalist desk setup bathed in natural sunlight"
            src={stepDiscover}
          />
        </div>
        <div className="order-1 lg:order-2 space-y-4 lg:pl-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Discover.
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Get inspired by the world's most beautiful workspaces. Browse
            curated feeds of minimalist, productive, and creative setups from
            designers, developers, and creators globally.
          </p>
        </div>
      </div>

      {/* Feature 02: Tag Gear */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center relative z-10 reveal-on-scroll">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
          <div className="w-5 h-5 rounded-full bg-[#0066ff] shadow-md border-4 border-[#f7f9fb]"></div>
        </div>
        <div className="space-y-4 lg:pr-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Tag.
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            See exactly what gear makes the setup. From custom mechanical
            keyboards to 4k monitors and acoustic panels, hover over tags to
            discover specs, brands, and where to buy.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
          <img
            className="w-full h-full object-cover aspect-[4/3] transition-transform duration-500 ease-out hover:scale-102"
            alt="Product photograph of desk setup gear"
            src={stepTag}
          />
        </div>
      </div>

      {/* Feature 03: Save Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center relative z-10 reveal-on-scroll">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
          <div className="w-5 h-5 rounded-full bg-[#0066ff] shadow-md border-4 border-[#f7f9fb]"></div>
        </div>
        <div className="order-2 lg:order-1 rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] flex items-center justify-center p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
          <img
            className="w-full max-w-md h-auto shadow-sm rounded-lg border border-[#E2E8F0] transition-transform duration-500 ease-out hover:scale-102"
            alt="iMac displaying desk setups UI"
            src={stepSave}
          />
        </div>
        <div className="order-1 lg:order-2 space-y-4 lg:pl-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
            Save.
          </h2>
          <p className="text-base text-[#475569] leading-relaxed">
            Organize your favorite finds into personal collections. Build mood
            boards for your future office renovation, save specific keyboard
            builds, or track cable management ideas.
          </p>
        </div>
      </div>
    </section>
  );
}
