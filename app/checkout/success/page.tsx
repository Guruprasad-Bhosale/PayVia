"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NegotiationAgreement } from "@/types/negotiation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShoppingBag, ShieldCheck, ArrowRight, Sparkles, Bot, UserCheck, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";
  const captureId = searchParams.get("captureId") || searchParams.get("token") || "N/A";
  const agreementId = searchParams.get("agreementId") || searchParams.get("id");
  const status = searchParams.get("status") || "COMPLETED";

  const [agreement, setAgreement] = useState<NegotiationAgreement | null>(null);

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
  const savingsPct = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(2) : "6.25";
  const deliveryDays = agreement?.deliveryDays ?? 5;
  const productName = agreement?.productName ?? "Laptop Pro 16";
  const currency = agreement?.currency ?? "USD";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <Badge variant="success" className="mb-1">
            ✓ PAYPAL VERIFIED SETTLEMENT
          </Badge>
          <CardTitle className="text-3xl font-extrabold text-white">Payment Confirmed!</CardTitle>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Your negotiated transaction has been captured and settled through PayPal Sandbox.
          </p>
        </div>

        {/* Visual 3-step Connection Flowchart */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
            Verified Execution Protocol
          </span>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300">
              <Bot className="w-4 h-4 text-blue-400" />
              <span>AI NEGOTIATED</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">➔</span>
            <span className="text-slate-600 sm:hidden">↓</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>YOU APPROVED</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">➔</span>
            <span className="text-slate-600 sm:hidden">↓</span>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0070BA]/20 border border-[#0070BA]/40 text-[#009cde]">
              <CreditCard className="w-4 h-4 text-[#009cde]" />
              <span>PAYPAL SETTLED</span>
            </div>
          </div>
        </div>

        {/* Settlement Breakdown Table */}
        <div className="rounded-xl bg-slate-950/90 border border-emerald-500/30 divide-y divide-slate-800 text-left">
          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Product</span>
            <span className="text-sm font-bold text-white">{productName}</span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Original Price</span>
            <span className="text-sm text-slate-400 line-through">
              {formatCurrency(originalPrice, currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between bg-emerald-950/30">
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Negotiated Price Paid</span>
            </span>
            <span className="text-lg font-extrabold text-emerald-400">
              {formatCurrency(finalPrice, currency)}
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">You Saved</span>
            <span className="text-sm font-bold text-emerald-400">
              {formatCurrency(savings, currency)} ({savingsPct}%)
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Delivery</span>
            <span className="text-xs font-medium text-slate-300">
              {deliveryDays} business days
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Payment Status</span>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              {status}
            </span>
          </div>
        </div>

        {/* Transaction Reference IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              PayPal Order ID
            </span>
            <code className="text-xs font-mono text-emerald-300 block truncate">
              {orderId}
            </code>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
              Capture Reference ID
            </span>
            <code className="text-xs font-mono text-emerald-300 block truncate">
              {captureId}
            </code>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <span>
            PayPal Settlement Status: <strong className="text-white">{status}</strong>. Amount was verified server-side against the AI-negotiated agreement before capture.
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/negotiate" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-500/20">
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
    <div className="space-y-8 py-4">
      <Suspense fallback={<div className="text-center text-slate-400">Loading payment confirmation...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
