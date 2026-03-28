import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/app/lib/db";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ─── Extract meaningful search keywords from natural language ───────────────
function extractSearchKeywords(text: string): string[] {
  const lower = text.toLowerCase();

  // Strip common filler words that would never match DB fields
  const stopWords = new Set([
    "find", "search", "show", "get", "list", "give", "tell", "what", "where",
    "when", "any", "are", "the", "there", "events", "event", "happening",
    "upcoming", "near", "me", "i", "want", "to", "a", "an", "some", "for",
    "in", "at", "on", "this", "next", "weekend", "today", "tomorrow", "week",
    "month", "can", "you", "please", "about", "see", "look", "my", "area",
    "available", "going", "around", "like", "is", "it", "do", "have",
  ]);

  // Extract individual meaningful words
  const words = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  // Also try to extract multi-word phrases (bigrams) for better matching
  const tokens = lower.replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!stopWords.has(tokens[i]) && !stopWords.has(tokens[i + 1])) {
      bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
  }

  return [...new Set([...words, ...bigrams])];
}

// ─── Build Prisma OR conditions from extracted keywords ──────────────────────
function buildSearchConditions(keywords: string[]) {
  if (keywords.length === 0) return [];

  const conditions: any[] = [];

  for (const kw of keywords) {
    conditions.push({ title: { contains: kw, mode: "insensitive" } });
    conditions.push({ category: { contains: kw, mode: "insensitive" } });
    conditions.push({ city: { contains: kw, mode: "insensitive" } });
    conditions.push({ state: { contains: kw, mode: "insensitive" } });
    conditions.push({ shortDescription: { contains: kw, mode: "insensitive" } });
    conditions.push({ OrganizerName: { contains: kw, mode: "insensitive" } });
    conditions.push({ tags: { has: kw } });
  }

  return conditions;
}

// ─── Format a single event into readable text for the AI ─────────────────────
function formatEvent(e: any, index: number): string {
  const location =
    e.eventMode === "ONLINE"
      ? `Online via ${e.platform || "Virtual Platform"}`
      : e.eventMode === "HYBRID"
      ? `${e.city}, ${e.state} + Online`
      : [e.venueName, e.city, e.state].filter(Boolean).join(", ");

  const ticketInfo =
    e.ticketType === "FREE"
      ? "Free Entry"
      : `${e.currency || "INR"} ${e.ticketPrice || 0}`;

  return `${index + 1}. "${e.title}"
   📍 Location: ${location}
   🎭 Category: ${e.category}
   👤 Organizer: ${e.OrganizerName}
   📅 Date: ${e.startDateTime.toLocaleDateString("en-US", {
     weekday: "long",
     year: "numeric",
     month: "long",
     day: "numeric",
   })}
   ⏰ Time: ${e.startDateTime.toLocaleTimeString("en-US", {
     hour: "2-digit",
     minute: "2-digit",
   })}
   🎫 Ticket: ${ticketInfo}
   📝 ${e.shortDescription || "No description available."}${
    e.tags?.length > 0 ? `\n   🏷️ Tags: ${e.tags.join(", ")}` : ""
  }`;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 });
    }

    const userText = messages[messages.length - 1].content as string;
    const lower = userText.toLowerCase().trim();

    // ── Greeting check ────────────────────────────────────────────────────────
    const greetings = [
      "hi", "hello", "hey", "hii", "hiii", "hllo", "hloo",
      "yo", "sup", "good morning", "good evening", "good afternoon",
    ];
    if (greetings.some((g) => lower === g)) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.5,
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are Planora AI, a friendly event planning assistant. 
The user just greeted you. Respond warmly and briefly. Ask how you can help them find or plan events today.
Keep it to 2-3 sentences, conversational.`,
          },
          ...messages,
        ],
      });
      return NextResponse.json({
        message:
          completion.choices[0]?.message?.content ||
          "Hello! 👋 I'm Planora AI. How can I help you find events today?",
        success: true,
      });
    }

    // ── Detect if this is an event-related query ──────────────────────────────
    const eventTriggers = [
      "event", "concert", "festival", "sports", "show", "happening",
      "upcoming", "find", "search", "music", "party", "workshop",
      "conference", "meetup", "exhibition", "fair", "gig", "performance",
    ];
    const isEventQuery = eventTriggers.some((t) => lower.includes(t));

    let eventData: string | null = null;

    if (isEventQuery) {
      try {
        // ── Step 1: Smart keyword search ─────────────────────────────────────
        const keywords = extractSearchKeywords(userText);
        console.log("🔍 Extracted keywords:", keywords);

        let events: any[] = [];

        if (keywords.length > 0) {
          const searchConditions = buildSearchConditions(keywords);
          events = await prisma.event.findMany({
            where: {
              startDateTime: { gte: new Date() },
              status: "APPROVED",
              OR: searchConditions,
            },
            orderBy: { startDateTime: "asc" },
            take: 15,
          });
          console.log(`✅ Keyword search found ${events.length} events`);
        }

        // ── Step 2: Fallback — return all upcoming events ─────────────────────
        if (events.length === 0) {
          console.log("⚠️ No keyword matches, falling back to all upcoming events");
          events = await prisma.event.findMany({
            where: {
              startDateTime: { gte: new Date() },
              status: "APPROVED",
            },
            orderBy: { startDateTime: "asc" },
            take: 10,
          });
        }

        if (events.length === 0) {
          return NextResponse.json({
            message:
              "There are no upcoming events in the database right now. Would you like to create one?",
            success: true,
          });
        }

        eventData = events.map(formatEvent).join("\n\n");
        console.log(`📋 Sending ${events.length} events to AI`);
      } catch (dbError: any) {
        console.error("DATABASE ERROR:", dbError);
        return NextResponse.json(
          { message: "I'm having trouble accessing the event database. Please try again." },
          { status: 500 }
        );
      }
    }

    // ── System prompt ─────────────────────────────────────────────────────────
    const systemPrompt = `You are Planora AI, a friendly and intelligent event planning assistant.

🎯 YOUR ROLE: Help users discover and plan events using real data from the database.

⚠️ CRITICAL RULES:
1. ONLY mention events listed in the EVENT DATA section below — never invent events.
2. If EVENT DATA is empty, say "No events found matching your search" — do not hallucinate.
3. Always cite specific details: name, date, location, price.
4. Suggest helpful next steps: "Want directions?", "Shall I show similar events?", etc.

📋 RESPONSE STYLE:
- Conversational and friendly, not robotic
- Format dates nicely: "Saturday, March 15th at 7:00 PM"
- Highlight Free Entry events enthusiastically
- Clearly state prices for paid events
- Use numbered lists when showing multiple events

${
  eventData
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 EVENTS FROM DATABASE (ONLY USE THESE)
━━━━━━━━━━━━━━━━━━━━━━━━━━

${eventData}

━━━━━━━━━━━━━━━━━━━━━━━━━━
These are the ONLY real events. Do NOT mention any others.
━━━━━━━━━━━━━━━━━━━━━━━━━━`
    : `No event data available. Answer the user's general question helpfully.`
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1200,
      top_p: 0.9,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "I couldn't generate a response. Please try again.";

    return NextResponse.json({ message: reply, success: true });
  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
    return NextResponse.json(
      { message: "I'm having trouble right now. Please try again in a moment.", success: false },
      { status: 500 }
    );
  }
}