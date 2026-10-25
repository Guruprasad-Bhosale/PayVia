"use client";

import React, { useState } from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { 
  Lock, 
  AlertCircle, 
  CreditCard, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Store,
  Clock,
  ArrowRight
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

  const finalPrice = agreement.finalPrice ?? agreement.finalAgreedPrice ?? 0;
  const originalPrice = agreement.originalPrice ?? 0;
  const savings = agreement.savings ?? agreement.savingsAmount ?? (originalPrice - finalPrice);
  const deliveryDays = agreement.deliveryDays ?? 3;
  const merchantName = agreement.merchantName || "Verified Commerce Merchant";

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
    <Card className="border-[#E2E8F0] bg-white shadow-sm overflow-hidden rounded-2xl">
      {/* PayPal Top Accent Stripe */}
      <div className="h-1 bg-[#0070BA] w-full" />

      <CardHeader className="border-b border-[#E2E8F0] bg-[#F8FAFC] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070BA]/10 border border-[#0070BA]/20 flex items-center justify-center text-[#0070BA] flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-[#0A192F]">PayPal Sandbox Settlement</CardTitle>
              <p className="text-xs text-[#475569] mt-0.5">
                Authoritative server-validated checkout session
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#475569] bg-white px-3 py-1 rounded-full border border-[#E2E8F0] shadow-2xs self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-[#0E6245]" />
            <span className="font-semibold text-[#0A192F]">TLS 256-Bit Encrypted</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-5 sm:p-6">
        {/* Itemized Payment Summary */}
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] divide-y divide-[#E2E8F0]">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Product Item</span>
            <span className="text-sm font-bold text-[#0A192F] text-right">{agreement.productName}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Fulfilling Merchant</span>
            <span className="text-xs font-semibold text-[#0052CC] flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              <span>{merchantName}</span>
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Original List Price</span>
            <span className="text-sm font-medium text-[#94A3B8] line-through font-mono">
              {formatCurrency(originalPrice, agreement.currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between bg-[#F0F5FF]">
            <span className="text-xs text-[#0A192F] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Negotiated Price to Pay</span>
            </span>
            <span className="text-xl font-extrabold text-[#0A192F] font-mono">
              {formatCurrency(finalPrice, agreement.currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between bg-[#ECFDF5]">
            <span className="text-xs text-[#0E6245] font-semibold">Total Savings</span>
            <span className="text-sm font-bold text-[#0E6245] font-mono">
              +{formatCurrency(savings, agreement.currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Delivery SLA</span>
            <span className="text-xs font-bold text-[#0A192F] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#475569]" />
              <span>{deliveryDays} business days</span>
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Settlement Channel</span>
            <span className="text-xs font-bold text-[#003087] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0070BA] animate-pulse" />
              <span>PayPal Orders v2 Sandbox</span>
            </span>
          </div>
        </div>

        {/* Guidance Note */}
        <div className="p-3.5 rounded-xl bg-[#F0F5FF] border border-[#0052CC]/20 text-xs text-[#0A192F] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
            <span>How PayPal Settlement Works</span>
          </div>
          <p className="text-[#475569] leading-relaxed">
            Clicking the button below redirects you to PayPal Sandbox. Log in with your test account, authorize the charge, and you will return to PayVia for verified confirmation.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/30 text-[#991B1B] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">PayPal Order Error:</span>
              <p className="leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {statusMessage && !errorMessage && (
          <div className="p-3.5 rounded-xl bg-[#F0F5FF] border border-[#0052CC]/30 text-[#0A192F] text-xs flex items-center gap-2 font-medium">
            <Loader2 className="w-4 h-4 text-[#0052CC] animate-spin flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {approvalUrl ? (
            <a
              href={approvalUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold rounded-xl shadow-xs transition-all text-base min-h-[48px]"
            >
              <span>Click to redirect to PayPal Sandbox</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <Button
              size="lg"
              className="w-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold text-base py-4 min-h-[48px] shadow-xs hover:shadow-sm transition-all gap-2"
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

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#475569] text-center pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0E6245]" />
            <span>Server-authoritative amount validation. Price is locked to {formatCurrency(finalPrice, agreement.currency)}.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PayPalCheckout;
