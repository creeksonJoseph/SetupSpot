import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { auth } = useAuth();
  const isLoggedIn = Boolean(auth?.token || auth?.user);

  // Header scroll state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // 1. Header background on scroll past hero
    const handleScrollHeader = () => {
      setIsScrolled(window.scrollY > 50);
    };

    // 2. Connecting line and step nodes scroll logic
    const handleScrollLine = () => {
      const section = document.getElementById('how-it-works');
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

      const line = document.getElementById('scroll-line');
      if (line) {
        line.style.height = `${progress * 100}%`;
      }

      const nodes = document.querySelectorAll('.step-node');
      nodes.forEach((node) => {
        const nodeRect = node.parentElement.getBoundingClientRect();
        if (nodeRect.top < startTrigger) {
          node.style.transform = 'translate(-50%, -50%) scale(1)';
        } else {
          node.style.transform = 'translate(-50%, -50%) scale(0)';
        }
      });
    };

    const handleScroll = () => {
      handleScrollHeader();
      handleScrollLine();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 3. Scroll Reveal Animation for sections
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans text-[#475569] antialiased bg-[#f7f9fb] min-h-screen">
      {/* Dynamic Header Navbar */}
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

      <main className="pt-24 pb-xl">
        {/* Hero Section — split layout */}
        <section className="max-w-container-max mx-auto px-md md:px-gutter pt-xl pb-xl reveal-on-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]">
            {/* Left: text */}
            <div className="flex flex-col justify-center text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 mb-6 self-start">
                <span className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  50,000+ enthusiasts
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0F172A] mb-6 tracking-tight leading-[1.05]">
                Where your dream setup comes to life.
              </h1>
              <p className="text-lg md:text-xl text-[#475569] max-w-xl mb-10 leading-relaxed font-normal">
                Join the community sharing their workspaces, tagging gear, and building the ultimate setup collections.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to={isLoggedIn ? "/create" : "/signup"}
                  className="bg-[#0066ff] text-[#ffffff] text-xs font-semibold uppercase tracking-wider px-8 py-3 rounded-full hover:bg-[#0050cb] transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md w-full sm:w-auto text-center"
                >
                  {isLoggedIn ? "Share Your Setup" : "Sign Up"}
                </Link>
                <a
                  href="#how-it-works"
                  className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0066ff] hover:text-[#0050cb] transition-colors w-full sm:w-auto"
                >
                  See how it works
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform duration-200">
                    arrow_forward
                  </span>
                </a>
              </div>
            </div>

            {/* Right: image with tags */}
            <div className="relative order-1 lg:order-2 reveal-on-scroll">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-4 border-[#ffffff] shadow-2xl bg-[#ffffff] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] cursor-pointer">
                <img
                  className="w-full h-full object-cover"
                  alt="Modern minimalist desk setup"
                  src="https://images.pexels.com/photos/5366225/pexels-photo-5366225.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                />
                {/* Animated Tags Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Tag 1: Mechanical Keyboard */}
                  <div
                    className="absolute bottom-[18%] left-[42%] flex flex-col items-center animate-fade-in-up"
                    style={{ animationDelay: '0.35s' }}
                  >
                    <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs mb-2 whitespace-nowrap">
                      Mechanical Keyboard
                    </div>
                    <div className="w-px h-6 bg-white/80 shadow-xs"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"></div>
                  </div>
                  {/* Tag 2: Monitor Light Bar */}
                  <div
                    className="absolute top-[22%] left-[48%] flex flex-col items-center animate-fade-in-up"
                    style={{ animationDelay: '0.7s' }}
                  >
                    <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs mb-2 whitespace-nowrap">
                      Monitor Light Bar
                    </div>
                    <div className="w-px h-8 bg-white/80 shadow-xs"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"></div>
                  </div>
                  {/* Tag 3: Widescreen Monitor */}
                  <div
                    className="absolute top-[38%] right-[28%] flex flex-col items-center animate-fade-in-up"
                    style={{ animationDelay: '1.0s' }}
                  >
                    <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs mb-2 whitespace-nowrap">
                      Widescreen Monitor
                    </div>
                    <div className="w-px h-10 bg-white/80 shadow-xs"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"></div>
                  </div>
                  {/* Tag 4: Cable Tray */}
                  <div
                    className="absolute bottom-[8%] right-[38%] flex flex-col items-center animate-fade-in-up"
                    style={{ animationDelay: '1.35s' }}
                  >
                    <div className="bg-[#e6f0ff] text-[#0066ff] text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs mb-2 whitespace-nowrap">
                      Cable Tray
                    </div>
                    <div className="w-px h-12 bg-white/80 shadow-xs"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.3)]"></div>
                  </div>
                </div>
              </div>

              {/* Floating accent card */}
              <div className="absolute -bottom-6 -left-6 hidden md:flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#0066ff] border-2 border-white flex items-center justify-center text-white text-xs font-bold">A</div>
                  <div className="w-8 h-8 rounded-full bg-[#0F172A] border-2 border-white flex items-center justify-center text-white text-xs font-bold">M</div>
                  <div className="w-8 h-8 rounded-full bg-[#e11d48] border-2 border-white flex items-center justify-center text-white text-xs font-bold">K</div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0F172A] leading-tight">12,400 setups</p>
                  <p className="text-[11px] text-[#727687] leading-tight">shared this month</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          className="max-w-container-max mx-auto px-md md:px-gutter space-y-xl mb-xl relative"
          id="how-it-works"
        >
          {/* Scroll Connector Line (Desktop Only) */}
          <div className="absolute left-1/2 top-24 bottom-24 w-0.5 -translate-x-1/2 hidden lg:block z-0 pointer-events-none">
            <div className="h-full w-full bg-[#E2E8F0] relative rounded-full">
              <div
                className="absolute top-0 left-0 w-full bg-[#0066ff] transition-all duration-100 ease-out rounded-full"
                id="scroll-line"
                style={{ height: '0%' }}
              ></div>
            </div>
          </div>

          {/* Step 01: Discover */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center relative z-10 reveal-on-scroll">
            {/* Connecting Node 1 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
              <div className="w-10 h-10 rounded-full border-[3px] border-[#0066ff] bg-[#f7f9fb] flex items-center justify-center shadow-md">
                <div className="w-4 h-4 rounded-full bg-[#0066ff]"></div>
              </div>
            </div>
            <div className="order-2 lg:order-1 rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
              <img
                className="w-full h-full object-cover aspect-[4/3] transition-transform duration-500 ease-out hover:scale-102"
                alt="Clean minimalist desk setup bathed in natural sunlight"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCb7jjKLMbXodEpudlGq5Dtg6BVRcmBy3fX3bZydw7VT3-KTSeJ9nO2x9ug1s6LMQM68bRib6gGafRVBboWptVYKKsU-adAZTCGiL4r2IgDiSr1ytYQ8PtVBVOZkS5LzdUAcqfKpGtjfgihTY0wwsy0BQFPCEP2oOxE5qDtF3luaJVCbWEuya-iFLYJBq7djGo5OhvVgEEqGBInQk9w7VkBw8UEBvLva11jt837jiHOK6ML6S1sAEzv"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6 lg:pl-lg">
              <div className="text-xs font-semibold text-[#0066ff] uppercase tracking-wider">
                Step 01
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Discover.</h2>
              <p className="text-base text-[#475569] leading-relaxed">
                Get inspired by the world's most beautiful workspaces. Browse curated feeds of minimalist, productive, and creative setups from designers, developers, and creators globally.
              </p>
            </div>
          </div>

          {/* Step 02: Tag Gear */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center relative z-10 reveal-on-scroll">
            {/* Connecting Node 2 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
              <div className="w-5 h-5 rounded-full bg-[#0066ff] shadow-md border-4 border-[#f7f9fb]"></div>
            </div>
            <div className="space-y-6 lg:pr-lg">
              <div className="text-xs font-semibold text-[#0066ff] uppercase tracking-wider">
                Step 02
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Tag.</h2>
              <p className="text-base text-[#475569] leading-relaxed">
                See exactly what gear makes the setup. From custom mechanical keyboards to 4k monitors and acoustic panels, hover over tags to discover specs, brands, and where to buy.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
              <img
                className="w-full h-full object-cover aspect-[4/3] transition-transform duration-500 ease-out hover:scale-102"
                alt="Product photograph of desk setup gear"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmHaZIl_xQMZf6NDT17d8vog9CXLTWvNM-ky2GAd-Whbd7IVytVbYUEq3YDqYLqgNHzmFa-uLq3yUVf7NGrtVb7zIN521s4xlCQZdh14kS6655drMVrl-aavvWStB83QyjAPdbmRteEDRx4tfbN2OrzIzsKU4U2BzTioTZCfhCoBkIDF0nvgxtod-8j59TABlwDWwaqdk0ZgB_Uf7DRU5cL59KtsQJJTa3OsovFMXhSD3YtpGgm4Qg"
              />
            </div>
          </div>

          {/* Step 03: Collections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg items-center relative z-10 reveal-on-scroll">
            {/* Connecting Node 3 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center step-node transition-transform duration-300 scale-0">
              <div className="w-5 h-5 rounded-full bg-[#0066ff] shadow-md border-4 border-[#f7f9fb]"></div>
            </div>
            <div className="order-2 lg:order-1 rounded-xl overflow-hidden border border-[#E2E8F0] bg-[#ffffff] flex items-center justify-center p-8 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:shadow-xl hover:border-[#0066ff]/40 cursor-pointer">
              <img
                className="w-full max-w-md h-auto shadow-sm rounded-lg border border-[#E2E8F0] transition-transform duration-500 ease-out hover:scale-102"
                alt="iMac displaying desk setups UI"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfWekW5DJ_9AzeawE37oL5peMT39D_g3kgUIICtO5ly4FDbgfBUU0CPVeBE4iYOQMSbHxx_dcO2njdi_8h3GtO1Mok2-B-Gax-bCjNU39aw1kkFaTEdb2-kAmbWciHfSsKi8IEg0hZIxkeEK_jL5zZeYJmMOeulNQ1Ch_8SKGVVrv055jHJHfi_yV5l_yF6td0C8gi7VOxu8v3oR7qZ0Pa6OPq2EehI-t-rU3fmRMVQ5j2_DBrLtOv"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-6 lg:pl-lg">
              <div className="text-xs font-semibold text-[#0066ff] uppercase tracking-wider">
                Step 03
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Save.</h2>
              <p className="text-base text-[#475569] leading-relaxed">
                Organize your favorite finds into personal collections. Build mood boards for your future office renovation, save specific keyboard builds, or track cable management ideas.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-lg bg-[#ffffff] border-t border-[#E2E8F0] reveal-on-scroll">
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
    </div>
  );
}
