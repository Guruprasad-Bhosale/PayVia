"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { NegotiationAgreement } from "@/types/negotiation";
import { AgreementCard } from "@/components/AgreementCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

function AgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get("id");
  const { success: toastSuccess, error: toastError } = useToast();

  const [agreement, setAgreement] = useState<NegotiationAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAgreement() {
      if (negotiationId) {
        try {
          const res = await fetch(`/api/negotiate?id=${negotiationId}`);
          const data = await res.json();
          if (res.ok && data.success && data.agreement) {
            setAgreement(data.agreement);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to fetch agreement:", e);
        }
      }

      // Default fallback agreement if viewing directly
      const sample = SAMPLE_PRODUCTS[0];
      setAgreement({
        id: "agree_laptop_8821",
        negotiationId: "sess_sample_default",
        productId: sample.id,
        productName: sample.name,
        originalPrice: sample.originalPrice,
        finalPrice: 750.0,
        savings: Number((sample.originalPrice - 750.0).toFixed(2)),
        deliveryDays: 5,
        buyerMaxPrice: 760.0,
        buyerMaxDeliveryDays: 5,
        merchantMinPrice: sample.minAcceptablePrice,
        merchantName: "ThinkPad Certified Store",
        currency: sample.currency || "USD",
        status: "AGREED",
        roundsCount: 3,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
        userApproved: false,
        termsSummary:
          "Buyer Agent negotiated final purchase price of $750.00 USD (saving $50.00) with 5-day delivery. Explicit human approval required before PayPal Sandbox charge.",
        finalAgreedPrice: 750.0,
        savingsAmount: Number((sample.originalPrice - 750.0).toFixed(2)),
        totalSettlementAmount: 750.0,
      });
      setLoading(false);
    }

    loadAgreement();
  }, [negotiationId]);

  const handleApprove = async () => {
    if (!agreement) return;
    setIsApproving(true);
    setApprovalError(null);

    try {
      const res = await fetch("/api/negotiate/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agreement.id,
          negotiationId: agreement.negotiationId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to record server-side agreement approval.");
      }

      toastSuccess(
        "Agreement Approved",
        "Terms locked. Redirecting to PayPal Sandbox checkout..."
      );

      // Advance to PayPal checkout
      router.push(`/checkout?negotiationId=${agreement.negotiationId || agreement.id}`);
    } catch (err) {
      console.error("Failed to record agreement approval:", err);
      const msg = err instanceof Error ? err.message : "Failed to record approval.";
      setApprovalError(msg);
      toastError("Approval Failed", msg);
      setIsApproving(false);
    }
  };

  if (loading || !agreement) {
    return (
      <div className="text-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0052CC]" />
        <p className="text-sm text-[#475569] font-medium">Verifying immutable agreement terms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-[#0052CC] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <Badge variant="secondary" className="font-semibold text-[#0A192F] bg-[#F1F5F9]">
              Human Review &amp; Approval
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
            Review Negotiated Agreement
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">
            Carefully review the authoritative commercial terms formulated between Buyer and Merchant agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/negotiate">
            <Button variant="secondary" size="sm" className="border-[#CBD5E1] text-[#0A192F] hover:bg-[#F8FAFC]">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Offers</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Agreement Display */}
      <div className="max-w-3xl mx-auto">
        <AgreementCard
          agreement={agreement}
          onApprove={handleApprove}
          isApproved={agreement.userApproved}
          isLoading={isApproving}
          errorMessage={approvalError}
        />
      </div>

      {/* Security & Protocol Verification Note */}
      <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-xs space-y-2 text-xs text-[#475569]">
        <div className="flex items-center gap-2 text-[#0A192F] font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
          <span>PayVia Zero-Trust Hard Constraint Enforcement</span>
        </div>
        <p className="leading-relaxed">
          No funds can be transferred autonomously. Settlement occurs strictly through official PayPal Orders v2 Sandbox endpoints with cryptographic checksum verification and server-side price validation.
        </p>
      </div>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="text-center text-[#475569] py-16">Loading agreement...</div>}>
      <AgreementContent />
    </Suspense>
  );
}
