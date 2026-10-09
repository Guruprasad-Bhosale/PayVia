"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Sparkles,
  Lock,
  RefreshCw,
} from "lucide-react";
import { CatalogItem } from "@/lib/domain/types";

export function MerchantProductCatalog({ merchantId = "merchant_default" }: { merchantId?: string }) {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCatalog = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/catalog/items?merchantId=${encodeURIComponent(merchantId)}`);
      const data = await res.json();
      if (res.ok && data?.items) {
        setItems(data.items);
      }
    } catch (e) {
      console.error("Failed to load catalog:", e);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-semibold text-payvia-navy">
              <Package className="w-3 h-3 mr-1 text-payvia-blue" />
              <span>Catalog Management</span>
            </Badge>
            <Badge variant="success" className="text-xs font-semibold">
              <span>Autonomous Pricing Active</span>
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-foreground">Negotiable Product Inventory</h2>
          <p className="text-xs text-muted-foreground">
            Items registered with active policy rules display the <strong>AI Negotiable</strong> badge to prospective buyers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadCatalog}
            disabled={loading}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-xs font-medium">Loading catalog items...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-border shadow-sm space-y-4 hover:border-payvia-blue/50 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.sku || item.id}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-bold text-payvia-navy bg-blue-50 border-blue-200 gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-payvia-blue" />
                    <span>AI Negotiable</span>
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description || "Autonomous AI negotiation enabled with verified PayPal settlement."}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">List Price:</span>
                  <span className="text-sm font-bold text-foreground">${item.listPrice} {item.currency}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" />
                    <span>Policy Floor:</span>
                  </span>
                  <span className="text-amber-700 font-mono font-bold">$750 USD (Locked)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
