import React from "react";
import { Product } from "@/types/product";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { PackageCheck, ShieldCheck, Zap } from "lucide-react";

interface ProductCardProps {
  product: Product;
  selected?: boolean;
  onSelect?: () => void;
}

export function ProductCard({ product, selected, onSelect }: ProductCardProps) {
  return (
    <Card
      onClick={onSelect}
      className={`transition-all duration-300 cursor-pointer border ${
        selected
          ? "border-blue-500 bg-slate-900/90 shadow-2xl shadow-blue-500/10 ring-2 ring-blue-500/30"
          : "hover:border-slate-700"
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge variant="purple" className="mb-2">
              {product.category}
            </Badge>
            <CardTitle>{product.name}</CardTitle>
            <CardDescription className="mt-1">{product.tagline}</CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">List Price</span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(product.originalPrice, product.currency)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          {product.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
          {product.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verified Merchant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-blue-400" />
            <span>{product.availableDeliveryOptions.length} Shipping Options</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
