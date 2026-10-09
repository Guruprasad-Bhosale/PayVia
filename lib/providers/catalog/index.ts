import { CatalogProvider } from "./interfaces";
import { DemoCatalogProvider } from "./demo.provider";
import { Channel3CatalogProvider } from "./channel3.provider";
import { isChannel3Configured } from "@/lib/config/env";

export * from "./interfaces";
export * from "./demo.provider";
export * from "./channel3.provider";

export const demoCatalogProvider = new DemoCatalogProvider();
export const channel3CatalogProvider = new Channel3CatalogProvider();

export function getCatalogProvider(preferred?: string): CatalogProvider {
  if (preferred === "DEMO_CATALOG") return demoCatalogProvider;
  if (preferred === "CHANNEL3_CATALOG") return channel3CatalogProvider;
  return isChannel3Configured() ? channel3CatalogProvider : demoCatalogProvider;
}
