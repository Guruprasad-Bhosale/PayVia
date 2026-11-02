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
  const token = searchParams.get("token");
  const negotiationId = searchParams.get("negotiationId") || searchParams.get("id");
  const paymentStatus = searchParams.get("payment");
  const errorMessage = searchParams.get("error");
  const errorDetails = searchParams.get("details");

  const [agreement, setAgreement] = useState<NegotiationAgreement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If buyer lands on /checkout?token=..., redirect them to /checkout/success?token=...
    // where client-side capture POST is executed safely
    if (token) {
      window.location.href = `/checkout/success?token=${encodeURIComponent(token)}`;
      return;
    }

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
        merchantName: "ThinkPad Certified Store",
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
  }, [negotiationId, token]);

  if (loading || !agreement) {
    return (
      <div className="text-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0284C7]" />
        <p className="text-sm text-[#52607A] font-medium">Initializing secure checkout session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE4EE] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-[#0284C7] text-white text-xs font-bold flex items-center justify-center">
              3
            </span>
            <Badge variant="secondary" className="font-semibold text-[#0B1B33]">
              PayPal Settlement
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B33] tracking-tight">
            Authorize PayPal Settlement
          </h1>
          <p className="text-xs sm:text-sm text-[#52607A] mt-1">
            Complete payment for your approved terms through PayPal&apos;s secure authorization portal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/agreement${negotiationId ? `?id=${negotiationId}` : ""}`}>
            <Button variant="outline" size="sm" className="border-[#DCE4EE] text-[#0B1B33] hover:bg-[#F0F9FF]">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Agreement</span>
            </Button>
          </Link>
        </div>
      </div>

      {paymentStatus === "cancelled" && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Payment Cancelled on PayPal</span>
            <p>Your agreement terms remain locked. You can retry authorization whenever you are ready.</p>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Payment Authorization Issue:</span>
            <p>{errorDetails ? decodeURIComponent(errorDetails) : errorMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <PayPalCheckout agreement={agreement} />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-center text-[#52607A] py-16">Loading checkout session...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
