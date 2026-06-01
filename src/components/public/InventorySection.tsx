"use client";

// ─── Inventory Section Component ───
// Dynamic filter sidebar + vehicle grid with AJAX fetching
// CRITICAL: Filtering does NOT refresh the page or cause viewport jump
// Bug fixes: debounce timer cleanup on unmount, capped stagger delay
// Optimizations: useCallback for handlers, useMemo for active filter count

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CarCard, { CarData } from "@/components/CarCard";
import CarModal from "@/components/CarModal";

// ─── Filter Options Constants ───
const BRANDS = [
  "Audi", "BMW", "Ford", "Honda", "Mercedes-Benz", "Land Rover",
  "Nissan", "Subaru", "Toyota", "Volkswagen", "Volvo", "Other"
];

const YEARS = Array.from({ length: 20 }, (_, i) => String(2025 - i));

// Translation key mapping for filter options
// Maps the DB value (English) to the translation key in t.inventory
const FUEL_TYPE_KEYS: Record<string, keyof typeof import("@/lib/i18n/translations").translations.en.inventory> = {
  Petrol: "petrol",
  Diesel: "diesel",
  Hybrid: "hybrid",
  Electric: "electric",
};

const CONDITION_KEYS: Record<string, keyof typeof import("@/lib/i18n/translations").translations.en.inventory> = {
  New: "new",
  Used: "used",
  Refurbished: "refurbished",
};

const BODY_TYPE_KEYS: Record<string, keyof typeof import("@/lib/i18n/translations").translations.en.inventory> = {
  SUV: "suv",
  Sedan: "sedan",
  Truck: "truck",
  Van: "van",
  Hatchback: "hatchback",
  Coupe: "coupe",
  Pickup: "pickup",
  Minivan: "minivan",
  Convertible: "convertible",
  "Sports Car": "sportsCar",
  "Station Wagon": "stationWagon",
  Other: "other",
};

const FUEL_TYPES = Object.keys(FUEL_TYPE_KEYS);
const CONDITIONS = Object.keys(CONDITION_KEYS);
const BODY_TYPES = Object.keys(BODY_TYPE_KEYS);

// Maximum stagger delay for framer-motion (caps at 0.5s even with many items)
const MAX_STAGGER_DELAY = 0.5;

// Fields that require debounced input (moved outside component to avoid recreation on every render)
const DEBOUNCE_FIELDS = ["minPrice", "maxPrice", "minMileage", "maxMileage"];

interface InventorySectionProps {
  whatsapp: string;
  phone: string; // BUG FIX: Added phone prop to pass through to CarModal
}

export default function InventorySection({ whatsapp, phone }: InventorySectionProps) {
  const { t } = useLanguage();

  // ─── State ───
  const [cars, setCars] = useState<CarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<CarData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    brand: "all",
    year: "all",
    fuelType: "all",
    condition: "all",
    bodyType: "all",
    minPrice: "",
    maxPrice: "",
    minMileage: "",
    maxMileage: "",
  });

  // BUG FIX: Use a Map of debounce timers keyed by field name
  // Previously, a single shared ref caused race conditions — typing in minPrice
  // then maxPrice within 500ms would cancel the minPrice update
  const debounceRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Cleanup all debounce timers on unmount to prevent state updates after unmount
  useEffect(() => {
    return () => {
      debounceRefs.current.forEach((timer) => clearTimeout(timer));
      debounceRefs.current.clear();
    };
  }, []);

  // ─── Fetch cars from API with current filters ───
  const fetchCars = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (debouncedFilters.brand !== "all") params.set("brand", debouncedFilters.brand);
      if (debouncedFilters.year !== "all") params.set("year", debouncedFilters.year);
      if (debouncedFilters.fuelType !== "all") params.set("fuelType", debouncedFilters.fuelType);
      if (debouncedFilters.condition !== "all") params.set("condition", debouncedFilters.condition);
      if (debouncedFilters.bodyType !== "all") params.set("bodyType", debouncedFilters.bodyType);
      if (debouncedFilters.minPrice) params.set("minPrice", debouncedFilters.minPrice);
      if (debouncedFilters.maxPrice) params.set("maxPrice", debouncedFilters.maxPrice);
      if (debouncedFilters.minMileage) params.set("minMileage", debouncedFilters.minMileage);
      if (debouncedFilters.maxMileage) params.set("maxMileage", debouncedFilters.maxMileage);

      const response = await fetch(`/api/cars?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch cars");
      const data = await response.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  // ─── Handle filter changes with debounce for text inputs ───
  // Each debounced field gets its own timer to prevent race conditions
  const updateFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    if (DEBOUNCE_FIELDS.includes(key)) {
      // Clear only this field's previous timer (not all fields)
      const existingTimer = debounceRefs.current.get(key);
      if (existingTimer) clearTimeout(existingTimer);
      const timer = setTimeout(() => {
        setDebouncedFilters((prev) => ({ ...prev, [key]: value }));
        debounceRefs.current.delete(key);
      }, 500);
      debounceRefs.current.set(key, timer);
    } else {
      // Non-debounced fields update immediately
      setDebouncedFilters((prev) => ({ ...prev, [key]: value }));
    }
  }, []);

  // ─── Clear all filters ───
  const clearFilters = useCallback(() => {
    const emptyFilters = {
      brand: "all",
      year: "all",
      fuelType: "all",
      condition: "all",
      bodyType: "all",
      minPrice: "",
      maxPrice: "",
      minMileage: "",
      maxMileage: "",
    };
    // Clear all pending debounce timers
    debounceRefs.current.forEach((timer) => clearTimeout(timer));
    debounceRefs.current.clear();
    setFilters(emptyFilters);
    setDebouncedFilters(emptyFilters);
  }, []);

  // ─── Modal handlers ───
  const openModal = useCallback((car: CarData) => {
    setSelectedCar(car);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedCar(null);
  }, []);

  // Memoize active filter count to avoid recomputation on every render
  const activeFilterCount = useMemo(() =>
    Object.entries(filters).filter(([key, value]) => {
      if (["minPrice", "maxPrice", "minMileage", "maxMileage"].includes(key)) {
        return value !== "";
      }
      return value !== "all";
    }).length,
  [filters]);

  return (
    <section id="inventory" className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Section Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-cta font-semibold text-sm uppercase tracking-wider">
            {t.inventory.ourCollection}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy mt-3 mb-4">
            {t.inventory.browseOur} <span className="text-cta">{t.nav.inventory}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t.inventory.subtitle}
          </p>
        </motion.div>

        {/* ─── Mobile Filter Toggle Button ─── */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="w-full border-navy/20 text-navy"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {showFilters ? t.inventory.hideFilters : t.inventory.showFilters}
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-cta text-white text-xs px-2 py-0.5 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── Filter Sidebar ─── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className={`${
              showFilters ? "block" : "hidden"
            } lg:block w-full lg:w-72 flex-shrink-0`}
          >
            <div className="bg-white rounded-none shadow-sm border border-gray-100 p-5 sticky top-24">
              {/* Filter header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-navy text-lg flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  {t.inventory.filters}
                </h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-cta text-sm font-medium hover:underline"
                  >
                    {t.inventory.clearAll}
                  </button>
                )}
              </div>

              {/* ─── Brand/Make Filter ─── */}
              <div className="mb-4">
                <label className="text-sm font-medium text-navy/70 mb-1.5 block">
                  {t.inventory.makeBrand}
                </label>
                <Select
                  value={filters.brand}
                  onValueChange={(val) => updateFilter("brand", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.inventory.allBrands} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.inventory.allBrands}</SelectItem>
                    {BRANDS.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ─── Year Filter ─── */}
              <div className="mb-4">
                <label className="text-sm font-medium text-navy/70 mb-1.5 block">
                  {t.inventory.year}
                </label>
                <Select
                  value={filters.year}
                  onValueChange={(val) => updateFilter("year", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.inventory.allYears} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.inventory.allYears}</SelectItem>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ─── Fuel Type Filter ─── */}
              <div className="mb-4">
                <label className="text-sm font-medium text-navy/70 mb-1.5 block">
                  {t.inventory.fuelType}
                </label>
                <Select
                  value={filters.fuelType}
                  onValueChange={(val) => updateFilter("fuelType", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.inventory.allFuelTypes} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.inventory.allFuelTypes}</SelectItem>
                    {FUEL_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t.inventory[FUEL_TYPE_KEYS[type]]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ─── Condition Filter ─── */}
              <div className="mb-4">
                <label className="text-sm font-medium text-navy/70 mb-1.5 block">
                  {t.inventory.condition}
                </label>
                <Select
                  value={filters.condition}
                  onValueChange={(val) => updateFilter("condition", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.inventory.allConditions} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.inventory.allConditions}</SelectItem>
                    {CONDITIONS.map((cond) => (
                      <SelectItem key={cond} value={cond}>
                        {t.inventory[CONDITION_KEYS[cond]]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ─── Body Type Filter ─── */}
              <div className="mb-4">
                <label className="text-sm font-medium text-navy/70 mb-1.5 block">
                  {t.inventory.bodyType}
                </label>
                <Select
                  value={filters.bodyType}
                  onValueChange={(val) => updateFilter("bodyType", val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.inventory.allBodyTypes} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.inventory.allBodyTypes}</SelectItem>
                    {BODY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t.inventory[BODY_TYPE_KEYS[type]]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ─── Price Range Filter ─── */}
              <div className="mb-4">
                <label className="text-sm font-medium text-navy/70 mb-1.5 block">
                  {t.inventory.priceRange}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t.inventory.min}
                    value={filters.minPrice}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder={t.inventory.max}
                    value={filters.maxPrice}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* ─── Mileage Range Filter ─── */}
              <div className="mb-4">
                <label className="text-sm font-medium text-navy/70 mb-1.5 block">
                  {t.inventory.mileageRange}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder={t.inventory.min}
                    value={filters.minMileage}
                    onChange={(e) => updateFilter("minMileage", e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder={t.inventory.max}
                    value={filters.maxMileage}
                    onChange={(e) => updateFilter("maxMileage", e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Active filters display */}
              {activeFilterCount > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs text-muted-foreground mb-2">
                    {activeFilterCount} {t.inventory.filtersActive}
                  </p>
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="w-full text-cta hover:bg-cta/10"
                  >
                    <X className="mr-1 h-3 w-3" />
                    {t.inventory.clearAllFilters}
                  </Button>
                </div>
              )}
            </div>
          </motion.aside>

          {/* ─── Vehicle Grid ─── */}
          <div className="flex-1">
            {/* Results count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {loading ? (
                  t.inventory.loadingVehicles
                ) : (
                  <>
                    {t.inventory.showing}{" "}
                    <span className="font-semibold text-navy">{cars.length}</span>{" "}
                    {cars.length !== 1 ? t.inventory.vehicles : t.inventory.vehicle}
                  </>
                )}
              </p>
            </div>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cta" />
                <span className="ml-3 text-muted-foreground">{t.inventory.loadingInventory}</span>
              </div>
            )}

            {/* No results state */}
            {!loading && cars.length === 0 && (
              <div className="text-center py-20">
                <Search className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-navy mb-2">{t.inventory.noVehiclesFound}</h3>
                <p className="text-muted-foreground mb-4">
                  {t.inventory.noVehiclesDesc}
                </p>
                <Button onClick={clearFilters} variant="outline" className="border-navy/20 text-navy">
                  {t.inventory.clearAllFilters}
                </Button>
              </div>
            )}

            {/* Cars grid — stagger delay capped to prevent long delays with many items */}
            {!loading && cars.length > 0 && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {cars.map((car, index) => (
                  <motion.div
                    key={car.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.05, MAX_STAGGER_DELAY) }}
                  >
                    <CarCard
                      car={car}
                      onViewDetails={openModal}
                      whatsapp={whatsapp}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Car Detail Modal ─── */}
      <CarModal
        car={selectedCar}
        isOpen={modalOpen}
        onClose={closeModal}
        whatsapp={whatsapp}
        phone={phone}
      />
    </section>
  );
}
