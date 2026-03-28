// app/api/ai/recommend/route.ts
import { NextRequest, NextResponse } from "next/server";

const FREE_MODELS = [
  "openrouter/auto-free", // Best practice: let OpenRouter decide
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "meta-llama/llama-3.3-70b-instruct:free"
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API Key" }, { status: 500 });

  try {
    const { prompt } = await req.json();
    let lastError = "";

    for (const model of FREE_MODELS) {
      try {
        console.log(`🚀 Attempting: ${model}`);
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
            // REQUIRED: OpenRouter needs these for free models to work correctly
            "HTTP-Referer": "http://localhost:3000", 
            "X-Title": "Planora",
          },
          body: JSON.stringify({
            model,
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          lastError = data.error?.message || `Status ${response.status}`;
          console.warn(`❌ ${model} failed: ${lastError}`);
          if (response.status === 429) await delay(1000);
          continue;
        }

        return NextResponse.json({ 
          text: data.choices[0].message.content, 
          model: data.model // Tells you which model 'auto-free' actually used
        });

      } catch (err) {
        lastError = "Fetch failed";
        continue;
      }
    }
    return NextResponse.json({ error: lastError }, { status: 503 });
  } catch (err) {
    return NextResponse.json({ error: "Route error" }, { status: 500 });
  }
}