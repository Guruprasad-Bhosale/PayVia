import { Product } from "@/types/product";
import { SAMPLE_PRODUCTS } from "@/data/products";

/**
 * Server-side in-memory registry for discovered Channel3 products.
 * Allows discovered products to seamlessly enter the existing negotiation engine by product ID.
 */
const discoveredProductsRegistry = new Map<string, Product>();

/**
 * Registers a discovered normalized product in the server cache.
 */
export function registerProduct(product: Product): void {
  if (product && product.id) {
    discoveredProductsRegistry.set(product.id, product);
  }
}

/**
 * Batch registers an array of discovered products.
 */
export function registerProducts(products: Product[]): void {
  for (const p of products) {
    registerProduct(p);
  }
}

/**
 * Retrieves a product by ID from either the static demo catalog or the dynamic discovered registry.
 */
export function findProductById(id: string): Product | undefined {
  if (!id) return undefined;

  // 1. Check static demo catalog first
  const staticProduct = SAMPLE_PRODUCTS.find((p) => p.id === id);
  if (staticProduct) {
    return staticProduct;
  }

  // 2. Check dynamic discovered products registry
  return discoveredProductsRegistry.get(id);
}
