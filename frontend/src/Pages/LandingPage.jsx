import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Local landing page image assets
import heroWall1 from "../assets/landing/hero-wall-1.jpg";
import heroWall2 from "../assets/landing/hero-wall-2.jpg";
import heroWall3 from "../assets/landing/hero-wall-3.jpg";
import heroWall4 from "../assets/landing/hero-wall-4.jpg";
import heroWall5 from "../assets/landing/hero-wall-5.jpg";
import heroWall6 from "../assets/landing/hero-wall-6.jpg";
import heroWall7 from "../assets/landing/hero-wall-7.jpg";
import heroWall8 from "../assets/landing/hero-wall-8.jpg";
import heroWall9 from "../assets/landing/hero-wall-9.jpg";
import heroWall10 from "../assets/landing/hero-wall-10.jpg";
import heroWall11 from "../assets/landing/hero-wall-11.jpg";
import heroWall12 from "../assets/landing/hero-wall-12.jpg";

import heroBackLeft from "../assets/landing/hero-back-left.jpg";
import heroBackRight from "../assets/landing/hero-back-right.jpg";
import heroCenter from "../assets/landing/hero-center.jpg";

import stepDiscover from "../assets/landing/step-discover.jpg";
import stepTag from "../assets/landing/step-tag.jpg";
import stepSave from "../assets/landing/step-save.jpg";

export default function LandingPage() {
  const { auth } = useAuth();
  const isLoggedIn = Boolean(auth?.token || auth?.user);

  // Header scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  // Categorized columns for the 3 marquee tracks
  const col1Images = [heroWall1, heroWall2, heroWall3, heroWall7];
  const col2Images = [heroWall4, heroWall5, heroWall6, heroWall10];
  const col3Images = [heroWall8, heroWall9, heroWall11, heroWall12];

  useEffect(() => {
    // Header background on scroll
    const handleScrollHeader = () => {
      setIsScrolled(window.scrollY > 40);
    };

    // Step connecting line scroll logic
    const handleScrollLine = () => {
      const section = document.getElementById("how-it-works");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const startTrigger = windowHeight * 0.7;
      const scrolled = startTrigger - rect.top;
      const scrollRange = rect.height * 0.8;

      let progress = 0;
      if (scrolled > 0) {
        progress = scrolled / scrollRange;
        progress = Math.max(0, Math.min(1, progress));
      }

      const line = document.getElementById("scroll-line");
      if (line) {
        line.style.height = `${progress * 100}%`;
      }

      const nodes = document.querySelectorAll(".step-node");
      nodes.forEach((node) => {
        const nodeRect = node.parentElement.getBoundingClientRect();
        if (nodeRect.top < startTrigger) {
          node.style.transform = "translate(-50%, -50%) scale(1)";
        } else {
          node.style.transform = "translate(-50%, -50%) scale(0)";
        }
      });
    };

    const handleScroll = () => {
      handleScrollHeader();
      handleScrollLine();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans text-[#475569] antialiased bg-[#f7f9fb] min-h-screen overflow-x-hidden">
      {/* Dynamic Header Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-out ${isScrolled
          ? "bg-[#ffffff]/95 backdrop-blur-md shadow-xs border-b border-[#E2E8F0]"
          : "bg-[#f7f9fb]/90 backdrop-blur-md border-b border-[#E2E8F0]"
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

      {/* Split Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-[#f7f9fb]">
        <div className="max-w-container-max mx-auto px-md md:px-gutter grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-20">
          {/* Left Column: Text & Actions (5 cols on lg) */}
          <div className="lg:col-span-5 text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] tracking-tight leading-[1.12]">
              Curate your setup.
            </h1>

            <p className="text-lg md:text-xl text-[#475569] max-w-xl leading-relaxed font-normal">
              Browse thousands of curated workspaces, tag mechanical keyboards &
              gear specs, and save inspiration into custom collections.
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
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0"
                  >
                    <img
                      src={img}
                      alt={`Setup ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div
                className="flex flex-col gap-4 shrink-0 animate-marquee-up"
                aria-hidden="true"
              >
                {col1Images.map((img, idx) => (
                  <div
                    key={`dup-${idx}`}
                    className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0"
                  >
                    <img
                      src={img}
                      alt={`Setup ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Downward Marquee */}
            <div className="flex flex-col gap-4 w-36 sm:w-44 lg:w-44 shrink-0 overflow-hidden h-full">
              <div className="flex flex-col gap-4 shrink-0 animate-marquee-down">
                {col2Images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0"
                  >
                    <img
                      src={img}
                      alt={`Setup ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div
                className="flex flex-col gap-4 shrink-0 animate-marquee-down"
                aria-hidden="true"
              >
                {col2Images.map((img, idx) => (
                  <div
                    key={`dup-${idx}`}
                    className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0"
                  >
                    <img
                      src={img}
                      alt={`Setup ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Upward Marquee (Fills space between text & right edge) */}
            <div className="hidden sm:flex flex-col gap-4 w-36 sm:w-44 lg:w-44 shrink-0 overflow-hidden h-full">
              <div className="flex flex-col gap-4 shrink-0 animate-marquee-up-slow">
                {col3Images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0"
                  >
                    <img
                      src={img}
                      alt={`Setup ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div
                className="flex flex-col gap-4 shrink-0 animate-marquee-up-slow"
                aria-hidden="true"
              >
                {col3Images.map((img, idx) => (
                  <div
                    key={`dup-${idx}`}
                    className="rounded-2xl overflow-hidden border-2 border-[#ffffff] shadow-md bg-white aspect-[4/5] shrink-0"
                  >
                    <img
                      src={img}
                      alt={`Setup ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Showcase Interactive Hero Mockup */}
      <section className="max-w-container-max mx-auto px-md py-12 reveal-on-scroll">
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

          {/* Main Focal Center Desk Photo */}
          <div className="relative z-10 w-full aspect-video rounded-3xl overflow-hidden border-4 border-[#ffffff] shadow-2xl bg-[#ffffff] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)] cursor-pointer">
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

      {/* How It Works Steps Section */}
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

        {/* Step 01: Discover */}
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

        {/* Step 02: Tag Gear */}
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

        {/* Step 03: Save Collections */}
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

      {/* Footer */}
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
            <span className="text-sm text-[#475569]">Privacy</span>
            <span className="text-sm text-[#475569]">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
