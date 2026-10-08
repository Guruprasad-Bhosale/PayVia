import React from "react";
import { NegotiationAgreement } from "@/types/negotiation";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

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
  return (
    <Card className="border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 shadow-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Agreed Transaction Terms</CardTitle>
              <CardDescription>
                Both AI agents have reached a mutual consensus
              </CardDescription>
            </div>
          </div>
          <Badge variant="success">Agreement Ready</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Final Agreed Price</span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(agreement.finalAgreedPrice, agreement.currency)}
            </span>
            <span className="text-xs text-slate-500 block mt-1 line-through">
              Original: {formatCurrency(agreement.originalPrice, agreement.currency)}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Your Total Savings</span>
            <span className="text-2xl font-bold text-emerald-400">
              {formatCurrency(agreement.savingsAmount, agreement.currency)}
            </span>
            <span className="text-xs text-emerald-500/80 block mt-1 font-medium">
              Negotiated by Buyer Agent
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-xs text-slate-400 block mb-1">Delivery Tier</span>
            <span className="text-sm font-semibold text-white block truncate">
              {agreement.selectedDelivery.name}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              Est. {agreement.selectedDelivery.estimatedDays} business days
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Summary of Terms</span>
          </div>
          <p className="leading-relaxed text-slate-400">
            {agreement.termsSummary}
          </p>
        </div>

        {!isApproved && onApprove && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400">
              By approving, you authorize proceeding to PayPal Sandbox settlement.
            </p>
            <Button
              onClick={onApprove}
              disabled={isLoading}
              className="w-full sm:w-auto"
              size="lg"
            >
              <span>{isLoading ? "Processing..." : "Explicitly Approve & Settle"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
