"use client";

// ─── Navbar Component ───
// Fixed navigation bar with logo, section links, language switcher, and admin login button
// Supports mobile responsive hamburger menu
// Uses i18n context for translated labels

import { useState, useEffect } from "react";
import { Menu, X, Car, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

// Props: shop settings (name, logo) from the database
interface NavbarProps {
  shopName: string;
  logo: string;
  phone: string;
}

export default function Navbar({ shopName, logo, phone }: NavbarProps) {
  // i18n hook for translations and locale switching
  const { locale, setLocale, t } = useLanguage();

  // Mobile menu open/close state
  const [isOpen, setIsOpen] = useState(false);
  // Track scroll position for navbar background effect
  const [scrolled, setScrolled] = useState(false);

  // Listen for scroll to add background on scroll
  // Optimization: only update state when the boolean value actually changes,
  // preventing excessive re-renders from every scroll pixel
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const isScrolled = window.scrollY > 50;
          setScrolled((prev) => prev !== isScrolled ? isScrolled : prev);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation links with smooth scroll targets (translated labels)
  const navLinks = [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.aboutUs, href: "#about" },
    { label: t.nav.inventory, href: "#inventory" },
    { label: t.nav.contact, href: "#contact" },
  ];

  // Handle nav link click: smooth scroll and close mobile menu
  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-navy/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* ─── Logo & Shop Name ─── */}
          <div className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={shopName}
                className="h-8 md:h-10 w-auto object-contain"
              />
            ) : (
              <Car className="h-8 w-8 text-cta" />
            )}
            <span className="text-white font-bold text-lg md:text-xl tracking-wide">
              {shopName || "AutoElite Motors"}
            </span>
          </div>

          {/* ─── Desktop Navigation Links ─── */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="nav-link text-white/80 hover:text-white text-sm font-medium tracking-wide uppercase transition-colors"
              >
                {link.label}
              </button>
            ))}

            {/* Language Switcher */}
            <button
              onClick={() => setLocale(locale === "en" ? "sw" : "en")}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
              aria-label={locale === "en" ? t.language.swahili : t.language.english}
            >
              <Globe className="h-4 w-4" />
              {locale === "en" ? "SW" : "EN"}
            </button>

            {/* Admin Login button */}
            <a href="/admin">
              <Button
                size="sm"
                className="bg-cta hover:bg-navy text-white border-none rounded-none font-semibold shadow-sm transition-colors duration-200"
              >
                {t.nav.adminLogin}
              </Button>
            </a>
          </div>

          {/* ─── Mobile Hamburger Button ─── */}
          <div className="md:hidden flex items-center gap-3">
            {/* Phone link for quick contact */}
            <a href={`tel:${phone}`} className="text-white/70 hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </a>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Mobile Menu Dropdown ─── */}
      {isOpen && (
        <div className="md:hidden bg-navy/95 backdrop-blur-md border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left text-white/80 hover:text-white text-sm font-medium tracking-wide uppercase py-2 transition-colors"
              >
                {link.label}
              </button>
            ))}

            {/* Language Switcher (Mobile) */}
            <button
              onClick={() => setLocale(locale === "en" ? "sw" : "en")}
              className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors py-2"
              aria-label={locale === "en" ? t.language.swahili : t.language.english}
            >
              <Globe className="h-4 w-4" />
              {locale === "en" ? "SW" : "EN"}
            </button>

            <a href="/admin" className="block">
              <Button
                size="sm"
                className="w-full bg-cta hover:bg-navy text-white border-none rounded-none font-semibold shadow-sm transition-colors duration-200 mt-2"
              >
                {t.nav.adminLogin}
              </Button>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
