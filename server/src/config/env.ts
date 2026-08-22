import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const env = {
  DATABASE_URL: required("DATABASE_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  AI_PROVIDER: (process.env.AI_PROVIDER ?? "none") as "none" | "gemini" | "openai",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  NODE_ENV: process.env.NODE_ENV ?? "development",
};
