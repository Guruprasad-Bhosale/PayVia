"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getProductById } from "@/data/products";
import { ShoppingIntentExperience } from "@/components/buyer/ShoppingIntentExperience";
import { ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NegotiateContent() {
  const searchParams = useSearchParams();
  const paramProductId = searchParams.get("productId") || searchParams.get("id");
  const product = paramProductId ? getProductById(paramProductId) : null;

  const initialQuery = product ? product.name : undefined;
  const initialBudget = product ? Number((product.originalPrice * 0.95).toFixed(2)) : undefined;

  return (
    <div className="max-w-4xl mx-auto py-2 space-y-6">
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#0E6245]/20 text-[#0E6245] text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Canonical Buyer Journey</span>
            </span>
            {product && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0F5FF] border border-[#0052CC]/20 text-[#0052CC] text-xs font-medium">
                <Sparkles className="w-3 h-3" />
                <span>Pre-selected item</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
            AI Negotiation &amp; Deal Discovery
          </h1>
          <p className="text-xs sm:text-sm text-[#475569]">
            Describe your purchase or refine constraints. PayVia AI negotiates directly with participating merchant agents.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs border-[#CBD5E1] text-[#0A192F] hover:bg-[#F8FAFC]">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Canonical Shopping Experience */}
      <ShoppingIntentExperience
        initialQuery={initialQuery}
        initialBudget={initialBudget}
      />
    </div>
  );
}

export default function NegotiatePage() {
  return (
    <Suspense fallback={<div className="text-center py-16 text-[#475569]">Loading negotiation experience...</div>}>
      <NegotiateContent />
    </Suspense>
  );
}
