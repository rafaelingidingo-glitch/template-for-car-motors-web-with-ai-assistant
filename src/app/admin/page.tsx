"use client";

// ─── Admin Dashboard Page ───
// Full admin CMS with login, settings management, and inventory CRUD
// All-in-one client component to avoid creating multiple routes

import { useState, useEffect, useCallback } from "react";
import {
  Car, Settings, LogOut, Plus, Pencil, Trash2, Save, X,
  Upload, Link, Eye, EyeOff, Loader2, ImageIcon, ArrowLeft,
  AlertTriangle, Phone, Mail, MapPin, Clock,
  UserCircle, UserPlus, Shield, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { formatPrice as sharedFormatPrice } from "@/lib/format";

// ─── Types ───
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

interface CarItem {
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
  createdAt: string;
}

// ─── Constants for dropdowns ───
const BRANDS = [
  "Audi", "BMW", "Ford", "Honda", "Mercedes-Benz", "Land Rover",
  "Nissan", "Subaru", "Toyota", "Volkswagen", "Volvo", "Other"
];
const YEARS = Array.from({ length: 20 }, (_, i) => 2025 - i);
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
const CONDITIONS = ["New", "Used", "Refurbished"];
const BODY_TYPES = [
  "SUV", "Sedan", "Truck", "Van", "Hatchback", "Coupe",
  "Pickup", "Minivan", "Convertible", "Sports Car", "Station Wagon", "Other"
];

// Default empty car form
const emptyCarForm = {
  brand: "",
  model: "",
  year: "2025",
  price: "",
  mileage: "",
  condition: "New",
  fuelType: "Petrol",
  bodyType: "SUV",
  seats: "5",
  doors: "4",
  color: "",
  status: "Available",
  description: "",
  images: [] as string[],
  featured: false,
};

export default function AdminPage() {
  // ─── State ───
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "settings" | "account">("inventory");

  // Login form state
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Inventory state
  const [cars, setCars] = useState<CarItem[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);

  // Car form state (for create/edit)
  const [carForm, setCarForm] = useState(emptyCarForm);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [carFormOpen, setCarFormOpen] = useState(false);
  const [carFormLoading, setCarFormLoading] = useState(false);

  // Image URL input state
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<CarItem | null>(null);

  // Account management state
  const [admins, setAdmins] = useState<{ id: string; username: string; createdAt: string; updatedAt: string }[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ username: "", password: "" });
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editUsernameForm, setEditUsernameForm] = useState("");
  const [editPasswordForm, setEditPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteAdminTarget, setDeleteAdminTarget] = useState<{ id: string; username: string } | null>(null);

  const { toast } = useToast();

  // ─── Check authentication on mount ───
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ─── Fetch settings ───
  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // ─── Fetch cars ───
  const fetchCars = useCallback(async () => {
    setCarsLoading(true);
    try {
      const res = await fetch("/api/cars");
      const data = await res.json();
      setCars(data.cars || []);
    } catch (error) {
      console.error("Error fetching cars:", error);
    } finally {
      setCarsLoading(false);
    }
  }, []);

  // ─── Fetch admin users ───
  const fetchAdmins = useCallback(async () => {
    setAdminsLoading(true);
    try {
      const res = await fetch("/api/admin");
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSettings();
      fetchCars();
      fetchAdmins();
    }
  }, [isAuthenticated, fetchSettings, fetchCars, fetchAdmins]);

  // ─── Login handler ───
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        toast({ title: "Login Successful", description: "Welcome to the admin dashboard!" });
      } else {
        toast({ title: "Login Failed", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to connect", variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  // ─── Logout handler ───
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsAuthenticated(false);
    toast({ title: "Logged Out", description: "You've been logged out successfully." });
  };

  // ─── Save settings handler ───
  const handleSaveSettings = async () => {
    if (!settings) return;
    setSettingsLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        toast({ title: "Settings Saved", description: "Your changes have been saved." });
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error || "Failed to save settings", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSettingsLoading(false);
    }
  };

  // ─── Open car form for creating ───
  const openCreateForm = () => {
    setCarForm(emptyCarForm);
    setEditingCarId(null);
    setCarFormOpen(true);
  };

  // ─── Open car form for editing ───
  const openEditForm = (car: CarItem) => {
    setCarForm({
      brand: car.brand,
      model: car.model,
      year: String(car.year),
      price: String(car.price),
      mileage: String(car.mileage),
      condition: car.condition,
      fuelType: car.fuelType,
      bodyType: car.bodyType,
      seats: String(car.seats),
      doors: String(car.doors),
      color: car.color,
      status: car.status,
      description: car.description || "",
      images: car.images || [],
      featured: car.featured,
    });
    setEditingCarId(car.id);
    setCarFormOpen(true);
  };

  // ─── Handle car form submission (create or update) ───
  const handleCarFormSubmit = async () => {
    // Validate numeric fields before submission — prevent NaN from being stored
    const numericFields = [
      { key: "year", label: "Year", value: carForm.year },
      { key: "price", label: "Price", value: carForm.price },
      { key: "mileage", label: "Mileage", value: carForm.mileage },
      { key: "seats", label: "Seats", value: carForm.seats },
      { key: "doors", label: "Doors", value: carForm.doors },
    ];
    for (const field of numericFields) {
      if (!field.value || isNaN(parseInt(field.value))) {
        toast({ title: "Validation Error", description: `${field.label} must be a valid number`, variant: "destructive" });
        return;
      }
    }

    setCarFormLoading(true);
    try {
      const payload = {
        ...carForm,
        year: parseInt(carForm.year),
        price: parseInt(carForm.price),
        mileage: parseInt(carForm.mileage),
        seats: parseInt(carForm.seats),
        doors: parseInt(carForm.doors),
      };

      const url = editingCarId ? `/api/cars/${editingCarId}` : "/api/cars";
      const method = editingCarId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast({
          title: editingCarId ? "Car Updated" : "Car Created",
          description: editingCarId ? "Vehicle has been updated." : "New vehicle has been added.",
        });
        setCarFormOpen(false);
        fetchCars(); // Refresh the list
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to save vehicle", variant: "destructive" });
    } finally {
      setCarFormLoading(false);
    }
  };

  // ─── Delete car handler ───
  const handleDeleteCar = async (car: CarItem) => {
    try {
      const res = await fetch(`/api/cars/${car.id}`, { method: "DELETE" });
      if (res.ok) {
        toast({ title: "Car Deleted", description: `${car.brand} ${car.model} has been removed.` });
        fetchCars();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete vehicle", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  // ─── Add image URL to car form ───
  const addImageUrl = () => {
    if (imageUrlInput.trim()) {
      setCarForm((prev) => ({
        ...prev,
        images: [...prev.images, imageUrlInput.trim()],
      }));
      setImageUrlInput("");
    }
  };

  // ─── Remove image from car form ───
  const removeImage = (index: number) => {
    setCarForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // ─── Handle file upload for images ───
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For now, convert files to object URLs for preview
    // In production, you'd upload to a CDN/storage service
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setCarForm((prev) => ({
            ...prev,
            images: [...prev.images, result],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // ─── Toggle car status (Available/Sold) ───
  const toggleCarStatus = async (car: CarItem) => {
    try {
      const newStatus = car.status === "Available" ? "Sold" : "Available";
      await fetch(`/api/cars/${car.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchCars();
      toast({ title: "Status Updated", description: `${car.brand} ${car.model} marked as ${newStatus}.` });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  // ─── Seed database handler ───
  const handleSeed = async () => {
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      toast({ title: "Database Seeded", description: data.message });
      fetchCars();
      fetchSettings();
    } catch {
      toast({ title: "Error", description: "Failed to seed database", variant: "destructive" });
    }
  };

  // ─── Add new admin user ───
  const handleAddUser = async () => {
    if (!newUserForm.username || !newUserForm.password) {
      toast({ title: "Error", description: "Username and password are required", variant: "destructive" });
      return;
    }
    if (newUserForm.password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setAddUserLoading(true);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "User Created", description: `Admin user "${newUserForm.username}" has been added.` });
        setNewUserForm({ username: "", password: "" });
        setShowAddUser(false);
        fetchAdmins();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    } finally {
      setAddUserLoading(false);
    }
  };

  // ─── Update admin username ───
  const handleUpdateUsername = async () => {
    if (!editingAdminId || !editUsernameForm.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/${editingAdminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: editUsernameForm.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Username Updated", description: `Username changed to "${editUsernameForm.trim()}".` });
        setEditingAdminId(null);
        fetchAdmins();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update username", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Update admin password ───
  const handleUpdatePassword = async () => {
    if (!editingAdminId) return;
    if (editPasswordForm.newPassword !== editPasswordForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }
    if (editPasswordForm.newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/${editingAdminId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: editPasswordForm.currentPassword,
          newPassword: editPasswordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Password Updated", description: "Password has been changed successfully." });
        setEditingAdminId(null);
        setEditPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update password", variant: "destructive" });
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Delete admin user ───
  const handleDeleteAdmin = async () => {
    if (!deleteAdminTarget) return;
    try {
      const res = await fetch(`/api/admin/${deleteAdminTarget.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "User Deleted", description: `Admin "${deleteAdminTarget.username}" has been removed.` });
        fetchAdmins();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
    setDeleteAdminTarget(null);
  };

  // Use shared TZS formatter directly
  const formatPrice = sharedFormatPrice;

  // ─────────────────────────────────────────────────
  // ─── LOGIN SCREEN ───
  // ─────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <Loader2 className="h-8 w-8 animate-spin text-cta" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white rounded-none shadow-2xl p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-cta/10 rounded-none flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8 text-cta" />
              </div>
              <h1 className="text-2xl font-bold text-navy">Admin Login</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Sign in to manage your dealership
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-cta hover:bg-cta-hover text-white font-semibold h-11"
              >
                {loginLoading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Default credentials hint — only shown in development mode */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-xs font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Default credentials: admin / admin123
                </p>
              </div>
            )}

            {/* Back to site link */}
            <div className="mt-4 text-center">
              <a href="/" className="text-sm text-muted-foreground hover:text-navy transition-colors flex items-center justify-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to website
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────
  // ─── ADMIN DASHBOARD ───
  // ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ─── Sidebar ─── */}
      <aside className="w-64 bg-navy text-white flex flex-col hidden md:flex">
        {/* Sidebar header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Car className="h-7 w-7 text-cta" />
            <div>
              <p className="font-bold text-sm">{settings?.shopName || "AutoElite"}</p>
              <p className="text-white/40 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Sidebar navigation */}
        <nav className="flex-1 py-4">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`admin-sidebar-item w-full text-left px-6 py-3 text-sm font-medium flex items-center gap-3 ${
              activeTab === "inventory" ? "active text-white" : "text-white/60 hover:text-white"
            }`}
          >
            <Car className="h-4 w-4" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`admin-sidebar-item w-full text-left px-6 py-3 text-sm font-medium flex items-center gap-3 ${
              activeTab === "settings" ? "active text-white" : "text-white/60 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`admin-sidebar-item w-full text-left px-6 py-3 text-sm font-medium flex items-center gap-3 ${
              activeTab === "account" ? "active text-white" : "text-white/60 hover:text-white"
            }`}
          >
            <UserCircle className="h-4 w-4" />
            Account
          </button>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <a href="/" className="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-white flex items-center gap-2 transition-colors">
            <ArrowLeft className="h-4 w-4" /> View Website
          </a>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-white/60 hover:text-cta flex items-center gap-2 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden bg-navy text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-cta" />
            <span className="font-bold text-sm">Admin</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-3 py-1 text-xs rounded-full ${activeTab === "inventory" ? "bg-cta text-white" : "text-white/60"}`}
            >
              Inventory
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-3 py-1 text-xs rounded-full ${activeTab === "settings" ? "bg-cta text-white" : "text-white/60"}`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`px-3 py-1 text-xs rounded-full ${activeTab === "account" ? "bg-cta text-white" : "text-white/60"}`}
            >
              Account
            </button>
            <a href="/" className="text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </a>
            <button onClick={handleLogout} className="text-white/60 hover:text-cta">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* ─── INVENTORY TAB ─── */}
          {activeTab === "inventory" && (
            <div>
              {/* Header with actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-navy">Inventory Management</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {cars.length} vehicle{cars.length !== 1 ? "s" : ""} in stock
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSeed} variant="outline" size="sm" className="border-navy/20 text-navy">
                    Seed Sample Data
                  </Button>
                  <Button onClick={openCreateForm} size="sm" className="bg-cta hover:bg-cta-hover text-white">
                    <Plus className="mr-1 h-4 w-4" /> Add Vehicle
                  </Button>
                </div>
              </div>

              {/* Cars list */}
              {carsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-cta" />
                </div>
              ) : cars.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border">
                  <Car className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-muted-foreground">No vehicles yet. Add your first car or seed sample data.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                  {/* Table header */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-navy/5 text-sm font-semibold text-navy/70 border-b">
                    <div className="col-span-3">Vehicle</div>
                    <div className="col-span-2">Price (TSH)</div>
                    <div className="col-span-1">Year</div>
                    <div className="col-span-2">Condition</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  {/* Table rows */}
                  <div className="divide-y">
                    {cars.map((car) => (
                      <div key={car.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 p-4 hover:bg-gray-50 items-center">
                        {/* Vehicle info */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {car.images?.[0] ? (
                              <img src={car.images[0]} alt={car.brand} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-navy text-sm">{car.brand} {car.model}</p>
                            <p className="text-xs text-muted-foreground">{car.bodyType} • {car.fuelType}</p>
                          </div>
                        </div>
                        {/* Price */}
                        <div className="col-span-2">
                          <p className="font-semibold text-navy text-sm">{formatPrice(car.price)}</p>
                          <p className="text-xs text-muted-foreground">{car.mileage.toLocaleString()} km</p>
                        </div>
                        {/* Year */}
                        <div className="col-span-1">
                          <p className="text-sm text-navy">{car.year}</p>
                        </div>
                        {/* Condition */}
                        <div className="col-span-2">
                          <Badge variant="outline" className={`text-xs ${
                            car.condition === "New" ? "border-green-300 text-green-700" :
                            car.condition === "Used" ? "border-amber-300 text-amber-700" :
                            "border-blue-300 text-blue-700"
                          }`}>
                            {car.condition}
                          </Badge>
                        </div>
                        {/* Status toggle */}
                        <div className="col-span-2">
                          <button
                            onClick={() => toggleCarStatus(car)}
                            className="flex items-center gap-2"
                            aria-label={`Toggle ${car.brand} ${car.model} status (currently ${car.status})`}
                          >
                            <div className={`w-2.5 h-2.5 rounded-full ${car.status === "Available" ? "bg-green-500" : "bg-cta"}`} />
                            <span className={`text-sm font-medium ${car.status === "Available" ? "text-green-700" : "text-cta"}`}>
                              {car.status}
                            </span>
                          </button>
                        </div>
                        {/* Actions */}
                        <div className="col-span-2 flex gap-2 justify-end">
                          <Button onClick={() => openEditForm(car)} variant="ghost" size="sm" className="text-navy/60 hover:text-navy" aria-label={`Edit ${car.brand} ${car.model}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button onClick={() => setDeleteTarget(car)} variant="ghost" size="sm" className="text-cta/60 hover:text-cta" aria-label={`Delete ${car.brand} ${car.model}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── SETTINGS TAB ─── */}
          {activeTab === "settings" && settings && (
            <div>
              <h1 className="text-2xl font-bold text-navy mb-6">Global Settings</h1>
              <div className="bg-white rounded-xl border shadow-sm p-6 max-w-2xl space-y-6">
                {/* Shop Name */}
                <div>
                  <Label className="text-navy/70">Shop Name</Label>
                  <Input
                    value={settings.shopName}
                    onChange={(e) => setSettings({ ...settings, shopName: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                {/* Logo URL */}
                <div>
                  <Label className="text-navy/70">Logo (Image URL or Path)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      value={settings.logo}
                      onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                      placeholder="/images/logo.png or https://..."
                    />
                  </div>
                  {settings.logo && (
                    <div className="mt-2 w-20 h-20 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img src={settings.logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <Label className="text-navy/70 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone Number</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <Label className="text-navy/70">WhatsApp Number (without +)</Label>
                  <Input
                    value={settings.whatsapp}
                    onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                    placeholder="255757337929"
                    className="mt-1.5"
                  />
                </div>

                {/* Email */}
                <div>
                  <Label className="text-navy/70 flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label>
                  <Input
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                {/* Address */}
                <div>
                  <Label className="text-navy/70 flex items-center gap-1"><MapPin className="h-3 w-3" /> Address</Label>
                  <Input
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                {/* Location */}
                <div>
                  <Label className="text-navy/70">Google Maps Coordinates</Label>
                  <Input
                    value={settings.location}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    placeholder="-6.7924,39.2083"
                    className="mt-1.5"
                  />
                </div>

                {/* Hours */}
                <div>
                  <Label className="text-navy/70 flex items-center gap-1"><Clock className="h-3 w-3" /> Operating Hours</Label>
                  <Input
                    value={settings.hours}
                    onChange={(e) => setSettings({ ...settings, hours: e.target.value })}
                    className="mt-1.5"
                  />
                </div>

                {/* Save button */}
                <Button
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                  className="bg-cta hover:bg-cta-hover text-white font-semibold"
                >
                  {settingsLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Save Settings</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ─── ACCOUNT TAB ─── */}
          {activeTab === "account" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-navy">Account Management</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Manage admin users, change usernames and passwords
                  </p>
                </div>
                <Button
                  onClick={() => setShowAddUser(!showAddUser)}
                  size="sm"
                  className="bg-cta hover:bg-cta-hover text-white"
                >
                  <UserPlus className="mr-1 h-4 w-4" /> Add New User
                </Button>
              </div>

              {/* Add New User Form */}
              {showAddUser && (
                <div className="bg-white rounded-none border shadow-sm p-6 max-w-2xl mb-6">
                  <h2 className="text-lg font-bold text-navy mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cta" /> New Admin User
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-navy/70">Username</Label>
                      <Input
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm((p) => ({ ...p, username: e.target.value }))}
                        placeholder="Enter username"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label className="text-navy/70">Password</Label>
                      <Input
                        type="password"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Minimum 6 characters"
                        className="mt-1.5"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddUser}
                        disabled={addUserLoading}
                        className="bg-cta hover:bg-cta-hover text-white font-semibold"
                      >
                        {addUserLoading ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                        ) : (
                          <><UserPlus className="mr-2 h-4 w-4" /> Create User</>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => { setShowAddUser(false); setNewUserForm({ username: "", password: "" }); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Users List */}
              {adminsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-6 w-6 animate-spin text-cta" />
                </div>
              ) : admins.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-none border">
                  <UserCircle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-muted-foreground">No admin users found.</p>
                </div>
              ) : (
                <div className="max-w-2xl space-y-4">
                  {admins.map((adminUser) => (
                    <div key={adminUser.id} className="bg-white rounded-none border shadow-sm p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy/5 rounded-none flex items-center justify-center">
                            <UserCircle className="h-6 w-6 text-navy/60" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy">{adminUser.username}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {new Date(adminUser.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => { setEditingAdminId(adminUser.id); setEditUsernameForm(adminUser.username); setEditPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                            variant="ghost"
                            size="sm"
                            className="text-navy/60 hover:text-navy"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setDeleteAdminTarget({ id: adminUser.id, username: adminUser.username })}
                            variant="ghost"
                            size="sm"
                            className="text-cta/60 hover:text-cta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Edit Username / Password Form (inline, shown when editing) */}
                      {editingAdminId === adminUser.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                          {/* Change Username */}
                          <div>
                            <Label className="text-navy/70 flex items-center gap-1">
                              <UserCircle className="h-3 w-3" /> Change Username
                            </Label>
                            <div className="flex gap-2 mt-1.5">
                              <Input
                                value={editUsernameForm}
                                onChange={(e) => setEditUsernameForm(e.target.value)}
                                placeholder="New username"
                                className="flex-1"
                              />
                              <Button
                                onClick={handleUpdateUsername}
                                disabled={editLoading}
                                size="sm"
                                className="bg-navy hover:bg-navy-light text-white"
                              >
                                {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>

                          {/* Change Password */}
                          <div>
                            <Label className="text-navy/70 flex items-center gap-1">
                              <KeyRound className="h-3 w-3" /> Change Password
                            </Label>
                            <div className="space-y-2 mt-1.5">
                              <Input
                                type="password"
                                value={editPasswordForm.currentPassword}
                                onChange={(e) => setEditPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                                placeholder="Your current password"
                              />
                              <Input
                                type="password"
                                value={editPasswordForm.newPassword}
                                onChange={(e) => setEditPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                                placeholder="New password (min 6 chars)"
                              />
                              <Input
                                type="password"
                                value={editPasswordForm.confirmPassword}
                                onChange={(e) => setEditPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                placeholder="Confirm new password"
                              />
                              <Button
                                onClick={handleUpdatePassword}
                                disabled={editLoading}
                                size="sm"
                                className="bg-cta hover:bg-cta-hover text-white"
                              >
                                {editLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><KeyRound className="mr-2 h-4 w-4" /> Update Password</>}
                              </Button>
                            </div>
                          </div>

                          <Button variant="outline" size="sm" onClick={() => setEditingAdminId(null)}>
                            <X className="mr-1 h-4 w-4" /> Close
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ─── Car Form Dialog (Create/Edit) ─── */}
      <Dialog open={carFormOpen} onOpenChange={setCarFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-navy">
              {editingCarId ? "Edit Vehicle" : "Add New Vehicle"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand / Make</Label>
                <Select value={carForm.brand} onValueChange={(val) => setCarForm((p) => ({ ...p, brand: val }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select brand" /></SelectTrigger>
                  <SelectContent>
                    {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Model Name</Label>
                <Input
                  value={carForm.model}
                  onChange={(e) => setCarForm((p) => ({ ...p, model: e.target.value }))}
                  placeholder="e.g., Alphard"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Year & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Year</Label>
                <Select value={carForm.year} onValueChange={(val) => setCarForm((p) => ({ ...p, year: val }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Price (TSH)</Label>
                <Input
                  type="number"
                  min="0"
                  value={carForm.price}
                  onChange={(e) => setCarForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="85000000"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Mileage & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mileage (km)</Label>
                <Input
                  type="number"
                  min="0"
                  value={carForm.mileage}
                  onChange={(e) => setCarForm((p) => ({ ...p, mileage: e.target.value }))}
                  placeholder="1200"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Condition</Label>
                <Select value={carForm.condition} onValueChange={(val) => setCarForm((p) => ({ ...p, condition: val }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Body Type & Fuel Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Body Type</Label>
                <Select value={carForm.bodyType} onValueChange={(val) => setCarForm((p) => ({ ...p, bodyType: val }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BODY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Fuel Type</Label>
                <Select value={carForm.fuelType} onValueChange={(val) => setCarForm((p) => ({ ...p, fuelType: val }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Seats & Doors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Seats</Label>
                <Input
                  type="number"
                  value={carForm.seats}
                  onChange={(e) => setCarForm((p) => ({ ...p, seats: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Doors</Label>
                <Input
                  type="number"
                  value={carForm.doors}
                  onChange={(e) => setCarForm((p) => ({ ...p, doors: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Color & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Exterior Color</Label>
                <Input
                  value={carForm.color}
                  onChange={(e) => setCarForm((p) => ({ ...p, color: e.target.value }))}
                  placeholder="Pearl White"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={carForm.status} onValueChange={(val) => setCarForm((p) => ({ ...p, status: val }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Featured toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={carForm.featured}
                onCheckedChange={(checked) => setCarForm((p) => ({ ...p, featured: checked }))}
              />
              <Label>Featured Vehicle</Label>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={carForm.description}
                onChange={(e) => setCarForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detailed vehicle description..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            {/* ─── Image Upload Section ─── */}
            <div>
              <Label className="text-navy font-semibold">Images</Label>

              {/* Upload from local files */}
              <div className="mt-2">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-cta/40 transition-colors">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload images from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Add image by URL */}
              <div className="mt-2 flex gap-2">
                <Input
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="Paste image URL here..."
                  className="flex-1"
                />
                <Button onClick={addImageUrl} variant="outline" size="sm" className="border-navy/20 text-navy">
                  <Link className="h-4 w-4 mr-1" /> Add URL
                </Button>
              </div>

              {/* Image previews */}
              {carForm.images.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {carForm.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border aspect-square">
                      <img src={img} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 bg-cta text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setCarFormOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCarFormSubmit}
              disabled={carFormLoading}
              className="bg-cta hover:bg-cta-hover text-white"
            >
              {carFormLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> {editingCarId ? "Update Vehicle" : "Add Vehicle"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation Dialog ─── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cta" />
              Delete Vehicle
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <strong>{deleteTarget?.brand} {deleteTarget?.model} ({deleteTarget?.year})</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDeleteCar(deleteTarget)}
              className="bg-cta hover:bg-cta-hover text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Delete Admin User Confirmation Dialog ─── */}
      <AlertDialog open={!!deleteAdminTarget} onOpenChange={() => setDeleteAdminTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-cta" />
              Delete Admin User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the admin user <strong>&quot;{deleteAdminTarget?.username}&quot;</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAdmin}
              className="bg-cta hover:bg-cta-hover text-white"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
