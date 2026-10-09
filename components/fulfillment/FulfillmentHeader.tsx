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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-payvia-navy">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <span>PAYVIA FULFILLMENT COMMAND CENTER</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                AI-Driven Fulfillment Scheduling & Operational Milestone Verification
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Channel3 vs Demo Source Badge */}
          {plan.source === "channel3" ? (
            <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 font-semibold text-payvia-navy bg-blue-50 border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-payvia-blue" />
              <span>Channel3 Live Item</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-xs py-1 px-3 text-muted-foreground">
              <Package className="w-3.5 h-3.5" />
              <span>PayVia Catalog</span>
            </Badge>
          )}

          {/* Bryntum Sponsor Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Powered by Bryntum Scheduler</span>
          </div>
        </div>
      </div>

      {/* Main KPI Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* 1. Product Info */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1 lg:col-span-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Product & Retailer
          </span>
          <div className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
            <span title={plan.productName}>{plan.productName}</span>
            {plan.productUrl && (
              <a
                href={plan.productUrl}
                target="_blank"
                rel="noreferrer"
                className="text-payvia-blue hover:text-payvia-navy"
                title="View original merchant listing"
              >
                <ExternalLink className="w-3.5 h-3.5 inline" />
              </a>
            )}
          </div>
          <div className="text-xs text-muted-foreground flex items-center justify-between pt-0.5">
            <span>Merchant: <strong className="text-foreground">{plan.merchantName}</strong></span>
            <span>{plan.productCategory}</span>
          </div>
        </div>

        {/* 2. Agreed Price & Savings */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Agreed Price
          </span>
          <div className="text-base font-black text-payvia-navy">
            {formatCurrency(plan.agreedPrice, plan.currency)}
          </div>
          <div className="text-xs text-payvia-success font-semibold">
            ${plan.savings.toFixed(2)} saved
          </div>
        </div>

        {/* 3. Negotiated Delivery Commitment */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Delivery Commitment
          </span>
          <div className="text-base font-bold text-foreground flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-payvia-blue" />
            <span>{plan.negotiatedDeliveryDays} days</span>
          </div>
          <div className="text-[11px] text-muted-foreground truncate" title={`Deadline: ${formattedDeadline}`}>
            Limit: {formattedDeadline}
          </div>
        </div>

        {/* 4. Promised Delivery Date */}
        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Promised Date
          </span>
          <div className="text-base font-bold text-payvia-navy flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-payvia-blue" />
            <span>{formattedPromised}</span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Slack: <span className={isAtRisk ? "text-amber-600 font-bold" : "text-payvia-success font-bold"}>+{plan.riskAnalysis.slackHours}h</span>
          </div>
        </div>

        {/* 5. Schedule Status */}
        <div
          className={`p-4 rounded-xl border shadow-xs space-y-1 flex flex-col justify-between ${
            isAtRisk
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-emerald-50 border-emerald-300 text-emerald-900"
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block">
            Schedule Status
          </span>
          <div className="flex items-center gap-2">
            {isAtRisk ? (
              <div className="flex items-center gap-1.5 font-black text-amber-700 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>▲ AT RISK</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 font-black text-payvia-success text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>● ON TRACK</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            {isAtRisk ? "Deadline Exceeded" : "Within Commitment"}
          </div>
        </div>
      </div>

      {/* PayPal Settlement Traceability Stripe */}
      <div className="p-3 rounded-xl bg-slate-50 border border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-payvia-success" />
          <span>
            PayPal Settlement Linked: <strong className="text-foreground font-mono">{plan.paypalOrderId}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Agreement ID: <code className="text-foreground font-mono">{plan.agreementId}</code></span>
        </div>
      </div>
    </div>
  );
};
