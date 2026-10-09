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
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";

function NegotiateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramProductId = searchParams.get("productId") || searchParams.get("id");
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

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

  const handleSelectProduct = (prod: Product) => {
    setSelectedProduct(prod);
    setSession(null);
    setErrorMessage(null);

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
    setStatusStepText("Buyer Agent formulating opening proposal with Google Gemini...");
    toastInfo("Negotiation Started", `Negotiating for ${selectedProduct.name}`);

    const t1 = setTimeout(() => {
      setStatusStepText("Merchant Agent evaluating inventory margins & counter-offers...");
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
      toastSuccess("Agreement Formulated", `Agreed at $${data.session?.agreement?.finalPrice} USD`);
    } catch (err) {
      console.error("Negotiation failed:", err);
      const msg = err instanceof Error ? err.message : "Failed to execute agent negotiation. Please try again.";
      setErrorMessage(msg);
      toastError("Negotiation Error", msg);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="info">Step 1: Autonomous Agent Negotiation</Badge>
            {isChannel3Product && (
              <Badge variant="default" className="gap-1 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0070E0] animate-pulse" />
                <span>Discovered via Channel3</span>
              </Badge>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Autonomous Negotiation Room
          </h1>
          <p className="text-xs sm:text-sm text-[#5B6472] mt-1">
            Define your budget ceiling and launch real Gemini-powered bargaining with the Merchant Agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Catalog Discovery</span>
            </Button>
          </Link>
          {agreement && (
            <Button
              onClick={() => router.push(`/agreement?id=${session?.id}`)}
              size="sm"
              className="gap-2"
            >
              <span>View Agreement</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Product Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0070E0]" />
            <span>1. Select Product to Negotiate</span>
          </h2>
          <span className="text-xs text-[#5B6472]">
            {availableProducts.length} Items Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#003087]" />
            <span>2. Configure Agent Parameters</span>
          </h2>
          {isChannel3Product && (
            <div className="flex items-center gap-1.5 text-xs text-[#003087] bg-[#EFF8FF] px-3 py-1 rounded-full border border-[#0070E0]/20">
              <Store className="w-3.5 h-3.5 text-[#0070E0]" />
              <span>Merchant: {selectedProduct.merchantName || "Channel3 Verified Partner"}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
      <Card className="border-[#E2E8F0] bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0070E0] flex items-center gap-1.5 justify-center sm:justify-start">
            <Sparkles className="w-3.5 h-3.5 text-[#0070E0]" />
            <span>Autonomous Commercial Protocol</span>
          </span>
          <p className="text-sm text-[#111827]">
            Negotiate for <strong className="text-[#003087]">{selectedProduct.name}</strong> ($
            {selectedProduct.originalPrice.toFixed(2)} list).
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            onClick={handleStartNegotiation}
            disabled={isNegotiating}
            className="w-full sm:w-auto px-8 font-bold text-sm sm:text-base gap-2"
          >
            {isNegotiating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Agents Negotiating...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Ask AI to Negotiate</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-[#FEF3F2] border border-[#D92D20]/30 text-[#D92D20] text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-[#D92D20] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block text-[#D92D20]">Constraint Notice:</span>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Live Negotiation Feed */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-xl bg-[#ECFDF5] border border-[#16845B]/30 shadow-sm">
          <div>
            <span className="text-xs text-[#16845B] font-bold uppercase tracking-wider block">
              Negotiation Successful
            </span>
            <p className="text-sm text-[#111827] mt-0.5">
              Agreed final price:{" "}
              <strong className="text-[#16845B] font-bold text-base font-mono">
                {formatCurrency(agreement.finalPrice, agreement.currency)}
              </strong>{" "}
              (Saved {formatCurrency(agreement.savings, agreement.currency)})
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => router.push(`/agreement?id=${session?.id}`)}
            className="w-full sm:w-auto gap-2 bg-[#16845B] hover:bg-[#136C4A] text-white font-bold text-sm px-6"
          >
            <span>Review Agreement &amp; Authorize</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function NegotiatePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-[#5B6472]">Loading negotiation room...</div>}>
      <NegotiateContent />
    </Suspense>
  );
}
