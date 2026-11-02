"use client";

import React, { useEffect, useState } from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  ShieldCheck, 
  ArrowRight, 
  DollarSign, 
  Sparkles, 
  Clock, 
  Package, 
  Lock,
  FileCheck2,
  AlertTriangle,
  Store,
  CheckCircle2,
  Loader2
} from "lucide-react";

interface AgreementCardProps {
  agreement: NegotiationAgreement;
  onApprove?: () => void;
  isApproved?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function AgreementCard({
  agreement,
  onApprove,
  isApproved = false,
  isLoading = false,
  errorMessage = null,
}: AgreementCardProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const finalPrice = agreement.finalPrice ?? agreement.finalAgreedPrice ?? 0;
  const originalPrice = agreement.originalPrice ?? 0;
  const savings = agreement.savings ?? agreement.savingsAmount ?? (originalPrice - finalPrice);
  const savingsPct = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(1) : "0.0";
  const deliveryDays = agreement.deliveryDays ?? 3;
  const merchantName = agreement.merchantName || "Verified Commerce Merchant";

  // Check expiration if expiresAt is present
  const isExpired = agreement.expiresAt
    ? Date.now() >= new Date(agreement.expiresAt).getTime()
    : false;

  const isFailed = agreement.status === "FAILED";
  const canApprove = !isExpired && !isFailed && !isApproved && Boolean(onApprove);

  // Avoid hydration mismatch by only rendering client-specific date formatting after mounting
  const formattedExpiry = !mounted
    ? "72 hours from generation"
    : agreement.expiresAt
    ? new Date(agreement.expiresAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "72 hours from generation";

  return (
    <Card className="border-[#DCE4EE] bg-white shadow-sm overflow-hidden relative rounded-2xl">
      {/* Top Brand Accent Line: Sky Blue / Deep Blue */}
      <div className="h-1 bg-[#0284C7] w-full" />

      <CardHeader className="border-b border-[#DCE4EE] bg-[#F0F9FF]/60 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] flex-shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-xl sm:text-2xl font-bold text-[#0B1B33] tracking-tight">
                  Commercial Agreement Terms
                </CardTitle>
                <Badge variant={isExpired ? "destructive" : isApproved ? "success" : "info"} className="text-xs font-semibold">
                  {isExpired ? "Expired" : isApproved ? "Approved by Buyer" : "Locked Terms"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-[#52607A] mt-0.5">
                Mutually bound and verified between Buyer and Merchant AI agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono bg-white text-[#52607A] px-3 py-1 rounded-md border border-[#DCE4EE] flex items-center gap-1.5 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>SHA-256 Sealed</span>
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5 sm:p-8">
        {/* 1. What You Are Buying */}
        <div className="p-4 rounded-xl bg-[#F0F9FF]/40 border border-[#DCE4EE] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCE4EE] pb-2.5">
            <span className="text-[11px] font-bold text-[#52607A] uppercase tracking-wider">
              1. Purchase Item &amp; Merchant Identity
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#0284C7] font-semibold">
              <Store className="w-3.5 h-3.5" />
              <span>{merchantName}</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#0B1B33]">{agreement.productName}</h3>
              <p className="text-xs text-[#52607A] mt-0.5">
                Allocated quantity: <strong>1 unit</strong> (Reserved in merchant inventory)
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-[11px] text-[#52607A] block">Listing baseline</span>
              <span className="text-sm font-semibold text-[#94A3B8] line-through font-mono">
                {formatCurrency(originalPrice, agreement.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. What You'll Pay: Economic Breakdown Grid */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#52607A] uppercase tracking-wider block">
            2. Economic Breakdown &amp; Settled Price
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
              <span className="text-xs font-medium text-[#52607A] block">Original List Price</span>
              <span className="text-xl font-bold text-[#94A3B8] line-through font-mono block">
                {formatCurrency(originalPrice, agreement.currency)}
              </span>
              <span className="text-[11px] text-[#52607A] block">Published catalog price</span>
            </div>

            <div className="p-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-1 ring-1 ring-[#38BDF8]/20">
              <span className="text-xs text-[#0B1B33] font-bold block flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Final Agreed Price</span>
              </span>
              <span className="text-2xl font-extrabold text-[#0B1B33] font-mono block">
                {formatCurrency(finalPrice, agreement.currency)}
              </span>
              <span className="text-[11px] text-[#0284C7] block font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                <span>Direct agent consensus</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-1">
              <span className="text-xs text-[#059669] font-bold block">Your Verified Savings</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#059669] font-mono">
                  {formatCurrency(savings, agreement.currency)}
                </span>
                <span className="text-[11px] font-bold text-[#059669] bg-white px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                  {savingsPct}% off
                </span>
              </div>
              <span className="text-[11px] text-[#059669] block font-medium">
                Protected against price changes
              </span>
            </div>
          </div>
        </div>

        {/* 3. What You've Agreed To: SLA & Verification Terms */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-[#52607A] uppercase tracking-wider block">
            3. Delivery &amp; Operational Commitments
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
              <span className="text-[#52607A] flex items-center gap-1.5 font-medium">
                <Package className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Quantity</span>
              </span>
              <span className="font-bold text-[#0B1B33] text-sm block">1 Unit Reserved</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
              <span className="text-[#52607A] flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#059669]" />
                <span>Delivery SLA</span>
              </span>
              <span className="font-bold text-[#0B1B33] text-sm block">{deliveryDays} Business Days</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
              <span className="text-[#52607A] flex items-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Settlement Mode</span>
              </span>
              <span className="font-bold text-[#0B1B33] text-sm block">PayPal Orders v2</span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#DCE4EE] space-y-1">
              <span className="text-[#52607A] flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Terms Expiration</span>
              </span>
              <span className="font-bold text-[#0B1B33] text-[11px] block truncate" title={formattedExpiry}>
                {formattedExpiry}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Strategy & Rationale Text */}
        {agreement.termsSummary && (
          <div className="p-4 rounded-xl bg-[#F0F9FF]/40 border border-[#DCE4EE] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#0B1B33] font-bold">
              <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
              <span>Negotiation Agreement Consensus</span>
            </div>
            <p className="text-[#52607A] leading-relaxed">
              {agreement.termsSummary}
            </p>
          </div>
        )}

        {/* 5. What Happens Next: Zero-Trust Notice */}
        <div className="p-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#0B1B33] space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
            <span>What happens when you approve</span>
          </div>
          <p className="text-[#52607A] leading-relaxed">
            Under PayVia&apos;s zero-trust architecture, AI agents cannot charge your payment method. Approving this agreement locks the commercial terms server-side and advances you to PayPal Sandbox checkout. No money moves until you sign in and authorize the payment on PayPal.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Approval Notice</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Expiration Notice if Expired */}
        {isExpired && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">Agreement Expired</span>
              <p>The time window authorized by the merchant has elapsed. Please start a new shopping search to negotiate fresh terms.</p>
            </div>
          </div>
        )}

        {/* 6. Human Approval Action */}
        <div className="pt-2 border-t border-[#DCE4EE]">
          {isApproved ? (
            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Agreement Approved by Buyer</span>
              </div>
              <Button
                size="lg"
                onClick={onApprove}
                className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 gap-2"
              >
                <span>Proceed to PayPal Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="space-y-3 text-center sm:text-left">
              <Button
                onClick={onApprove}
                disabled={!canApprove || isLoading}
                size="lg"
                className="w-full bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold py-3.5 text-sm sm:text-base min-h-[48px] shadow-xs gap-2 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Authorizing Agreement Terms...</span>
                  </>
                ) : (
                  <>
                    <span>Approve agreement &amp; continue to PayPal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
              <p className="text-[11px] text-[#52607A] text-center">
                Requires explicit buyer consent. You will review and authorize final payment on PayPal.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default AgreementCard;
