import crypto from "crypto";

/**
 * Generates a URL-safe slug from a string + random suffix.
 * Used for public share links: once set, never regenerated.
 */
export function generateSlug(prefix: string): string {
  const sanitized = prefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const random = crypto.randomBytes(4).toString("hex");
  return `${sanitized}-${random}`;
}
