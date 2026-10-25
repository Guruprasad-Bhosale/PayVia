"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OfferComparisonTable } from "./OfferComparisonTable";
import { CandidateOffer, ShoppingSession } from "@/lib/domain/types";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Search,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Clock,
  SlidersHorizontal,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";

export interface ShoppingIntentExperienceProps {
  initialQuery?: string;
  initialBudget?: number;
  initialDeliveryDays?: number;
}

export function ShoppingIntentExperience({
  initialQuery = "ThinkPad Workstation Laptop",
  initialBudget = 760,
  initialDeliveryDays = 5,
}: ShoppingIntentExperienceProps = {}) {
  const router = useRouter();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // Intent Form State
  const [query, setQuery] = useState(initialQuery);
  const [maxBudget, setMaxBudget] = useState(initialBudget);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState(initialDeliveryDays);
  const [priority, setPriority] = useState<"PRICE" | "DELIVERY" | "BALANCED">("PRICE");
  const [showAdvanced, setShowAdvanced] = useState(false);

  React.useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
    if (initialBudget) setMaxBudget(initialBudget);
    if (initialDeliveryDays) setMaxDeliveryDays(initialDeliveryDays);
  }, [initialQuery, initialBudget, initialDeliveryDays]);

  // Flow State
  const [step, setStep] = useState<"INTENT" | "DISCOVERING" | "NEGOTIATING" | "OFFERS" | "SELECTED">("INTENT");
  const [stepMessage, setStepMessage] = useState("");
  const [session, setSession] = useState<ShoppingSession | null>(null);
  const [offers, setOffers] = useState<CandidateOffer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreementId, setAgreementId] = useState<string | null>(null);

  const handleStartShopping = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setErrorMessage(null);
    setStep("DISCOVERING");
    setStepMessage("Finding verified merchants with inventory...");
    toastInfo("Deal Finder Started", `Searching for "${query}" within $${maxBudget}`);

    try {
      // 1. Create Shopping Intent
      const intentRes = await fetch("/api/v1/shopping-intents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          constraints: {
            maxTotal: maxBudget,
            maxDeliveryDays,
            allowedPaymentTiming: ["IMMEDIATE"],
          },
          preferences: {
            priority,
            paymentTiming: "IMMEDIATE",
          },
        }),
      });

      const intentData = await intentRes.json();
      if (!intentRes.ok || !intentData.session) {
        throw new Error(intentData.error?.message || "Failed to initialize shopping intent");
      }

      const activeSessionId = intentData.session.id;

      // 2. Discover Candidates
      const discoverRes = await fetch(`/api/v1/shopping-intents/${intentData.intent.id}/discover`, {
        method: "POST",
      });
      const discoverData = await discoverRes.json();
      if (!discoverRes.ok) {
        throw new Error(discoverData.error?.message || "Failed to discover candidates");
      }

      // 3. Parallel Multi-Merchant AI Negotiation
      setStep("NEGOTIATING");
      setStepMessage("Negotiating in parallel with merchant agents within price floors...");
      await new Promise((r) => setTimeout(r, 600));

      const negotiateRes = await fetch(`/api/v1/shopping-sessions/${activeSessionId}/negotiate`, {
        method: "POST",
      });
      const negotiateData = await negotiateRes.json();
      if (!negotiateRes.ok) {
        throw new Error(negotiateData.error?.message || "Failed to negotiate offers");
      }

      const candidateOffers = negotiateData.offers || negotiateData.session?.candidateOffers || [];
      setSession(negotiateData.session);
      setOffers(candidateOffers);
      setStep("OFFERS");
      toastSuccess("Negotiation Complete", `${candidateOffers.length} merchant offers ready`);
    } catch (err: any) {
      console.error("Shopping flow error:", err);
      const msg = err instanceof Error ? err.message : "Failed to find deals";
      setErrorMessage(msg);
      setStep("INTENT");
      toastError("Error", msg);
    }
  };

  const handleSelectOffer = async (offerId: string) => {
    if (!session) return;
    setErrorMessage(null);
    try {
      setSelectedOfferId(offerId);
      const res = await fetch(`/api/v1/shopping-sessions/${session.id}/offers/${offerId}/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to select offer");
      }

      const lockedAgreementId = data.agreement?.id || data.transaction?.activeAgreementId || null;
      setSession(data.session);
      setAgreementId(lockedAgreementId);
      setStep("SELECTED");
      toastSuccess("Offer Selected", "Agreement generated. Ready for your review.");
    } catch (err: any) {
      const msg = err.message || "Failed to select offer";
      setErrorMessage(msg);
      toastError("Error", msg);
    }
  };

  const handleReset = () => {
    setStep("INTENT");
    setOffers([]);
    setSelectedOfferId(undefined);
    setAgreementId(null);
    setErrorMessage(null);
  };

  return (
    <div id="intent-composer" className="space-y-6 scroll-mt-24">
      {/* 
        ========================================================================
        SHOPPING INTENT FORM
        - Logical order: Product, Budget, Delivery SLA
        - Single primary action: Find my deal
        - Progressive disclosure for advanced ranking priorities
        ========================================================================
      */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A192F] tracking-tight">
            Describe your purchase
          </h2>
          <p className="text-xs sm:text-sm text-[#475569]">
            Tell PayVia what you need. AI agents negotiate eligible offers within merchant-authorized limits.
          </p>
        </div>

        {/* Natural Language Example Helper */}
        <div className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#475569] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0052CC] flex-shrink-0" />
            <span>
              <strong className="text-[#0A192F] font-semibold">Example:</strong> &ldquo;A lightweight laptop for college, under $760, delivered within five days.&rdquo;
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("Lightweight laptop for college");
              setMaxBudget(760);
              setMaxDeliveryDays(5);
            }}
            className="text-[11px] font-semibold text-[#0052CC] hover:underline flex-shrink-0"
          >
            Use this example
          </button>
        </div>

        <form onSubmit={handleStartShopping} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* 1. Product Query (6 cols) */}
            <div className="sm:col-span-6 space-y-1.5">
              <label htmlFor="shopping-product-query" className="text-xs font-bold text-[#0A192F] block">
                Product or Item Description
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="shopping-product-query"
                  type="text"
                  placeholder="e.g. ThinkPad Laptop, Sony Headphones"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-11 text-sm bg-[#F8FAFC] border-[#CBD5E1] text-[#0A192F] focus:bg-white focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                  disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
                  required
                />
              </div>
            </div>

            {/* 2. Maximum Budget (3 cols) */}
            <div className="sm:col-span-3 space-y-1.5">
              <label htmlFor="shopping-max-budget" className="text-xs font-bold text-[#0A192F] block">
                Maximum Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  id="shopping-max-budget"
                  type="number"
                  min={1}
                  step="any"
                  placeholder="760"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(Number(e.target.value))}
                  className="pl-9 h-11 text-sm bg-[#F8FAFC] border-[#CBD5E1] text-[#0A192F] focus:bg-white font-mono focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                  disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
                  required
                />
              </div>
            </div>

            {/* 3. Delivery SLA (3 cols) */}
            <div className="sm:col-span-3 space-y-1.5">
              <label htmlFor="shopping-delivery-time" className="text-xs font-bold text-[#0A192F] block">
                Delivery Deadline
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="shopping-delivery-time"
                  value={maxDeliveryDays}
                  onChange={(e) => setMaxDeliveryDays(Number(e.target.value))}
                  className="w-full h-11 pl-9 pr-3 text-sm rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] focus:bg-white text-[#0A192F] focus:outline-none focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                  disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
                >
                  <option value={3}>Within 3 Days</option>
                  <option value={5}>Within 5 Days</option>
                  <option value={7}>Within 7 Days</option>
                  <option value={14}>Within 14 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Progressive Disclosure Toggle */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-[#0052CC] hover:text-[#0A192F] flex items-center gap-1 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? "Hide advanced preferences" : "Show advanced preferences"}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center gap-4 text-xs">
                <span className="font-bold text-[#0A192F]">Deal Priority:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#475569]">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === "PRICE"}
                    onChange={() => setPriority("PRICE")}
                    className="text-[#0052CC] focus:ring-[#0052CC]"
                  />
                  <span>Lowest Price</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#475569]">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === "DELIVERY"}
                    onChange={() => setPriority("DELIVERY")}
                    className="text-[#0052CC] focus:ring-[#0052CC]"
                  />
                  <span>Fastest Delivery</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#475569]">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === "BALANCED"}
                    onChange={() => setPriority("BALANCED")}
                    className="text-[#0052CC] focus:ring-[#0052CC]"
                  />
                  <span>Balanced Score</span>
                </label>
              </div>
            )}
          </div>

          {/* Primary Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#475569]">
              Your budget is kept private and never exposed to seller agents.
            </p>

            <Button
              type="submit"
              size="lg"
              disabled={step === "DISCOVERING" || step === "NEGOTIATING" || !query.trim()}
              className="w-full sm:w-auto px-8 font-bold bg-[#0052CC] hover:bg-[#0A192F] text-white shadow-xs gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Find my deal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#EF4444]/30 text-[#991B1B] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Unable to complete request</p>
              <p className="font-medium text-[#475569]">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* 
        ========================================================================
        LOADING & NEGOTIATION PROGRESS
        ========================================================================
      */}
      {(step === "DISCOVERING" || step === "NEGOTIATING") && (
        <div className="p-8 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#F0F5FF] border border-[#0052CC]/20 flex items-center justify-center text-[#0052CC] mx-auto animate-spin">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#0A192F]">Finding and negotiating your deal</h3>
            <p className="text-xs text-[#475569]">{stepMessage}</p>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        EMPTY STATE
        ========================================================================
      */}
      {step === "OFFERS" && offers.length === 0 && (
        <div className="p-8 rounded-2xl bg-white border border-[#E2E8F0] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#475569] mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0A192F]">No eligible offers found</h3>
            <p className="text-xs text-[#475569]">
              No merchants could meet your budget of ${maxBudget} or delivery time of {maxDeliveryDays} days. Try adjusting your constraints.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-[#CBD5E1] text-[#0A192F] hover:bg-[#F8FAFC]"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Revise Request</span>
          </Button>
        </div>
      )}

      {/* 
        ========================================================================
        OFFER COMPARISON RESULTS
        ========================================================================
      */}
      {step === "OFFERS" && offers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#0A192F]">
              {offers.length} Negotiated Deals Found
            </h3>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#475569] hover:text-[#0052CC] flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Search</span>
            </button>
          </div>

          <OfferComparisonTable
            offers={offers}
            selectedOfferId={selectedOfferId}
            onSelectOffer={handleSelectOffer}
          />
        </div>
      )}

      {/* 
        ========================================================================
        SELECTED OFFER & DIRECT APPROVAL HANDOFF
        ========================================================================
      */}
      {step === "SELECTED" && (
        <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#0E6245]/30 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0E6245]">
                <ShieldCheck className="w-4 h-4 text-[#0E6245]" />
                <span>Deal Selected &amp; Locked</span>
              </div>
              <h3 className="text-lg font-bold text-[#0A192F]">
                Ready for your explicit review and approval
              </h3>
              <p className="text-xs text-[#475569]">
                Review the exact price, delivery SLA, and terms before PayPal is charged.
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => router.push(`/agreement?id=${agreementId || session?.id}`)}
              className="bg-[#0E6245] hover:bg-[#0A4E36] text-white font-bold px-6 gap-2"
            >
              <span>Review Agreement &amp; Settle</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShoppingIntentExperience;
