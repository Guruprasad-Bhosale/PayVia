import { z } from "zod";
import fs from "fs";
import path from "path";

/**
 * Server-only Environment Configuration Loader.
 * Reads environment variables from process.env or fallback secrets.txt in development.
 * Strictly guarantees that private credentials are NEVER exposed to client components.
 */

const envSchema = z.object({
  PAYPAL_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  PAYPAL_CLIENT_ID: z.string().default(""),
  PAYPAL_CLIENT_SECRET: z.string().default(""),
  AI_API_KEY: z.string().default(""),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string().default(""),
});

export type ServerEnv = z.infer<typeof envSchema>;

let cachedEnv: ServerEnv | null = null;

function loadSecretsFile(): Record<string, string> {
  const result: Record<string, string> = {};
  try {
    const secretsPath = path.join(process.cwd(), "secrets.txt");
    if (fs.existsSync(secretsPath)) {
      const content = fs.readFileSync(secretsPath, "utf-8");
      const lines = content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            result[key] = val;
          }
        }
      }
    }
  } catch {
    // Silently ignore if reading secrets.txt fails
  }
  return result;
}

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("CRITICAL SECURITY ERROR: getServerEnv() must only be called in server-side code!");
  }

  if (cachedEnv) {
    return cachedEnv;
  }

  const fileSecrets = loadSecretsFile();

  const rawEnv = {
    PAYPAL_ENVIRONMENT:
      process.env.PAYPAL_ENVIRONMENT || fileSecrets.PAYPAL_ENVIRONMENT || "sandbox",
    PAYPAL_CLIENT_ID:
      process.env.PAYPAL_CLIENT_ID || fileSecrets.PAYPAL_CLIENT_ID || "",
    PAYPAL_CLIENT_SECRET:
      process.env.PAYPAL_CLIENT_SECRET || fileSecrets.PAYPAL_CLIENT_SECRET || "",
    AI_API_KEY:
      process.env.AI_API_KEY || fileSecrets.AI_API_KEY || "",
    AI_MODEL:
      process.env.AI_MODEL || fileSecrets.AI_MODEL || "gpt-4o-mini",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    NEXT_PUBLIC_PAYPAL_CLIENT_ID:
      process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
      process.env.PAYPAL_CLIENT_ID ||
      fileSecrets.PAYPAL_CLIENT_ID ||
      "",
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.warn("⚠️ Warning: Environment configuration schema validation issues:", parsed.error.format());
    cachedEnv = rawEnv as ServerEnv;
    return cachedEnv;
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function isPayPalConfigured(): boolean {
  try {
    const env = getServerEnv();
    return Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);
  } catch {
    return false;
  }
}

export function isAIConfigured(): boolean {
  try {
    const env = getServerEnv();
    return Boolean(env.AI_API_KEY);
  } catch {
    return false;
  }
}
