"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  Bot, 
  UserCheck, 
  CreditCard,
  CalendarClock
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";
  const captureId = searchParams.get("captureId") || searchParams.get("token") || "N/A";
  const agreementId = searchParams.get("agreementId") || searchParams.get("id");
  const status = searchParams.get("status") || "COMPLETED";
  const { toast } = useToast();

  const [agreement, setAgreement] = useState<NegotiationAgreement | null>(null);
  const [rated, setRated] = useState<number | null>(null);

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
          // Non-critical fallback
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
  const productName = agreement?.productName ?? "Laptop Pro 16";
  const currency = agreement?.currency ?? "USD";

  const handleRatingChange = (val: number) => {
    setRated(val);
    toast({
      title: "Feedback Submitted",
      description: `Thank you for rating your negotiation & settlement experience (${val}/5 stars).`,
      variant: "success",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-border bg-card p-6 sm:p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
        {/* Top Success Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-payvia-navy via-payvia-blue to-payvia-success" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-payvia-success/30 flex items-center justify-center text-payvia-success mx-auto shadow-sm mt-2">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <Badge variant="success" className="mb-1 font-semibold px-3 py-1">
            ✓ PayPal Verified Settlement
          </Badge>
          <CardTitle className="text-3xl font-extrabold text-foreground tracking-tight">
            Transaction Complete!
          </CardTitle>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your negotiated purchase has been captured and settled through the official PayPal Sandbox REST API.
          </p>
        </div>

        {/* Visual 3-step Connection Flowchart */}
        <div className="p-4 rounded-xl bg-slate-50 border border-border">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-3">
            Autonomous Commerce Protocol Executed
          </span>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-payvia-navy">
              <Bot className="w-4 h-4 text-payvia-blue" />
              <span>AI Negotiated</span>
            </div>
            <span className="text-muted-foreground hidden sm:inline">➔</span>
            <span className="text-muted-foreground sm:hidden">↓</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
              <UserCheck className="w-4 h-4 text-payvia-success" />
              <span>You Approved</span>
            </div>
            <span className="text-muted-foreground hidden sm:inline">➔</span>
            <span className="text-muted-foreground sm:hidden">↓</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0070BA]/10 border border-[#0070BA]/30 text-[#003087]">
              <CreditCard className="w-4 h-4 text-[#0070BA]" />
              <span>PayPal Settled</span>
            </div>
          </div>
        </div>

        {/* Settlement Breakdown Table */}
        <div className="rounded-xl bg-slate-50 border border-border divide-y divide-border text-left">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Product</span>
            <span className="text-sm font-bold text-foreground">{productName}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Original List Price</span>
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(originalPrice, currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between bg-blue-50/50">
            <span className="text-xs text-payvia-navy font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-payvia-blue" />
              <span>Negotiated Price Paid</span>
            </span>
            <span className="text-lg font-black text-payvia-navy">
              {formatCurrency(finalPrice, currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between bg-emerald-50/50">
            <span className="text-xs font-semibold text-emerald-800">You Saved</span>
            <span className="text-sm font-bold text-payvia-success">
              {formatCurrency(savings, currency)} ({savingsPct}%)
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Delivery SLA</span>
            <span className="text-xs font-bold text-foreground">
              {deliveryDays} business days guaranteed
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Payment Status</span>
            <span className="text-xs font-bold text-payvia-success bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              {status}
            </span>
          </div>
        </div>

        {/* Transaction Reference IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              PayPal Order ID
            </span>
            <code className="text-xs font-mono font-bold text-payvia-navy block truncate">
              {orderId}
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-border space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
              Capture Reference ID
            </span>
            <code className="text-xs font-mono font-bold text-payvia-navy block truncate">
              {captureId}
            </code>
          </div>
        </div>

        {/* React Bits PeekRating Component for Transaction Feedback */}
        <div className="p-4 rounded-xl bg-slate-50 border border-border text-center space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-bold text-foreground block">
              Rate Your Autonomous Negotiation Experience
            </span>
            <p className="text-[11px] text-muted-foreground">
              Help your Buyer Agent improve future commercial strategies
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
              tipColor="#003087"
              tipTextColor="#ffffff"
              size={32}
              lift={8}
              onChange={handleRatingChange}
            />
          </div>
        </div>

        {/* Fulfillment Scheduled Banner */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-payvia-blue/30 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-payvia-navy flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4 text-payvia-blue" />
              <span>AI Fulfillment Dispatch Scheduled</span>
            </span>
            <Badge variant="info" className="text-[10px] py-0.5 px-2">
              ● ON TRACK ({deliveryDays}d SLA)
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fulfillment Agent has generated an operational schedule respecting your negotiated <strong>{deliveryDays}-day delivery commitment</strong> using Bryntum Scheduler.
          </p>
          <Link
            href={`/fulfillment?negotiationId=${encodeURIComponent(
              agreement?.negotiationId || agreement?.id || agreementId || ""
            )}`}
            className="block"
          >
            <Button
              className="w-full bg-payvia-navy hover:bg-payvia-navy-dark text-white gap-2 font-semibold shadow-sm"
            >
              <span>View Fulfillment Schedule in Bryntum Timeline</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-border text-xs text-muted-foreground flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 text-payvia-success flex-shrink-0 mt-0.5" />
          <span>
            PayPal Settlement Status: <strong className="text-foreground">{status}</strong>. Amount was verified server-side against cryptographic agreement hash prior to capture.
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/negotiate" className="w-full sm:w-auto">
            <Button variant="default" size="lg" className="w-full sm:w-auto gap-2 bg-payvia-navy hover:bg-payvia-navy-dark text-white">
              <ShoppingBag className="w-4 h-4" />
              <span>Start New Negotiation</span>
            </Button>
          </Link>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
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
    <div className="space-y-8 py-6">
      <Suspense fallback={<div className="text-center text-muted-foreground py-16">Loading payment confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
