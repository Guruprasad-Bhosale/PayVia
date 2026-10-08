import { getPayPalAccessToken, getPayPalBaseUrl } from "./auth";

/**
 * Server-only PayPal REST API Client.
 * Automatically injects OAuth2 Bearer token into outgoing requests.
 */

export async function paypalRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `PayPal API error on [${options.method || "GET"} ${endpoint}] (${response.status}): ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}
