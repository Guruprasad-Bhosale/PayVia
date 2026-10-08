import { Product } from "@/types/product";

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "prod_aurora_headphones",
    name: "AuraPro ANC Wireless Headphones",
    tagline: "Studio-grade active noise cancelling audio",
    description:
      "Premium over-ear wireless headphones featuring adaptive noise cancellation, 40-hour battery life, lossless audio codecs, and ultra-plush memory foam earcups.",
    category: "Consumer Electronics",
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
      {
        id: "deliv_overnight",
        name: "Next-Day Priority Air",
        estimatedDays: 1,
        cost: 29.99,
        description: "Guaranteed overnight arrival with signature required.",
      },
    ],
    merchantPolicy: {
      maxDiscountPercentage: 25,
      allowFreeShippingNegotiation: true,
      bundleDiscountsAvailable: true,
    },
  },
  {
    id: "prod_smart_watch_ultra",
    name: "Veloce Titan Smartwatch",
    tagline: "Rugged GPS sports & health smartwatch",
    description:
      "Titanium case with sapphire crystal glass, dual-frequency GPS, biometric health monitoring, 100m water resistance, and 14-day battery life.",
    category: "Wearables",
    originalPrice: 449.0,
    minAcceptablePrice: 350.0,
    currency: "USD",
    inventoryCount: 20,
    features: [
      "Aerospace Titanium Case",
      "Continuous ECG & SpO2 sensors",
      "Offline topographic maps",
      "100-meter water resistance",
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
        description: "Expedited shipping with tracking.",
      },
    ],
    merchantPolicy: {
      maxDiscountPercentage: 22,
      allowFreeShippingNegotiation: true,
      bundleDiscountsAvailable: false,
    },
  },
];

export function getProductById(id: string): Product | undefined {
  return SAMPLE_PRODUCTS.find((p) => p.id === id);
}
