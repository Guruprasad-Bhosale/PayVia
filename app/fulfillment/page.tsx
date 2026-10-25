"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FulfillmentPlan, FulfillmentTask } from "@/types/fulfillment";
import { FulfillmentHeader } from "@/components/fulfillment/FulfillmentHeader";
import { BryntumScheduler } from "@/components/fulfillment/BryntumScheduler";
import { FulfillmentAiPanel } from "@/components/fulfillment/FulfillmentAiPanel";
import { TaskBreakdownTable } from "@/components/fulfillment/TaskBreakdownTable";
import { Card } from "@/components/ui/card";
import {
  RefreshCw,
  Package,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";
import Link from "next/link";

function MilestoneStepper({ tasks }: { tasks: FulfillmentTask[] }) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#0052CC]" />
          <span>Fulfillment Milestone Progression</span>
        </h2>
        <span className="text-xs text-[#475569]">
          {tasks.filter((t) => t.status === "completed").length} of {tasks.length} stages complete
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {tasks.map((task, idx) => {
          const isDone = task.status === "completed";
          const isInProgress = task.status === "in_progress";
          const isRisk = task.status === "at_risk";

          return (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all space-y-2 ${
                isDone
                  ? "bg-emerald-50/60 border-emerald-200"
                  : isInProgress
                  ? "bg-blue-50/80 border-[#0052CC] ring-1 ring-[#0052CC]/20"
                  : isRisk
                  ? "bg-amber-50 border-amber-300"
                  : "bg-slate-50/70 border-[#E2E8F0]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isDone
                    ? "bg-emerald-100 text-[#0E6245]"
                    : isInProgress
                    ? "bg-blue-100 text-[#0052CC]"
                    : "bg-slate-200 text-[#475569]"
                }`}>
                  Stage {idx + 1}
                </span>

                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-[#0E6245]" />
                ) : isInProgress ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0052CC] animate-ping" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#0A192F] line-clamp-1">{task.name}</h4>
                <p className="text-[10px] text-[#475569] truncate mt-0.5">
                  Handler: {task.resourceName}
                </p>
              </div>

              <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-[#475569]">
                <span>{task.duration}{task.durationUnit} SLA</span>
                <span className={`font-semibold capitalize ${
                  isDone ? "text-[#0E6245]" : isInProgress ? "text-[#0052CC]" : "text-[#475569]"
                }`}>
                  {task.status.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FulfillmentContent() {
  const searchParams = useSearchParams();
  const targetId = searchParams.get("negotiationId") || searchParams.get("id") || searchParams.get("agreementId");

  const [plan, setPlan] = useState<FulfillmentPlan | null>(null);
  const [allPlans, setAllPlans] = useState<FulfillmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"milestones" | "gantt">("milestones");

  useEffect(() => {
    async function loadFulfillmentData() {
      setLoading(true);
      try {
        const allRes = await fetch("/api/fulfillment");
        const allData = await allRes.json();
        if (allRes.ok && allData.success && allData.plans) {
          setAllPlans(allData.plans);
        }

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
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3 text-[#475569]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#0052CC]" />
        <p className="text-sm font-medium">Loading Fulfillment Schedule &amp; Milestones...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <Card className="p-8 text-center border-[#E2E8F0] bg-white max-w-lg mx-auto space-y-4 shadow-sm my-12">
        <Package className="w-12 h-12 text-[#94A3B8] mx-auto" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-[#0A192F]">No Fulfillment Plan Found</h2>
          <p className="text-xs text-[#475569]">
            Complete an AI negotiation and PayPal settlement to generate an operational fulfillment schedule.
          </p>
        </div>
        <Link href="/negotiate">
          <button className="px-5 py-2.5 rounded-xl bg-[#0A192F] hover:bg-[#0052CC] text-white text-xs font-bold shadow-xs transition-colors">
            Start New Negotiation
          </button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {/* Plan Selector Switcher (if multiple plans exist) */}
      {allPlans.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-[#E2E8F0] text-xs shadow-xs">
          <div className="flex items-center gap-2 text-[#475569]">
            <Package className="w-4 h-4 text-[#0052CC]" />
            <span>Select Active Order:</span>
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
                      ? "bg-[#0A192F] text-white shadow-xs font-bold"
                      : "bg-[#F8FAFC] hover:bg-blue-50 text-[#475569] border border-[#E2E8F0]"
                  }`}
                >
                  <span>{p.productName}</span>
                  <span className="text-[10px] opacity-75 font-mono">({p.negotiatedDeliveryDays}d SLA)</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Header with KPIs, Status, Next Action, Promised Date, and Savings */}
      <FulfillmentHeader plan={plan} />

      {/* 2. Responsive Milestone Progression (Mobile-First) */}
      <MilestoneStepper tasks={plan.tasks} />

      {/* 3. View Mode Switcher: Milestones & Operations vs Bryntum Gantt */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("milestones")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === "milestones"
                ? "bg-[#0A192F] text-white shadow-xs"
                : "bg-slate-50 text-[#475569] hover:text-[#0A192F] border border-[#E2E8F0]"
            }`}
          >
            Milestone Operations &amp; Q&amp;A
          </button>
          <button
            onClick={() => setViewMode("gantt")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === "gantt"
                ? "bg-[#0A192F] text-white shadow-xs"
                : "bg-slate-50 text-[#475569] hover:text-[#0A192F] border border-[#E2E8F0]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Bryntum Advanced Gantt Schedule</span>
          </button>
        </div>

        <span className="text-[11px] text-[#475569] hidden sm:inline">
          {viewMode === "gantt" ? "Interactive desktop timeline" : "Operational breakdown view"}
        </span>
      </div>

      {/* 4. Active View Mode */}
      {viewMode === "gantt" ? (
        <div className="space-y-4">
          <BryntumScheduler plan={plan} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <FulfillmentAiPanel plan={plan} />
          </div>
          <div className="lg:col-span-2">
            <TaskBreakdownTable plan={plan} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FulfillmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3 text-[#475569]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#0052CC]" />
          <p className="text-sm font-medium">Loading Fulfillment Schedule &amp; Milestones...</p>
        </div>
      }
    >
      <FulfillmentContent />
    </Suspense>
  );
}
