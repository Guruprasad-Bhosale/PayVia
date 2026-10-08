export interface DeliveryOption {
  id: string;
  name: string;
  estimatedDays: number;
  cost: number;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  originalPrice: number;
  minAcceptablePrice: number;
  currency: string;
  inventoryCount: number;
  imageUrl?: string;
  features: string[];
  availableDeliveryOptions: DeliveryOption[];
  merchantPolicy: {
    maxDiscountPercentage: number;
    allowFreeShippingNegotiation: boolean;
    bundleDiscountsAvailable: boolean;
  };
  source?: "channel3" | "demo";
  merchantName?: string;
  brandName?: string;
  productUrl?: string;
  externalId?: string;
  availability?: string;
}

