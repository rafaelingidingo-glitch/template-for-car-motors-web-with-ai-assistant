"use client";

// ─── Footer Component ───
// Sticky footer with social links, quick navigation, and contact info

import { Car, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

interface FooterProps {
  shopName: string;
  phone: string;
  email: string;
  address: string;
}

export default function Footer({ shopName, phone, email, address }: FooterProps) {
  const { t } = useLanguage();

  // Navigation links for smooth scrolling
  const navLinks = [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.aboutUs, href: "#about" },
    { label: t.nav.inventory, href: "#inventory" },
    { label: t.nav.contact, href: "#contact" },
  ];

  // Quick links
  const quickLinks = [
    { label: t.footer.newCars, href: "#inventory" },
    { label: t.footer.usedCars, href: "#inventory" },
    { label: t.footer.financing, href: "#home" },
    { label: t.footer.tradeIn, href: "#home" },
  ];

  // Handle smooth scroll click
  const handleNavClick = (href: string) => {
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-navy text-white">
      {/* ─── Main Footer Content ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Column 1: Brand info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Car className="h-8 w-8 text-cta" />
              <span className="font-bold text-xl tracking-wide">
                {shopName || "AutoElite Motors"}
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t.footer.description}
            </p>
            {/* Social media links */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-cta flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-cta flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-cta flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 rounded-lg bg-white/10 hover:bg-cta flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.footer.quickLinks}</h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-white/60 hover:text-cta text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.footer.ourServices}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="text-white/60 hover:text-cta text-sm transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.footer.contactInfo}</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-cta flex-shrink-0 mt-0.5" />
                <span className="text-white/60 text-sm">
                  {address || "123 Safari Drive, Dar es Salaam, Tanzania"}
                </span>
              </li>
              <li>
                <a
                  href={`tel:${phone}`}
                  className="flex items-center gap-3 text-white/60 hover:text-cta text-sm transition-colors"
                >
                  <Phone className="h-4 w-4 text-cta flex-shrink-0" />
                  {phone || "+255 757 337 929"}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 text-white/60 hover:text-cta text-sm transition-colors"
                >
                  <Mail className="h-4 w-4 text-cta flex-shrink-0" />
                  {email || "info@autoelite.co.tz"}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Bottom Bar ─── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} {shopName || "AutoElite Motors"}. {t.footer.allRightsReserved}
            </p>
            <p className="text-white/40 text-xs">
              {t.footer.designedWith} <a href="https://rwextech.vercel.app/">Rwex Tech Limited</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
