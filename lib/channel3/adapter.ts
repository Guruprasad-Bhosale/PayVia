import { Product, DeliveryOption } from "@/types/product";
import { Channel3ProductRaw } from "./types";

/**
 * Default standard delivery options for discovered products.
 * Keeps delivery terms consistent and realistic for multi-agent negotiation.
 */
const DEFAULT_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: "deliv_standard",
    name: "Standard Ground Delivery",
    estimatedDays: 5,
    cost: 0.0,
    description: "Insured standard delivery (3-5 business days).",
  },
  {
    id: "deliv_express",
    name: "Priority Express Shipping",
    estimatedDays: 2,
    cost: 15.0,
    description: "Expedited air priority shipping (1-2 business days).",
  },
];

/**
 * Normalizes a raw Channel3 product item into a valid PayVia Product model.
 * Separates marketplace discovery data from PayVia's server-side negotiation constraints.
 */
export function normalizeChannel3Product(raw: Channel3ProductRaw): Product | null {
  if (!raw || !raw.id || !raw.title) {
    return null;
  }

  // 1. Extract primary offer price and merchant details
  const primaryOffer = raw.offers?.[0];
  const rawPrice = primaryOffer?.price?.price;
  const originalPrice = typeof rawPrice === "number" && rawPrice > 0 ? Number(rawPrice.toFixed(2)) : 0;

  if (originalPrice <= 0) {
    return null; // Skip products without valid positive prices
  }

  const currency = primaryOffer?.price?.currency || "USD";
  const brandName = raw.brands?.[0]?.name;
  const merchantName = primaryOffer?.merchant?.name || primaryOffer?.domain || brandName || "Verified Retailer";
  const productUrl = primaryOffer?.url;
  const availability = primaryOffer?.availability || "InStock";

  // 2. Extract best hero image
  const mainImage = raw.images?.find((img) => img.is_main_image)?.url || raw.images?.[0]?.url || "";

  // 3. Extract category and features
  const categoryStr = Array.isArray(raw.category)
    ? raw.category.join(" > ")
    : typeof raw.category === "string" && raw.category
    ? raw.category
    : "Consumer Electronics";

  const features = (raw.key_features && raw.key_features.length > 0)
    ? raw.key_features.slice(0, 4)
    : [
        `Authentic ${brandName || "brand"} product`,
        `Available via ${merchantName}`,
        `Condition: ${primaryOffer?.condition || "Brand New"}`,
        `Direct checkout settlement`,
      ];

  // 4. Deterministic server-side merchant floor policy (12% maximum floor)
  // Protected server-side: client cannot manipulate or bypass this.
  const maxDiscountPct = 12;
  const minAcceptablePrice = Number((originalPrice * (1 - maxDiscountPct / 100)).toFixed(2));

  return {
    id: `ch3_${raw.id}`,
    name: raw.title.trim(),
    tagline: brandName ? `${brandName} • Discovered via Channel3` : "Live Marketplace Discovery",
    description:
      raw.description ||
      `Live product listing for ${raw.title}. Discovered via Channel3 marketplace integration and validated for PayVia AI negotiation.`,
    category: categoryStr,
    originalPrice,
    minAcceptablePrice,
    currency,
    inventoryCount: availability.toLowerCase().includes("in") ? 10 : 3,
    imageUrl: mainImage,
    features,
    availableDeliveryOptions: DEFAULT_DELIVERY_OPTIONS,
    merchantPolicy: {
      maxDiscountPercentage: maxDiscountPct,
      allowFreeShippingNegotiation: true,
      bundleDiscountsAvailable: false,
    },
    source: "channel3",
    merchantName,
    brandName,
    productUrl,
    externalId: raw.id,
    availability,
  };
}

/**
 * Batch normalizes a list of raw Channel3 products, filtering out any invalid records.
 */
export function normalizeChannel3Products(rawProducts: Channel3ProductRaw[]): Product[] {
  if (!Array.isArray(rawProducts)) {
    return [];
  }

  return rawProducts
    .map(normalizeChannel3Product)
    .filter((p): p is Product => p !== null);
}
