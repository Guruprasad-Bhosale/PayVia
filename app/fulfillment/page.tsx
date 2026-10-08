"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FulfillmentPlan } from "@/types/fulfillment";
import { FulfillmentHeader } from "@/components/fulfillment/FulfillmentHeader";
import { BryntumScheduler } from "@/components/fulfillment/BryntumScheduler";
import { FulfillmentAiPanel } from "@/components/fulfillment/FulfillmentAiPanel";
import { TaskBreakdownTable } from "@/components/fulfillment/TaskBreakdownTable";
import { Card } from "@/components/ui/card";
import { RefreshCw, Package } from "lucide-react";
import Link from "next/link";

function FulfillmentContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get("negotiationId") || searchParams.get("id") || searchParams.get("agreementId");

  const [plan, setPlan] = useState<FulfillmentPlan | null>(null);
  const [allPlans, setAllPlans] = useState<FulfillmentPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFulfillmentData() {
      setLoading(true);
      try {
        // Fetch all available plans for the switcher
        const allRes = await fetch("/api/fulfillment");
        const allData = await allRes.json();
        if (allRes.ok && allData.success && allData.plans) {
          setAllPlans(allData.plans);
        }

        // Fetch targeted plan or default to first
        let currentPlan: FulfillmentPlan | null = null;
        if (targetId) {
          const res = await fetch(`/api/fulfillment?id=${encodeURIComponent(targetId)}`);
          const data = await res.json();
          if (res.ok && data.success && data.plan) {
            currentPlan = data.plan;
          }
        }

        if (!currentPlan && allData.plans && allData.plans.length > 0) {
          currentPlan = allData.plans[0];
        }

        setPlan(currentPlan);
      } catch (err) {
        console.error("[Fulfillment Page Load Error]:", err);
      } finally {
        setLoading(false);
      }
    }

    loadFulfillmentData();
  }, [targetId]);

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3 text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-sm font-medium">Loading PayVia Fulfillment Intelligence & Bryntum Engine...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <Card className="p-8 text-center border-slate-800 bg-slate-900/60 max-w-lg mx-auto space-y-4">
        <Package className="w-12 h-12 text-slate-500 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white">No Fulfillment Plan Found</h2>
          <p className="text-xs text-slate-400">
            Complete an AI negotiation and PayPal settlement to generate an operational fulfillment schedule.
          </p>
        </div>
        <Link href="/negotiate">
          <button className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
            Start New Negotiation
          </button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Plan Selector Switcher (if multiple plans exist) */}
      {allPlans.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Package className="w-4 h-4 text-blue-400" />
            <span>Select Active Fulfillment Schedule:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {allPlans.map((p) => {
              const isActive = plan.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPlan(p)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs flex items-center gap-1.5 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                  }`}
                >
                  <span>{p.productName}</span>
                  <span className="text-[10px] opacity-75">({p.negotiatedDeliveryDays}d)</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Header with KPIs, Status, Promised Date, and Savings */}
      <FulfillmentHeader plan={plan} />

      {/* 2. Bryntum Interactive Scheduler & Timeline */}
      <BryntumScheduler plan={plan} />

      {/* 3. Operational Grid: Fulfillment AI Panel & Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FulfillmentAiPanel plan={plan} />
        </div>
        <div className="lg:col-span-2">
          <TaskBreakdownTable plan={plan} />
        </div>
      </div>
    </div>
  );
}

export default function FulfillmentPage() {
  return (
    <div className="space-y-6 py-2">
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center text-slate-400 text-sm gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
            <span>Loading Fulfillment Intelligence...</span>
          </div>
        }
      >
        <FulfillmentContent />
      </Suspense>
    </div>
  );
}
