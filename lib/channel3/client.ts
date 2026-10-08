import { env, isChannel3Configured } from "@/lib/config/env";
import { Channel3SearchRequest, Channel3SearchResponse } from "./types";

const CHANNEL3_SEARCH_ENDPOINT = "https://api.trychannel3.com/v1/search";
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Server-only Channel3 API client.
 * Dispatches authenticated search requests to Channel3 Product Data API.
 */
export async function fetchChannel3Search(
  request: Channel3SearchRequest,
  options: { timeoutMs?: number } = {}
): Promise<Channel3SearchResponse> {
  if (!isChannel3Configured() || !env.channel3ApiKey) {
    throw new Error("Channel3 API is not configured on the server (missing CHANNEL3_API_KEY).");
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(CHANNEL3_SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": env.channel3ApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        query: request.query,
        limit: request.limit || 8,
        ...(request.page_token ? { page_token: request.page_token } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Channel3 API error [HTTP ${response.status}]: ${errorText || response.statusText}`
      );
    }

    const data: Channel3SearchResponse = await response.json();
    return data;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`Channel3 API request timed out after ${timeoutMs}ms.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
