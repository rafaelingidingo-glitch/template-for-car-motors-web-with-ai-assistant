"use client";

// ─── Contact Section Component ───
// Contact form + business info + Google Maps embed placeholder

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/context";

interface ContactSectionProps {
  phone: string;
  email: string;
  address: string;
  location: string;
  hours: string;
}

export default function ContactSection({
  phone,
  email,
  address,
  location,
  hours,
}: ContactSectionProps) {
  const { t } = useLanguage();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // BUG FIX: Track timeout so it can be cleaned up on unmount
  const submittedTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (submittedTimerRef.current) {
        clearTimeout(submittedTimerRef.current);
      }
    };
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: "", email: "", phone: "", message: "" });
        toast({
          title: t.contact.messageSent,
          description: t.contact.messageSentDesc,
        });
        // Reset success state after 5 seconds (cleanup on unmount)
        submittedTimerRef.current = setTimeout(() => setSubmitted(false), 5000);
      } else {
        toast({
          title: t.contact.errorTitle,
          description: t.contact.errorSend,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast({
        title: t.contact.errorTitle,
        description: t.contact.errorGeneral,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-28 bg-white">
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
            {t.contact.getInTouch}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mt-3 mb-4">
            {t.contact.contactUs} <span className="text-cta">{t.contact.us}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t.contact.subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* ─── Left: Contact Form ─── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-white border border-gray-100 rounded-none p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold text-navy mb-6">{t.contact.sendMessage}</h3>

              {submitted ? (
                // Success state after form submission
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-navy mb-2">{t.contact.messageSent}</h4>
                  <p className="text-muted-foreground">
                    {t.contact.messageSentDesc}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field */}
                  <div>
                    <Label htmlFor="name" className="text-navy/70 text-sm font-medium">
                      {t.contact.fullName}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <Label htmlFor="email" className="text-navy/70 text-sm font-medium">
                      {t.contact.emailAddress}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  {/* Phone field (optional) */}
                  <div>
                    <Label htmlFor="phone" className="text-navy/70 text-sm font-medium">
                      {t.contact.phoneNumber}
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+255 xxx xxx xxx"
                      className="mt-1.5"
                    />
                  </div>

                  {/* Message field */}
                  <div>
                    <Label htmlFor="message" className="text-navy/70 text-sm font-medium">
                      {t.contact.messageField}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      rows={5}
                      required
                      className="mt-1.5 resize-none"
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-cta hover:bg-cta-hover text-white font-semibold h-12"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.contact.sending}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t.contact.sendBtn}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>

          {/* ─── Right: Contact Info + Map ─── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Contact details cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Address */}
              <div className="bg-navy/5 rounded-none p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-none bg-cta/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-cta" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm mb-1">{t.contact.ourLocation}</h4>
                  <p className="text-sm text-muted-foreground">{address || "123 Safari Drive, Dar es Salaam"}</p>
                </div>
              </div>

              {/* Phone */}
              <a href={`tel:${phone}`} className="bg-navy/5 rounded-none p-5 flex items-start gap-4 hover:bg-navy/10 transition-colors">
                <div className="w-10 h-10 rounded-none bg-cta/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-cta" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm mb-1">{t.contact.callUs}</h4>
                  <p className="text-sm text-muted-foreground">{phone || "+255 757 337 929"}</p>
                </div>
              </a>

              {/* Email */}
              <a href={`mailto:${email}`} className="bg-navy/5 rounded-none p-5 flex items-start gap-4 hover:bg-navy/10 transition-colors">
                <div className="w-10 h-10 rounded-none bg-cta/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-cta" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm mb-1">{t.contact.emailUs}</h4>
                  <p className="text-sm text-muted-foreground">{email || "info@autoelite.co.tz"}</p>
                </div>
              </a>

              {/* Operating Hours */}
              <div className="bg-navy/5 rounded-none p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-none bg-cta/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-cta" />
                </div>
                <div>
                  <h4 className="font-semibold text-navy text-sm mb-1">{t.contact.workingHours}</h4>
                  <p className="text-sm text-muted-foreground">
                    {hours || "Mon-Fri: 8AM-6PM | Sat: 9AM-4PM"}
                  </p>
                </div>
              </div>
            </div>

            {/* ─── Google Maps Embed ─── */}
            {/* BUG FIX: Use the location prop to construct dynamic Maps URL instead of hardcoded Dar es Salaam */}
            <div className="rounded-none overflow-hidden shadow-sm border border-gray-100 h-64 md:h-72">
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(location || "-6.7924,39.2083")}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Our Location"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
