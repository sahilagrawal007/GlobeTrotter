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

// ─── Gemini provider stub (fill in when AI_PROVIDER=gemini) ──────────────────

class GeminiAIProvider implements AIProvider {
  private apiKey: string;
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async suggestItinerary(ctx: TripContext): Promise<Suggestion[]> {
    // TODO: implement Gemini API call
    void ctx;
    void this.apiKey;
    return [];
  }

  async estimateBudget(ctx: TripContext): Promise<BudgetEstimate | null> {
    // TODO: implement Gemini API call
    void ctx;
    void this.apiKey;
    return null;
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function getAIProvider(): AIProvider {
  switch (env.AI_PROVIDER) {
    case "gemini":
      return new GeminiAIProvider(env.GEMINI_API_KEY);
    case "openai":
      // TODO: add OpenAI provider when needed
      return new MockAIProvider();
    case "none":
    default:
      return new MockAIProvider();
  }
}
