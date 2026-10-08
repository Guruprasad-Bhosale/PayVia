"use client";

import React, { useState } from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Lock, AlertCircle, CreditCard, ExternalLink, Loader2, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

interface PayPalCheckoutProps {
  agreement: NegotiationAgreement;
}

/**
 * PayPal Checkout Component.
 * Calls server-side /api/paypal/create-order passing ONLY the `negotiationId`.
 * The server looks up the validated agreement and charges the genuine negotiated price.
 */
export function PayPalCheckout({ agreement }: PayPalCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null);

  const finalPrice = agreement.finalPrice ?? agreement.finalAgreedPrice ?? 0;
  const originalPrice = agreement.originalPrice ?? 0;
  const savings = agreement.savings ?? agreement.savingsAmount ?? (originalPrice - finalPrice);
  const deliveryDays = agreement.deliveryDays ?? 3;

  const handleExecutePayment = async () => {
    setLoading(true);
    setErrorMessage(null);
    setStatusMessage("Validating agreement & creating PayPal Sandbox order...");

    try {
      // Send ONLY the negotiationId to prevent frontend price tampering
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          negotiationId: agreement.negotiationId || agreement.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.details || data.error || "Failed to create PayPal order.");
      }

      if (data.approvalUrl) {
        setApprovalUrl(data.approvalUrl);
        setStatusMessage(
          `Order created (${formatCurrency(data.negotiatedAmount ?? finalPrice, data.currency ?? "USD")}). Redirecting to PayPal...`
        );
        // Redirect user to PayPal Sandbox
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("PayPal did not return an approval URL.");
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during PayPal order creation."
      );
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
              <CardTitle className="text-xl text-white">Payment Summary</CardTitle>
              <CardDescription>
                Server-validated checkout session
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
        {/* Itemized Payment Summary */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800 divide-y divide-slate-800/80">
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Product</span>
            <span className="text-sm font-bold text-white">{agreement.productName}</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Original Price</span>
            <span className="text-sm font-semibold text-slate-400 line-through">
              {formatCurrency(originalPrice, agreement.currency)}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between bg-emerald-950/20">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Negotiated Price</span>
            </span>
            <span className="text-xl font-extrabold text-white">
              {formatCurrency(finalPrice, agreement.currency)}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Savings</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatCurrency(savings, agreement.currency)}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Delivery</span>
            <span className="text-xs font-medium text-slate-300">
              {deliveryDays} business days
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="text-xs text-slate-400">Payment Provider</span>
            <span className="text-xs font-semibold text-[#009cde] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#009cde] animate-pulse" />
              <span>PayPal Sandbox</span>
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <span className="font-semibold block">PayPal Order Creation Failed:</span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-3">
          {approvalUrl ? (
            <a
              href={approvalUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#FFC439] hover:bg-[#F2B930] text-[#003087] font-bold rounded-xl shadow-md transition-all text-base"
            >
              <span>Click here if not redirected automatically</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <Button
              variant="paypal"
              size="lg"
              className="w-full flex items-center justify-center gap-2 text-base font-bold"
              onClick={handleExecutePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Secure PayPal Checkout...</span>
                </>
              ) : (
                <>
                  <span>Continue to PayPal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Final payment amount is validated server-side. AI agents cannot alter checkout parameters.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
