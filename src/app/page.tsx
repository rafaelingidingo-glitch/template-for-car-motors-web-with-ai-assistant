"use client";

// ─── Main Public Page ───
// Single-page application with all sections
// Fetches site settings on mount, seeds database only once per session

import { useState, useEffect } from "react";
import Navbar from "@/components/public/Navbar";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import InventorySection from "@/components/public/InventorySection";
import CTASection from "@/components/public/CTASection";
import ContactSection from "@/components/public/ContactSection";
import Footer from "@/components/public/Footer";
import ChatWidget from "@/components/ChatWidget";

// Site settings type from the database
interface SiteSettings {
  id: string;
  shopName: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  location: string;
  hours: string;
  whatsapp: string;
}

// Track if seed has been called this session to avoid repeated DB round-trips
let seedCalledThisSession = false;

export default function HomePage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch site settings and seed database on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // OPTIMIZATION: Only call seed API once per browser session
        // The seed endpoint allows unauthenticated access for first-time setup only.
        // If admin already exists, the seed is a no-op (returns 200 with "already seeded"),
        // or returns 401 which we silently ignore since the admin can seed from the dashboard.
        if (!seedCalledThisSession) {
          seedCalledThisSession = true;
          try {
            await fetch("/api/seed", { method: "POST" });
          } catch {
            // Silently ignore seed errors — the admin can seed from the dashboard
          }
        }

        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSettings(data.settings);
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Show loading state while settings are being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-navy">
        <div className="w-12 h-12 border-4 border-white/20 border-t-cta rounded-full animate-spin mb-4" />
        <p className="text-white/60 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navigation Bar ─── */}
      <Navbar
        shopName={settings?.shopName || "AutoElite Motors"}
        logo={settings?.logo || ""}
        phone={settings?.phone || ""}
      />

      {/* ─── Main Content ─── */}
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <InventorySection
          whatsapp={settings?.whatsapp || "255757337929"}
          phone={settings?.phone || "+255 757 337 929"}
        />
        <CTASection
          whatsapp={settings?.whatsapp || "255757337929"}
        />
        <ContactSection
          phone={settings?.phone || "+255 757 337 929"}
          email={settings?.email || "info@autoelite.co.tz"}
          address={settings?.address || "123 Safari Drive, Dar es Salaam, Tanzania"}
          location={settings?.location || "-6.7924,39.2083"}
          hours={settings?.hours || "Mon-Fri: 8AM-6PM | Sat: 9AM-4PM | Sun: Closed"}
        />
      </main>

      {/* ─── Footer (sticky at bottom) ─── */}
      <Footer
        shopName={settings?.shopName || "AutoElite Motors"}
        phone={settings?.phone || "+255 757 337 929"}
        email={settings?.email || "info@autoelite.co.tz"}
        address={settings?.address || "123 Safari Drive, Dar es Salaam, Tanzania"}
      />

      {/* ─── AI Customer Care Chat Widget ─── */}
      <ChatWidget />
    </div>
  );
}
