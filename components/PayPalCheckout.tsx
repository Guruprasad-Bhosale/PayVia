"use client";

import React, { useState } from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import SlideCommit from "./react-bits/SlideCommit";
import { 
  Lock, 
  AlertCircle, 
  CreditCard, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  SlidersHorizontal
} from "lucide-react";

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
  const [useSlider, setUseSlider] = useState(false);

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
    <Card className="border-border bg-card shadow-lg overflow-hidden">
      {/* PayPal Top Accent Stripe */}
      <div className="h-1.5 bg-[#0070BA] w-full" />

      <CardHeader className="border-b border-border bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070BA]/10 border border-[#0070BA]/30 flex items-center justify-center text-[#0070BA]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground">PayPal Sandbox Settlement</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Authoritative server-validated checkout session
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-white px-3 py-1.5 rounded-full border border-border shadow-sm">
            <Lock className="w-3.5 h-3.5 text-payvia-success" />
            <span className="font-semibold text-payvia-navy">SSL 256-Bit</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Itemized Payment Summary */}
        <div className="rounded-xl bg-slate-50 border border-border divide-y divide-border">
          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Product Item</span>
            <span className="text-sm font-bold text-foreground">{agreement.productName}</span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Original List Price</span>
            <span className="text-sm font-medium text-muted-foreground line-through">
              {formatCurrency(originalPrice, agreement.currency)}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between bg-blue-50/60">
            <span className="text-xs text-payvia-navy font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-payvia-blue" />
              <span>Negotiated Price to Pay</span>
            </span>
            <span className="text-xl font-black text-payvia-navy">
              {formatCurrency(finalPrice, agreement.currency)}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between bg-emerald-50/50">
            <span className="text-xs text-emerald-800 font-semibold">Total Savings</span>
            <span className="text-sm font-bold text-payvia-success">
              {formatCurrency(savings, agreement.currency)}
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Delivery Commitment</span>
            <span className="text-xs font-bold text-foreground">
              {deliveryDays} business days SLA
            </span>
          </div>

          <div className="p-4 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Settlement Channel</span>
            <span className="text-xs font-bold text-[#003087] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0070BA] animate-pulse" />
              <span>PayPal Orders v2 Sandbox</span>
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-payvia-error text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">PayPal Order Creation Error:</span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-payvia-navy text-xs flex items-center gap-2 font-medium">
            <Loader2 className="w-4 h-4 text-payvia-blue animate-spin flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Preferred Checkout Interaction:</span>
            <button
              type="button"
              onClick={() => setUseSlider(!useSlider)}
              className="text-payvia-blue hover:text-payvia-navy font-medium flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{useSlider ? "Use PayPal button" : "Use Slide-to-Pay"}</span>
            </button>
          </div>

          {approvalUrl ? (
            <a
              href={approvalUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#FFC439] hover:bg-[#F2B930] text-[#003087] font-extrabold rounded-xl shadow-md transition-all text-base"
            >
              <span>Click to redirect to PayPal Sandbox</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : useSlider ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <SlideCommit
                label="Slide to Pay with PayPal"
                doneLabel="Redirecting..."
                errorLabel="Payment Error"
                onConfirm={handleExecutePayment}
                trackColor="#E2E8F0"
                handleColor="#003087"
                successColor="#16845B"
                dangerColor="#D92D20"
                width={320}
                height={54}
                radius={27}
              />
              <span className="text-[11px] text-muted-foreground">
                Slide right to initiate secure PayPal session
              </span>
            </div>
          ) : (
            <Button
              variant="paypal"
              size="lg"
              className="w-full flex items-center justify-center gap-2 text-base font-bold shadow-md hover:shadow-lg transition-all"
              onClick={handleExecutePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#003087]" />
                  <span>Preparing Secure PayPal Checkout...</span>
                </>
              ) : (
                <>
                  <span>Pay with PayPal</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-[#003087]" />
                </>
              )}
            </Button>
          )}

          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground text-center pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-payvia-success" />
            <span>Server-authoritative amount validation. Price is immutable once locked.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
