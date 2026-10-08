import { getServerEnv } from "@/lib/config/env";
import { PayPalOAuthTokenResponse } from "./types";

/**
 * Server-only PayPal OAuth2 Token Generator.
 * Authenticates with PayPal Sandbox REST API using Client ID and Secret.
 * Strictly never exposed to the client browser.
 */

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export function getPayPalBaseUrl(): string {
  const env = getServerEnv();
  return env.PAYPAL_ENVIRONMENT === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export async function getPayPalAccessToken(): Promise<string> {
  const env = getServerEnv();

  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error(
      "PayPal credentials are not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in secrets.txt or environment variables."
    );
  }

  // Use cached token if valid
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60000) {
    return cachedAccessToken.token;
  }

  const authString = Buffer.from(
    `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const baseUrl = getPayPalBaseUrl();

  // TODO: [PayPal Hackathon Integration] Connect to live Sandbox endpoint
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authString}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal OAuth failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as PayPalOAuthTokenResponse;

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}
