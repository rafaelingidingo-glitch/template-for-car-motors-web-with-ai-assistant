// API route: /api/seed
// Handles POST - seed the database with sample data
// FIX: Uses requireAuth() for proper session validation
// FIX: Uses bcrypt for default admin password

import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { invalidateChatCache } from '@/lib/chat-cache';

// Shared default settings (matches settings route)
const DEFAULT_SETTINGS = {
  shopName: 'AutoElite Motors',
  logo: '/images/logo.png',
  phone: '+255 757 337 929',
  email: 'info@autoelite.co.tz',
  address: '123 Safari Drive, Dar es Salaam, Tanzania',
  location: '-6.7924,39.2083',
  hours: 'Mon-Fri: 8AM-6PM | Sat: 9AM-4PM | Sun: Closed',
  whatsapp: '255757337929',
};

// ─── POST /api/seed ───
// Populate database with sample cars and default settings
// Security: Allows unauthenticated access ONLY for first-time setup (no admin exists yet).
export async function POST() {
  try {
    // SECURITY: Check if this is first-time setup
    const adminCount = await db.admin.count();
    const isFirstTimeSetup = adminCount === 0;

    if (!isFirstTimeSetup) {
      // FIX: Validate session against database (previously only checked cookie existence)
      const admin = await requireAuth();
      if (!admin) {
        return NextResponse.json(
          { error: 'Unauthorized — login required to seed database' },
          { status: 401 }
        );
      }
    }

    // ─── Create default admin user if not exists ───
    const existingAdmin = await db.admin.findUnique({
      where: { username: 'admin' },
    });

    if (!existingAdmin) {
      // FIX: Hash the default password with bcrypt
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.admin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
        },
      });
    }

    // ─── Create default site settings if not exists ───
    const existingSettings = await db.siteSetting.findFirst();
    if (!existingSettings) {
      await db.siteSetting.create({ data: DEFAULT_SETTINGS });
    }

    // ─── Check if cars already exist ───
    const existingCars = await db.car.count();
    if (existingCars > 0) {
      return NextResponse.json({
        message: 'Database already seeded',
        carsCount: existingCars,
      });
    }

    // ─── Sample car data ───
    const sampleCars = [
      {
        brand: 'Toyota',
        model: 'Alphard',
        year: 2024,
        price: 212500000,
        mileage: 1200,
        condition: 'New',
        fuelType: 'Hybrid',
        bodyType: 'Minivan',
        seats: 7,
        doors: 5,
        color: 'Pearl White',
        status: 'Available',
        description: 'Brand new Toyota Alphard luxury minivan. Premium interior with captain seats, advanced safety features, and hybrid efficiency.',
        images: JSON.stringify(['/images/car-toyota-alphard.png', '/images/car-toyota-alphard-side.png', '/images/car-toyota-alphard-rear.png']),
        featured: true,
      },
      {
        brand: 'BMW',
        model: 'X5',
        year: 2023,
        price: 180000000,
        mileage: 18500,
        condition: 'Used',
        fuelType: 'Diesel',
        bodyType: 'SUV',
        seats: 5,
        doors: 5,
        color: 'Black Sapphire',
        status: 'Available',
        description: 'Well-maintained BMW X5 with M Sport package. Panoramic sunroof, premium Harman Kardon sound system.',
        images: JSON.stringify(['/images/car-bmw-x5.png', '/images/car-bmw-x5-side.png', '/images/car-bmw-x5-rear.png']),
        featured: true,
      },
      {
        brand: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2023,
        price: 137500000,
        mileage: 22000,
        condition: 'Used',
        fuelType: 'Petrol',
        bodyType: 'Sedan',
        seats: 5,
        doors: 4,
        color: 'Red',
        status: 'Available',
        description: 'Elegant Mercedes C-Class with AMG Line package. MBUX infotainment, leather interior, and driver assistance package.',
        images: JSON.stringify(['/images/car-mercedes-cclass.png', '/images/car-mercedes-cclass-side.png', '/images/car-mercedes-cclass-rear.png']),
        featured: false,
      },
      {
        brand: 'Toyota',
        model: 'Land Cruiser',
        year: 2024,
        price: 237500000,
        mileage: 500,
        condition: 'New',
        fuelType: 'Diesel',
        bodyType: 'SUV',
        seats: 7,
        doors: 5,
        color: 'Silver Metallic',
        status: 'Available',
        description: 'Legendary Toyota Land Cruiser. Brand new with full warranty, off-road package, and premium leather interior.',
        images: JSON.stringify(['/images/car-landcruiser.png', '/images/car-landcruiser-side.png', '/images/car-landcruiser-rear.png']),
        featured: true,
      },
      {
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
        price: 70000000,
        mileage: 35000,
        condition: 'Used',
        fuelType: 'Petrol',
        bodyType: 'Sedan',
        seats: 5,
        doors: 4,
        color: 'Blue',
        status: 'Available',
        description: 'Reliable Honda Civic with sporty design. Turbocharged engine, Honda Sensing safety suite, and Apple CarPlay.',
        images: JSON.stringify(['/images/car-honda-civic.png', '/images/car-honda-civic-side.png', '/images/car-honda-civic-rear.png']),
        featured: false,
      },
      {
        brand: 'Ford',
        model: 'Ranger',
        year: 2023,
        price: 105000000,
        mileage: 15000,
        condition: 'Used',
        fuelType: 'Diesel',
        bodyType: 'Pickup',
        seats: 5,
        doors: 4,
        color: 'White',
        status: 'Sold',
        description: 'Ford Ranger Wildtrak with canopy and tow bar. Perfect for work and adventure. Well maintained.',
        images: JSON.stringify(['/images/car-ford-ranger.png', '/images/car-ford-ranger-side.png', '/images/car-ford-ranger-rear.png']),
        featured: false,
      },
      {
        brand: 'Audi',
        model: 'Q7',
        year: 2023,
        price: 170000000,
        mileage: 12000,
        condition: 'Refurbished',
        fuelType: 'Petrol',
        bodyType: 'SUV',
        seats: 7,
        doors: 5,
        color: 'Grey',
        status: 'Available',
        description: 'Refurbished Audi Q7 in excellent condition. Virtual cockpit, Quattro AWD, and premium Bang & Olufsen audio.',
        images: JSON.stringify(['/images/car-audi-q7.png', '/images/car-audi-q7-side.png', '/images/car-audi-q7-rear.png']),
        featured: false,
      },
      {
        brand: 'Land Rover',
        model: 'Range Rover',
        year: 2024,
        price: 300000000,
        mileage: 800,
        condition: 'New',
        fuelType: 'Hybrid',
        bodyType: 'SUV',
        seats: 5,
        doors: 5,
        color: 'British Racing Green',
        status: 'Available',
        description: 'The pinnacle of luxury SUVs. New Range Rover with hybrid powertrain, air suspension, and executive rear seats.',
        images: JSON.stringify(['/images/car-range-rover.png', '/images/car-range-rover-side.png', '/images/car-range-rover-rear.png']),
        featured: true,
      },
    ];

    for (const car of sampleCars) {
      await db.car.create({ data: car });
    }

    // Invalidate AI chat cache so it picks up the new seed data
    invalidateChatCache();

    return NextResponse.json({
      message: 'Database seeded successfully',
      carsCount: sampleCars.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
