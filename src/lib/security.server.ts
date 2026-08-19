const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomChars(length: number): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += KEY_ALPHABET[values[i]! % KEY_ALPHABET.length];
  }
  return out;
}

/** Human readable access key, e.g. 7GQK-2M4P-K44L */
export function generateAccessKey(): string {
  return [randomChars(4), randomChars(4), randomChars(4)].join("-");
}

export function normalizeAccessKey(value: string): string {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function buildDisplayId(role: "student" | "institution" | "admin"): string {
  const prefix = role === "student" ? "STU" : role === "institution" ? "INS" : "ADM";
  const year = new Date().getUTCFullYear();
  return `${prefix}${year}-${randomChars(4)}`;
}

export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("cf-connecting-ip") ?? headers.get("x-real-ip") ?? "unknown";
}
