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
      <div className="text-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-payvia-blue" />
        <p className="text-sm text-muted-foreground font-medium">Initializing secure checkout session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-payvia-blue text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <Badge variant="secondary" className="font-semibold text-payvia-navy">
              PayPal Settlement
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Authorize PayPal Sandbox Settlement
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete payment for your approved terms through PayPal&apos;s secure authorization portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/agreement${negotiationId ? `?id=${negotiationId}` : ""}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Agreement</span>
            </Button>
          </Link>
        </div>
      </div>

      {paymentStatus === "cancelled" && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Payment authorization was cancelled on PayPal. You can re-attempt whenever ready.</span>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-red-50 border border-red-200 text-payvia-error text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-payvia-error flex-shrink-0" />
          <span>
            Payment capture issue: {errorDetails ? decodeURIComponent(errorDetails) : errorMessage}
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
    <Suspense fallback={<div className="text-center text-muted-foreground py-16">Loading checkout session...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
