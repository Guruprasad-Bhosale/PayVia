export interface MerchantStoreConfig {
  storeName: string;
  supportEmail: string;
  defaultCurrency: string;
  maxNegotiationRounds: number;
  autoAcceptThresholdPercentage: number;
  allowFreeShippingConcessions: boolean;
  agentPersonality: "flexible" | "strict" | "balanced";
}

export const DEFAULT_MERCHANT_CONFIG: MerchantStoreConfig = {
  storeName: "Apex Retailers Official",
  supportEmail: "support@apexretailers.example.com",
  defaultCurrency: "USD",
  maxNegotiationRounds: 5,
  autoAcceptThresholdPercentage: 5, // Accepts offer if within 5% of asking
  allowFreeShippingConcessions: true,
  agentPersonality: "balanced",
};
