import { Product } from "@/types/product";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { isChannel3Configured } from "@/lib/config/env";
import { fetchChannel3Search } from "./client";
import { normalizeChannel3Products } from "./adapter";
import { registerProducts } from "./registry";

export interface SearchProductsOptions {
  limit?: number;
  fallbackOnFailure?: boolean;
}

export interface SearchProductsResult {
  success: boolean;
  source: "channel3" | "demo_fallback";
  products: Product[];
  totalResults: number;
  message?: string;
  error?: string;
}

/**
 * High-level product discovery service.
 * Searches the live Channel3 product catalog, normalizes results, registers them for negotiation,
 * and gracefully falls back to the PayVia demo catalog if Channel3 is unavailable.
 */
export async function searchProducts(
  rawQuery: string,
  options: SearchProductsOptions = {}
): Promise<SearchProductsResult> {
  const query = (rawQuery || "").trim();

  if (!query || query.length < 2) {
    return {
      success: false,
      source: "demo_fallback",
      products: SAMPLE_PRODUCTS,
      totalResults: SAMPLE_PRODUCTS.length,
      error: "Search query must be at least 2 characters.",
    };
  }

  const limit = Math.min(Math.max(Number(options.limit) || 8, 1), 20);
  const fallbackOnFailure = options.fallbackOnFailure !== false;

  // Check server configuration
  if (!isChannel3Configured()) {
    if (fallbackOnFailure) {
      return {
        success: true,
        source: "demo_fallback",
        products: SAMPLE_PRODUCTS,
        totalResults: SAMPLE_PRODUCTS.length,
        message: "Live product discovery is temporarily unconfigured. Showing PayVia demo catalog.",
      };
    }
    return {
      success: false,
      source: "demo_fallback",
      products: [],
      totalResults: 0,
      error: "Channel3 API key is not configured.",
    };
  }

  try {
    const response = await fetchChannel3Search({ query, limit });
    const rawProducts = response.products || [];
    const normalizedProducts = normalizeChannel3Products(rawProducts);

    if (normalizedProducts.length > 0) {
      // Register in server cache so they can be negotiated by ID
      registerProducts(normalizedProducts);

      return {
        success: true,
        source: "channel3",
        products: normalizedProducts,
        totalResults: normalizedProducts.length,
      };
    }

    // If query returned 0 valid items from Channel3, fallback gracefully if enabled
    if (fallbackOnFailure) {
      return {
        success: true,
        source: "demo_fallback",
        products: SAMPLE_PRODUCTS,
        totalResults: SAMPLE_PRODUCTS.length,
        message: `No exact matches found on Channel3 for "${query}". Showing PayVia demo catalog.`,
      };
    }

    return {
      success: true,
      source: "channel3",
      products: [],
      totalResults: 0,
    };
  } catch (err: unknown) {
    console.warn("[Channel3 Search Service Fallback]:", err instanceof Error ? err.message : err);

    if (fallbackOnFailure) {
      return {
        success: true,
        source: "demo_fallback",
        products: SAMPLE_PRODUCTS,
        totalResults: SAMPLE_PRODUCTS.length,
        message: "Live product discovery is temporarily unavailable. Showing PayVia demo catalog.",
      };
    }

    return {
      success: false,
      source: "demo_fallback",
      products: [],
      totalResults: 0,
      error: err instanceof Error ? err.message : "Failed to search Channel3 products.",
    };
  }
}
