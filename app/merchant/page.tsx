"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MerchantAnalyticsDataset } from "@/lib/merchant/types";
import { formatCurrency } from "@/lib/utils";
import { MerchantGrid } from "@/components/merchant/MerchantGrid";
import { MerchantStudioDashboard } from "@/components/merchant/MerchantStudioDashboard";
import { MerchantPolicyEditor } from "@/components/merchant/MerchantPolicyEditor";
import { MerchantAgentSimulator } from "@/components/merchant/MerchantAgentSimulator";
import { MerchantProductCatalog } from "@/components/merchant/MerchantProductCatalog";
import { PayViaConnectDeveloper } from "@/components/merchant/PayViaConnectDeveloper";
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
  Sliders,
  Play,
  Package,
  Code,
  ShieldCheck,
  BarChart3,
  Table,
} from "lucide-react";
import Link from "next/link";

type MerchantTab = "overview" | "products" | "policy" | "simulator" | "transactions" | "analytics" | "developer";

function MerchantContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as MerchantTab) || "overview";

  const [activeTab, setActiveTab] = useState<MerchantTab>(initialTab);
  const [dataset, setDataset] = useState<MerchantAnalyticsDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get("tab") as MerchantTab;
    if (tabParam && ["overview", "products", "policy", "simulator", "transactions", "analytics", "developer"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

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
        <p className="text-sm text-slate-400">Loading PayVia Connect Control Plane...</p>
      </div>
    );
  }

  const { kpis } = dataset;

  const tabs: { id: MerchantTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
    { id: "products", label: "Products", icon: <Package className="w-4 h-4" /> },
    { id: "policy", label: "Negotiation Rules", icon: <Sliders className="w-4 h-4" />, badge: "Active" },
    { id: "simulator", label: "Agent Preview", icon: <Play className="w-4 h-4" />, badge: "Test" },
    { id: "transactions", label: "Transactions", icon: <Table className="w-4 h-4" />, badge: "AG Grid" },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" />, badge: "AG Studio" },
    { id: "developer", label: "Developer", icon: <Code className="w-4 h-4" />, badge: "API / SDK" },
  ];

  return (
    <div className="space-y-8 py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="purple" className="gap-1 text-xs">
              <Zap className="w-3 h-3 text-purple-400" />
              <span>PAYVIA CONNECT · MERCHANT CONTROL PLANE</span>
            </Badge>
            <Badge variant="success" className="gap-1 text-xs">
              <ShieldCheck className="w-3 h-3" />
              <span>AI Negotiation: ACTIVE</span>
            </Badge>
            <span className="text-xs font-mono text-slate-400">Policy v2.4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Make Your Commerce Negotiable.
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Define what you&apos;re willing to negotiate. PayVia lets AI handle the conversation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={refreshing}
            className="gap-2 text-xs border-slate-700 bg-slate-900"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href="/negotiate">
            <Button size="sm" className="gap-2 text-xs bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 font-bold">
              <span>Test as Buyer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80"
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-800 text-blue-400"
                  }`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Negotiations</span>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {kpis.totalNegotiations}
              </div>
              <span className="text-[10px] text-slate-500 block">Actual session records</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Agreements</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {kpis.completedTransactions}
              </div>
              <span className="text-[10px] text-slate-500 block">Consensus reached</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Settlement Volume</span>
                <DollarSign className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-extrabold text-white font-mono">
                {formatCurrency(kpis.totalRevenue, "USD")}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium block">PayPal Orders v2</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Avg Customer Savings</span>
                <Percent className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-400 font-mono">
                {kpis.averageSavingsPct}%
              </div>
              <span className="text-[10px] text-slate-500 block">
                Saved: ${kpis.totalSavings.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Conversion Rate</span>
                <TrendingUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-extrabold text-indigo-400 font-mono">
                {kpis.acceptanceRate}%
              </div>
              <span className="text-[10px] text-slate-500 block">Consensus rate</span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab("policy")}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Configure Negotiation Policy</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Set minimum floor prices, max concession step per turn, delivery bounds, and payment timing discounts.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("simulator")}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Play className="w-4 h-4 text-indigo-400" />
                <span>Test Merchant Agent</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simulate buyer bids against your private policy rules and preview automated agent decisions in real time.
              </p>
            </div>

            <div
              onClick={() => setActiveTab("developer")}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Code className="w-4 h-4 text-emerald-400" />
                <span>Connect via API / SDK</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access your platform API keys, embed the TypeScript SDK, and configure webhooks for automated settlement capture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === "products" && (
        <div>
          <MerchantProductCatalog merchantId="merchant_default" />
        </div>
      )}

      {/* Tab 3: Negotiation Rules (Policy Editor) */}
      {activeTab === "policy" && (
        <div>
          <MerchantPolicyEditor
            merchantId="merchant_default"
            onSaveSuccess={loadAnalytics}
          />
        </div>
      )}

      {/* Tab 4: Agent Preview (Simulator) */}
      {activeTab === "simulator" && (
        <div>
          <MerchantAgentSimulator merchantId="merchant_default" />
        </div>
      )}

      {/* Tab 5: Transactions (AG Grid) */}
      {activeTab === "transactions" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-400" />
              <h2 className="text-base font-bold text-white">
                Negotiation Activity &amp; PayPal Settlement Ledger
              </h2>
            </div>
            <Badge variant="default" className="text-[11px] font-mono">
              AG Grid Community v36
            </Badge>
          </div>
          <MerchantGrid records={dataset.records} />
        </section>
      )}

      {/* Tab 6: Analytics (AG Studio) */}
      {activeTab === "analytics" && (
        <section className="space-y-4">
          <MerchantStudioDashboard dataset={dataset} />
        </section>
      )}

      {/* Tab 7: Developer */}
      {activeTab === "developer" && (
        <div>
          <PayViaConnectDeveloper platformId="plat_default" />
        </div>
      )}
    </div>
  );
}

export default function MerchantPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" />
        <p className="text-sm text-slate-400">Loading PayVia Connect Control Plane...</p>
      </div>
    }>
      <MerchantContent />
    </Suspense>
  );
}

