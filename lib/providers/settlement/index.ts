import { SettlementProvider } from "./interfaces";
import { PayPalSettlementProvider } from "./paypal.provider";

export * from "./interfaces";
export * from "./paypal.provider";

export const paypalSettlementProvider = new PayPalSettlementProvider();

export function getSettlementProvider(providerName: string = "PAYPAL_ORDERS_V2"): SettlementProvider {
  switch (providerName) {
    case "PAYPAL_ORDERS_V2":
    case "PAYPAL":
    default:
      return paypalSettlementProvider;
  }
}
