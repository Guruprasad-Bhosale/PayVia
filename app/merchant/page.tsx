"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { MerchantAnalyticsDataset } from "@/lib/merchant/types";
import { formatCurrency } from "@/lib/utils";
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
  Sliders,
  Play,
  Code,
  ShieldCheck,
  Package,
  Receipt,
  ArrowRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import Link from "next/link";

// Lazy-load heavy sub-components
const MerchantGrid = dynamic(
  () => import("@/components/merchant/MerchantGrid").then((mod) => mod.MerchantGrid),
  {
    loading: () => (
      <div className="p-12 text-center text-xs text-[#52607A] bg-white rounded-2xl border border-[#DCE4EE]">
        Loading settlement ledger grid (AG Grid Community)...
      </div>
    ),
    ssr: false,
  }
);

const MerchantStudioDashboard = dynamic(
  () => import("@/components/merchant/MerchantStudioDashboard").then((mod) => mod.MerchantStudioDashboard),
  {
    loading: () => (
      <div className="p-12 text-center text-xs text-[#52607A] bg-white rounded-2xl border border-[#DCE4EE]">
        Loading AG Studio analytics...
      </div>
    ),
    ssr: false,
  }
);

const MerchantPolicyEditor = dynamic(
  () => import("@/components/merchant/MerchantPolicyEditor").then((mod) => mod.MerchantPolicyEditor),
  {
    loading: () => (
      <div className="p-12 text-center text-xs text-[#52607A] bg-white rounded-2xl border border-[#DCE4EE]">
        Loading policy editor...
      </div>
    ),
    ssr: false,
  }
);

const MerchantAgentSimulator = dynamic(
  () => import("@/components/merchant/MerchantAgentSimulator").then((mod) => mod.MerchantAgentSimulator),
  {
    loading: () => (
      <div className="p-12 text-center text-xs text-[#52607A] bg-white rounded-2xl border border-[#DCE4EE]">
        Loading strategy simulator...
      </div>
    ),
    ssr: false,
  }
);

const MerchantProductCatalog = dynamic(
  () => import("@/components/merchant/MerchantProductCatalog").then((mod) => mod.MerchantProductCatalog),
  {
    loading: () => (
      <div className="p-12 text-center text-xs text-[#52607A] bg-white rounded-2xl border border-[#DCE4EE]">
        Loading product catalog...
      </div>
    ),
    ssr: false,
  }
);

const PayViaConnectDeveloper = dynamic(
  () => import("@/components/merchant/PayViaConnectDeveloper").then((mod) => mod.PayViaConnectDeveloper),
  {
    loading: () => (
      <div className="p-12 text-center text-xs text-[#52607A] bg-white rounded-2xl border border-[#DCE4EE]">
        Loading developer portal...
      </div>
    ),
    ssr: false,
  }
);

type MerchantSection = "overview" | "catalog" | "policies" | "transactions";

function MerchantContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Normalize initial tab from query parameter with backward compatibility
  const resolveTab = (param: string | null): MerchantSection => {
    if (!param) return "overview";
    if (param === "products" || param === "catalog") return "catalog";
    if (param === "policy" || param === "policies" || param === "simulator") return "policies";
    if (param === "transactions" || param === "analytics" || param === "developer") return "transactions";
    return "overview";
  };

  const [activeSection, setActiveSection] = useState<MerchantSection>(resolveTab(searchParams.get("tab")));
  const [policySubView, setPolicySubView] = useState<"editor" | "simulator">(
    searchParams.get("tab") === "simulator" ? "simulator" : "editor"
  );
  const [transactionsSubView, setTransactionsSubView] = useState<"ledger" | "analytics" | "developer">(
    searchParams.get("tab") === "analytics"
      ? "analytics"
      : searchParams.get("tab") === "developer"
      ? "developer"
      : "ledger"
  );

  const [dataset, setDataset] = useState<MerchantAnalyticsDataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCatalogItemId, setSelectedCatalogItemId] = useState<string | undefined>(
    searchParams.get("itemId") || undefined
  );
  const [lastBuyerSessionId, setLastBuyerSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("payvia_last_session_id");
      if (saved) setLastBuyerSessionId(saved);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const itemParam = searchParams.get("itemId");
    if (itemParam) {
      setSelectedCatalogItemId(itemParam);
    }
    if (tabParam) {
      setActiveSection(resolveTab(tabParam));
      if (tabParam === "simulator") setPolicySubView("simulator");
      if (tabParam === "analytics") setTransactionsSubView("analytics");
      if (tabParam === "developer") setTransactionsSubView("developer");
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

  const handleTabChange = (section: MerchantSection) => {
    setActiveSection(section);
    router.replace(`/merchant?tab=${section}`, { scroll: false });
  };

  const handlePolicySubViewChange = (sub: "editor" | "simulator") => {
    setActiveSection("policies");
    setPolicySubView(sub);
    router.replace(`/merchant?tab=${sub === "simulator" ? "simulator" : "policies"}`, { scroll: false });
  };

  const handleTransactionsSubViewChange = (sub: "ledger" | "analytics" | "developer") => {
    setActiveSection("transactions");
    setTransactionsSubView(sub);
    router.replace(`/merchant?tab=${sub === "ledger" ? "transactions" : sub}`, { scroll: false });
  };

  if (loading || !dataset) {
    return (
      <div className="text-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0284C7]" />
        <p className="text-sm text-[#52607A] font-medium">Loading PayVia Merchant Control Plane...</p>
      </div>
    );
  }

  const { kpis, records } = dataset;
  const recentRecords = records.slice(0, 5);

  return (
    <div className="space-y-6 py-2">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DCE4EE] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="gap-1 text-xs font-bold text-[#0B1B33] bg-blue-50 border-blue-200">
              <Zap className="w-3 h-3 text-[#0284C7]" />
              <span>PAYVIA CONNECT · MERCHANT CONTROL PLANE</span>
            </Badge>
            <Badge variant="success" className="gap-1 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>Autonomous Rules: ACTIVE</span>
            </Badge>
            <span className="text-xs font-mono text-[#52607A] bg-slate-100 px-2 py-0.5 rounded">
              Store: merchant_default
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B33] tracking-tight">
            Merchant Operations &amp; Negotiation Control
          </h1>
          <p className="text-xs sm:text-sm text-[#52607A] mt-1 max-w-3xl">
            Configure private price floors and delivery boundaries. Your merchant AI agent negotiates autonomously within these limits, and PayPal Orders v2 settles all approved transactions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={refreshing}
            className="gap-2 text-xs border-[#DCE4EE] text-[#0B1B33] hover:bg-slate-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#0284C7]" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Link href={lastBuyerSessionId ? `/negotiate?sessionId=${encodeURIComponent(lastBuyerSessionId)}` : "/negotiate"}>
            <Button size="sm" className="gap-2 text-xs bg-[#0B1B33] hover:bg-[#0284C7] text-white font-bold shadow-xs">
              <span>Test as Buyer</span>
              <ExternalLink className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Focused Sections Navigation Bar */}
      <nav aria-label="Merchant Navigation" className="flex border-b border-[#DCE4EE] overflow-x-auto gap-2">
        <button
          onClick={() => handleTabChange("overview")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSection === "overview"
              ? "border-[#0284C7] text-[#0284C7]"
              : "border-transparent text-[#52607A] hover:text-[#0B1B33]"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Overview</span>
        </button>

        <button
          onClick={() => handleTabChange("catalog")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSection === "catalog"
              ? "border-[#0284C7] text-[#0284C7]"
              : "border-transparent text-[#52607A] hover:text-[#0B1B33]"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>2. Catalog</span>
        </button>

        <button
          onClick={() => handleTabChange("policies")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSection === "policies"
              ? "border-[#0284C7] text-[#0284C7]"
              : "border-transparent text-[#52607A] hover:text-[#0B1B33]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>3. Negotiation Policies</span>
        </button>

        <button
          onClick={() => handleTabChange("transactions")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
            activeSection === "transactions"
              ? "border-[#0284C7] text-[#0284C7]"
              : "border-transparent text-[#52607A] hover:text-[#0B1B33]"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>4. Transactions &amp; Settlements</span>
        </button>
      </nav>

      {/* SECTION 1: OVERVIEW */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          {/* Key Commerce Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#52607A] font-medium">
                <span>Negotiations</span>
                <Layers className="w-4 h-4 text-[#0284C7]" />
              </div>
              <div className="text-2xl font-black text-[#0B1B33] font-mono">
                {kpis.totalNegotiations}
              </div>
              <span className="text-[10px] text-[#52607A] block">Historical buyer sessions</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#52607A] font-medium">
                <span>Agreements Reached</span>
                <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              </div>
              <div className="text-2xl font-black text-[#059669] font-mono">
                {kpis.completedTransactions}
              </div>
              <span className="text-[10px] text-[#52607A] block">Consensus agreements locked</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#52607A] font-medium">
                <span>Settled Volume</span>
                <DollarSign className="w-4 h-4 text-[#0B1B33]" />
              </div>
              <div className="text-2xl font-black text-[#0B1B33] font-mono">
                {formatCurrency(kpis.totalRevenue, "USD")}
              </div>
              <span className="text-[10px] text-[#0284C7] font-bold block">PayPal Orders v2 Settled</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1">
              <div className="flex items-center justify-between text-xs text-[#52607A] font-medium">
                <span>Avg Discount</span>
                <Percent className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-800 font-mono">
                {kpis.averageSavingsPct}%
              </div>
              <span className="text-[10px] text-[#52607A] block">
                Total savings: ${kpis.totalSavings.toFixed(2)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-1 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-xs text-[#52607A] font-medium">
                <span>Deal Conversion</span>
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-800 font-mono">
                {kpis.acceptanceRate}%
              </div>
              <span className="text-[10px] text-[#52607A] block">Consensus conversion rate</span>
            </div>
          </div>

          {/* Operational Alerts & System Boundaries */}
          <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0B1B33] uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>Operational Health &amp; Active Policy Safeguards</span>
              </h2>
              <span className="text-xs text-[#059669] font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                All 3 Boundaries Normal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#DCE4EE] space-y-1">
                <div className="text-xs font-bold text-[#0B1B33] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Price Floor Protection</span>
                </div>
                <p className="text-[11px] text-[#52607A]">
                  Floor protected at <strong className="text-[#0B1B33]">$750.00 USD</strong>. Server-side rejection is active for all below-floor proposals.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#DCE4EE] space-y-1">
                <div className="text-xs font-bold text-[#0B1B33] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Negotiable Inventory</span>
                </div>
                <p className="text-[11px] text-[#52607A]">
                  2 items actively negotiable, 1 external listing set to discovery-only. Zero overselling incidents recorded.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-[#DCE4EE] space-y-1">
                <div className="text-xs font-bold text-[#0B1B33] flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-[#059669]" />
                  <span>PayPal Orders v2 Gateway</span>
                </div>
                <p className="text-[11px] text-[#52607A]">
                  Sandbox settlement binding active. Capture restricted to server-side verified POST requests only.
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity Snapshot */}
          <div className="p-5 rounded-2xl bg-white border border-[#DCE4EE] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h2 className="text-sm font-bold text-[#0B1B33] uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#0284C7]" />
                  <span>Recent Transaction &amp; Settlement Activity</span>
                </h2>
                <p className="text-xs text-[#52607A]">Showing latest verified sessions</p>
              </div>

              <button
                onClick={() => handleTabChange("transactions")}
                className="text-xs font-bold text-[#0284C7] hover:text-[#0B1B33] flex items-center gap-1"
              >
                <span>View Full AG Grid Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-[#DCE4EE] border border-[#DCE4EE] rounded-xl overflow-hidden">
              {recentRecords.map((r) => (
                <div key={r.id} className="p-3.5 bg-white hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-[#0B1B33]">{r.productName}</div>
                    <div className="text-[11px] text-[#52607A] font-mono">
                      Session: {r.negotiationId} · {r.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right">
                      <div className="font-mono font-bold text-[#0B1B33]">{formatCurrency(r.negotiatedPrice, r.currency)}</div>
                      <div className="text-[10px] text-[#059669]">Save ${r.savings.toFixed(2)} ({r.savingsPercentage}%)</div>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.paymentStatus === "SETTLED"
                        ? "bg-emerald-50 text-[#059669] border border-emerald-200"
                        : "bg-slate-100 text-[#52607A]"
                    }`}>
                      {r.paymentStatus === "SETTLED" ? "● SETTLED" : "UNSETTLED"}
                    </span>

                    <Link
                      href={`/fulfillment?negotiationId=${encodeURIComponent(r.negotiationId)}`}
                      className="text-[#0284C7] hover:text-[#0B1B33] font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Fulfillment</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => handleTabChange("policies")}
              className="p-5 rounded-2xl bg-white border border-[#DCE4EE] hover:border-[#0284C7]/50 hover:shadow-xs cursor-pointer transition space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B1B33]">
                <Sliders className="w-4 h-4 text-[#0284C7]" />
                <span>Adjust Negotiation Policy</span>
              </div>
              <p className="text-xs text-[#52607A] leading-relaxed">
                Update floor price, delivery SLA bounds, and payment incentives enforced by your agent.
              </p>
            </div>

            <div
              onClick={() => handlePolicySubViewChange("simulator")}
              className="p-5 rounded-2xl bg-white border border-[#DCE4EE] hover:border-[#0284C7]/50 hover:shadow-xs cursor-pointer transition space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B1B33]">
                <Play className="w-4 h-4 text-indigo-600" />
                <span>Test Strategy Simulator</span>
              </div>
              <p className="text-xs text-[#52607A] leading-relaxed">
                Simulate buyer bids against your private rules and review autonomous counter-offers.
              </p>
            </div>

            <div
              onClick={() => handleTransactionsSubViewChange("developer")}
              className="p-5 rounded-2xl bg-white border border-[#DCE4EE] hover:border-[#0284C7]/50 hover:shadow-xs cursor-pointer transition space-y-2"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B1B33]">
                <Code className="w-4 h-4 text-[#059669]" />
                <span>API &amp; Developer Setup</span>
              </div>
              <p className="text-xs text-[#52607A] leading-relaxed">
                Retrieve platform API keys, configure settlement webhooks, and embed the TypeScript SDK.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CATALOG */}
      {activeSection === "catalog" && (
        <div className="space-y-4">
          <MerchantProductCatalog
            merchantId="merchant_default"
            onConfigurePolicy={(productId) => {
              setSelectedCatalogItemId(productId);
              setActiveSection("policies");
              setPolicySubView("editor");
              router.replace(
                `/merchant?tab=policies${productId ? `&itemId=${encodeURIComponent(productId)}` : ""}`,
                { scroll: false }
              );
            }}
          />
        </div>
      )}

      {/* SECTION 3: NEGOTIATION POLICIES */}
      {activeSection === "policies" && (
        <div className="space-y-6">
          {/* Sub-view switcher */}
          <div className="flex items-center gap-2 border-b border-[#DCE4EE] pb-3">
            <button
              onClick={() => handlePolicySubViewChange("editor")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                policySubView === "editor"
                  ? "bg-[#0B1B33] text-white shadow-xs"
                  : "bg-slate-50 text-[#52607A] hover:text-[#0B1B33] border border-[#DCE4EE]"
              }`}
            >
              Policy Rules &amp; Limits
            </button>
            <button
              onClick={() => handlePolicySubViewChange("simulator")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                policySubView === "simulator"
                  ? "bg-[#0B1B33] text-white shadow-xs"
                  : "bg-slate-50 text-[#52607A] hover:text-[#0B1B33] border border-[#DCE4EE]"
              }`}
            >
              <Play className="w-3.5 h-3.5 text-indigo-500" />
              <span>Strategy Simulator (Preview Bids)</span>
            </button>
          </div>

          {policySubView === "editor" ? (
            <MerchantPolicyEditor
              merchantId="merchant_default"
              catalogItemId={selectedCatalogItemId}
              onSaveSuccess={loadAnalytics}
            />
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#0B1B33] flex items-center justify-between">
                <span>Testing against active rules for <strong>merchant_default</strong> (Floor: $750.00 USD)</span>
                <button
                  onClick={() => handlePolicySubViewChange("editor")}
                  className="text-xs font-bold text-[#0284C7] hover:underline"
                >
                  Edit Rules
                </button>
              </div>
              <MerchantAgentSimulator merchantId="merchant_default" />
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: TRANSACTIONS & SETTLEMENTS */}
      {activeSection === "transactions" && (
        <div className="space-y-6">
          {/* Sub-view switcher */}
          <div className="flex items-center gap-2 border-b border-[#DCE4EE] pb-3 flex-wrap">
            <button
              onClick={() => handleTransactionsSubViewChange("ledger")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                transactionsSubView === "ledger"
                  ? "bg-[#0B1B33] text-white shadow-xs"
                  : "bg-slate-50 text-[#52607A] hover:text-[#0B1B33] border border-[#DCE4EE]"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Settlement Ledger (AG Grid)</span>
            </button>

            <button
              onClick={() => handleTransactionsSubViewChange("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                transactionsSubView === "analytics"
                  ? "bg-[#0B1B33] text-white shadow-xs"
                  : "bg-slate-50 text-[#52607A] hover:text-[#0B1B33] border border-[#DCE4EE]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>Visual Analytics (AG Studio)</span>
            </button>

            <button
              onClick={() => handleTransactionsSubViewChange("developer")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                transactionsSubView === "developer"
                  ? "bg-[#0B1B33] text-white shadow-xs"
                  : "bg-slate-50 text-[#52607A] hover:text-[#0B1B33] border border-[#DCE4EE]"
              }`}
            >
              <Code className="w-3.5 h-3.5 text-[#059669]" />
              <span>API &amp; Webhooks</span>
            </button>
          </div>

          {transactionsSubView === "ledger" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-[#0B1B33]">
                    Negotiation History &amp; PayPal Settlement Ledger
                  </h2>
                  <p className="text-xs text-[#52607A]">
                    Authoritative transaction records, consensus status, and dynamic fulfillment links.
                  </p>
                </div>
                <Badge variant="secondary" className="text-[11px] font-mono">
                  AG Grid Community v36
                </Badge>
              </div>
              <MerchantGrid records={dataset.records} />
            </section>
          )}

          {transactionsSubView === "analytics" && (
            <section className="space-y-4">
              <MerchantStudioDashboard dataset={dataset} />
            </section>
          )}

          {transactionsSubView === "developer" && (
            <section className="space-y-4">
              <PayViaConnectDeveloper platformId="plat_default" />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function MerchantPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-24 space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#0284C7]" />
          <p className="text-sm text-[#52607A] font-medium">Loading PayVia Merchant Control Plane...</p>
        </div>
      }
    >
      <MerchantContent />
    </Suspense>
  );
}
