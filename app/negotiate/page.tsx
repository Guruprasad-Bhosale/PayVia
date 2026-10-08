"use client";

import React, { useState } from "react";
import { SAMPLE_PRODUCTS } from "@/data/products";
import { Product } from "@/types/product";
import { BuyerConstraints } from "@/types/agent";
import { ProductCard } from "@/components/ProductCard";
import { BuyerAgentPanel } from "@/components/BuyerAgentPanel";
import { MerchantAgentPanel } from "@/components/MerchantAgentPanel";
import { NegotiationTimeline } from "@/components/NegotiationTimeline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, RefreshCw, Layers } from "lucide-react";
import Link from "next/link";

export default function NegotiatePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(SAMPLE_PRODUCTS[0]);
  const [buyerConstraints, setBuyerConstraints] = useState<BuyerConstraints>({
    maxBudget: 260.0,
    targetPrice: 235.0,
    maxDeliveryDays: 3,
    preferredPaymentMethod: "PayPal",
    notes: "Requesting free express shipping if available",
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [negotiationStep, setNegotiationStep] = useState<"idle" | "negotiating" | "agreed">("idle");

  const handleStartNegotiation = async () => {
    setIsSimulating(true);
    setNegotiationStep("negotiating");

    // Placeholder simulated step for the initial scaffold
    // TODO: [AI Hackathon Integration] Connect to POST /api/negotiate for real multi-turn LLM reasoning
    setTimeout(() => {
      setIsSimulating(false);
      setNegotiationStep("agreed");
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <Badge variant="purple" className="mb-2">
            Step 1: Configuration
          </Badge>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Agent Negotiation Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure buyer preferences and initiate autonomous bargaining with the merchant agent.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/agreement">
            <Button variant="outline" size="sm">
              <span>View Agreements</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Select Product to Negotiate</span>
          </h2>
          <span className="text-xs text-slate-400">
            Catalog: {SAMPLE_PRODUCTS.length} active merchant listings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SAMPLE_PRODUCTS.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selected={selectedProduct.id === product.id}
              onSelect={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </div>

      {/* Agents Configuration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BuyerAgentPanel
          constraints={buyerConstraints}
          onChange={setBuyerConstraints}
          disabled={isSimulating}
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

      {/* Action Bar */}
      <Card className="border-blue-900/40 bg-slate-900/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Autonomous Deal Formulation
          </span>
          <p className="text-sm text-slate-300">
            Clicking below commands the Buyer Agent to start negotiations for{" "}
            <span className="font-semibold text-white">{selectedProduct.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            size="lg"
            onClick={handleStartNegotiation}
            disabled={isSimulating}
            className="w-full sm:w-auto shadow-lg shadow-blue-500/20"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Agents Negotiating...</span>
              </>
            ) : (
              <>
                <Bot className="w-5 h-5" />
                <span>Start Negotiation</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Negotiation Feed Placeholder */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Live Negotiation Transcript</h2>
        <NegotiationTimeline
          messages={
            negotiationStep === "agreed"
              ? [
                  {
                    id: "msg_1",
                    sender: "buyer",
                    timestamp: new Date().toISOString(),
                    content: `Hello! I represent a buyer eager to purchase "${selectedProduct.name}". We propose $${buyerConstraints.targetPrice.toFixed(
                      2
                    )} with standard delivery included.`,
                    proposedPrice: buyerConstraints.targetPrice,
                    decision: "PROPOSE",
                    reasoning: "Starting at target price to anchor negotiation favorably.",
                  },
                  {
                    id: "msg_2",
                    sender: "merchant",
                    timestamp: new Date().toISOString(),
                    content: `Thank you for your interest in "${selectedProduct.name}". While $${buyerConstraints.targetPrice.toFixed(
                      2
                    )} is below our standard threshold, we can offer $${(
                      (selectedProduct.originalPrice + buyerConstraints.targetPrice) /
                      2
                    ).toFixed(2)} with express shipping complimentary!`,
                    proposedPrice: Number(
                      (
                        (selectedProduct.originalPrice + buyerConstraints.targetPrice) /
                        2
                      ).toFixed(2)
                    ),
                    decision: "COUNTER",
                    reasoning:
                      "Offering midpoint concession bundled with expedited shipping perk.",
                  },
                  {
                    id: "msg_3",
                    sender: "buyer",
                    timestamp: new Date().toISOString(),
                    content: `That is acceptable! The buyer accepts $${(
                      (selectedProduct.originalPrice + buyerConstraints.targetPrice) /
                      2
                    ).toFixed(2)} with express delivery included.`,
                    proposedPrice: Number(
                      (
                        (selectedProduct.originalPrice + buyerConstraints.targetPrice) /
                        2
                      ).toFixed(2)
                    ),
                    decision: "ACCEPT",
                    reasoning: "Counter-offer is well within user budget and includes upgraded shipping.",
                  },
                ]
              : []
          }
        />
      </div>

      {negotiationStep === "agreed" && (
        <div className="flex justify-end pt-4">
          <Link href="/agreement">
            <Button size="lg" className="gap-2 shadow-lg shadow-emerald-500/20">
              <span>Review Agreement & Approve</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
