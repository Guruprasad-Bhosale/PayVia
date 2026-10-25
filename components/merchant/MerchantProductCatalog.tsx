"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Lock,
  RefreshCw,
  CheckCircle2,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { CatalogItem } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils";

interface MerchantProductCatalogProps {
  merchantId?: string;
  onConfigurePolicy?: (productId?: string) => void;
}

export function MerchantProductCatalog({
  merchantId = "merchant_default",
  onConfigurePolicy,
}: MerchantProductCatalogProps) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantFloorPrice, setMerchantFloorPrice] = useState<number | null>(null);

  const loadCatalogAndPolicy = React.useCallback(async () => {
    try {
      setLoading(true);

      // Load policy for floor reference
      try {
        const polRes = await fetch(`/api/v1/merchants/${merchantId}/policy`);
        const polData = await polRes.json();
        if (polRes.ok && polData?.policy?.minimumPrice) {
          setMerchantFloorPrice(polData.policy.minimumPrice);
        }
      } catch {
        // Fallback default floor
        setMerchantFloorPrice(750);
      }

      // Load items
      const res = await fetch(`/api/v1/catalog/items?merchantId=${encodeURIComponent(merchantId)}`);
      const data = await res.json();
      if (res.ok && data?.items && data.items.length > 0) {
        setItems(data.items);
      } else {
        // Fallback standard catalog items for merchant_default
        setItems([
          {
            id: "prod_thinkpad_p16",
            platformId: "plat_default",
            merchantId: "merchant_default",
            sku: "TP-P16-GEN2",
            title: "Lenovo ThinkPad P16 Gen 2 Workstation",
            description: "High-performance enterprise mobile workstation. Autonomous AI negotiation enabled within authorized floor.",
            category: "Laptops & Workstations",
            listPrice: 800,
            currency: "USD",
            stockStatus: "IN_STOCK",
            source: "internal",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "prod_aurora_headphones",
            platformId: "plat_default",
            merchantId: "merchant_default",
            sku: "AUR-NC-900",
            title: "Aurora Sound Pro ANC Wireless Headphones",
            description: "Active noise-cancelling studio headphones with 40-hour battery and low-latency audio.",
            category: "Audio",
            listPrice: 299.99,
            currency: "USD",
            stockStatus: "IN_STOCK",
            source: "internal",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "prod_channel3_sony_wh1000xm5",
            platformId: "plat_default",
            merchantId: "merchant_external",
            sku: "CH3-EXT-WH5",
            title: "Sony WH-1000XM5 Wireless Headphones (Channel3 Partner Listing)",
            description: "Discovered via Channel3 multi-merchant commerce network. External catalog listing with fixed pricing.",
            category: "Audio",
            listPrice: 399.99,
            currency: "USD",
            stockStatus: "IN_STOCK",
            source: "channel3",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error("Failed to load catalog:", e);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    loadCatalogAndPolicy();
  }, [loadCatalogAndPolicy]);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              Merchant Catalog Management
            </span>
            <Badge variant="success" className="text-[10px] font-semibold gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Catalog In Sync</span>
            </Badge>
          </div>
          <h2 className="text-xl font-extrabold text-[#0A192F] tracking-tight">
            Product Listings &amp; Negotiation Eligibility
          </h2>
          <p className="text-xs text-[#475569]">
            Only products registered under active PayVia merchant policies participate in autonomous AI negotiation. External listings remain discovery-only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCatalogAndPolicy}
            disabled={loading}
            className="gap-2 text-xs h-9 border-[#E2E8F0] text-[#0A192F] hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#0052CC]" : ""}`} />
            <span>Refresh Catalog</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0] space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0052CC]" />
          <p className="text-xs text-[#475569] font-medium">Loading catalog items and policy boundaries...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => {
            const isNegotiable = item.source !== "channel3";
            const floorPrice = isNegotiable
              ? item.listPrice > 500
                ? merchantFloorPrice || 750
                : 220
              : null;

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#0052CC]/50 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-semibold text-[#475569] uppercase tracking-wider">
                      {item.sku || item.id}
                    </span>
                    {isNegotiable ? (
                      <Badge variant="secondary" className="text-[10px] font-bold text-[#0A192F] bg-blue-50 border-blue-200 gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#0052CC]" />
                        <span>AI Negotiable</span>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] font-semibold text-[#475569] border-[#CBD5E1] gap-1">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Discovery Only</span>
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#0A192F] line-clamp-1 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                      {item.description || "Registered catalog product with authorized settlement rules."}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] font-medium text-[#475569] bg-slate-50 px-2 py-0.5 rounded border border-[#E2E8F0]">
                      {item.category || "General"}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      item.stockStatus === "OUT_OF_STOCK"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-emerald-50 text-[#0E6245] border-emerald-200"
                    }`}>
                      {item.stockStatus === "OUT_OF_STOCK" ? "Out of Stock" : "In Stock"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#475569]">List Price:</span>
                    <span className="text-sm font-extrabold text-[#0A192F]">
                      {formatCurrency(item.listPrice, item.currency || "USD")}
                    </span>
                  </div>

                  {isNegotiable && floorPrice !== null ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569] flex items-center gap-1">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Policy Floor:</span>
                      </span>
                      <span className="text-amber-800 font-mono font-bold">
                        {formatCurrency(floorPrice, item.currency || "USD")}
                        <span className="text-[10px] font-normal text-amber-600 ml-1">(Private)</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569]">Pricing Mode:</span>
                      <span className="text-xs text-[#475569] font-medium">Fixed List Price</span>
                    </div>
                  )}

                  {isNegotiable && onConfigurePolicy && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConfigurePolicy(item.id)}
                      className="w-full mt-2 h-8 text-xs font-semibold text-[#0A192F] border-[#E2E8F0] hover:bg-blue-50 hover:text-[#0052CC] hover:border-blue-200 gap-1.5"
                    >
                      <Sliders className="w-3 h-3" />
                      <span>Configure Rules in Policy Editor</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
