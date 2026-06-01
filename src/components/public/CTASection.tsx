"use client";

// ─── CTA Section Component ───
// Mid-page call-to-action banner with parallax background
// Encourages users to sell/trade-in or get financing

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/context";

interface CTASectionProps {
  whatsapp: string;
}

export default function CTASection({ whatsapp }: CTASectionProps) {
  const { t } = useLanguage();

  // WhatsApp URLs for trade-in and financing
  const tradeInUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    t.cta.tradeInWhatsapp
  )}`;

  const financingUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    t.cta.financingWhatsapp
  )}`;

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* ─── Parallax Background Image ─── */}
      <div
        className="absolute inset-0 parallax-bg"
        style={{
          backgroundImage: "url('/images/cta-bg.png')",
        }}
      />

      {/* ─── Dark Overlay with Gradient ─── */}
      <div className="absolute inset-0 cta-overlay" />

      {/* ─── Decorative Elements ─── */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-cta/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-cta/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      {/* ─── Content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Tagline */}
          <span className="text-cta font-semibold text-sm uppercase tracking-wider mb-4 block">
            {t.cta.readyToUpgrade}
          </span>

          {/* Main headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {t.cta.sellTradeIn} <br className="hidden sm:block" />
            <span className="text-cta">{t.cta.getBestValue}</span>
          </h2>

          {/* Sub-text */}
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.cta.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={tradeInUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-cta hover:bg-navy text-white font-semibold text-base px-8 h-14 rounded-[2px] shadow-lg shadow-cta/30 transition-colors duration-200"
              >
                {t.cta.sellTradeInBtn}
              </Button>
            </a>
            <a href={financingUrl} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-transparent text-white font-semibold text-base px-8 h-14 rounded-[2px] border-2 border-white hover:bg-white hover:text-navy transition-colors duration-200"
              >
                {t.cta.getApprovedFinancing}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
