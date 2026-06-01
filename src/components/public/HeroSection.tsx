"use client";

// ─── Hero Section Component ───
// Full-screen hero with parallax background, bold headline, and CTA button
// Design inspired by premium car dealership hero layouts

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

export default function HeroSection() {
  const { t } = useLanguage();

  // Smooth scroll to inventory section
  const scrollToInventory = () => {
    const el = document.querySelector("#inventory");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Smooth scroll to about section
  const scrollToAbout = () => {
    const el = document.querySelector("#about");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-24 sm:pt-36 sm:pb-32"
    >
      {/* ─── Background Image with Parallax ─── */}
      <div
        className="absolute inset-0 parallax-bg"
        style={{
          backgroundImage: "url('/images/hero-bg.png')",
        }}
      />

      {/* ─── Dark Overlay Gradient ─── */}
      <div className="absolute inset-0 hero-overlay" />

      {/* ─── Decorative diagonal shape ─── */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto fill-white">
          <path d="M0,64 C480,120 960,0 1440,64 L1440,120 L0,120 Z" />
        </svg>
      </div>

      {/* ─── Hero Content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left column: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] mb-6">
              {t.hero.findYour}{" "}
              <span className="text-cta relative">
                {t.hero.dreamCar}
                {/* Decorative underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 200 12"
                  fill="none"
                >
                  <path
                    d="M2 8C50 2 150 2 198 8"
                    stroke="#E63946"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              {t.hero.today}
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-white/70 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              {t.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={scrollToInventory}
                size="lg"
                className="bg-cta hover:bg-cta-hover text-white font-semibold text-base px-8 h-14 rounded-none shadow-lg shadow-cta/30 transition-all hover:shadow-xl hover:shadow-cta/40"
              >
                {t.hero.browseInventory}
              </Button>
              <Button
                onClick={scrollToAbout}
                variant="outline"
                size="lg"
                className="bg-transparent text-white font-semibold text-base px-8 h-14 rounded-none border-2 border-white hover:bg-white hover:text-navy transition-colors duration-200"
              >
                {t.hero.learnMore}
              </Button>
            </div>

            {/* Quick stats */}
            <div className="mt-10 flex gap-8 justify-center lg:justify-start">
              <div>
                <p className="text-3xl font-bold text-white">200+</p>
                <p className="text-white/50 text-sm">{t.hero.vehicles}</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">15+</p>
                <p className="text-white/50 text-sm">{t.hero.yearsExperience}</p>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <p className="text-3xl font-bold text-white">5K+</p>
                <p className="text-white/50 text-sm">{t.hero.happyClients}</p>
              </div>
            </div>
          </motion.div>

          {/* Right column: Decorative car silhouette / empty for hero bg image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:block"
          >
            {/* This space lets the background image show through */}
            <div className="relative">
              {/* Decorative floating card — Certified Quality */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -bottom-6 -left-4 bg-white rounded-none p-5 shadow-2xl shadow-black/30 border-l-4 border-l-cta"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-none bg-cta/10 flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 text-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-navy font-bold text-sm tracking-wide">{t.hero.certifiedQuality}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{t.hero.everyCarInspected}</p>
                  </div>
                </div>
              </motion.div>
              {/* Another floating card — Best Prices */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute top-8 -right-4 bg-white rounded-none p-5 shadow-2xl shadow-black/30 border-l-4 border-l-cta"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-none bg-cta/10 flex items-center justify-center shrink-0">
                    <svg className="h-5 w-5 text-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-navy font-bold text-sm tracking-wide">{t.hero.bestPrices}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{t.hero.guaranteedValue}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>


    </section>
  );
}
