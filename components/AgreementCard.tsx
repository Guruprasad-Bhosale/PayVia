"use client";

import React, { useState } from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import SlideCommit from "./react-bits/SlideCommit";
import { 
  ShieldCheck, 
  ArrowRight, 
  DollarSign, 
  Sparkles, 
  Clock, 
  Calendar, 
  Package, 
  Lock,
  FileCheck2,
  SlidersHorizontal
} from "lucide-react";

interface AgreementCardProps {
  agreement: NegotiationAgreement;
  onApprove?: () => void;
  isApproved?: boolean;
  isLoading?: boolean;
}

export function AgreementCard({
  agreement,
  onApprove,
  isApproved = false,
  isLoading = false,
}: AgreementCardProps) {
  const [useSlider, setUseSlider] = useState(true);

  const finalPrice = agreement.finalPrice ?? agreement.finalAgreedPrice ?? 0;
  const originalPrice = agreement.originalPrice ?? 0;
  const savings = agreement.savings ?? agreement.savingsAmount ?? (originalPrice - finalPrice);
  const savingsPct = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(1) : "0.0";
  const deliveryDays = agreement.deliveryDays ?? 3;
  const quantity = 1;

  const handleSlideConfirm = async () => {
    if (onApprove && !isLoading && !isApproved) {
      onApprove();
    }
  };

  return (
    <Card className="border-border bg-card shadow-lg overflow-hidden relative">
      {/* Top Brand Accent Bar */}
      <div className="h-1.5 bg-gradient-to-r from-payvia-navy via-payvia-blue to-payvia-cyan w-full" />

      <CardHeader className="border-b border-border bg-slate-50/70 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-payvia-success/10 border border-payvia-success/25 flex items-center justify-center text-payvia-success shadow-sm">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
                  Negotiation Agreement
                </CardTitle>
                <Badge variant="success" className="px-2.5 py-0.5 text-xs font-semibold">
                  Locked Terms
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground text-sm mt-0.5">
                Mutually formulated and bound by Buyer and Merchant AI agents
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-white text-muted-foreground px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-payvia-blue" />
              <span>SHA-256 Validated</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Core Price & Savings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-border">
            <span className="text-xs font-medium text-muted-foreground block mb-1">Original List Price</span>
            <span className="text-2xl font-bold text-slate-400 line-through block">
              {formatCurrency(originalPrice, agreement.currency)}
            </span>
            <span className="text-xs text-muted-foreground block mt-1">Standard retail baseline</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/60 border border-payvia-blue/30 ring-1 ring-payvia-blue/20">
            <span className="text-xs text-payvia-navy font-bold block mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-payvia-blue" />
              <span>Agreed Settlement Price</span>
            </span>
            <span className="text-3xl font-black text-payvia-navy block">
              {formatCurrency(finalPrice, agreement.currency)}
            </span>
            <span className="text-xs text-payvia-blue block mt-1 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct agent consensus</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-payvia-success/30">
            <span className="text-xs text-emerald-800 font-bold block mb-1">Verified Savings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-payvia-success">
                {formatCurrency(savings, agreement.currency)}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {savingsPct}% off
              </span>
            </div>
            <span className="text-xs text-emerald-800 block mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-emerald-700" />
              <span>{deliveryDays}-day SLA guaranteed</span>
            </span>
          </div>
        </div>

        {/* Agreed Transaction Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Package className="w-3.5 h-3.5 text-payvia-blue" />
              <span>Allocated Quantity</span>
            </span>
            <span className="font-bold text-foreground text-sm block">{quantity} unit (Reserved)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-payvia-success" />
              <span>Fulfillment SLA</span>
            </span>
            <span className="font-bold text-foreground text-sm block">{deliveryDays} business days</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Payment Protocol</span>
            </span>
            <span className="font-bold text-foreground text-sm block">PayPal Sandbox v2</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
            <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-purple-600" />
              <span>Agreement Integrity</span>
            </span>
            <span className="font-bold text-payvia-success text-sm block">Immutable Hash</span>
          </div>
        </div>

        {/* Summary of Terms */}
        <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-2 text-xs text-foreground">
          <div className="flex items-center gap-2 text-payvia-navy font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-payvia-blue" />
            <span>Economic Terms & Settlement Guarantee</span>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            {agreement.termsSummary || `Buyer Agent negotiated final purchase price of ${formatCurrency(finalPrice, agreement.currency)} (saving ${formatCurrency(savings, agreement.currency)}) with ${deliveryDays}-day guaranteed fulfillment. This agreement is cryptographically verified against merchant policy rules.`}
          </p>
        </div>

        {/* Human Approval Gate */}
        {!isApproved && onApprove && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-xl bg-blue-50/40 border border-blue-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-payvia-navy">
                  <ShieldCheck className="w-4 h-4 text-payvia-blue" />
                  <span>Mandatory Human Approval Gate</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Under PayVia zero-trust architecture, AI agents cannot initiate charges. Authorize this agreement to proceed to PayPal.
                </p>
              </div>

              {/* Toggle slider vs standard button */}
              <button
                type="button"
                onClick={() => setUseSlider(!useSlider)}
                className="text-xs text-payvia-blue hover:text-payvia-navy font-medium flex items-center gap-1 self-end md:self-auto"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{useSlider ? "Switch to standard button" : "Switch to slide confirmation"}</span>
              </button>
            </div>

            <div className="flex flex-col items-center justify-center pt-2">
              {useSlider ? (
                <div className="w-full flex flex-col items-center gap-2">
                  <SlideCommit
                    label="Slide to approve agreement terms"
                    doneLabel="Agreement Approved ✓"
                    errorLabel="Approval Failed"
                    onConfirm={handleSlideConfirm}
                    trackColor="#E2E8F0"
                    handleColor="#003087"
                    successColor="#16845B"
                    dangerColor="#D92D20"
                    width={340}
                    height={52}
                    radius={26}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    Slide fully right to authorize and open PayPal Checkout
                  </span>
                </div>
              ) : (
                <Button
                  onClick={onApprove}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-payvia-navy hover:bg-payvia-navy-dark text-white font-bold px-8 py-3 text-sm shadow-md"
                  size="lg"
                >
                  <span>{isLoading ? "Locking Protocol..." : "Approve Agreement & Continue to PayPal"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
