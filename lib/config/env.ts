import fs from "node:fs";
import path from "node:path";

function loadSecretsFile() {
  const secretsPath = path.join(process.cwd(), "secrets.txt");

  if (!fs.existsSync(secretsPath)) {
    return;
  }

  const contents = fs.readFileSync(secretsPath, "utf8");

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();

    if (key && value && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadSecretsFile();

export const env = {
  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  paypalMerchantEmail: process.env.PAYPAL_MERCHANT_EMAIL ?? "",
  paypalEnvironment: process.env.PAYPAL_ENVIRONMENT ?? "sandbox",
  googleGenerativeAiApiKey:
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "",
  channel3ApiKey: process.env.CHANNEL3_API_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export function isPayPalConfigured(): boolean {
  return Boolean(env.paypalClientId && env.paypalClientSecret);
}

export function isAIConfigured(): boolean {
  return Boolean(env.googleGenerativeAiApiKey);
}

export function isChannel3Configured(): boolean {
  return Boolean(env.channel3ApiKey);
}

export function assertServerEnv(options: { requireMerchantEmail?: boolean } = {}) {
  const missing: string[] = [];

  if (!env.paypalClientId) {
    missing.push("PAYPAL_CLIENT_ID");
  }

  if (!env.paypalClientSecret) {
    missing.push("PAYPAL_CLIENT_SECRET");
  }

  if (options.requireMerchantEmail && !env.paypalMerchantEmail) {
    missing.push("PAYPAL_MERCHANT_EMAIL");
  }

  if (!env.googleGenerativeAiApiKey) {
    missing.push("GOOGLE_GENERATIVE_AI_API_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}