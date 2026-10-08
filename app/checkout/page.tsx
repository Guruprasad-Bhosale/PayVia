"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { NegotiationAgreement } from "@/types/negotiation";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const negotiationId = searchParams.get("negotiationId") || searchParams.get("id");
  const paymentStatus = searchParams.get("payment");
  const errorMessage = searchParams.get("error");
  const errorDetails = searchParams.get("details");

  const [agreement, setAgreement] = useState<NegotiationAgreement | null>(null);
  const [loading, setLoading] = useState(true);

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
          console.error("Failed to load negotiation:", e);
        }
      }

      // Default sample fallback
      const sampleProduct = SAMPLE_PRODUCTS[0];
      setAgreement({
        id: "agree_laptop_8821",
        negotiationId: "sess_sample_default",
        productId: sampleProduct.id,
        productName: sampleProduct.name,
        originalPrice: sampleProduct.originalPrice,
        finalPrice: 750.0,
        savings: Number((sampleProduct.originalPrice - 750.0).toFixed(2)),
        deliveryDays: 5,
        buyerMaxPrice: 760.0,
        buyerMaxDeliveryDays: 5,
        merchantMinPrice: sampleProduct.minAcceptablePrice,
        currency: "USD",
        status: "AGREED",
        roundsCount: 3,
        createdAt: new Date().toISOString(),
        userApproved: true,
        termsSummary:
          "Buyer Agent agreed to final price of $750.00 USD with 5-day delivery.",
        finalAgreedPrice: 750.0,
        savingsAmount: Number((sampleProduct.originalPrice - 750.0).toFixed(2)),
        totalSettlementAmount: 750.0,
      });
      setLoading(false);
    }

    loadAgreement();
  }, [negotiationId]);

  if (loading || !agreement) {
    return (
      <div className="text-center py-16 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-400" />
        <p className="text-sm text-slate-400">Loading checkout session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge variant="info" className="mb-2">
            Step 3: Settlement
          </Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Execute PayPal Sandbox Settlement
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authorize payment for your negotiated purchase using official PayPal Sandbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/agreement${negotiationId ? `?id=${negotiationId}` : ""}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Agreement</span>
            </Button>
          </Link>
        </div>
      </div>

      {paymentStatus === "cancelled" && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Payment was cancelled on PayPal. You can re-attempt whenever ready.</span>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>
            Payment capture error: {errorDetails ? decodeURIComponent(errorDetails) : errorMessage}
          </span>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <PayPalCheckout agreement={agreement} />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center text-slate-400">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
