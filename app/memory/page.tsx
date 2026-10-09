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

  return (
    <div className="space-y-6 py-2">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-payvia-navy">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <span>PAYVIA MEMORY EXPLORER</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Product Intelligence for Autonomous Commerce · Preferences, Negotiation Patterns &amp; Outcome History
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Elastic Serverless Status Badge */}
          {status?.connected ? (
            <div className="flex items-center gap-1.5 text-xs text-payvia-success bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Vector Memory Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-payvia-navy bg-blue-50 px-3 py-1 rounded-full border border-blue-200 font-semibold">
              <span className="w-2 h-2 rounded-full bg-payvia-blue"></span>
              <span>Memory Engine Ready</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={syncing}
            className="h-8 px-3 text-xs gap-1.5"
            title="Seed / Sync Benchmark Memories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-payvia-blue" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Memories"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Indexed Memories
          </span>
          <div className="text-2xl font-black text-foreground flex items-center gap-2">
            <Database className="w-5 h-5 text-payvia-blue" />
            <span>{status?.documentCount || results.length} records</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Persistent cross-negotiation documents</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Search Index
          </span>
          <div className="text-sm font-bold text-payvia-navy font-mono flex items-center gap-2 pt-1">
            <Layers className="w-4 h-4 text-payvia-blue" />
            <span>{status?.indexName || "payvia-memory"}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">BM25 + Semantic Hybrid Mapping</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Memory Scope
          </span>
          <div className="text-sm font-bold text-payvia-success flex items-center gap-1.5 pt-1">
            <Sparkles className="w-4 h-4" />
            <span>Buyer, Merchant & Logs</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Multi-Actor Contextual Storage</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-border shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            Security Isolation
          </span>
          <div className="text-sm font-bold text-foreground flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Untrusted Data Guard</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Cannot alter PayPal or Price Floors</p>
        </div>
      </div>

      {/* Interactive Search Panel */}
      <Card className="p-4 sm:p-5 border-border bg-white shadow-sm space-y-4">
        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery, activeFilter);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PayVia AI memories (e.g. 'previous laptop negotiations', 'discount patterns', 'headphones')..."
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-50 border border-border text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-payvia-blue focus:ring-1 focus:ring-payvia-blue/20"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-6 bg-payvia-navy hover:bg-payvia-navy-dark text-white rounded-xl gap-2 font-bold"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">Semantic Search</span>
          </Button>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-payvia-blue" />
            <span>Suggested Inquiries</span>
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
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-foreground border border-border transition-colors flex items-center gap-1.5 font-medium"
              >
                <Sparkles className="w-3 h-3 text-payvia-blue" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Memory Type Filter Tabs */}
        <div className="pt-2 border-t border-border flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold mr-1">Filter:</span>
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === "all"
                ? "bg-payvia-navy text-white shadow-xs"
                : "bg-slate-50 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            All Memories
          </button>
          <button
            onClick={() => onFilterChange("negotiation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "negotiation"
                ? "bg-payvia-navy text-white shadow-xs"
                : "bg-slate-50 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Brain className="w-3 h-3 text-payvia-blue" />
            <span>Buyer Negotiations</span>
          </button>
          <button
            onClick={() => onFilterChange("merchant_pattern")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "merchant_pattern"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-slate-50 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <Building2 className="w-3 h-3 text-purple-600" />
            <span>Merchant Patterns</span>
          </button>
          <button
            onClick={() => onFilterChange("purchase")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "purchase"
                ? "bg-payvia-success text-white shadow-xs"
                : "bg-slate-50 text-muted-foreground hover:text-foreground border border-border"
            }`}
          >
            <ShoppingBag className="w-3 h-3 text-emerald-600" />
            <span>PayPal Settlements</span>
          </button>
          <button
            onClick={() => onFilterChange("fulfillment")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeFilter === "fulfillment"
                ? "bg-cyan-700 text-white shadow-xs"
                : "bg-slate-50 text-muted-foreground hover:text-foreground border border-border"
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
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <span>Retrieved Memory Documents</span>
            <span className="text-xs text-muted-foreground font-normal">({results.length} found)</span>
          </h2>

          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Engine:</span>
            <Badge variant="secondary" className="text-[10px] py-0.5 px-2 text-payvia-navy">
              {status?.connected ? "Elasticsearch Serverless" : "Local Memory Fallback"}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[240px] flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-payvia-blue" />
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
          <Card className="p-8 text-center border-border bg-white max-w-md mx-auto space-y-3">
            <Brain className="w-10 h-10 text-muted-foreground mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">No Matching Memories Found</h3>
              <p className="text-xs text-muted-foreground">
                {hasSearched
                  ? "Try broadening your search query or clear the filter."
                  : "Complete negotiations or click 'Sync Memories' to populate historical records."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
