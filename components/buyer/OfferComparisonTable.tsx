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
      <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
        No candidate merchant offers available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Structured Multi-Merchant Offer Comparison</span>
          </h3>
          <p className="text-xs text-slate-400">
            Compare negotiated economic terms across verified commerce merchants. Select your preferred offer to proceed to settlement.
          </p>
        </div>
        <Badge variant="info" className="text-xs">
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
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                isSelected
                  ? "border-emerald-500 bg-slate-900 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/40"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Card Header & Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {offer.isNegotiable ? (
                        <Badge variant="success" className="text-[10px] gap-1 py-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                          <span>AI Negotiated</span>
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-[10px] py-0.5">
                          Discovery Only
                        </Badge>
                      )}
                      {isBestPrice && (
                        <Badge variant="purple" className="text-[10px] py-0.5 font-bold">
                          ★ Best Value
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{offer.productTitle}</h4>
                    <span className="text-xs text-slate-400 block font-medium">
                      {offer.merchantName}
                    </span>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Negotiated
                    </span>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono">
                      {formatCurrency(offer.price, offer.currency)}
                    </span>
                  </div>
                </div>

                {/* Economic Breakdown Table */}
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-slate-500" />
                      <span>Original List Price:</span>
                    </span>
                    <span className="line-through text-slate-400">
                      {formatCurrency(offer.listPrice, offer.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-200">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Your AI Savings:</span>
                    </span>
                    <span className="font-bold text-emerald-400 font-mono">
                      +{formatCurrency(offer.savings, offer.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-blue-400" />
                      <span>Delivery Window:</span>
                    </span>
                    <span className="font-semibold text-white">{offer.deliveryDays} Days SLA</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Payment Timing:</span>
                    <span className="text-slate-200 font-mono uppercase text-[11px]">
                      {offer.paymentTiming}
                    </span>
                  </div>
                </div>

                {/* Agent Reasoning Snippet */}
                {offer.reasoningText && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
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
                  className={`w-full text-xs font-bold gap-2 ${
                    isSelected
                      ? "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white"
                      : ""
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
                    className="flex items-center justify-center gap-1 text-[10px] text-slate-500 hover:text-blue-400 transition-colors pt-2"
                  >
                    <span>View catalog listing</span>
                    <ExternalLink className="w-2.5 h-2.5" />
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
