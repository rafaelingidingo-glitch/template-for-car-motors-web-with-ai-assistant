"use client";

// ─── Car Card Component ───
// Displays a single vehicle in the inventory grid
// Features: image carousel, status badge, specs grid, CTA buttons
// Optimized: memoized formatters, useCallback for event handlers

import React, { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, Users, DoorOpen, Palette, Gauge, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { formatPrice, formatMileage } from "@/lib/format";

// Car data type definition
export interface CarData {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  condition: string;
  fuelType: string;
  bodyType: string;
  seats: number;
  doors: number;
  color: string;
  status: string;
  description: string | null;
  images: string[];
  featured: boolean;
}

interface CarCardProps {
  car: CarData;
  onViewDetails: (car: CarData) => void;
  whatsapp: string;
}

const CarCard = React.memo(function CarCard({ car, onViewDetails, whatsapp }: CarCardProps) {
  const { t } = useLanguage();

  // Current image index for the carousel
  const [currentImage, setCurrentImage] = useState(0);

  // Ensure images array has at least one item (fallback placeholder)
  const images = car.images && car.images.length > 0
    ? car.images
    : ["/images/car-placeholder.png"];

  // Clamp currentImage when images change (safety guard)
  const safeImageIndex = Math.min(currentImage, images.length - 1);

  // Navigate carousel images — memoized to avoid recreating on each render
  const nextImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Memoize the formatted price and mileage to avoid recomputation
  const formattedPrice = useMemo(() => formatPrice(car.price), [car.price]);
  const formattedMileage = useMemo(() => formatMileage(car.mileage), [car.mileage]);

  // Generate WhatsApp URL — translated message, only recomputes when car data or whatsapp changes
  const whatsappUrl = useMemo(() => `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `${t.carCard.whatsappInterest} ${car.year} ${car.brand} ${car.model} (${car.condition}) ${t.carCard.whatsappListedAt} ${formattedPrice}. ${t.carCard.whatsappIsAvailable}`
  )}`, [whatsapp, car.year, car.brand, car.model, car.condition, formattedPrice, t]);

  // Condition badge color — computed once since car.condition is stable
  const conditionColor = useMemo(() => {
    switch (car.condition) {
      case "New": return "bg-green-500";
      case "Used": return "bg-amber-500";
      case "Refurbished": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  }, [car.condition]);

  return (
    <div className="car-card bg-white rounded-none overflow-hidden border border-gray-100 shadow-sm">
      {/* ─── Image Carousel Section ─── */}
      <div
        className="relative h-52 sm:h-56 bg-gray-100 cursor-pointer overflow-hidden"
        onClick={() => onViewDetails(car)}
      >
        {/* Main image with lazy loading */}
        <img
          src={images[safeImageIndex]}
          alt={`${car.brand} ${car.model} - Image ${safeImageIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        {/* Status ribbon overlay */}
        <div className={`status-badge ${
          car.status === "Sold"
            ? "bg-cta text-white"
            : "bg-green-500 text-white"
        }`}>
          {car.status}
        </div>

        {/* Condition badge */}
        <div className={`absolute top-12 left-3 z-10 px-2 py-1 rounded text-xs font-semibold text-white ${conditionColor}`}>
          {car.condition}
        </div>

        {/* Carousel navigation arrows — visible when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute top-1/2 -translate-y-1/2 left-2 z-10 h-9 w-9 flex items-center justify-center bg-navy/70 hover:bg-navy text-white border-none cursor-pointer transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute top-1/2 -translate-y-1/2 right-2 z-10 h-9 w-9 flex items-center justify-center bg-navy/70 hover:bg-navy text-white border-none cursor-pointer transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image counter — current/total */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 z-10 bg-black/60 text-white text-xs font-medium px-2 py-1 rounded-none">
            {safeImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Sold overlay when car is sold */}
        {car.status === "Sold" && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-[4]">
            <span className="bg-cta text-white px-6 py-2 rounded-none font-bold text-lg tracking-wider uppercase">
              {t.carCard.sold}
            </span>
          </div>
        )}
      </div>

      {/* ─── Card Content Section ─── */}
      <div className="p-4">
        {/* Header: Brand, Model, Year */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-navy text-lg leading-tight">
                {car.brand} {car.model}
              </h3>
              <p className="text-muted-foreground text-sm">{car.year} • {car.bodyType}</p>
            </div>
            <div className="flex items-center gap-1.5 text-cta">
              <Fuel className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">{car.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-navy">
            {formattedPrice}
          </p>
        </div>

        {/* Specs Grid with Icons */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4 text-navy/60" />
            <span>{car.seats} {t.carCard.seats}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DoorOpen className="h-4 w-4 text-navy/60" />
            <span>{car.doors} {t.carCard.doors}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Palette className="h-4 w-4 text-navy/60" />
            <span>{car.color}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Gauge className="h-4 w-4 text-navy/60" />
            <span>{formattedMileage} km</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewDetails(car)}
            variant="outline"
            className="flex-1 border-navy/20 text-navy hover:bg-navy/5 text-sm font-medium rounded-[2px]"
          >
            {t.carCard.viewDetails}
          </Button>
          {car.status === "Available" && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button className="w-full bg-cta hover:bg-cta-hover text-white text-sm font-medium rounded-[2px]">
                {t.carCard.inquireNow}
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

export default CarCard;
