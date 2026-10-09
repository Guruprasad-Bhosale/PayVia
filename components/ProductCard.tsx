import React from "react";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShieldCheck, Truck, Zap, Check, ArrowRight, ExternalLink, Sparkles } from "lucide-react";

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  onSelect?: () => void;
}

export function ProductCard({ product, selected, onSelect }: ProductCardProps) {
  const standardDelivery = product.availableDeliveryOptions?.[0];
  const isChannel3 = product.source === "channel3";

  return (
    <Card
      onClick={onSelect}
      className={`transition-all duration-150 cursor-pointer border flex flex-col justify-between overflow-hidden group bg-white ${
        selected
          ? "border-[#0070E0] shadow-md ring-2 ring-[#0070E0]/20"
          : "border-[#E2E8F0] hover:border-[#CBD5E1] shadow-2xs hover:shadow-xs"
      }`}
    >
      <div>
        {/* Product Image Thumbnail if provided */}
        {product.imageUrl && (
          <div className="relative w-full h-40 bg-[#F5F7FA] border-b border-[#E2E8F0] flex items-center justify-center p-3 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#16845B] border border-[#16845B]/25 shadow-2xs">
                <Sparkles className="w-2.5 h-2.5 text-[#16845B]" />
                <span>AI Negotiable</span>
              </span>
              {isChannel3 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EFF8FF] text-[#0070E0] border border-[#0070E0]/25 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0] animate-pulse" />
                  <span>Channel3</span>
                </span>
              )}
            </div>
            {product.availability && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-[#5B6472] border border-[#E2E8F0] shadow-2xs">
                  {product.availability}
                </span>
              </div>
            )}
          </div>
        )}

        <CardHeader className={product.imageUrl ? "pt-4" : ""}>
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1.5">
              {!product.imageUrl && (
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] text-[#16845B] border border-[#16845B]/25 shadow-2xs">
                    <Sparkles className="w-2.5 h-2.5 text-[#16845B]" />
                    <span>AI Negotiable</span>
                  </span>
                  <Badge variant={isChannel3 ? "info" : "default"}>
                    {isChannel3 ? "Channel3 Discovery" : product.category}
                  </Badge>
                </div>
              )}
              <CardTitle className="text-base sm:text-lg text-[#111827] group-hover:text-[#003087] transition-colors line-clamp-2 leading-snug">
                {product.name}
              </CardTitle>
              <CardDescription className="text-xs text-[#5B6472] line-clamp-1">
                {product.tagline || product.merchantName || "Verified Commerce Listing"}
              </CardDescription>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] text-[#5B6472] block uppercase font-semibold">List Price</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#111827] font-mono">
                {formatCurrency(product.originalPrice, product.currency)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-[#5B6472] leading-relaxed line-clamp-2">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-[#5B6472]">
            {product.features.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-[#5B6472] text-[11px]">
                <Zap className="w-3 h-3 text-[#0070E0] flex-shrink-0" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#5B6472]">
            <div className="flex items-center gap-1.5 text-[#16845B] truncate max-w-[50%] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{product.merchantName || "Verified Merchant"}</span>
            </div>
            {standardDelivery && (
              <div className="flex items-center gap-1.5 text-[#5B6472] flex-shrink-0">
                <Truck className="w-3.5 h-3.5 text-[#0070E0]" />
                <span>Est. {standardDelivery.estimatedDays}d SLA</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-4 sm:p-6 pt-0 space-y-2">
        <Button
          variant={selected ? "primary" : "secondary"}
          size="sm"
          className="w-full text-xs font-semibold gap-1.5"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (onSelect) onSelect();
          }}
        >
          {selected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Selected for Negotiation</span>
            </>
          ) : (
            <>
              <span>Configure Negotiation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </Button>

        {product.productUrl && (
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="flex items-center justify-center gap-1 text-[10px] text-[#5B6472] hover:text-[#0070E0] transition-colors pt-0.5"
          >
            <span>View catalog source</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </Card>
  );
}
