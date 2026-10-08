import React from "react";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ShieldCheck, Truck, Zap, Check, ArrowRight, ExternalLink } from "lucide-react";

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
      className={`transition-all duration-300 cursor-pointer border flex flex-col justify-between overflow-hidden ${
        selected
          ? "border-blue-500 bg-slate-900 shadow-2xl shadow-blue-500/15 ring-2 ring-blue-500/40"
          : "hover:border-slate-700 bg-slate-900/60"
      }`}
    >
      <div>
        {/* Product Image Thumbnail if provided */}
        {product.imageUrl && (
          <div className="relative w-full h-40 bg-slate-950/80 border-b border-slate-800 flex items-center justify-center p-3 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
              loading="lazy"
            />
            <div className="absolute top-2 left-2">
              {isChannel3 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950/90 text-blue-300 border border-blue-700/60 backdrop-blur-sm shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Channel3 Live</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/90 text-slate-300 border border-slate-700/80 backdrop-blur-sm">
                  <span>Demo Catalog</span>
                </span>
              )}
            </div>
            {product.availability && (
              <div className="absolute top-2 right-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 backdrop-blur-sm">
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
                  <Badge variant={isChannel3 ? "info" : "purple"}>
                    {isChannel3 ? "● Channel3 Discovery" : product.category}
                  </Badge>
                </div>
              )}
              <CardTitle className="text-base sm:text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                {product.name}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 line-clamp-1">
                {product.tagline || product.merchantName || "Verified Listing"}
              </CardDescription>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">List Price</span>
              <span className="text-xl sm:text-2xl font-extrabold text-white">
                {formatCurrency(product.originalPrice, product.currency)}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
            {product.description}
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
            {product.features.slice(0, 4).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                <span className="truncate">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 truncate max-w-[50%]">
              <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{product.merchantName || "Verified Merchant"}</span>
            </div>
            {standardDelivery && (
              <div className="flex items-center gap-1.5 text-slate-400 flex-shrink-0">
                <Truck className="w-3.5 h-3.5 text-blue-400" />
                <span>Est. {standardDelivery.estimatedDays}d</span>
              </div>
            )}
          </div>
        </CardContent>
      </div>

      <div className="p-4 sm:p-6 pt-0 space-y-2">
        <Button
          variant={selected ? "primary" : "outline"}
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
              <span>Negotiate this deal</span>
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
            className="flex items-center justify-center gap-1 text-[10px] text-slate-500 hover:text-blue-400 transition-colors pt-0.5"
          >
            <span>View source listing</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}
      </div>
    </Card>
  );
}
