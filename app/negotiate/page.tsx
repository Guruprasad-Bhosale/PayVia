"use client";

import React, { useState, useEffect, Suspense } from "react";
import { SAMPLE_PRODUCTS, getProductById } from "@/data/products";
import { Product } from "@/types/product";
import { BuyerConstraints } from "@/types/agent";
import { NegotiationSession } from "@/types/negotiation";
import { ProductCard } from "@/components/ProductCard";
import { BuyerAgentPanel } from "@/components/BuyerAgentPanel";
import { MerchantAgentPanel } from "@/components/MerchantAgentPanel";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, RefreshCw, Layers, AlertCircle, Sparkles, Store, ShoppingBag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

function NegotiateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramProductId = searchParams.get("productId") || searchParams.get("id");

  const [availableProducts, setAvailableProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product>(SAMPLE_PRODUCTS[0]);

  // Dynamic realistic constraint suggestions per product
  const [buyerConstraints, setBuyerConstraints] = useState<BuyerConstraints>({
    maxBudget: 760.0,
    targetPrice: 735.0,
    maxDeliveryDays: 5,
    preferredPaymentMethod: "PayPal",
    notes: "Prefer complimentary express shipping if available",
  });

  const [isNegotiating, setIsNegotiating] = useState(false);
  const [statusStepText, setStatusStepText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [session, setSession] = useState<NegotiationSession | null>(null);

  // Check if a specific product was requested via URL query param
  useEffect(() => {
    if (paramProductId) {
      const found = getProductById(paramProductId);
      if (found) {
        setSelectedProduct(found);
        // Include in available list if not already present
        setAvailableProducts((prev) => {
          if (!prev.some((p) => p.id === found.id)) {
            return [found, ...prev];
          }
          return prev;
        });

        const suggestedMax = Number((found.originalPrice * 0.95).toFixed(2));
        const suggestedTarget = Number((found.originalPrice * 0.90).toFixed(2));
        setBuyerConstraints({
          maxBudget: suggestedMax,
          targetPrice: suggestedTarget,
          maxDeliveryDays: 5,
          preferredPaymentMethod: "PayPal",
          notes: "Requesting free priority shipping if within budget",
        });
      }
    }
  }, [paramProductId]);

  // When product changes, adjust suggested default constraints
  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSession(null);
    setErrorMessage(null);

    // Compute sensible suggested demo budget (around 5% below list price, safely above floor)
    const suggestedMax = Number((prod.originalPrice * 0.95).toFixed(2));
    const suggestedTarget = Number((prod.originalPrice * 0.90).toFixed(2));

    setBuyerConstraints({
      maxBudget: suggestedMax,
      targetPrice: suggestedTarget,
      maxDeliveryDays: 5,
      preferredPaymentMethod: "PayPal",
      notes: "Requesting free priority shipping if within budget",
    });
  };

  const handleStartNegotiation = async () => {
    // 1. Validation before dispatching
    if (!buyerConstraints.maxBudget || buyerConstraints.maxBudget <= 0) {
      setErrorMessage("Please enter a valid maximum budget greater than $0.");
      return;
    }
    if (buyerConstraints.maxBudget > selectedProduct.originalPrice) {
      setErrorMessage(
        `Budget ($${buyerConstraints.maxBudget}) cannot exceed the original listing price ($${selectedProduct.originalPrice}).`
      );
      return;
    }
    if (buyerConstraints.maxBudget < selectedProduct.minAcceptablePrice) {
      setErrorMessage(
        `Your budget ($${buyerConstraints.maxBudget}) is below the merchant's minimum acceptable floor ($${selectedProduct.minAcceptablePrice}). Please increase your budget.`
      );
      return;
    }

    setIsNegotiating(true);
    setErrorMessage(null);
    setSession(null);
    setStatusStepText("Buyer Agent is formulating opening proposal with Google Gemini...");

    // Simulated step progression for smooth UX
    const t1 = setTimeout(() => {
      setStatusStepText("Merchant Agent is evaluating inventory margins & counter-offers...");
    }, 1500);

    const t2 = setTimeout(() => {
      setStatusStepText("Agents negotiating multi-turn terms & delivery concessions...");
    }, 3200);

    try {
      const response = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          buyerConstraints,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to run autonomous negotiation.");
      }

      setSession(data.session);
    } catch (err) {
      console.error("Negotiation failed:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to execute agent negotiation. Please try again."
      );
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsNegotiating(false);
      setStatusStepText("");
    }
  };

  const agreement = session?.agreement;
  const isChannel3Product = selectedProduct.source === "channel3";

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple">Step 1: AI Agent Negotiation</Badge>
            {isChannel3Product && (
              <Badge variant="info" className="gap-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>Discovered via Channel3</span>
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Autonomous Negotiation Room
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Define your budget ceiling and launch real Gemini-powered bargaining with the Merchant Agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Discover Products</span>
            </Button>
          </Link>
          {agreement && (
            <Button
              onClick={() => router.push(`/agreement?id=${session?.id}`)}
              size="sm"
              className="gap-2 shadow-md shadow-emerald-500/20"
            >
              <span>View Verified Agreement</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Product Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>1. Select Product to Negotiate</span>
          </h2>
          <span className="text-xs text-slate-400">
            {availableProducts.length} Items Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {availableProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={selectedProduct.id === product.id}
              onSelect={() => handleSelectProduct(product)}
            />
          ))}
        </div>
      </div>

      {/* Agents Configuration Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-400" />
            <span>2. Configure Agent Parameters</span>
          </h2>
          {isChannel3Product && (
            <div className="flex items-center gap-1.5 text-xs text-blue-300 bg-blue-950/50 px-3 py-1 rounded-full border border-blue-800/50">
              <Store className="w-3.5 h-3.5" />
              <span>Merchant: {selectedProduct.merchantName || "Channel3 Verified Partner"}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BuyerAgentPanel
            constraints={buyerConstraints}
            onChange={setBuyerConstraints}
            disabled={isNegotiating}
          />

          <MerchantAgentPanel
            constraints={{
              originalPrice: selectedProduct.originalPrice,
              minAcceptablePrice: selectedProduct.minAcceptablePrice,
              shippingFloorPrice: 0,
              maxRoundsAllowed: 5,
            }}
          />
        </div>
      </div>

      {/* Action Bar */}
      <Card className="border-blue-900/40 bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Autonomous Commercial Protocol</span>
          </span>
          <p className="text-sm text-slate-200">
            Click to command Buyer Agent to negotiate for{" "}
            <strong className="text-white">{selectedProduct.name}</strong> ($
            {selectedProduct.originalPrice.toFixed(2)} list).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            onClick={handleStartNegotiation}
            disabled={isNegotiating}
            className="w-full sm:w-auto shadow-xl shadow-blue-500/25 px-8 font-bold text-base"
          >
            {isNegotiating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Agents Negotiating...</span>
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                <span>Ask AI to Negotiate</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-rose-200">Constraint Validation Notice:</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Live Negotiation Feed */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <span>3. Live Agent Negotiation Stream</span>
        </h2>
        <NegotiationTimeline
          messages={session?.messages || []}
          agreement={agreement}
          isNegotiating={isNegotiating}
          activeStatusText={statusStepText}
        />
      </div>

      {agreement && agreement.status === "AGREED" && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
              Negotiation Successful
            </span>
            <p className="text-sm text-slate-200 mt-0.5">
              Agreed final price:{" "}
              <strong className="text-white font-extrabold text-base">
                {formatCurrency(agreement.finalPrice, agreement.currency)}
              </strong>{" "}
              (Saved {formatCurrency(agreement.savings, agreement.currency)})
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => router.push(`/agreement?id=${session?.id}`)}
            className="w-full sm:w-auto gap-2 shadow-xl shadow-emerald-500/25 px-8 font-bold text-base"
          >
            <span>Review Agreement & Authorize Payment</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function NegotiatePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-slate-400">Loading negotiation room...</div>}>
      <NegotiateContent />
    </Suspense>
  );
}

