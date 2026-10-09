import React from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, ShieldCheck, ArrowRight, DollarSign, Sparkles, Clock, Calendar, Package, Lock } from "lucide-react";

interface AgreementCardProps {
  agreement: NegotiationAgreement;
  onApprove?: () => void;
  isApproved?: boolean;
  isLoading?: boolean;
}

export function AgreementCard({
  agreement,
  onApprove,
  isApproved = false,
  isLoading = false,
}: AgreementCardProps) {
  const finalPrice = agreement.finalPrice ?? agreement.finalAgreedPrice ?? 0;
  const originalPrice = agreement.originalPrice ?? 0;
  const savings = agreement.savings ?? agreement.savingsAmount ?? (originalPrice - finalPrice);
  const savingsPct = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(2) : "0.00";
  const deliveryDays = agreement.deliveryDays ?? 3;
  const quantity = 1;

  return (
    <Card className="border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-white tracking-tight">
                AGREEMENT READY
              </CardTitle>
              <CardDescription className="text-slate-300 font-medium text-sm mt-0.5">
                Both agents agreed to these terms.
              </CardDescription>
            </div>
          </div>
          <Badge variant="success" className="px-3 py-1 text-xs uppercase tracking-wider font-bold">
            ✓ LOCKED
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {/* Core Price & Savings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Original List Price</span>
            <span className="text-2xl font-bold text-slate-400 line-through">
              {formatCurrency(originalPrice, agreement.currency)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Merchant Baseline</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 ring-1 ring-emerald-500/20">
            <span className="text-xs text-emerald-400 font-semibold block mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Negotiated Price</span>
            </span>
            <span className="text-3xl font-extrabold text-white">
              {formatCurrency(finalPrice, agreement.currency)}
            </span>
            <span className="text-[11px] text-emerald-400/90 block mt-1 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Agreed by Buyer & Merchant AI</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 bg-emerald-950/10">
            <span className="text-xs text-emerald-400 font-medium block mb-1">Total Savings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-emerald-400">
                {formatCurrency(savings, agreement.currency)}
              </span>
              <span className="text-xs font-semibold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-full">
                {savingsPct}%
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{deliveryDays}-day delivery guaranteed</span>
            </span>
          </div>
        </div>

        {/* Agreed Transaction Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Quantity</span>
            </span>
            <span className="font-bold text-white text-sm block">{quantity} unit</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Delivery Time</span>
            </span>
            <span className="font-bold text-white text-sm block">{deliveryDays} business days</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Payment Timing</span>
            </span>
            <span className="font-bold text-white text-sm block">Immediate upon approval</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>Agreement State</span>
            </span>
            <span className="font-bold text-emerald-400 text-sm block">Immutable (SHA-256)</span>
          </div>
        </div>

        {/* Summary of Terms */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Economic Terms Summary</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            {agreement.termsSummary || `Buyer Agent negotiated final purchase price of ${formatCurrency(finalPrice, agreement.currency)} (saving ${formatCurrency(savings, agreement.currency)}) with ${deliveryDays}-day guaranteed fulfillment.`}
          </p>
        </div>

        {/* Human Approval Gate */}
        {!isApproved && onApprove && (
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>Human Approval Gate</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  PayVia will not charge your PayPal account without your explicit confirmation.
                </p>
              </div>
              <Button
                onClick={onApprove}
                disabled={isLoading}
                className="w-full sm:w-auto shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 text-sm"
                size="lg"
              >
                <span>{isLoading ? "Locking Protocol..." : "Approve & Pay with PayPal"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
