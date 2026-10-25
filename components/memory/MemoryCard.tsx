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
          <Badge variant="secondary" className="gap-1 text-[10px] py-0.5 font-semibold text-[#0A192F] bg-blue-50 border-blue-200">
            <Brain className="w-3 h-3 text-[#0052CC]" />
            <span>Buyer Negotiation</span>
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
            <ShoppingBag className="w-3 h-3 text-[#0E6245]" />
            <span>PayPal Settlement Record</span>
          </Badge>
        );
      case "fulfillment":
        return (
          <Badge variant="outline" className="gap-1 text-[10px] py-0.5 font-semibold text-cyan-900 border-cyan-300 bg-cyan-50/50">
            <Truck className="w-3 h-3 text-cyan-600" />
            <span>Fulfillment SLA Log</span>
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
    <Card className="p-4 rounded-2xl border-[#E2E8F0] bg-white hover:border-[#0052CC]/50 transition-all shadow-xs space-y-3 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getMemoryTypeBadge()}
            {document.source === "channel3" && (
              <span className="text-[10px] font-bold text-[#0A192F] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Channel3
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {similarityPct !== undefined && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#0E6245] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Sparkles className="w-2.5 h-2.5" />
                <span>{similarityPct}% Match</span>
              </div>
            )}
            <span className="text-[10px] text-[#475569] bg-slate-100 px-2 py-0.5 rounded border border-[#E2E8F0] font-medium" title="Untrusted reference context only">
              Reference Only
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#0A192F] tracking-tight line-clamp-1">
            {document.productTitle || "Commerce Memory"}
          </h3>
          {document.category && (
            <span className="text-[11px] text-[#475569] block">
              Category: {document.category} {document.merchantName ? `· ${document.merchantName}` : ""}
            </span>
          )}
        </div>

        {/* Financial Metrics Strip */}
        {document.originalPrice !== undefined && document.agreedPrice !== undefined && document.agreedPrice > 0 && (
          <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E2E8F0] grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] text-[#475569] uppercase block font-medium">List</span>
              <span className="font-semibold text-[#475569] line-through">
                {formatCurrency(document.originalPrice)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#0A192F] uppercase font-bold block">Agreed</span>
              <span className="font-black text-[#0A192F]">
                {formatCurrency(document.agreedPrice)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#0E6245] uppercase font-bold block">Saved</span>
              <span className="font-bold text-[#0E6245] flex items-center justify-center gap-0.5">
                <TrendingDown className="w-3 h-3" />
                <span>{formatCurrency(document.savings || 0)}</span>
              </span>
            </div>
          </div>
        )}

        {/* Semantic Content Narrative */}
        <p className="text-xs text-[#0A192F] leading-relaxed bg-slate-50 p-3 rounded-xl border border-[#E2E8F0]">
          &ldquo;{document.content}&rdquo;
        </p>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-[#475569] pt-2 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-[#475569]" />
          <span>{formattedDate}</span>
        </div>

        {document.deliveryDays !== undefined && document.deliveryDays > 0 && (
          <div className="flex items-center gap-1 text-[#0A192F] font-medium">
            <Clock className="w-3 h-3 text-[#0052CC]" />
            <span>{document.deliveryDays}d delivery</span>
          </div>
        )}

        <div>
          <span
            className={`font-bold ${
              isAgreed ? "text-[#0E6245]" : "text-[#475569]"
            }`}
          >
            {document.outcome || "RECORDED"}
          </span>
        </div>
      </div>
    </Card>
  );
};
