// API route: /api/cars
// Handles GET (list with filters) and POST (create new car)
// FIX: Uses requireAuth() for proper session validation on POST

import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { invalidateChatCache } from '@/lib/chat-cache';

// ─── GET /api/cars ───
// Fetch cars with optional filters (query params)
// Public endpoint — no auth required
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filter conditions from query parameters
    const where: Record<string, unknown> = {};

    // Brand filter (exact match)
    const brand = searchParams.get('brand');
    if (brand && brand !== 'all') {
      where.brand = brand;
    }

    // Year filter (with NaN validation)
    const year = searchParams.get('year');
    if (year && year !== 'all') {
      const parsed = parseInt(year);
      if (!isNaN(parsed)) where.year = parsed;
    }

    // Fuel type filter
    const fuelType = searchParams.get('fuelType');
    if (fuelType && fuelType !== 'all') {
      where.fuelType = fuelType;
    }

    // Condition filter
    const condition = searchParams.get('condition');
    if (condition && condition !== 'all') {
      where.condition = condition;
    }

    // Body type filter
    const bodyType = searchParams.get('bodyType');
    if (bodyType && bodyType !== 'all') {
      where.bodyType = bodyType;
    }

    // Status filter
    const status = searchParams.get('status');
    if (status && status !== 'all') {
      where.status = status;
    }

    // Price range filter (with NaN validation)
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const priceFilter: Record<string, number> = {};
    if (minPrice) { const v = parseInt(minPrice); if (!isNaN(v)) priceFilter.gte = v; }
    if (maxPrice) { const v = parseInt(maxPrice); if (!isNaN(v)) priceFilter.lte = v; }
    if (Object.keys(priceFilter).length > 0) {
      where.price = priceFilter;
    }

    // Mileage range filter (with NaN validation)
    const minMileage = searchParams.get('minMileage');
    const maxMileage = searchParams.get('maxMileage');
    const mileageFilter: Record<string, number> = {};
    if (minMileage) { const v = parseInt(minMileage); if (!isNaN(v)) mileageFilter.gte = v; }
    if (maxMileage) { const v = parseInt(maxMileage); if (!isNaN(v)) mileageFilter.lte = v; }
    if (Object.keys(mileageFilter).length > 0) {
      where.mileage = mileageFilter;
    }

    // Fetch cars with applied filters
    const cars = await db.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Parse images JSON string to array for each car
    const carsWithParsedImages = cars.map((car) => ({
      ...car,
      images: (() => { try { return JSON.parse(car.images); } catch { return []; } })(),
    }));

    return NextResponse.json({ cars: carsWithParsedImages });
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

// ─── POST /api/cars ───
// Create a new car listing (requires admin authentication)
export async function POST(request: NextRequest) {
  try {
    // FIX: Validate session against database (previously only checked cookie existence)
    const admin = await requireAuth();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ['brand', 'model', 'year', 'price', 'mileage', 'condition', 'fuelType', 'bodyType', 'seats', 'doors', 'color'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields
    const numericFields = { year: body.year, price: body.price, mileage: body.mileage, seats: body.seats, doors: body.doors };
    for (const [field, value] of Object.entries(numericFields)) {
      if (isNaN(parseInt(String(value)))) {
        return NextResponse.json(
          { error: `Invalid numeric value for field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the car
    const car = await db.car.create({
      data: {
        brand: body.brand,
        model: body.model,
        year: parseInt(String(body.year)),
        price: parseInt(String(body.price)),
        mileage: parseInt(String(body.mileage)),
        condition: body.condition,
        fuelType: body.fuelType,
        bodyType: body.bodyType,
        seats: parseInt(String(body.seats)),
        doors: parseInt(String(body.doors)),
        color: body.color,
        status: body.status || 'Available',
        description: body.description || null,
        images: JSON.stringify(body.images || []),
        featured: body.featured || false,
      },
    });

    // Invalidate AI chat cache so it picks up the new vehicle
    invalidateChatCache();

    return NextResponse.json({
      car: { ...car, images: (() => { try { return JSON.parse(car.images); } catch { return []; } })() },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    );
  }
}
