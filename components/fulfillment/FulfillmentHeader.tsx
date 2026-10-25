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
  ArrowRight,
  Info,
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

  // Determine current active and next tasks
  const inProgressTask = plan.tasks.find((t) => t.status === "in_progress") || plan.tasks.find((t) => t.status === "pending");
  const nextTask = plan.tasks.find((t) => t.status === "pending" && t.id !== inProgressTask?.id);

  return (
    <div className="space-y-4">
      {/* Top Banner with Title and Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0A192F]">
              <Truck className="w-5 h-5 text-[#0052CC]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A192F] tracking-tight flex items-center gap-2">
                <span>PAYVIA FULFILLMENT TIMELINE</span>
              </h1>
              <p className="text-xs text-[#475569]">
                AI-Driven Fulfillment Scheduling &amp; Milestone Tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Data Source Badge */}
          {plan.source === "channel3" ? (
            <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 font-semibold text-[#0A192F] bg-blue-50 border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Channel3 Partner Item</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-xs py-1 px-3 text-[#475569] border-[#CBD5E1]">
              <Package className="w-3.5 h-3.5" />
              <span>PayVia Catalog ({plan.source === "demo" ? "Sandbox Benchmark" : "Persisted Order"})</span>
            </Badge>
          )}

          {/* Bryntum Indicator */}
          <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
            <span>Bryntum Gantt Engine</span>
          </div>
        </div>
      </div>

      {/* "What is happening now & what happens next" Direct Answer Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">Current Stage:</span>
            <span className="text-xs font-extrabold text-[#0052CC]">
              {inProgressTask ? inProgressTask.name : "Order Settlement Confirmed"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#0A192F]">
            <span className="text-[#475569]">Estimated Delivery Window:</span>
            <strong className="text-[#0E6245] font-extrabold">{formattedPromised}</strong>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#475569]">
          <div className="flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
            <span>
              <strong>Next expected action:</strong>{" "}
              {nextTask
                ? `${nextTask.name} by ${nextTask.resourceName}`
                : "Final carrier dispatch to delivery address."}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-[#475569]">
            <Info className="w-3 h-3 text-[#0052CC]" />
            <span>Dates are operational estimates based on agreed SLA ({plan.negotiatedDeliveryDays}d target).</span>
          </div>
        </div>
      </div>

      {/* Main KPI Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* 1. Product Info */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1 lg:col-span-2">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Product &amp; Retailer
          </span>
          <div className="text-sm font-bold text-[#0A192F] truncate flex items-center gap-1.5">
            <span title={plan.productName}>{plan.productName}</span>
            {plan.productUrl && (
              <a
                href={plan.productUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#0052CC] hover:text-[#0A192F]"
                title="View original merchant listing"
              >
                <ExternalLink className="w-3.5 h-3.5 inline" />
              </a>
            )}
          </div>
          <div className="text-xs text-[#475569] flex items-center justify-between pt-0.5">
            <span>Merchant: <strong className="text-[#0A192F]">{plan.merchantName}</strong></span>
            <span className="text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-[#475569]">{plan.productCategory}</span>
          </div>
        </div>

        {/* 2. Agreed Price & Savings */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Agreed Price
          </span>
          <div className="text-base font-black text-[#0A192F]">
            {formatCurrency(plan.agreedPrice, plan.currency)}
          </div>
          <div className="text-xs text-[#0E6245] font-semibold">
            ${plan.savings.toFixed(2)} saved
          </div>
        </div>

        {/* 3. Negotiated Delivery Commitment */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Delivery Commitment
          </span>
          <div className="text-base font-bold text-[#0A192F] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0052CC]" />
            <span>{plan.negotiatedDeliveryDays} days</span>
          </div>
          <div className="text-[11px] text-[#475569] truncate" title={`Deadline: ${formattedDeadline}`}>
            SLA Limit: {formattedDeadline}
          </div>
        </div>

        {/* 4. Promised Delivery Date */}
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Estimated Arrival
          </span>
          <div className="text-base font-bold text-[#0A192F] flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#0052CC]" />
            <span>{formattedPromised}</span>
          </div>
          <div className="text-[11px] text-[#475569]">
            Buffer: <span className={isAtRisk ? "text-amber-600 font-bold" : "text-[#0E6245] font-bold"}>+{plan.riskAnalysis.slackHours}h</span>
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
              <div className="flex items-center gap-1.5 font-black text-[#0E6245] text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>● ON TRACK</span>
              </div>
            )}
          </div>
          <div className="text-[10px] text-[#475569] truncate">
            {isAtRisk ? "Delay Detected" : "Within Commitment"}
          </div>
        </div>
      </div>

      {/* PayPal Settlement Traceability Stripe */}
      <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#475569]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#0E6245]" />
          <span>
            PayPal Settlement Linked: <strong className="text-[#0A192F] font-mono">{plan.paypalOrderId}</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>Agreement: <code className="text-[#0A192F] font-mono">{plan.agreementId}</code></span>
        </div>
      </div>
    </div>
  );
};
