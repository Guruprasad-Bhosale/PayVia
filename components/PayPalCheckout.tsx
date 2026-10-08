"use client";

import React, { useState } from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Lock, AlertCircle, CreditCard, CheckCircle } from "lucide-react";

interface PayPalCheckoutProps {
  agreement: NegotiationAgreement;
  onPaymentSuccess?: (captureData: { captureId: string; status: string }) => void;
}

/**
 * PayPal Checkout Component.
 * Interacts with server-side endpoints (/api/paypal/create-order and /api/paypal/capture-order)
 * to execute secure PayPal Sandbox payments.
 *
 * TODO: [PayPal Hackathon Integration] Mount the official @paypal/react-paypal-js buttons
 * or standard PayPal JS SDK using NEXT_PUBLIC_PAYPAL_CLIENT_ID.
 */
export function PayPalCheckout({ agreement, onPaymentSuccess }: PayPalCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleExecutePayment = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("Connecting to server-side PayPal order service...");

    try {
      // 1. Create order on server
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agreementId: agreement.id,
          amount: agreement.totalSettlementAmount,
          currency: agreement.currency,
          itemDescription: `Payvia Settlement: ${agreement.productName}`,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.message || createData.error || "Failed to create order");
      }

      setStatusMessage(`Order created (${createData.orderId}). Authorizing sandbox capture...`);

      // TODO: [PayPal Hackathon Integration] Replace direct server capture with client approval step via PayPal SDK
      const captureRes = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createData.orderId,
          agreementId: agreement.id,
        }),
      });

      const captureData = await captureRes.json();

      if (!captureRes.ok) {
        throw new Error(captureData.message || captureData.error || "Failed to capture payment");
      }

      setStatusMessage("Payment completed successfully!");
      if (onPaymentSuccess) {
        onPaymentSuccess(captureData);
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during PayPal processing."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-900/50 bg-slate-900/90 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070BA]/20 border border-[#0070BA]/40 flex items-center justify-center text-[#009cde]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">PayPal Sandbox Checkout</CardTitle>
              <CardDescription>
                Zero-trust settlement for negotiated terms
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-full border border-slate-800">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit Encrypted</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Agreed Settlement Amount</span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(agreement.totalSettlementAmount, agreement.currency)}
            </span>
          </div>
          <div className="text-right text-xs text-slate-400">
            <span className="block font-medium text-slate-300">{agreement.productName}</span>
            <span>Incl. {agreement.selectedDelivery.name}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <span className="font-semibold block">Payment Notice:</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          <Button
            variant="paypal"
            size="lg"
            className="w-full flex items-center justify-center gap-2 text-base"
            onClick={handleExecutePayment}
            disabled={loading}
          >
            <span>{loading ? "Connecting to PayPal..." : "Pay with PayPal Sandbox"}</span>
          </Button>

          <p className="text-center text-[11px] text-slate-500">
            PayPal Sandbox test environment. Server credentials configured via secrets.txt.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
