"use client";

import React, { useState } from "react";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { NegotiationAgreement } from "@/types/negotiation";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const sampleProduct = SAMPLE_PRODUCTS[0];

  const agreement: NegotiationAgreement = {
    id: "agree_aurora_9942",
    productId: sampleProduct.id,
    productName: sampleProduct.name,
    originalPrice: sampleProduct.originalPrice,
    finalAgreedPrice: 245.0,
    savingsAmount: 54.99,
    selectedDelivery: sampleProduct.availableDeliveryOptions[1], // Express
    totalSettlementAmount: 245.0,
    currency: "USD",
    roundsCount: 3,
    createdAt: new Date().toISOString(),
    userApproved: true,
    termsSummary:
      "Buyer Agent agreed to final price of $245.00 USD with complimentary Express Air Delivery (2-day).",
  };

  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [captureDetails, setCaptureDetails] = useState<{
    captureId: string;
    status: string;
  } | null>(null);

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
            Execute the final payment for your negotiated purchase using PayPal Sandbox.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/agreement">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Agreement</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {paymentCompleted && captureDetails ? (
          <Card className="border-emerald-500/40 bg-emerald-950/20 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl text-white">Payment Confirmed!</CardTitle>
            <p className="text-sm text-slate-300">
              PayPal transaction captured successfully with reference ID:
            </p>
            <code className="block bg-slate-900 px-4 py-2 rounded-lg text-emerald-400 font-mono text-sm border border-slate-800">
              {captureDetails.captureId}
            </code>

            <div className="pt-4 flex justify-center gap-4">
              <Link href="/negotiate">
                <Button>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Start Another Negotiation</span>
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <PayPalCheckout
            agreement={agreement}
            onPaymentSuccess={(data) => {
              setCaptureDetails(data);
              setPaymentCompleted(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
