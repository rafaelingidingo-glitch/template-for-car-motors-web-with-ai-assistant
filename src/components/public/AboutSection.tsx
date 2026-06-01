"use client";

// ─── About Us Section Component ───
// Split layout: image on left, content on right
// Design inspired by modern dealership about sections

import { motion } from "framer-motion";
import { Shield, Award, Heart, Users } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";

export default function AboutSection() {
  const { t } = useLanguage();

  // Why Choose Us feature items
  const features = [
    {
      icon: Shield,
      title: t.about.certifiedVehicles,
      description: t.about.certifiedDesc,
    },
    {
      icon: Award,
      title: t.about.bestPriceGuarantee,
      description: t.about.bestPriceDesc,
    },
    {
      icon: Heart,
      title: t.about.customerFirst,
      description: t.about.customerDesc,
    },
    {
      icon: Users,
      title: t.about.expertTeam,
      description: t.about.expertDesc,
    },
  ];

  return (
    <section id="about" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cta font-semibold text-sm uppercase tracking-wider">
            {t.about.aboutUs}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mt-3 mb-4">
            {t.about.whyChoose} <span className="text-cta">{t.about.autoElite}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t.about.subtitle}
          </p>
        </motion.div>

        {/* ─── Main Content: Image + Text Split ─── */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left: About Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-none overflow-hidden shadow-2xl">
              <img
                src="/images/about-bg.png"
                alt="Our Dealership Team"
                className="w-full h-[400px] md:h-[500px] object-cover"
                loading="lazy"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/40 to-transparent" />
            </div>
            {/* Decorative accent box */}
            <div className="absolute -bottom-6 -right-6 bg-cta text-white p-6 rounded-none shadow-lg hidden md:block">
              <p className="text-4xl font-bold">15+</p>
              <p className="text-sm font-medium opacity-90">{t.about.yearsOfTrust}</p>
            </div>
            {/* Decorative corner accent */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-4 border-t-4 border-cta rounded-tl-2xl" />
          </motion.div>

          {/* Right: About Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-cta font-semibold text-sm uppercase tracking-wider">
              {t.about.ourStory}
            </span>
            <h3 className="text-2xl md:text-3xl font-bold text-navy mt-2 mb-6">
              {t.about.drivingDreams}
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t.about.storyP1}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t.about.storyP2}
            </p>

            {/* Mission & Vision */}
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-navy/5 p-5 rounded-none">
                <h4 className="font-bold text-navy text-lg mb-2">{t.about.ourMission}</h4>
                <p className="text-sm text-muted-foreground">
                  {t.about.missionText}
                </p>
              </div>
              <div className="bg-cta/5 p-5 rounded-none">
                <h4 className="font-bold text-navy text-lg mb-2">{t.about.ourVision}</h4>
                <p className="text-sm text-muted-foreground">
                  {t.about.visionText}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Why Choose Us Features Grid ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-none p-6 text-center hover:shadow-lg transition-shadow group"
              >
                <div className="w-14 h-14 rounded-full bg-cta/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-cta/20 transition-colors">
                  <Icon className="h-7 w-7 text-cta" />
                </div>
                <h4 className="font-bold text-navy text-lg mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
