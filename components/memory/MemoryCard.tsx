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
          <Badge variant="info" className="gap-1 text-[10px] py-0.5">
            <Brain className="w-3 h-3 text-blue-400" />
            <span>Negotiation Memory</span>
          </Badge>
        );
      case "merchant_pattern":
        return (
          <Badge variant="purple" className="gap-1 text-[10px] py-0.5">
            <Building2 className="w-3 h-3 text-purple-400" />
            <span>Merchant Pattern</span>
          </Badge>
        );
      case "purchase":
        return (
          <Badge variant="success" className="gap-1 text-[10px] py-0.5">
            <ShoppingBag className="w-3 h-3 text-emerald-400" />
            <span>PayPal Settlement</span>
          </Badge>
        );
      case "fulfillment":
        return (
          <Badge variant="default" className="gap-1 text-[10px] py-0.5 text-cyan-300 border-cyan-500/30">
            <Truck className="w-3 h-3 text-cyan-400" />
            <span>Fulfillment Log</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="text-[10px] py-0.5">
            <span>{document.memoryType}</span>
          </Badge>
        );
    }
  };

  return (
    <Card className="p-4 rounded-xl border-slate-800 bg-slate-900/80 hover:bg-slate-900 transition-all shadow-md space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {getMemoryTypeBadge()}
          {document.source === "channel3" && (
            <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              Channel3
            </span>
          )}
        </div>

        {similarityPct !== undefined && (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            <span>{similarityPct}% Match</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white tracking-tight">
          {document.productTitle || "Commerce Memory"}
        </h3>
        {document.category && (
          <span className="text-[11px] text-slate-400 block">
            Category: {document.category} {document.merchantName ? `• ${document.merchantName}` : ""}
          </span>
        )}
      </div>

      {/* Financial Metrics Strip if available */}
      {document.originalPrice !== undefined && document.agreedPrice !== undefined && document.agreedPrice > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">List</span>
            <span className="font-semibold text-slate-400 line-through">
              {formatCurrency(document.originalPrice)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Agreed</span>
            <span className="font-bold text-emerald-400">
              {formatCurrency(document.agreedPrice)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Saved</span>
            <span className="font-semibold text-emerald-500/90 flex items-center justify-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              <span>{formatCurrency(document.savings || 0)}</span>
            </span>
          </div>
        </div>
      )}

      {/* Semantic Content Narrative */}
      <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
        &ldquo;{document.content}&rdquo;
      </p>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>

        {document.deliveryDays !== undefined && document.deliveryDays > 0 && (
          <div className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3 text-blue-400" />
            <span>{document.deliveryDays}d delivery</span>
          </div>
        )}

        <div>
          <span
            className={`font-semibold ${
              isAgreed ? "text-emerald-400" : "text-slate-400"
            }`}
          >
            {document.outcome || "RECORDED"}
          </span>
        </div>
      </div>
    </Card>
  );
};
