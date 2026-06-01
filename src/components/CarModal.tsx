"use client";

// ─── Car Detail Modal Component ───
// Full-screen modal showing all car details with image carousel
// Opens when user clicks "View Details" or the car image
// Bug fix: currentImage resets when switching between cars
// Optimization: memoized formatters and URLs

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  DoorOpen,
  Palette,
  Gauge,
  Fuel,
  Calendar,
  Car,
  Settings,
  Phone,
} from "lucide-react";
import type { CarData } from "./CarCard";
import { useLanguage } from "@/lib/i18n/context";
import { formatPrice, formatMileage } from "@/lib/format";

// ─── DetailRow Component (declared outside to avoid re-creation on render) ───
// Consistent detail row layout for the modal's vehicle specs grid
function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-navy/5 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-navy/70" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-navy">{value}</p>
      </div>
    </div>
  );
}

interface CarModalProps {
  car: CarData | null;
  isOpen: boolean;
  onClose: () => void;
  whatsapp: string;
  phone: string; // BUG FIX: Added phone prop — previously was hardcoded as +255757337929
}

export default function CarModal({ car, isOpen, onClose, whatsapp, phone }: CarModalProps) {
  const { t } = useLanguage();

  // Current image index for the modal carousel
  const [currentImage, setCurrentImage] = useState(0);

  // BUG FIX: Reset currentImage when the selected car changes
  // React-recommended pattern: adjust state during render based on changed props
  // See: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  // CRITICAL FIX: Normalize car?.id to null so that when car is null, carId === prevCarId (both null)
  // Previously, car?.id (undefined) !== prevCarId (null) was ALWAYS true when car was null,
  // causing an infinite re-render loop: "Too many re-renders" error
  const [prevCarId, setPrevCarId] = useState<string | null>(null);
  const carId = car?.id ?? null;
  if (carId !== prevCarId) {
    setPrevCarId(carId);
    setCurrentImage(0);
  }

  // Reset when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // BUG FIX: All hooks must be called BEFORE the early return to satisfy React's rules of hooks
  // Memoize formatted values — use car?. defaults to avoid undefined when car is null
  const formattedPrice = useMemo(() => formatPrice(car?.price ?? 0), [car?.price]);
  const formattedMileage = useMemo(() => formatMileage(car?.mileage ?? 0), [car?.mileage]);

  // WhatsApp URL — translated message, only recomputes when car data or whatsapp number changes
  const whatsappUrl = useMemo(() => {
    if (!car) return '';
    return `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `${t.carCard.whatsappDetails} ${car.year} ${car.brand} ${car.model}:\n\n` +
      `• ${t.carCard.whatsappCondition}: ${car.condition}\n` +
      `• ${t.carCard.whatsappPrice}: ${formattedPrice}\n` +
      `• ${t.carCard.whatsappMileage}: ${formattedMileage} km\n` +
      `• ${t.carCard.whatsappFuel}: ${car.fuelType}\n` +
      `• ${t.carCard.whatsappColor}: ${car.color}\n\n` +
      `${t.carCard.whatsappStillAvailable}`
    )}`;
  }, [whatsapp, car, formattedPrice, formattedMileage, t]);

  // Early return after all hooks
  if (!car) return null;

  const images = car.images && car.images.length > 0
    ? car.images
    : ["/images/car-placeholder.png"];

  // Clamp image index for safety
  const safeImageIndex = Math.min(currentImage, images.length - 1);

  // Navigate carousel
  const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* ─── Modal Header with Image Carousel ─── */}
        <div className="relative h-64 sm:h-80 md:h-96 bg-gray-100">
          {/* Main image */}
          <img
            src={images[safeImageIndex]}
            alt={`${car.brand} ${car.model} - Image ${safeImageIndex + 1}`}
            className="w-full h-full object-cover"
          />

          {/* Status badge on image */}
          <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-lg text-sm font-bold text-white ${
            car.status === "Sold" ? "bg-cta" : "bg-green-500"
          }`}>
            {car.status}
          </div>

          {/* Condition badge */}
          <div className="absolute top-4 right-16 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-navy/70">
            {car.condition}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Carousel arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-none bg-navy/70 hover:bg-navy text-white flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-none bg-navy/70 hover:bg-navy text-white flex items-center justify-center transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Thumbnail dots — positioned at bottom-left to avoid overlap with counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 flex gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === safeImageIndex ? "bg-white w-6" : "bg-white/40 w-2"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image counter — positioned at bottom-right to avoid overlap with thumbnails */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-none font-medium">
              {safeImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* ─── Modal Content ─── */}
        <div className="p-6">
          {/* Header: Brand, Model, Year, Price */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-cta border-cta/30">
                  {car.fuelType}
                </Badge>
                <Badge variant="outline" className="text-navy/60 border-navy/20">
                  {car.bodyType}
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy">
                {car.brand} {car.model}
              </h2>
              <p className="text-muted-foreground mt-1">
                {car.year} {t.carModal.model} • {car.condition}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl font-bold text-navy">{formattedPrice}</p>
              <p className="text-sm text-muted-foreground">{formattedMileage} km</p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-4" />

          {/* Description */}
          {car.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-navy text-lg mb-2">{t.carModal.description}</h3>
              <p className="text-muted-foreground leading-relaxed">{car.description}</p>
            </div>
          )}

          {/* Vehicle Details Grid */}
          <div className="grid sm:grid-cols-2 gap-x-8 mb-6">
            <DetailRow icon={Calendar} label={t.carModal.year} value={String(car.year)} />
            <DetailRow icon={Car} label={t.carModal.bodyType} value={car.bodyType} />
            <DetailRow icon={Fuel} label={t.carModal.fuelType} value={car.fuelType} />
            <DetailRow icon={Settings} label={t.carModal.condition} value={car.condition} />
            <DetailRow icon={Users} label={t.carModal.seats} value={`${car.seats} ${t.carModal.seats}`} />
            <DetailRow icon={DoorOpen} label={t.carModal.doors} value={`${car.doors} ${t.carModal.doors}`} />
            <DetailRow icon={Palette} label={t.carModal.exteriorColor} value={car.color} />
            <DetailRow icon={Gauge} label={t.carModal.mileage} value={`${formattedMileage} km`} />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {car.status === "Available" ? (
              <>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-cta hover:bg-cta-hover text-white h-12 text-base font-semibold rounded-[2px]">
                    {t.carModal.buyNow}
                  </Button>
                </a>
                <a href={`tel:${phone}`} className="flex-1">
                  <Button variant="outline" className="w-full border-navy/20 text-navy hover:bg-navy/5 h-12 text-base font-medium rounded-[2px]">
                    <Phone className="mr-2 h-4 w-4" />
                    {t.carModal.callUs}
                  </Button>
                </a>
              </>
            ) : (
              <div className="w-full bg-cta/10 text-cta rounded-lg p-4 text-center font-semibold">
                {t.carModal.soldMessage}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
