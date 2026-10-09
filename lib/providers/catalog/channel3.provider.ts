import { CatalogItem } from "@/lib/domain/types";
import { CatalogProvider, CatalogSearchResult } from "./interfaces";
import { searchProducts } from "@/lib/channel3/search";

export class Channel3CatalogProvider implements CatalogProvider {
  readonly providerId = "CHANNEL3_CATALOG";

  async search(query: string, options?: { limit?: number; platformId?: string }): Promise<CatalogSearchResult> {
    const searchRes = await searchProducts(query, {
      limit: options?.limit || 10,
      fallbackOnFailure: true,
    });

    const items: CatalogItem[] = searchRes.products.map((p) => ({
      id: p.id,
      platformId: options?.platformId || "plat_default",
      merchantId: `merchant_${(p.merchantName || "channel3").toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      title: p.name,
      description: p.description,
      category: p.category,
      listPrice: p.originalPrice,
      currency: p.currency,
      stockStatus: (p.inventoryCount ?? 1) > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
      source: p.source === "channel3" ? "channel3" : "demo",
      imageUrl: p.imageUrl,
    }));

    return {
      items,
      source: searchRes.source,
      totalCount: items.length,
    };
  }

  async getItem(id: string): Promise<CatalogItem | null> {
    const result = await this.search(id, { limit: 1 });
    return result.items[0] || null;
  }
}
