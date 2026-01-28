import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { prisma } from "@/app/lib/db";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ message: "Invalid request" });
    }

    const userText = messages[messages.length - 1].content;
    const lower = userText.toLowerCase();

    /* ---------------- DB CONTEXT ---------------- */
    let dbContext = "";
    let isEventQuery = false;

    if (
      lower.includes("event") ||
      lower.includes("concert") ||
      lower.includes("festival") ||
      lower.includes("sports")
    ) {
      isEventQuery = true;

      const events = await prisma.event.findMany({
        where: {
          startDateTime: { gte: new Date() },
        },
        orderBy: { startDateTime: "asc" },
        take: 5,
      });

      if (events.length > 0) {
        dbContext = `
EVENT DATA FROM DATABASE (SOURCE OF TRUTH):
${events
  .map(
    (e) =>
      `- ${e.title} (${e.category}) in ${e.city} on ${e.startDateTime.toDateString()}`
  )
  .join("\n")}
`;
      } else {
        // 🔒 HARD STOP — NO LLM GUESSING
        return NextResponse.json({
          message:
            "I don’t see any upcoming events listed in our database for this period yet.",
        });
      }
    }

    /* ---------------- SYSTEM PROMPT ---------------- */
    const systemPrompt = `
You are Planora AI.

CRITICAL RULES:
- You MUST NOT invent events, sports matches, schedules, or dates.
- You MUST answer event-related questions ONLY using database data provided.
- If no event data is provided, clearly say that no events are available.
- You may answer normally for non-event questions.
`;

    /* ---------------- LLM CALL ---------------- */
      const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2, // 🔽 reduces hallucination
      messages: [
        { role: "system", content: systemPrompt },
        ...(dbContext ? [{ role: "assistant", content: dbContext }] : []),
        ...messages,
      ],
    });


    return NextResponse.json({
      message: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("GROQ ERROR:", error);
    return NextResponse.json({
      message: "AI service temporarily unavailable. Please try again.",
    });
  }
}
