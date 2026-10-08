import { Product } from "@/types/product";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod_laptop_pro",
    name: "AeroBook Pro 16 AI Workstation",
    tagline: "Ultra-slim creator laptop with M-series neural acceleration",
    description:
      "High-performance 16-inch Liquid Retina XDR display, 32GB Unified Memory, 1TB NVMe SSD, and 22-hour battery life engineered for developer and creative workflows.",
    category: "Laptops & Computing",
    originalPrice: 800.0,
    minAcceptablePrice: 730.0,
    currency: "USD",
    inventoryCount: 15,
    features: [
      "16-inch 120Hz Liquid Retina Display",
      "32GB Unified RAM & 1TB Fast NVMe SSD",
      "Dedicated Neural Accelerator Engine",
      "22-Hour all-day battery efficiency",
    ],
    availableDeliveryOptions: [
      {
        id: "deliv_standard",
        name: "Standard Ground Delivery",
        estimatedDays: 5,
        cost: 0.0,
        description: "Reliable 4-5 business day insured ground shipping.",
      },
      {
        id: "deliv_express",
        name: "Express Priority Courier",
        estimatedDays: 2,
        cost: 25.0,
        description: "Expedited 2-day air delivery with signature.",
      },
    ],
    merchantPolicy: {
      maxDiscountPercentage: 12,
      allowFreeShippingNegotiation: true,
      bundleDiscountsAvailable: true,
    },
    source: "demo",
    merchantName: "AeroComputing Official Store",
  },
  {
    id: "prod_aurora_headphones",
    name: "AuraPro ANC Wireless Headphones",
    tagline: "Studio-grade active noise cancelling audio",
    description:
      "Premium over-ear wireless headphones featuring adaptive noise cancellation, 40-hour battery life, lossless audio codecs, and ultra-plush memory foam earcups.",
    category: "Audio & Headphones",
    originalPrice: 299.99,
    minAcceptablePrice: 220.0,
    currency: "USD",
    inventoryCount: 45,
    features: [
      "Hybrid Active Noise Cancellation",
      "40-hour battery playback",
      "Multipoint Bluetooth 5.3",
      "Fast charging: 10 mins = 5 hrs play",
    ],
    availableDeliveryOptions: [
      {
        id: "deliv_standard",
        name: "Standard Ground Shipping",
        estimatedDays: 5,
        cost: 0.0,
        description: "Reliable 3-5 business day ground delivery.",
      },
      {
        id: "deliv_express",
        name: "Express Air Delivery",
        estimatedDays: 2,
        cost: 15.0,
        description: "Priority 2-day air express shipping.",
      },
    ],
    merchantPolicy: {
      maxDiscountPercentage: 25,
      allowFreeShippingNegotiation: true,
      bundleDiscountsAvailable: true,
    },
    source: "demo",
    merchantName: "Aura Audio Labs",
  },
  {
    id: "prod_smart_watch_ultra",
    name: "Veloce Titan Smartwatch",
    tagline: "Rugged GPS sports & health smartwatch",
    description:
      "Titanium case with sapphire crystal glass, dual-frequency GPS, biometric health monitoring, 100m water resistance, and 14-day battery life.",
    category: "Wearables & Fitness",
    originalPrice: 449.0,
    minAcceptablePrice: 350.0,
    currency: "USD",
    inventoryCount: 20,
    features: [
      "Aerospace Grade Titanium Case",
      "Continuous ECG & SpO2 biometric sensors",
      "Dual-Frequency Topographic GPS",
      "100-meter water resistance rating",
    ],
    availableDeliveryOptions: [
      {
        id: "deliv_standard",
        name: "Standard Ground Shipping",
        estimatedDays: 4,
        cost: 0.0,
        description: "Standard postal shipping.",
      },
      {
        id: "deliv_express",
        name: "Express Air Delivery",
        estimatedDays: 2,
        cost: 18.0,
        description: "Expedited shipping with real-time tracking.",
      },
    ],
    merchantPolicy: {
      maxDiscountPercentage: 22,
      allowFreeShippingNegotiation: true,
      bundleDiscountsAvailable: false,
    },
    source: "demo",
    merchantName: "Veloce Tech Store",
  },
];

export function getProductById(id: string): Product | undefined {
  const sample = SAMPLE_PRODUCTS.find((p) => p.id === id);
  if (sample) return sample;

  try {
    // Dynamic import/require check for discovered products registry to prevent cyclic deps
    const { findProductById } = require("@/lib/channel3/registry");
    return findProductById(id);
  } catch {
    return undefined;
  }
}
