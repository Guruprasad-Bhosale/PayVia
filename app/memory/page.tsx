"use client";

import React, { useState, useEffect } from "react";
import { MemorySearchResult, ElasticStatusResponse, MemoryType } from "@/lib/elastic/types";
import { MemoryCard } from "@/components/memory/MemoryCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-md shadow-blue-500/10">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>PAYVIA MEMORY</span>
              </h1>
              <p className="text-xs text-slate-300">
                Product Intelligence for Autonomous Commerce · Preferences, Negotiation Patterns &amp; Outcome History
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Elastic Serverless Status Badge */}
          {status?.connected ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Vector Memory Active</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Memory Engine Ready</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeed}
            disabled={syncing}
            className="h-8 px-3 text-xs gap-1.5 text-slate-300 hover:text-white border-slate-700"
            title="Seed / Sync Benchmark Memories"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-blue-400" : ""}`} />
            <span>{syncing ? "Syncing..." : "Sync Memories"}</span>
          </Button>
        </div>
      </div>

      {/* KPI Diagnostic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Indexed Memories
          </span>
          <div className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span>{status?.documentCount || results.length} records</span>
          </div>
          <p className="text-[11px] text-slate-400">Persistent cross-negotiation documents</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Search Index
          </span>
          <div className="text-sm font-bold text-white font-mono flex items-center gap-2 pt-1">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>{status?.indexName || "payvia-memory"}</span>
          </div>
          <p className="text-[11px] text-slate-400">BM25 + Semantic Hybrid Mapping</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Memory Scope
          </span>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 pt-1">
            <Sparkles className="w-4 h-4" />
            <span>Buyer, Merchant & Logs</span>
          </div>
          <p className="text-[11px] text-slate-400">Multi-Actor Contextual Storage</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Security Isolation
          </span>
          <div className="text-sm font-bold text-slate-200 flex items-center gap-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Untrusted Data Guard</span>
          </div>
          <p className="text-[11px] text-slate-400">Cannot alter PayPal or Price Floors</p>
        </div>
      </div>

      {/* Interactive Search Panel */}
      <Card className="p-4 sm:p-5 border-slate-800 bg-slate-900/90 shadow-xl space-y-4">
        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchQuery, activeFilter);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PayVia AI memories (e.g. 'previous laptop negotiations', 'discount patterns', 'headphones')..."
              className="w-full h-11 pl-10 pr-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="h-11 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 font-medium"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span className="hidden sm:inline">Semantic Search</span>
          </Button>
        </form>

        {/* Suggested Queries */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-blue-400" />
            <span>Suggested Semantic Inquiries</span>
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
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Memory Type Filter Tabs */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1">Filter Type:</span>
          <button
            onClick={() => onFilterChange("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeFilter === "all"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            All Memories
          </button>
          <button
            onClick={() => onFilterChange("negotiation")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === "negotiation"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Brain className="w-3 h-3" />
            <span>Buyer Negotiations</span>
          </button>
          <button
            onClick={() => onFilterChange("merchant_pattern")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === "merchant_pattern"
                ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Building2 className="w-3 h-3" />
            <span>Merchant Patterns</span>
          </button>
          <button
            onClick={() => onFilterChange("purchase")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === "purchase"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            <span>PayPal Settlements</span>
          </button>
          <button
            onClick={() => onFilterChange("fulfillment")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeFilter === "fulfillment"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Truck className="w-3 h-3" />
            <span>Fulfillment Logs</span>
          </button>
        </div>
      </Card>

      {/* Results Header & Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Retrieved Memory Documents</span>
            <span className="text-xs text-slate-400 font-normal">({results.length} found)</span>
          </h2>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>Engine:</span>
            <Badge variant="info" className="text-[10px] py-0.5 px-2">
              {status?.connected ? "Elasticsearch Serverless" : "Local Memory Fallback"}
            </Badge>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[240px] flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
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
          <Card className="p-8 text-center border-slate-800 bg-slate-900/60 max-w-md mx-auto space-y-3">
            <Brain className="w-10 h-10 text-slate-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">No Matching Memories Found</h3>
              <p className="text-xs text-slate-400">
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
