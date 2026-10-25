"use client";

import React, { useState, useEffect } from "react";
import { MemorySearchResult, ElasticStatusResponse, MemoryType } from "@/lib/elastic/types";
import { MemoryCard } from "@/components/memory/MemoryCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Brain,
  Search,
  RefreshCw,
  Sparkles,
  Database,
  Layers,
  HelpCircle,
  Building2,
  Truck,
  ShoppingBag,
  ShieldCheck,
  Lock,
} from "lucide-react";

const SUGGESTED_SEARCHES = [
  "Previous laptop negotiations",
  "Audio category discount patterns",
  "Headphones negotiated with 3-day delivery",
  "Channel3 discovered items",
  "Fulfillment linehaul logs",
  "ThinkPad X1 discount rate",
];

export default function MemoryExplorerPage() {
  const [status, setStatus] = useState<ElasticStatusResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<MemoryType | "all">("all");
  const [results, setResults] = useState<MemorySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  // 1. Fetch Elastic status
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/memory/status");
      const data = await res.json();
      if (data.success) {
        setStatus(data);
      }
    } catch {
      // Non-critical fallback
    }
  };

  // 2. Execute memory search
  const handleSearch = async (queryToSearch: string, filterType: MemoryType | "all" = activeFilter) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch("/api/memory/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryToSearch.trim() || "*",
          memoryType: filterType === "all" ? undefined : filterType,
          limit: 12,
        }),
      });

      const data = await res.json();
      if (data.success && data.results) {
        setResults(data.results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("[Memory Search Error]:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Seed / Sync memories
  const handleSeed = async () => {
    setSyncing(true);
    try {
      await fetch("/api/memory/seed", { method: "POST" });
      await fetchStatus();
      await handleSearch(searchQuery, activeFilter);
      toast({
        title: "Memories Synchronized",
        description: "Benchmark commerce memories loaded into vector index.",
        variant: "success",
      });
    } catch (err) {
      console.error("[Memory Seed Error]:", err);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchStatus();
      await handleSearch("*", "all");
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilterChange = (newFilter: MemoryType | "all") => {
    setActiveFilter(newFilter);
    handleSearch(searchQuery, newFilter);
  };

  const isCloudElastic = status?.connected === true;

  return (
    <div className="space-y-6 py-2">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0A192F]">
              <Brain className="w-5 h-5 text-[#0052CC]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A192F] tracking-tight flex items-center gap-2">
                <span>PAYVIA AI MEMORY EXPLORER</span>
              </h1>
              <p className="text-xs text-[#475569]">
                Historical Negotiation Patterns, Category Preferences &amp; Outcome Benchmarks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Elastic Serverless Status Badge */}
          {isCloudElastic ? (
            <div className="flex items-center gap-1.5 text-xs text-[#0E6245] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Elasticsearch Serverless Vector Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#0A192F] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#0052CC]"></span>
              <span>Resilient In-Memory Vector Index</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={syncing}
            className="h-8 px-3 text-xs gap-1.5 border-[#E2E8F0] text-[#0A192F] hover:bg-slate-50"
            title="Seed / Sync Benchmark Memories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-[#0052CC]" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Benchmark Memories"}</span>
          </Button>
        </div>
      </div>

      {/* Trust & Architecture Transparency Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#475569] space-y-2">
        <div className="flex items-center gap-2 font-bold text-[#0A192F]">
          <ShieldCheck className="w-4 h-4 text-[#0E6245]" />
          <span>Non-Authoritative Role of AI Memory</span>
        </div>
        <p className="leading-relaxed">
          PayVia uses historical negotiation context and category patterns strictly as <strong>untrusted reference context</strong> to suggest initial proposal terms. AI Memory <strong>never</strong> overrides merchant minimum floor policies, buyer budget caps, authoritative agreement terms, explicit buyer approval, or PayPal settlement amounts.
        </p>
        <div className="flex items-center gap-4 text-[11px] text-[#475569] pt-1 border-t border-[#E2E8F0] flex-wrap">
          <span>Storage Persistence: <strong>{isCloudElastic ? "Persistent Elasticsearch Cloud Index" : "Session-Scoped In-Memory Store"}</strong></span>
          <span>Security Fence: <strong>Strict Prompt Injection &amp; Data-Only Boundary Active</strong></span>
        </div>
      </div>

      {/* KPI Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Indexed Records
          </span>
          <div className="text-2xl font-black text-[#0A192F] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0052CC]" />
            <span>{status?.documentCount || results.length} records</span>
          </div>
          <p className="text-[11px] text-[#475569]">Cross-negotiation documents</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Search Index
          </span>
          <div className="text-sm font-bold text-[#0A192F] font-mono flex items-center gap-2 pt-1">
            <Layers className="w-4 h-4 text-[#0052CC]" />
            <span>{status?.indexName || "payvia-memory"}</span>
          </div>
          <p className="text-[11px] text-[#475569]">BM25 + Vector Semantic Matching</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Memory Dimensions
          </span>
          <div className="text-sm font-bold text-[#0E6245] flex items-center gap-1.5 pt-1">
            <Sparkles className="w-4 h-4" />
            <span>Buyer, Merchant &amp; Logistics</span>
          </div>
          <p className="text-[11px] text-[#475569]">Multi-Actor Historical Storage</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider block">
            Financial Authority
          </span>
          <div className="text-sm font-bold text-[#0A192F] flex items-center gap-1.5 pt-1">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Zero Policy Override</span>
          </div>
          <p className="text-[11px] text-[#475569]">Price floors locked server-side</p>
        </div>
      </div>

      {/* Interactive Search Panel */}
      <Card className="p-4 sm:p-5 border-[#E2E8F0] bg-white shadow-xs space-y-4">
        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery, activeFilter);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#475569] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PayVia AI memories (e.g. 'previous laptop negotiations', 'discount patterns', 'headphones')..."
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-sm text-[#0A192F] placeholder-[#475569] focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]/20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-6 bg-[#0A192F] hover:bg-[#0052CC] text-white rounded-xl gap-2 font-bold shadow-xs transition-colors"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">Search Memory</span>
          </Button>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-[#0052CC]" />
            <span>Suggested Context Inquiries</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SEARCHES.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchQuery(q);
                  handleSearch(q, activeFilter);
                }}
                disabled={loading}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-[#0A192F] hover:text-[#0052CC] border border-[#E2E8F0] transition-colors flex items-center gap-1.5 font-medium"
              >
                <Sparkles className="w-3 h-3 text-[#0052CC]" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Memory Type Filter Tabs */}
        <div className="pt-2 border-t border-[#E2E8F0] flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#475569] font-semibold mr-1">Filter:</span>
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-[#0A192F] text-white shadow-xs"
                : "bg-slate-50 text-[#475569] hover:text-[#0A192F] border border-[#E2E8F0]"
            }`}
          >
            All Memory Types
          </button>
          <button
            onClick={() => onFilterChange("negotiation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "negotiation"
                ? "bg-[#0A192F] text-white shadow-xs"
                : "bg-slate-50 text-[#475569] hover:text-[#0A192F] border border-[#E2E8F0]"
            }`}
          >
            <Brain className="w-3 h-3 text-[#0052CC]" />
            <span>Buyer Negotiations</span>
          </button>
          <button
            onClick={() => onFilterChange("merchant_pattern")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "merchant_pattern"
                ? "bg-purple-900 text-white shadow-xs"
                : "bg-slate-50 text-[#475569] hover:text-[#0A192F] border border-[#E2E8F0]"
            }`}
          >
            <Building2 className="w-3 h-3 text-purple-600" />
            <span>Merchant Patterns</span>
          </button>
          <button
            onClick={() => onFilterChange("purchase")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "purchase"
                ? "bg-[#0E6245] text-white shadow-xs"
                : "bg-slate-50 text-[#475569] hover:text-[#0A192F] border border-[#E2E8F0]"
            }`}
          >
            <ShoppingBag className="w-3 h-3 text-[#0E6245]" />
            <span>PayPal Settlements</span>
          </button>
          <button
            onClick={() => onFilterChange("fulfillment")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "fulfillment"
                ? "bg-cyan-900 text-white shadow-xs"
                : "bg-slate-50 text-[#475569] hover:text-[#0A192F] border border-[#E2E8F0]"
            }`}
          >
            <Truck className="w-3 h-3 text-cyan-600" />
            <span>Fulfillment Logs</span>
          </button>
        </div>
      </Card>

      {/* Results Header & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0A192F] uppercase tracking-wider flex items-center gap-2">
            <span>Retrieved Reference Memories</span>
            <span className="text-xs text-[#475569] font-normal">({results.length} found)</span>
          </h2>

          <div className="text-xs text-[#475569] flex items-center gap-2">
            <span>Source:</span>
            <Badge variant="secondary" className="text-[10px] py-0.5 px-2 text-[#0A192F] bg-blue-50 border-blue-200">
              {isCloudElastic ? "Elasticsearch Serverless" : "Local Memory Fallback"}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[240px] flex flex-col items-center justify-center text-[#475569] text-sm gap-2 bg-white rounded-2xl border border-[#E2E8F0]">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0052CC]" />
            <span>Retrieving semantically similar memories...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((res) => (
              <MemoryCard
                key={res.document.memoryId}
                document={res.document}
                similarityPct={res.similarityPct}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-[#E2E8F0] bg-white max-w-md mx-auto space-y-3 shadow-xs">
            <Brain className="w-10 h-10 text-[#475569] mx-auto opacity-50" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-[#0A192F]">No Matching Memories Found</h3>
              <p className="text-xs text-[#475569]">
                {hasSearched
                  ? "Try broadening your query or clear the filter."
                  : "Complete negotiations or click 'Sync Benchmark Memories' to populate historical records."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
