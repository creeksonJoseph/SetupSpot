import React, { useEffect, useState } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useSEO } from '../hooks/useSEO';

// Modular Landing Page Components
import LandingHeader from '../components/landing/LandingHeader';
import HeroSplitSection from '../components/landing/HeroSplitSection';
import FeaturedShowcaseSection from '../components/landing/FeaturedShowcaseSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import LandingFooter from '../components/landing/LandingFooter';

// Image assets
import heroWall1 from '../assets/landing/hero-wall-1.jpg';
import heroWall2 from '../assets/landing/hero-wall-2.jpg';
import heroWall3 from '../assets/landing/hero-wall-3.jpg';
import heroWall4 from '../assets/landing/hero-wall-4.jpg';
import heroWall5 from '../assets/landing/hero-wall-5.jpg';
import heroWall6 from '../assets/landing/hero-wall-6.jpg';
import heroWall7 from '../assets/landing/hero-wall-7.jpg';
import heroWall8 from '../assets/landing/hero-wall-8.jpg';
import heroWall9 from '../assets/landing/hero-wall-9.jpg';
import heroWall10 from '../assets/landing/hero-wall-10.jpg';
import heroWall11 from '../assets/landing/hero-wall-11.jpg';
import heroWall12 from '../assets/landing/hero-wall-12.jpg';

import heroBackLeft from '../assets/landing/hero-back-left.jpg';
import heroBackRight from '../assets/landing/hero-back-right.jpg';
import heroCenter from '../assets/landing/hero-center.jpg';

import stepDiscover from '../assets/landing/step-discover.jpg';
import stepTag from '../assets/landing/step-tag.jpg';
import stepSave from '../assets/landing/step-save.jpg';

export default function LandingPage() {
  const { isLoggedIn } = useCurrentUser();
  const [isScrolled, setIsScrolled] = useState(false);

  useSEO({
    title: 'SetupSpot — Discover & Share Your Dream Desk Setup',
    description:
      'Browse thousands of desk setups from gamers, creators & productivity enthusiasts. Tag your gear, save favorites, and get inspired on SetupSpot.',
    url: 'https://setupspot.com',
    type: 'website',
  });

  const col1Images = [heroWall1, heroWall2, heroWall3, heroWall7];
  const col2Images = [heroWall4, heroWall5, heroWall6, heroWall10];
  const col3Images = [heroWall8, heroWall9, heroWall11, heroWall12];

  useEffect(() => {
    const handleScrollHeader = () => {
      setIsScrolled(window.scrollY > 40);
    };

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
        progress = Math.max(0, Math.min(1, scrolled / scrollRange));
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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="font-sans text-[#475569] antialiased bg-[#f7f9fb] min-h-screen overflow-x-hidden">
      <LandingHeader isScrolled={isScrolled} isLoggedIn={isLoggedIn} />
      <HeroSplitSection
        isLoggedIn={isLoggedIn}
        col1Images={col1Images}
        col2Images={col2Images}
        col3Images={col3Images}
      />
      <FeaturedShowcaseSection
        heroBackLeft={heroBackLeft}
        heroBackRight={heroBackRight}
        heroCenter={heroCenter}
      />
      <HowItWorksSection
        stepDiscover={stepDiscover}
        stepTag={stepTag}
        stepSave={stepSave}
      />
      <LandingFooter />
    </div>
  );
}
