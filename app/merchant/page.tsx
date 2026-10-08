"use client";

import React, { useState, useEffect } from "react";
import { MerchantAnalyticsDataset } from "@/lib/merchant/types";
import { formatCurrency } from "@/lib/utils";
import { MerchantGrid } from "@/components/merchant/MerchantGrid";
import { MerchantStudioDashboard } from "@/components/merchant/MerchantStudioDashboard";
import { MerchantAiPanel } from "@/components/merchant/MerchantAiPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  TrendingUp,
  DollarSign,
  Percent,
  CheckCircle2,
  RefreshCw,
  ShoppingBag,
  Zap,
  Activity,
  Bot,
} from "lucide-react";
import Link from "next/link";

export default function MerchantPage() {
  const [dataset, setDataset] = useState<MerchantAnalyticsDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/merchant/analytics");
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setDataset(data.data);
      }
    } catch (e) {
      console.error("Failed to load merchant analytics:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading || !dataset) {
    return (
      <div className="text-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" />
        <p className="text-sm text-slate-400">Loading PayVia Merchant Command Center...</p>
      </div>
    );
  }

  const { kpis } = dataset;

  return (
    <div className="space-y-10 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple" className="gap-1">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>AG Grid & AG Studio Integration</span>
            </Badge>
            <Badge variant="info" className="gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span>Live Commerce Telemetry</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Merchant Command Center
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time analytics, automated pricing yield, and AI intelligence for PayVia merchant partners.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={refreshing}
            className="gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh Analytics</span>
          </Button>

          <Link href="/negotiate">
            <Button size="sm" className="gap-2 text-xs shadow-md shadow-blue-500/20">
              <Bot className="w-3.5 h-3.5" />
              <span>Launch Negotiator</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Level KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Negotiations */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Negotiations</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {kpis.totalNegotiations}
          </div>
          <span className="text-[10px] text-slate-500 block">Across all catalogs</span>
        </div>

        {/* Completed Transactions */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Agreed Deals</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {kpis.completedTransactions}
          </div>
          <span className="text-[10px] text-slate-500 block">Consensus reached</span>
        </div>

        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Negotiated Revenue</span>
            <DollarSign className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {formatCurrency(kpis.totalRevenue, "USD")}
          </div>
          <span className="text-[10px] text-slate-500 block">Settled via PayPal</span>
        </div>

        {/* Average Discount % */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Avg Customer Savings</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {kpis.averageSavingsPct}%
          </div>
          <span className="text-[10px] text-slate-500 block">
            Total saved: ${kpis.totalSavings.toFixed(2)}
          </span>
        </div>

        {/* Acceptance Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Acceptance Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            {kpis.acceptanceRate}%
          </div>
          <span className="text-[10px] text-slate-500 block">Agent conversion yield</span>
        </div>
      </div>

      {/* AG Studio Analytics Visualizations */}
      <section className="space-y-4">
        <MerchantStudioDashboard dataset={dataset} />
      </section>

      {/* AG Grid Live Activity Table */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Negotiation Activity & Settlement Ledger
            </h2>
          </div>
          <Badge variant="default" className="text-[11px] font-mono">
            AG Grid Community v36
          </Badge>
        </div>

        <MerchantGrid records={dataset.records} />
      </section>

      {/* Merchant AI Analyst Intelligence Section */}
      <section className="space-y-4">
        <MerchantAiPanel />
      </section>
    </div>
  );
}
