import { CatalogItem } from "@/lib/domain/types";
import { CatalogProvider, CatalogSearchResult } from "./interfaces";
import { SAMPLE_PRODUCTS } from "@/data/products";

export class DemoCatalogProvider implements CatalogProvider {
  readonly providerId = "DEMO_CATALOG";

  async search(query: string, options?: { limit?: number; platformId?: string }): Promise<CatalogSearchResult> {
    const q = query.toLowerCase().trim();
    const limit = options?.limit || 10;

    const filtered = SAMPLE_PRODUCTS.filter((p) => {
      if (!q || q === "*") return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }).slice(0, limit);

    const items: CatalogItem[] = filtered.map((p) => ({
      id: p.id,
      platformId: options?.platformId || "plat_default",
      merchantId: "merchant_default",
      title: p.name,
      description: p.description,
      category: p.category,
      listPrice: p.originalPrice,
      currency: p.currency,
      stockStatus: (p.inventoryCount ?? 1) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      source: "demo",
      imageUrl: p.imageUrl,
    }));

    return {
      items,
      source: "demo_catalog",
      totalCount: items.length,
    };
  }

  async getItem(id: string): Promise<CatalogItem | null> {
    const found = SAMPLE_PRODUCTS.find((p) => p.id === id);
    if (!found) return null;

    return {
      id: found.id,
      platformId: "plat_default",
      merchantId: "merchant_default",
      title: found.name,
      description: found.description,
      category: found.category,
      listPrice: found.originalPrice,
      currency: found.currency,
      stockStatus: (found.inventoryCount ?? 1) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      source: "demo",
      imageUrl: found.imageUrl,
    };
  }
}
