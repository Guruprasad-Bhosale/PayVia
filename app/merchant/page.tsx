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
import BranchedMenu, { BranchedMenuItem } from "@/components/react-bits/BranchedMenu";
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
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-payvia-blue" />
        <p className="text-sm text-muted-foreground font-medium">Loading PayVia Connect Control Plane...</p>
      </div>
    );
  }

  const { kpis } = dataset;

  const branchedMenuItems: BranchedMenuItem[] = [
    {
      label: "Commerce Operations",
      children: [
        { value: "overview", label: "Operations Overview" },
        { value: "products", label: "Product Catalog" },
        { value: "transactions", label: "Settlement Ledger (AG Grid)" },
      ],
    },
    {
      label: "Autonomous Strategy",
      children: [
        { value: "policy", label: "Negotiation Policy" },
        { value: "simulator", label: "Strategy Simulator" },
      ],
    },
    {
      label: "Intelligence & API",
      children: [
        { value: "analytics", label: "AG Studio Analytics" },
        { value: "developer", label: "API & Webhooks" },
      ],
    },
  ];

  const handleMenuSelect = (value: string) => {
    if (["overview", "products", "policy", "simulator", "transactions", "analytics", "developer"].includes(value)) {
      setActiveTab(value as MerchantTab);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="gap-1 text-xs font-bold text-payvia-navy">
              <Zap className="w-3 h-3 text-payvia-blue" />
              <span>PAYVIA CONNECT · MERCHANT CONTROL PLANE</span>
            </Badge>
            <Badge variant="success" className="gap-1 text-xs font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>AI Negotiation: ACTIVE</span>
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">Policy v2.4</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Make Your Commerce Negotiable.
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define private economic rules. Autonomous merchant agents negotiate within your boundaries and settle via PayPal.
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
            <span>Refresh</span>
          </Button>

          <Link href="/negotiate">
            <Button size="sm" className="gap-2 text-xs bg-payvia-navy hover:bg-payvia-navy-dark text-white font-bold shadow-sm">
              <span>Test as Buyer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Layout with BranchedMenu Navigation Sidebar on Left & Content on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation Sidebar with React Bits BranchedMenu */}
        <aside className="lg:col-span-3 bg-white p-5 rounded-2xl border border-border shadow-sm space-y-4 sticky top-20">
          <div className="border-b border-border pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-payvia-navy block">
              Control Plane Navigation
            </span>
            <p className="text-[11px] text-muted-foreground">
              Select an area to configure or monitor
            </p>
          </div>

          <div className="py-1">
            <BranchedMenu
              items={branchedMenuItems}
              defaultOpen={[0, 1, 2]}
              defaultActive={activeTab}
              onSelect={handleMenuSelect}
              color="#111827"
              accentColor="#0070E0"
              lineColor="#CBD5E1"
              width={260}
              rowHeight={36}
              indent={32}
              trunk={12}
              radius={8}
              fontSize={13}
            />
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* Tab 1: Overview */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-border shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Negotiations</span>
                    <Layers className="w-4 h-4 text-payvia-blue" />
                  </div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {kpis.totalNegotiations}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Active sessions</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Agreements</span>
                    <CheckCircle2 className="w-4 h-4 text-payvia-success" />
                  </div>
                  <div className="text-2xl font-black text-payvia-success font-mono">
                    {kpis.completedTransactions}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Consensus locked</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Settled Volume</span>
                    <DollarSign className="w-4 h-4 text-payvia-navy" />
                  </div>
                  <div className="text-2xl font-black text-payvia-navy font-mono">
                    {formatCurrency(kpis.totalRevenue, "USD")}
                  </div>
                  <span className="text-[10px] text-payvia-blue font-bold block">PayPal Orders v2</span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border shadow-sm space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Avg Savings</span>
                    <Percent className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-black text-amber-700 font-mono">
                    {kpis.averageSavingsPct}%
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    Total: ${kpis.totalSavings.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border shadow-sm space-y-1 col-span-2 md:col-span-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Conversion</span>
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-indigo-700 font-mono">
                    {kpis.acceptanceRate}%
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Deal completion</span>
                </div>
              </div>

              {/* Quick Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  onClick={() => setActiveTab("policy")}
                  className="p-5 rounded-2xl bg-white border border-border hover:border-payvia-blue/50 hover:shadow-md cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Sliders className="w-4 h-4 text-payvia-blue" />
                    <span>Configure Negotiation Policy</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Set minimum floor prices, max concession step per turn, delivery bounds, and payment timing discounts.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("simulator")}
                  className="p-5 rounded-2xl bg-white border border-border hover:border-payvia-blue/50 hover:shadow-md cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Play className="w-4 h-4 text-indigo-600" />
                    <span>Test Merchant Agent</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Simulate buyer bids against your private policy rules and preview automated agent decisions in real time.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab("developer")}
                  className="p-5 rounded-2xl bg-white border border-border hover:border-payvia-blue/50 hover:shadow-md cursor-pointer transition space-y-2"
                >
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Code className="w-4 h-4 text-payvia-success" />
                    <span>Connect via API / SDK</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
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
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-payvia-blue" />
                  <h2 className="text-base font-bold text-foreground">
                    Negotiation Activity &amp; PayPal Settlement Ledger
                  </h2>
                </div>
                <Badge variant="secondary" className="text-[11px] font-mono">
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
        </main>
      </div>
    </div>
  );
}

export default function MerchantPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-payvia-blue" />
        <p className="text-sm text-muted-foreground font-medium">Loading PayVia Connect Control Plane...</p>
      </div>
    }>
      <MerchantContent />
    </Suspense>
  );
}
