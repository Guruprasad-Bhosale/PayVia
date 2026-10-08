"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Search,
  Bot,
  Sparkles,
  Loader2,
  AlertCircle,
  ShoppingBag,
  Layers,
} from "lucide-react";

interface ProductDiscoveryProps {
  initialProducts?: Product[];
  onSelectProduct?: (product: Product) => void;
}

const SAMPLE_QUERIES = [
  "Developer Laptop under $800",
  "Noise Cancelling Headphones",
  "Smartwatch with GPS & ECG",
  "Mechanical Keyboard",
  "4K Gaming Monitor",
];

export function ProductDiscovery({
  initialProducts = [],
  onSelectProduct,
}: ProductDiscoveryProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>("");
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialProducts[0]?.id || null
  );
  const [source, setSource] = useState<"channel3" | "demo_fallback" | "initial">("initial");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsSearching(true);
    setErrorMessage(null);
    setInfoMessage(null);
    setQuery(q);

    try {
      setSearchStep("AI Shopping Agent: Understanding your request...");
      await new Promise((r) => setTimeout(r, 300));

      setSearchStep("Searching live product catalog (Channel3 API)...");
      const res = await fetch("/api/products/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, limit: 6, fallbackOnFailure: true }),
      });

      setSearchStep("Comparing available merchant offers & prices...");
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to discover products.");
      }

      setProducts(data.products || []);
      setSource(data.source || "channel3");
      if (data.products?.length > 0) {
        setSelectedProductId(data.products[0].id);
      }
      if (data.message) {
        setInfoMessage(data.message);
      }
      setSearchStep(`Found ${data.products?.length || 0} matching items`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An error occurred during discovery."
      );
      setSource("demo_fallback");
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProductId(product.id);
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      router.push(`/negotiate?productId=${product.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Product Discovery</h2>
              <p className="text-xs text-slate-400">
                Powered by Channel3 Live Product Data API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {source === "channel3" && (
              <Badge variant="info" className="text-[11px] gap-1 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Channel3 Live</span>
              </Badge>
            )}
            {source === "demo_fallback" && (
              <Badge variant="default" className="text-[11px] text-slate-400">
                PayVia Demo Catalog
              </Badge>
            )}
          </div>
        </div>

        {/* Input & Action Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(query);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="What are you looking for? e.g. Laptop for software development under $800"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 text-sm bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              disabled={isSearching}
            />
          </div>

          <Button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="h-11 px-6 font-semibold gap-2 shadow-lg shadow-blue-500/20 text-sm"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Find Products</span>
              </>
            )}
          </Button>
        </form>

        {/* Quick Query Pill Suggestions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium">Try searching:</span>
          {SAMPLE_QUERIES.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSearch(item)}
              disabled={isSearching}
              className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Dynamic AI Shopping Agent Progress State */}
        {isSearching && (
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center gap-2.5 text-xs text-blue-300 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-blue-400" />
            <span className="font-mono">{searchStep}</span>
          </div>
        )}

        {infoMessage && !isSearching && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{infoMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Results Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {source === "channel3"
                ? `Live Channel3 Results (${products.length})`
                : `Available Products (${products.length})`}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Select an item to initiate AI price negotiation
          </span>
        </div>

        {products.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">No products found for your query.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSearch("laptop for software development")}
            >
              <span>Try &quot;laptop for software development&quot;</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                selected={selectedProductId === product.id}
                onSelect={() => handleProductSelect(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
