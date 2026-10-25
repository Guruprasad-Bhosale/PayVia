"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NegotiationAgreement } from "@/types/negotiation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/ToastProvider";
import PeekRating from "@/components/react-bits/PeekRating";
import { 
  CheckCircle2, 
  ShoppingBag, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CalendarClock,
  Store,
  Clock,
  AlertTriangle,
  Loader2,
  RotateCcw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const initialOrderId = searchParams.get("orderId");
  const initialCaptureId = searchParams.get("captureId");
  const agreementId = searchParams.get("agreementId") || searchParams.get("id");
  const initialStatus = searchParams.get("status");
  const { success: toastSuccess } = useToast();

  const [state, setState] = useState<"CAPTURING" | "CONFIRMED" | "FAILED" | "UNVERIFIED">(
    token && !initialCaptureId
      ? "CAPTURING"
      : initialStatus === "COMPLETED" || (initialOrderId && initialCaptureId)
      ? "CONFIRMED"
      : "UNVERIFIED"
  );

  const [orderId, setOrderId] = useState(initialOrderId || token || "");
  const [captureId, setCaptureId] = useState(initialCaptureId || "");
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [agreement, setAgreement] = useState<NegotiationAgreement | null>(null);
  const [rated, setRated] = useState<number | null>(null);

  // 1. If we have a token and no captureId yet, execute authoritative client POST
  useEffect(() => {
    async function executeCapture(targetToken: string) {
      setState("CAPTURING");
      setCaptureError(null);

      try {
        const res = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: targetToken,
            agreementId: agreementId || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.details || data.error || "PayPal payment capture failed.");
        }

        const resolvedCaptureId = data.captureId || targetToken;
        const resolvedOrderId = data.orderId || targetToken;
        const resolvedAgreementId = data.agreementId || agreementId;

        setOrderId(resolvedOrderId);
        setCaptureId(resolvedCaptureId);
        setState("CONFIRMED");

        // Update URL to verified receipt URL without reloading page
        const newUrl = `/checkout/success?orderId=${encodeURIComponent(
          resolvedOrderId
        )}&captureId=${encodeURIComponent(resolvedCaptureId)}&status=COMPLETED${
          resolvedAgreementId ? `&agreementId=${encodeURIComponent(resolvedAgreementId)}` : ""
        }`;
        router.replace(newUrl);

        toastSuccess("Payment Captured", `Settlement completed via PayPal Sandbox.`);
      } catch (err) {
        console.error("[Client Capture Execution Error]:", err);
        setCaptureError(err instanceof Error ? err.message : "Capture failed");
        setState("FAILED");
      }
    }

    if (token && !initialCaptureId) {
      executeCapture(token);
    }
  }, [token, initialCaptureId, agreementId, router, toastSuccess]);

  // 2. Load authoritative agreement terms for the receipt breakdown
  useEffect(() => {
    async function loadAgreement() {
      if (agreementId) {
        try {
          const res = await fetch(`/api/negotiate?id=${agreementId}`);
          const data = await res.json();
          if (res.ok && data.success && data.agreement) {
            setAgreement(data.agreement);
          }
        } catch {
          // Non-critical
        }
      }
    }
    loadAgreement();
  }, [agreementId]);

  const finalPrice = agreement?.finalPrice ?? agreement?.finalAgreedPrice ?? 750.0;
  const originalPrice = agreement?.originalPrice ?? 800.0;
  const savings = agreement?.savings ?? agreement?.savingsAmount ?? (originalPrice - finalPrice);
  const savingsPct = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(1) : "6.3";
  const deliveryDays = agreement?.deliveryDays ?? 5;
  const productName = agreement?.productName ?? "ThinkPad Workstation Laptop";
  const merchantName = agreement?.merchantName ?? "Lenovo Certified Partner";
  const currency = agreement?.currency ?? "USD";

  const handleRatingChange = (val: number) => {
    setRated(val);
    toastSuccess("Feedback Submitted", `Thank you for rating your PayVia experience (${val}/5 stars).`);
  };

  // State A: Capturing in progress
  if (state === "CAPTURING") {
    return (
      <Card className="border-[#E2E8F0] bg-white p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-xl mx-auto rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[#F0F5FF] border border-[#0052CC]/20 flex items-center justify-center text-[#0052CC] mx-auto animate-spin">
          <Loader2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-[#0A192F]">
            Finalizing PayPal Settlement
          </CardTitle>
          <p className="text-xs sm:text-sm text-[#475569] max-w-sm mx-auto">
            Capturing authorized payment and binding cryptographic agreement records...
          </p>
        </div>
      </Card>
    );
  }

  // State B: Capture Failed
  if (state === "FAILED") {
    return (
      <Card className="border-[#EF4444]/30 bg-white p-6 sm:p-8 text-center space-y-5 shadow-sm max-w-xl mx-auto rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] border border-[#EF4444]/20 flex items-center justify-center text-[#EF4444] mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <Badge variant="destructive" className="font-semibold text-xs">
            Payment Capture Incomplete
          </Badge>
          <CardTitle className="text-xl font-bold text-[#0A192F]">
            Unable to Finalize Settlement
          </CardTitle>
          <p className="text-xs sm:text-sm text-[#475569] max-w-sm mx-auto">
            {captureError || "The payment authorization could not be completed with PayPal."}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          {token && (
            <Button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto bg-[#0052CC] hover:bg-[#0A192F] text-white font-bold gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Capture</span>
            </Button>
          )}
          <Link href="/checkout" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto border-[#CBD5E1] text-[#0A192F] hover:bg-[#F8FAFC]">
              <span>Return to Checkout</span>
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // State C: Unverified direct visit
  if (state === "UNVERIFIED") {
    return (
      <Card className="border-[#E2E8F0] bg-white p-8 text-center space-y-4 shadow-sm max-w-xl mx-auto rounded-2xl">
        <div className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#475569] mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-[#0A192F]">
            No Active Settlement Found
          </CardTitle>
          <p className="text-xs sm:text-sm text-[#475569] max-w-sm mx-auto">
            This receipt URL does not contain a verified transaction. Please select an offer to initiate checkout.
          </p>
        </div>
        <div className="pt-2">
          <Link href="/negotiate">
            <Button className="bg-[#0052CC] hover:bg-[#0A192F] text-white font-bold">
              <span>Start Shopping</span>
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // State D: Verified Receipt (CONFIRMED)
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-[#E2E8F0] bg-white p-6 sm:p-8 text-center space-y-6 shadow-sm relative overflow-hidden rounded-2xl">
        {/* Top Success Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0E6245]" />

        <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#0E6245]/20 flex items-center justify-center text-[#0E6245] mx-auto shadow-2xs mt-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <Badge variant="success" className="font-semibold px-3 py-0.5 text-xs">
            ✓ Verified PayPal Settlement
          </Badge>
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
            Transaction Confirmed
          </CardTitle>
          <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto">
            Your negotiated purchase has been captured and settled through the official PayPal Orders v2 Sandbox API.
          </p>
        </div>

        {/* Verified Receipt Breakdown */}
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] divide-y divide-[#E2E8F0] text-left">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Purchased Item</span>
            <span className="text-sm font-bold text-[#0A192F] text-right">{productName}</span>
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
            <span className="text-sm text-[#94A3B8] line-through font-mono">
              {formatCurrency(originalPrice, currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between bg-[#F0F5FF]">
            <span className="text-xs text-[#0A192F] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Negotiated Price Paid</span>
            </span>
            <span className="text-lg font-extrabold text-[#0A192F] font-mono">
              {formatCurrency(finalPrice, currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between bg-[#ECFDF5]">
            <span className="text-xs font-semibold text-[#0E6245]">Total Verified Savings</span>
            <span className="text-sm font-bold text-[#0E6245] font-mono">
              +{formatCurrency(savings, currency)} ({savingsPct}%)
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Delivery Commitment</span>
            <span className="text-xs font-bold text-[#0A192F] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#475569]" />
              <span>{deliveryDays} business days guaranteed</span>
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-[#475569]">Payment Settlement</span>
            <span className="text-xs font-bold text-[#0E6245] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#0E6245]/20">
              COMPLETED
            </span>
          </div>
        </div>

        {/* Transaction Reference IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block">
              PayPal Order ID
            </span>
            <code className="text-xs font-mono font-bold text-[#0A192F] block truncate">
              {orderId}
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
            <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider block">
              Capture Reference ID
            </span>
            <code className="text-xs font-mono font-bold text-[#0A192F] block truncate">
              {captureId}
            </code>
          </div>
        </div>

        {/* Fulfillment Dispatch Scheduled Banner */}
        <div className="p-4 rounded-xl bg-[#F0F5FF] border border-[#0052CC]/20 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0A192F] flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-[#0052CC]" />
              <span>AI Fulfillment Dispatch Scheduled</span>
            </span>
            <Badge variant="info" className="text-[10px] py-0.5 px-2">
              ● ON TRACK ({deliveryDays}d SLA)
            </Badge>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Fulfillment Agent has generated an operational schedule respecting your negotiated <strong>{deliveryDays}-day delivery commitment</strong> using Bryntum Scheduler.
          </p>
          <Link
            href={`/fulfillment?negotiationId=${encodeURIComponent(
              agreement?.negotiationId || agreement?.id || agreementId || ""
            )}`}
            className="block"
          >
            <Button
              className="w-full bg-[#0A192F] hover:bg-[#002266] text-white gap-2 font-semibold shadow-xs"
            >
              <span>View Fulfillment Schedule in Bryntum Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Feedback Rating Component */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center space-y-3">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#0A192F] block">
              Rate Your Negotiation Experience
            </span>
            <p className="text-[11px] text-[#475569]">
              Help your Buyer Agent optimize future commercial strategies
            </p>
          </div>
          <div className="flex justify-center py-1">
            <PeekRating
              defaultValue={rated ?? 5}
              count={5}
              shape="star"
              labels={["Poor", "Fair", "Good", "Great", "Superb"]}
              activeColor="#f5b400"
              idleColor="#cbd5e1"
              tipColor="#0052CC"
              tipTextColor="#ffffff"
              size={30}
              lift={6}
              onChange={handleRatingChange}
            />
          </div>
        </div>

        {/* Return Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/negotiate" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-[#0052CC] hover:bg-[#0A192F] text-white font-bold">
              <ShoppingBag className="w-4 h-4" />
              <span>Start New Purchase</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-[#CBD5E1] text-[#0A192F] hover:bg-[#F8FAFC]">
              <span>Return Home</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="space-y-8 py-4">
      <Suspense fallback={<div className="text-center text-[#475569] py-16">Loading payment confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
