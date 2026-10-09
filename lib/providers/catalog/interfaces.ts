import { CatalogItem } from "@/lib/domain/types";

export interface CatalogSearchResult {
  items: CatalogItem[];
  source: string;
  totalCount: number;
}

export interface CatalogProvider {
  readonly providerId: string;

  /**
   * Searches for commercial items across the catalog
   */
  search(query: string, options?: { limit?: number; platformId?: string }): Promise<CatalogSearchResult>;

  /**
   * Retrieves an item by its ID
   */
  getItem(id: string): Promise<CatalogItem | null>;
}
