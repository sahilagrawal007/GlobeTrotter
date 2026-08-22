// server/src/services/ai/index.ts
//
// AI provider interface + stub implementations.
// The only file that changes when AI_PROVIDER flips to "gemini" -
// nothing upstream (routes, controllers, frontend hooks) changes.

import { env } from "../../config/env";

// ─── Domain types ─────────────────────────────────────────────────────────────

export interface TripContext {
  trip: {
    id: string;
    name: string;
    stops: Array<{
      city: { name: string; country: string };
      startDate: Date;
      endDate: Date;
    }>;
  };
}

export interface Suggestion {
  title: string;
  description: string;
}

export interface BudgetEstimate {
  total: number;
  breakdown: Record<string, number>;
}

// ─── AIProvider interface ─────────────────────────────────────────────────────

export interface AIProvider {
  suggestItinerary(ctx: TripContext): Promise<Suggestion[]>;
  estimateBudget(ctx: TripContext): Promise<BudgetEstimate | null>;
}

// ─── Mock provider (AI_PROVIDER=none) ────────────────────────────────────────

class MockAIProvider implements AIProvider {
  async suggestItinerary(_ctx: TripContext): Promise<Suggestion[]> {
    return [];
  }
  async estimateBudget(_ctx: TripContext): Promise<BudgetEstimate | null> {
    return null;
  }
}

// ─── Gemini provider ─────────────────────────────────────────────────────────

class GeminiAIProvider implements AIProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private buildTripSummary(ctx: TripContext): string {
    const stops = ctx.trip.stops
      .map((s) => {
        const nights = Math.max(
          1,
          Math.round(
            (new Date(s.endDate).getTime() - new Date(s.startDate).getTime()) /
              86400000
          )
        );
        return `  - ${s.city.name}, ${s.city.country} (${nights} night${nights !== 1 ? "s" : ""})`;
      })
      .join("\n");
    return `Trip: "${ctx.trip.name}"\nStops:\n${stops}`;
  }

  async suggestItinerary(ctx: TripContext): Promise<Suggestion[]> {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

      const prompt =
        `You are a helpful travel assistant. Given this trip itinerary, suggest 4-6 specific, actionable travel tips or activity ideas. Each suggestion should be concise (1-2 sentences) and specific to the destinations.\n\n` +
        this.buildTripSummary(ctx) +
        `\n\nRespond with a JSON array only (no markdown fences, no extra text) in this exact format:\n[{"title":"Suggestion title","description":"One or two sentence description."}]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Strip markdown fences if model adds them anyway
      const clean = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(clean) as Suggestion[];

      if (!Array.isArray(parsed)) return [];
      return parsed.filter((s) => s.title && s.description).slice(0, 6);
    } catch (err) {
      console.error("[Gemini] suggestItinerary error:", err);
      return [];
    }
  }

  async estimateBudget(ctx: TripContext): Promise<BudgetEstimate | null> {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

      const prompt =
        `You are a budget travel expert. Estimate the total travel budget in INR (Indian Rupees) for a budget-conscious traveler for this trip. Break it down by category.\n\n` +
        this.buildTripSummary(ctx) +
        `\n\nRespond with a JSON object only (no markdown fences, no extra text) in this exact format:\n{"total":45000,"breakdown":{"transport":12000,"accommodation":18000,"food":8000,"activities":7000}}\n\nAll values must be integers in INR. Be realistic and practical.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const clean = text.replace(/^```json?\s*/i, "").replace(/\s*```$/, "").trim();
      const parsed = JSON.parse(clean) as BudgetEstimate;

      if (typeof parsed.total !== "number" || !parsed.breakdown) return null;
      return parsed;
    } catch (err) {
      console.error("[Gemini] estimateBudget error:", err);
      return null;
    }
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function getAIProvider(): AIProvider {
  switch (env.AI_PROVIDER) {
    case "gemini":
      if (!env.GEMINI_API_KEY) {
        console.warn("[AI] AI_PROVIDER=gemini but GEMINI_API_KEY is empty — falling back to mock");
        return new MockAIProvider();
      }
      return new GeminiAIProvider(env.GEMINI_API_KEY);
    case "openai":
      // TODO: add OpenAI provider when needed
      return new MockAIProvider();
    case "none":
    default:
      return new MockAIProvider();
  }
}
