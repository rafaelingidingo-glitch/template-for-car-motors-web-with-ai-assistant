import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai"; // Native modern SDK
import { db } from "@/lib/db";
import { registerChatCacheInvalidator } from "@/lib/chat-cache";

// ─── Initialize Google Gen AI ───
const geminiApiKey = process.env.GEMINI_API_KEY;
// Automatically initializes if the key exists, else remains null
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ─── Conversation Store ───
const conversations = new Map<
  string,
  { messages: { role: "user" | "model"; parts: { text: string }[] }[]; lastActivity: number }
>();

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of conversations) {
    if (now - session.lastActivity > SESSION_TTL) {
      conversations.delete(sessionId);
    }
  }
}, CLEANUP_INTERVAL);

const MAX_MESSAGES = 40;
const sessionLocks = new Map<string, Promise<void>>();

// ─── Cached Inventory Data ───
let cachedInventory: string | null = null;
let cachedSettings: string | null = null;
let lastCacheRefresh = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchDealershipContext(): Promise<string> {
  const now = Date.now();
  if (cachedInventory && cachedSettings && now - lastCacheRefresh < CACHE_TTL) {
    return cachedInventory + "\n\n" + cachedSettings;
  }

  try {
    const availableCars = await db.car.findMany({
      where: { status: "Available" },
      select: {
        brand: true,
        model: true,
        year: true,
        price: true,
        mileage: true,
        condition: true,
        fuelType: true,
        bodyType: true,
        seats: true,
        color: true,
        description: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const soldCount = await db.car.count({ where: { status: "Sold" } });
    const settings = await db.siteSetting.findFirst();

    const carList = availableCars
      .map((car) => {
        const priceStr = `TSH ${car.price.toLocaleString()}`;
        const mileageStr = `${car.mileage.toLocaleString()} km`;
        return `- ${car.year} ${car.brand} ${car.model} | ${priceStr} | ${car.condition} | ${car.fuelType} | ${car.bodyType} | ${mileageStr} | ${car.seats} seats | ${car.color}${car.description ? ` | ${car.description}` : ""}`;
      })
      .join("\n");

    cachedInventory = `**Current Vehicle Inventory (${availableCars.length} available, ${soldCount} sold):**
${carList || "No vehicles currently in stock."}

IMPORTANT: When a customer asks about specific vehicles, ONLY reference vehicles from the list above. State the exact price in TSH. If a vehicle is not listed, say it's not currently in stock and suggest they contact the dealership.`;

    if (settings) {
      cachedSettings = `**Company Details:**
- Shop Name: ${settings.shopName}
- Phone: ${settings.phone}
- WhatsApp: ${settings.whatsapp}
- Email: ${settings.email}
- Address: ${settings.address}
- Working Hours: ${settings.hours}
- Google Maps: ${settings.location}`;
    } else {
      cachedSettings = `**Company Details:**
- Shop Name: your shop name
- Phone: +255 762686240
- WhatsApp: +255 762686240
- Email: info@shopname.co.tz
- Address: 123 Safari Drive, Dar es Salaam, Tanzania
- Working Hours: Mon-Fri 8AM-6PM | Sat 9AM-4PM | Sun Closed`;
    }

    lastCacheRefresh = now;
    return cachedInventory + "\n\n" + cachedSettings;
  } catch (error) {
    console.error("Error fetching dealership context:", error);
    return `**Company Details:**
- Shop Name: your shop name
- Phone: +255 762686240
- WhatsApp: +255 762686240
- Email: info@shopname.co.tz
- Address: 123 Safari Drive, Dar es Salaam, Tanzania
- Working Hours: Mon-Fri 8AM-6PM | Sat 9AM-4PM | Sun Closed

Note: Vehicle inventory data is temporarily unavailable. Direct customers to call or WhatsApp for the latest inventory.`;
  }
}

function invalidateDealershipCache() {
  cachedInventory = null;
  cachedSettings = null;
  lastCacheRefresh = 0;
}
registerChatCacheInvalidator(invalidateDealershipCache);

const BASE_SYSTEM_PROMPT = `You are the friendly and professional customer care assistant for AutoElite Motors, a premium car dealership located in Dar es Salaam, Tanzania.

**Your Role:**
- Help customers with inquiries about vehicles, pricing, financing, trade-ins, and services
- Be polite, helpful, and knowledgeable about cars and the automotive industry
- Provide accurate information based on the dealership data provided below

**Dealership Data (fetched live from database):**
{DEALERSHIP_CONTEXT}

**Key Policies:**
- Every vehicle undergoes a 150-point inspection
- Best price guarantee — match legitimate dealer quotes
- Financing options available for all budgets
- All prices displayed are in TSH (Tanzanian Shillings)
- Support both English and Swahili — if a customer writes in Swahili, respond in Swahili.`;

// ─── POST: Send a message ───
export async function POST(request: NextRequest) {
  try {
    if (!ai) {
      return NextResponse.json(
        { error: "Gemini API key is missing or not configured in your .env file." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sessionId, message } = body;

    if (!sessionId || !message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "sessionId and valid message string are required" }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: "Message is too long (max 2000 characters)" }, { status: 400 });
    }

    // Lock session to prevent overlapping mutations
    const existingLock = sessionLocks.get(sessionId) || Promise.resolve();
    let releaseLock!: () => void;
    const newLock = new Promise<void>((resolve) => { releaseLock = resolve; });
    sessionLocks.set(sessionId, newLock);

    try {
      await existingLock;

      const dealershipContext = await fetchDealershipContext();
      const dynamicSystemPrompt = BASE_SYSTEM_PROMPT.replace("{DEALERSHIP_CONTEXT}", dealershipContext);

      let session = conversations.get(sessionId);
      if (!session) {
        session = {
          messages: [],
          lastActivity: Date.now(),
        };
        conversations.set(sessionId, session);
      }

      // Add the user message formatted for the new SDK structure
      session.messages.push({
        role: "user",
        parts: [{ text: message.trim() }],
      });
      session.lastActivity = Date.now();

      if (session.messages.length > MAX_MESSAGES) {
        session.messages = session.messages.slice(-MAX_MESSAGES);
      }

      // Execute chat request using the native @google/genai client structure
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: session.messages,
        config: {
          systemInstruction: dynamicSystemPrompt,
          temperature: 0.7,
        },
      });

      const aiResponse = response.text || "I am sorry, I couldn't handle that instruction. Please reach out to our team directly.";

      // Record Gemini's answer to the local history store
      session.messages.push({
        role: "model",
        parts: [{ text: aiResponse }],
      });
      session.lastActivity = Date.now();

      return NextResponse.json({
        success: true,
        response: aiResponse,
      });

    } finally {
      releaseLock();
      if (sessionLocks.get(sessionId) === newLock) {
        sessionLocks.delete(sessionId);
      }
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to parse or fetch AI response. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    if (sessionId) conversations.delete(sessionId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to clear conversation" }, { status: 500 });
  }
}