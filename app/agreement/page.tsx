"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { NegotiationAgreement } from "@/types/negotiation";
import { AgreementCard } from "@/components/AgreementCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

function AgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get("id");

  const [agreement, setAgreement] = useState<NegotiationAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);

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
        currency: sample.currency || "USD",
        status: "AGREED",
        roundsCount: 3,
        createdAt: new Date().toISOString(),
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
    try {
      await fetch("/api/negotiate/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: agreement.id,
          negotiationId: agreement.negotiationId,
        }),
      });
    } catch (err) {
      console.error("Failed to record server-side agreement approval:", err);
    }
    router.push(`/checkout?negotiationId=${agreement.negotiationId || agreement.id}`);
  };

  if (loading || !agreement) {
    return (
      <div className="text-center py-16 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
        <p className="text-sm text-slate-400">Loading verified agreement terms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge variant="success" className="mb-2">
            Step 2: Human Verification & Approval
          </Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Transaction Agreement Review
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review the negotiated terms formulated by your Buyer Agent and Merchant Agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/negotiate">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Negotiator</span>
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
        />
      </div>

      <div className="max-w-3xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-3 text-xs text-slate-400">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-sm">
          <ShieldCheck className="w-4 h-4 text-blue-400" />
          <span>PayVia Zero-Trust Hard Constraint Enforcement</span>
        </div>
        <p className="leading-relaxed">
          No funds are transferred automatically by autonomous agents. Payment settlement occurs strictly after explicit human authorization using the PayPal Sandbox REST API with server-verified amounts.
        </p>
      </div>
    </div>
  );
}

export default function AgreementPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Loading agreement...</div>}>
      <AgreementContent />
    </Suspense>
  );
}
