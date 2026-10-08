import React from "react";
import { FulfillmentPlan } from "@/types/fulfillment";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShieldCheck,
  Calendar,
  Sparkles,
  Truck,
  ExternalLink,
} from "lucide-react";

interface FulfillmentHeaderProps {
  plan: FulfillmentPlan;
}

export const FulfillmentHeader: React.FC<FulfillmentHeaderProps> = ({ plan }) => {
  const isAtRisk = plan.status === "AT_RISK";
  const deadlineDate = new Date(plan.deliveryDeadline);
  const promisedDate = new Date(plan.promisedDeliveryDate);

  const formattedPromised = promisedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedDeadline = deadlineDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Top Banner with Title and Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>PAYVIA FULFILLMENT COMMAND CENTER</span>
              </h1>
              <p className="text-xs text-slate-400">
                AI-Driven Fulfillment Scheduling & Operational Milestone Verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Channel3 vs Demo Source Badge */}
          {plan.source === "channel3" ? (
            <Badge variant="info" className="gap-1.5 text-xs py-1 px-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Channel3 Live Item</span>
            </Badge>
          ) : (
            <Badge variant="default" className="gap-1.5 text-xs py-1 px-3 text-slate-300 border-slate-700">
              <Package className="w-3.5 h-3.5" />
              <span>PayVia Catalog</span>
            </Badge>
          )}

          {/* Bryntum Sponsor Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span>Powered by Bryntum Scheduler</span>
          </div>
        </div>
      </div>

      {/* Main KPI Status Banner requested by prompt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* 1. Product Info */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 lg:col-span-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Product & Retailer
          </span>
          <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
            <span title={plan.productName}>{plan.productName}</span>
            {plan.productUrl && (
              <a
                href={plan.productUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300"
                title="View original merchant listing"
              >
                <ExternalLink className="w-3.5 h-3.5 inline" />
              </a>
            )}
          </div>
          <div className="text-xs text-slate-400 flex items-center justify-between pt-0.5">
            <span>Merchant: <strong className="text-slate-300">{plan.merchantName}</strong></span>
            <span className="text-slate-500">{plan.productCategory}</span>
          </div>
        </div>

        {/* 2. Agreed Price & Savings */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Agreed Price
          </span>
          <div className="text-base font-extrabold text-emerald-400">
            {formatCurrency(plan.agreedPrice, plan.currency)}
          </div>
          <div className="text-xs text-emerald-500/90 font-medium">
            ${plan.savings.toFixed(2)} saved
          </div>
        </div>

        {/* 3. Negotiated Delivery Commitment */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Delivery Commitment
          </span>
          <div className="text-base font-bold text-white flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{plan.negotiatedDeliveryDays} days</span>
          </div>
          <div className="text-[11px] text-slate-400 truncate" title={`Deadline: ${formattedDeadline}`}>
            Limit: {formattedDeadline}
          </div>
        </div>

        {/* 4. Promised Delivery Date */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Promised Date
          </span>
          <div className="text-base font-bold text-cyan-300 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>{formattedPromised}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Slack: <span className={isAtRisk ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>+{plan.riskAnalysis.slackHours}h</span>
          </div>
        </div>

        {/* 5. Schedule Status */}
        <div
          className={`p-4 rounded-xl border space-y-1 flex flex-col justify-between ${
            isAtRisk
              ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
              : "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider block">
            Schedule Status
          </span>
          <div className="flex items-center gap-2">
            {isAtRisk ? (
              <div className="flex items-center gap-1.5 font-extrabold text-amber-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>▲ AT RISK</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-extrabold text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>● ON TRACK</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-slate-300 truncate">
            {isAtRisk ? "Deadline Breached" : "Within Commitment"}
          </div>
        </div>
      </div>

      {/* PayPal Settlement Traceability Stripe */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            PayPal Settlement Linked: <strong className="text-white font-mono">{plan.paypalOrderId}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Agreement ID: <code className="text-slate-300 font-mono">{plan.agreementId}</code></span>
        </div>
      </div>
    </div>
  );
};
