import { env } from "@/lib/config/env";
import { PayPalOAuthTokenResponse } from "./types";

/**
 * Server-only PayPal OAuth2 Token Manager.
 * Authenticates with PayPal Sandbox REST API using Client ID and Secret.
 * Tokens are cached in-memory and refreshed before expiry.
 */

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export function getPayPalBaseUrl(): string {
  return env.paypalEnvironment === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  if (!env.paypalClientId || !env.paypalClientSecret) {
    throw new Error(
      "PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in secrets.txt."
    );
  }

  // Return cached token if valid for at least another 60 seconds
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const credentials = Buffer.from(
    `${env.paypalClientId}:${env.paypalClientSecret}`
  ).toString("base64");

  const baseUrl = getPayPalBaseUrl();

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    console.error(
      `[PayPal OAuth Error] Status: ${response.status} Endpoint: ${baseUrl}/v1/oauth2/token`
    );
    throw new Error(`PayPal OAuth authentication failed (HTTP ${response.status})`);
  }

  const data = (await response.json()) as PayPalOAuthTokenResponse;

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}
