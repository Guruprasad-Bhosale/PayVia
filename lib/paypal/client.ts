import { getPayPalAccessToken, getPayPalBaseUrl } from "./auth";
import { PayPalApiError } from "./types";

/**
 * Server-only PayPal REST API client helper.
 * Injects OAuth2 Bearer token and logs detailed server-side error responses on failure.
 */
export async function paypalRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getPayPalAccessToken();
  const baseUrl = getPayPalBaseUrl();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetails: PayPalApiError | string;
    try {
      errorDetails = (await response.json()) as PayPalApiError;
    } catch {
      errorDetails = await response.text();
    }

    console.error(
      `[PayPal API Error] ${options.method ?? "GET"} ${endpoint} (HTTP ${response.status}):`,
      typeof errorDetails === "object" ? JSON.stringify(errorDetails, null, 2) : errorDetails
    );

    const errorMessage =
      typeof errorDetails === "object" && errorDetails.message
        ? `${errorDetails.name || "PayPalError"}: ${errorDetails.message} (debug_id: ${errorDetails.debug_id || "N/A"})`
        : `PayPal request failed with HTTP ${response.status}`;

    const error = new Error(errorMessage);
    (error as Error & { details?: PayPalApiError | string; status?: number }).details = errorDetails;
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}
