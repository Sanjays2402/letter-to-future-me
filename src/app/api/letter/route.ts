import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, userPromptFor } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

type Letter = { date: string; letter: string; preview: string };

function todayString() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  let body: { present?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const present = body.present?.trim();
  if (!present) return NextResponse.json({ error: "Tell us what's true today" }, { status: 400 });
  if (present.length > 800) return NextResponse.json({ error: "Keep it under 800 characters" }, { status: 400 });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.85,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPromptFor(present, todayString()) },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    let parsed: Letter;
    try {
      parsed = JSON.parse(text) as Letter;
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output", raw: text }, { status: 502 });
    }

    if (!parsed.date || !parsed.letter || !parsed.preview) {
      return NextResponse.json({ error: "Model output missing fields", raw: parsed }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
