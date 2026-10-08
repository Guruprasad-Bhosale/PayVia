import React from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, ShieldCheck, ArrowRight, DollarSign, Sparkles, Clock, UserCheck, Store, ShieldAlert } from "lucide-react";

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
  const buyerLimit = agreement.buyerMaxPrice ?? null;
  const merchantFloor = agreement.merchantMinPrice ?? null;

  return (
    <Card className="border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Negotiation Complete</CardTitle>
              <CardDescription>
                Buyer and Merchant AI agents have reached an agreed settlement price
              </CardDescription>
            </div>
          </div>
          <Badge variant="success">✓ {agreement.status === "AGREED" ? "ACCEPTED" : agreement.status}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Price & Savings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Original Price</span>
            <span className="text-2xl font-bold text-slate-400 line-through">
              {formatCurrency(originalPrice, agreement.currency)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1">Merchant List Price</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/40 ring-1 ring-emerald-500/20">
            <span className="text-xs text-emerald-400 font-semibold block mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Final Negotiated Price</span>
            </span>
            <span className="text-3xl font-extrabold text-white">
              {formatCurrency(finalPrice, agreement.currency)}
            </span>
            <span className="text-[11px] text-emerald-400/90 block mt-1 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Validated by PayVia Core</span>
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/20 bg-emerald-950/10">
            <span className="text-xs text-emerald-400 font-medium block mb-1">You Save</span>
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
              <span>{deliveryDays}-day guaranteed delivery</span>
            </span>
          </div>
        </div>

        {/* Boundary Parameters Transparency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Buyer Maximum Budget</span>
            </div>
            <span className="font-semibold text-white">
              {buyerLimit ? formatCurrency(buyerLimit, agreement.currency) : "Enforced"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Store className="w-4 h-4 text-amber-400" />
              <span>Merchant Minimum Floor</span>
            </div>
            <span className="font-semibold text-white">
              {merchantFloor ? formatCurrency(merchantFloor, agreement.currency) : "Protected"}
            </span>
          </div>
        </div>

        {/* Summary of Terms */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Summary of Negotiated Terms</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            {agreement.termsSummary || `Buyer Agent negotiated final purchase price of ${formatCurrency(finalPrice, agreement.currency)} (saving ${formatCurrency(savings, agreement.currency)}) with ${deliveryDays}-day delivery.`}
          </p>
        </div>

        {/* Human in the loop action & safety microcopy */}
        {!isApproved && onApprove && (
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                  <span>AI proposes. You approve.</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  AI cannot make this payment without your approval.
                </p>
              </div>
              <Button
                onClick={onApprove}
                disabled={isLoading}
                className="w-full sm:w-auto shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-2.5 text-sm"
                size="lg"
              >
                <span>{isLoading ? "Validating Terms..." : `Approve & Pay ${formatCurrency(finalPrice, agreement.currency)}`}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
