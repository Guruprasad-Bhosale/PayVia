import React from "react";
import { ElasticMemoryDocument } from "@/lib/elastic/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Brain,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  Clock,
  Truck,
  Building2,
  Calendar,
} from "lucide-react";

interface MemoryCardProps {
  document: ElasticMemoryDocument;
  similarityPct?: number;
}

export const MemoryCard: React.FC<MemoryCardProps> = ({
  document,
  similarityPct,
}) => {
  const isAgreed = document.outcome === "AGREED" || document.outcome === "SETTLED";
  const formattedDate = new Date(document.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getMemoryTypeBadge = () => {
    switch (document.memoryType) {
      case "negotiation":
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 font-semibold text-payvia-navy bg-blue-50 border-blue-200">
            <Brain className="w-3 h-3 text-payvia-blue" />
            <span>Negotiation Memory</span>
          </Badge>
        );
      case "merchant_pattern":
        return (
          <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 font-semibold text-purple-900 bg-purple-50 border-purple-200">
            <Building2 className="w-3 h-3 text-purple-600" />
            <span>Merchant Pattern</span>
          </Badge>
        );
      case "purchase":
        return (
          <Badge variant="success" className="gap-1 text-[10px] py-0.5 font-semibold">
            <ShoppingBag className="w-3 h-3 text-payvia-success" />
            <span>PayPal Settlement</span>
          </Badge>
        );
      case "fulfillment":
        return (
          <Badge variant="outline" className="gap-1 text-[10px] py-0.5 font-semibold text-cyan-800 border-cyan-300">
            <Truck className="w-3 h-3 text-cyan-600" />
            <span>Fulfillment Log</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] py-0.5">
            <span>{document.memoryType}</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="p-4 rounded-xl border-border bg-white hover:border-payvia-blue/40 transition-all shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {getMemoryTypeBadge()}
          {document.source === "channel3" && (
            <span className="text-[10px] font-bold text-payvia-navy bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Channel3
            </span>
          )}
        </div>

        {similarityPct !== undefined && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-payvia-success bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3" />
            <span>{similarityPct}% Match</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-foreground tracking-tight">
          {document.productTitle || "Commerce Memory"}
        </h3>
        {document.category && (
          <span className="text-[11px] text-muted-foreground block">
            Category: {document.category} {document.merchantName ? `• ${document.merchantName}` : ""}
          </span>
        )}
      </div>

      {/* Financial Metrics Strip */}
      {document.originalPrice !== undefined && document.agreedPrice !== undefined && document.agreedPrice > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-border grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase block font-medium">List</span>
            <span className="font-semibold text-muted-foreground line-through">
              {formatCurrency(document.originalPrice)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-payvia-navy uppercase font-bold block">Agreed</span>
            <span className="font-black text-payvia-navy">
              {formatCurrency(document.agreedPrice)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-800 uppercase font-bold block">Saved</span>
            <span className="font-bold text-payvia-success flex items-center justify-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              <span>{formatCurrency(document.savings || 0)}</span>
            </span>
          </div>
        </div>
      )}

      {/* Semantic Content Narrative */}
      <p className="text-xs text-foreground leading-relaxed font-sans bg-slate-50 p-2.5 rounded-lg border border-border">
        &ldquo;{document.content}&rdquo;
      </p>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>

        {document.deliveryDays !== undefined && document.deliveryDays > 0 && (
          <div className="flex items-center gap-1 text-foreground font-medium">
            <Clock className="w-3 h-3 text-payvia-blue" />
            <span>{document.deliveryDays}d delivery</span>
          </div>
        )}

        <div>
          <span
            className={`font-bold ${
              isAgreed ? "text-payvia-success" : "text-muted-foreground"
            }`}
          >
            {document.outcome || "RECORDED"}
          </span>
        </div>
      </div>
    </Card>
  );
};
