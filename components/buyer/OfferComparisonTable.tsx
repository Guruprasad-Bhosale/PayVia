"use client";

import React from "react";
import { CandidateOffer } from "@/lib/domain/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Truck,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Tag,
  ArrowRight,
} from "lucide-react";

interface OfferComparisonTableProps {
  offers: CandidateOffer[];
  selectedOfferId?: string;
  onSelectOffer: (offerId: string) => void;
  disabled?: boolean;
}

export function OfferComparisonTable({
  offers,
  selectedOfferId,
  onSelectOffer,
  disabled = false,
}: OfferComparisonTableProps) {
  if (!offers || offers.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl bg-white border border-[#DCE4EE] text-[#52607A] text-sm shadow-xs">
        No candidate merchant offers available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE4EE] pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-[#0B1B33] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0284C7]" />
            <span>Structured Multi-Merchant Offer Comparison</span>
          </h3>
          <p className="text-xs text-[#52607A]">
            Compare negotiated economic terms across verified commerce merchants. Select your preferred offer to proceed to agreement review.
          </p>
        </div>
        <Badge variant="info" className="text-xs self-start sm:self-auto font-semibold">
          {offers.length} Offers Evaluated
        </Badge>
      </div>

      {/* Grid Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer, idx) => {
          const isSelected = selectedOfferId === offer.id;
          const isBestPrice = idx === 0 && offer.savings > 0;

          return (
            <div
              key={offer.id}
              className={`rounded-xl border transition-all duration-150 flex flex-col justify-between overflow-hidden bg-white ${
                isSelected
                  ? "border-[#0284C7] shadow-md ring-2 ring-[#38BDF8]/30"
                  : "border-[#DCE4EE] hover:border-[#BAE6FD] shadow-xs hover:shadow-card"
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Card Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {offer.isNegotiable ? (
                        <Badge variant="success" className="text-[10px] gap-1 py-0.5 font-semibold">
                          <Sparkles className="w-2.5 h-2.5 text-[#059669]" />
                          <span>AI Negotiated</span>
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] py-0.5 font-medium">
                          Discovery Only
                        </Badge>
                      )}
                      {isBestPrice && (
                        <Badge variant="pink" className="text-[10px] py-0.5 font-bold">
                          ★ Best Value
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#0B1B33] line-clamp-1">{offer.productTitle}</h4>
                    <span className="text-xs text-[#52607A] block font-medium">
                      {offer.merchantName}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-[#52607A] uppercase font-bold tracking-wider block">
                      Agreed Price
                    </span>
                    <span className="text-xl font-extrabold text-[#059669] font-mono">
                      {formatCurrency(offer.price, offer.currency)}
                    </span>
                  </div>
                </div>

                {/* Economic Breakdown Table */}
                <div className="p-3.5 rounded-lg bg-[#F0F9FF] border border-[#BAE6FD] space-y-2 text-xs">
                  {offer.listPrice !== undefined && offer.listPrice > 0 && (
                    <div className="flex justify-between items-center text-[#52607A]">
                      <span className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>Original List Price:</span>
                      </span>
                      <span className="line-through text-[#94A3B8] font-mono">
                        {formatCurrency(offer.listPrice, offer.currency)}
                      </span>
                    </div>
                  )}

                  {offer.savings > 0 ? (
                    <div className="flex justify-between items-center text-[#0B1B33]">
                      <span className="flex items-center gap-1.5 text-[#059669] font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Negotiated Savings:</span>
                      </span>
                      <span className="font-bold text-[#059669] font-mono">
                        +{formatCurrency(offer.savings, offer.currency)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-[#52607A]">
                      <span className="flex items-center gap-1.5 text-[#94A3B8]">
                        <span>Price Adjustment:</span>
                      </span>
                      <span className="text-[#94A3B8] font-medium italic">Standard Catalog Price</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[#0B1B33] pt-2 border-t border-[#BAE6FD]/60">
                    <span className="flex items-center gap-1.5 text-[#52607A]">
                      <Truck className="w-3.5 h-3.5 text-[#0284C7]" />
                      <span>Delivery SLA:</span>
                    </span>
                    <span className="font-semibold text-[#0B1B33]">{offer.deliveryDays} Days Transit</span>
                  </div>

                  <div className="flex justify-between items-center text-[#52607A]">
                    <span>Payment Method:</span>
                    <span className="text-[#0B1B33] font-semibold text-[11px]">
                      PayPal Orders v2
                    </span>
                  </div>
                </div>

                {/* Agent Reasoning Snippet */}
                {offer.reasoningText && (
                  <p className="text-[11px] text-[#52607A] italic bg-[#F8FAFC] p-2.5 rounded-lg border border-[#DCE4EE] leading-relaxed">
                    &ldquo;{offer.reasoningText}&rdquo;
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <Button
                  onClick={() => onSelectOffer(offer.id)}
                  disabled={disabled || !offer.isNegotiable}
                  variant={isSelected ? "primary" : "outline"}
                  className={`w-full text-xs font-bold gap-2 min-h-[40px] cursor-pointer ${
                    isSelected
                      ? "bg-[#059669] hover:bg-[#047857] text-white shadow-xs"
                      : "text-[#0B1B33] border-[#DCE4EE] hover:border-[#0284C7] hover:bg-[#F0F9FF]"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Offer Selected</span>
                    </>
                  ) : offer.isNegotiable ? (
                    <>
                      <span>Select This Offer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <span>Fixed Listing (No Negotiation)</span>
                  )}
                </Button>

                {offer.productUrl && (
                  <a
                    href={offer.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 text-[11px] text-[#52607A] hover:text-[#0284C7] font-medium transition-colors pt-2.5"
                  >
                    <span>View catalog listing</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default OfferComparisonTable;
