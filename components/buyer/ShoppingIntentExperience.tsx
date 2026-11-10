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
  initialSessionId?: string;
}

export function ShoppingIntentExperience({
  initialQuery = "ThinkPad Workstation Laptop",
  initialBudget = 760,
  initialDeliveryDays = 5,
  initialSessionId,
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
  const restoredSessionRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!initialSessionId) return;
    if (session?.id === initialSessionId || restoredSessionRef.current === initialSessionId) return;
    restoredSessionRef.current = initialSessionId;

    async function restoreSession(sessionIdToLoad: string) {
      try {
        const sRes = await fetch(`/api/v1/shopping-sessions/${encodeURIComponent(sessionIdToLoad)}`);
        const sData = await sRes.json();
        if (!sRes.ok || !sData?.session) return;

        const loadedSession: ShoppingSession = sData.session;
        setSession(loadedSession);
        setOffers(loadedSession.candidateOffers || []);
        setSelectedOfferId(loadedSession.selectedOfferId);

        if (loadedSession.shoppingIntentId) {
          try {
            const iRes = await fetch(`/api/v1/shopping-intents/${encodeURIComponent(loadedSession.shoppingIntentId)}`);
            const iData = await iRes.json();
            if (iRes.ok && iData?.intent) {
              setQuery(iData.intent.query);
              if (iData.intent.constraints?.maxTotal) setMaxBudget(iData.intent.constraints.maxTotal);
              if (iData.intent.constraints?.maxDeliveryDays) setMaxDeliveryDays(iData.intent.constraints.maxDeliveryDays);
            }
          } catch {
            // Keep existing input values if intent fetch fails
          }
        }

        if ((loadedSession.candidateOffers || []).length > 0) {
          setStep("OFFERS");
        }
      } catch {
        // Fallback to clean composer
      }
    }

    restoreSession(initialSessionId);
  }, [initialSessionId, session?.id]);

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
            brandKeywords: [],
            priority,
          },
        }),
      });

      if (!intentRes.ok) {
        const err = await intentRes.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create shopping intent");
      }

      const intentData = await intentRes.json();
      const currentSession: ShoppingSession = intentData.session;
      setSession(currentSession);

      // 2. Discover Merchant Items
      setStepMessage("Matching with participating merchant inventories...");
      const discoverRes = await fetch(`/api/v1/shopping-intents/${intentData.intent.id}/discover`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: currentSession.id }),
      });

      if (!discoverRes.ok) {
        const err = await discoverRes.json().catch(() => ({}));
        throw new Error(err.message || "Discovery failed");
      }

      // 3. Negotiate Eligible Offers
      setStep("NEGOTIATING");
      setStepMessage("Buyer & merchant AI agents negotiating prices and delivery SLA...");
      const negotiateRes = await fetch(`/api/v1/shopping-sessions/${currentSession.id}/negotiate`, {
        method: "POST",
      });

      if (!negotiateRes.ok) {
        const err = await negotiateRes.json().catch(() => ({}));
        throw new Error(err.message || "Negotiation round failed");
      }

      const negotiateData = await negotiateRes.json();
      const candidateOffers: CandidateOffer[] = negotiateData.offers || [];

      setOffers(candidateOffers);
      setStep("OFFERS");

      try {
        sessionStorage.setItem("payvia_last_session_id", currentSession.id);
        if (typeof window !== "undefined" && window.location.pathname === "/negotiate") {
          window.history.replaceState(null, "", `/negotiate?sessionId=${encodeURIComponent(currentSession.id)}`);
        }
      } catch {
        // Ignore history/storage errors
      }

      if (candidateOffers.length > 0) {
        toastSuccess("Offers Ready", `Found ${candidateOffers.length} negotiated offers matching your criteria`);
      } else {
        toastInfo("No Deals Met Criteria", "Try raising your budget or extending your delivery SLA");
      }
    } catch (err: any) {
      console.error("Shopping flow error:", err);
      const msg = err.message || "An unexpected error occurred";
      setErrorMessage(msg);
      toastError("Negotiation Error", msg);
      setStep("INTENT");
    }
  };

  const handleSelectOffer = async (offerId: string) => {
    if (!session) return;
    try {
      setSelectedOfferId(offerId);
      const res = await fetch(`/api/v1/shopping-sessions/${session.id}/offers/${offerId}/select`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to select offer");
      }

      const data = await res.json();
      const agreement = data.agreement;
      if (agreement?.id) {
        setAgreementId(agreement.id);
        toastSuccess("Offer Selected", "Draft agreement created. Navigating to agreement review...");
        router.push(`/agreement?id=${agreement.id}`);
      } else {
        setStep("SELECTED");
      }
    } catch (err: any) {
      console.error("Select offer error:", err);
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
        - Clean White Surface, Light Slate Borders, Sky Blue Accents
        - Subtle Ice Blue example helper
        ========================================================================
      */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#DCE4EE] shadow-sm space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
            <span>Autonomous Procurement</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1B33] tracking-tight">
            Describe your purchase
          </h2>
          <p className="text-xs sm:text-sm text-[#52607A]">
            Tell PayVia what you need. AI agents negotiate eligible offers within merchant-authorized limits.
          </p>
        </div>

        {/* Natural Language Example Helper */}
        <div className="p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] text-xs text-[#52607A] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
            <span>
              <strong className="text-[#0B1B33] font-semibold">Example:</strong> &ldquo;A lightweight laptop for college, under $760, delivered within five days.&rdquo;
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery("Lightweight laptop for college");
              setMaxBudget(760);
              setMaxDeliveryDays(5);
            }}
            className="text-[11px] font-semibold text-[#0284C7] hover:underline flex-shrink-0 cursor-pointer"
          >
            Use this example
          </button>
        </div>

        <form onSubmit={handleStartShopping} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* 1. Product Query (6 cols) */}
            <div className="sm:col-span-6 space-y-1.5">
              <label htmlFor="shopping-product-query" className="text-xs font-bold text-[#0B1B33] block">
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
                  className="pl-9 h-11 text-sm bg-white border-[#DCE4EE] text-[#0B1B33] focus:border-[#0284C7] focus:ring-2 focus:ring-[#38BDF8]/20"
                  disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
                  required
                />
              </div>
            </div>

            {/* 2. Maximum Budget (3 cols) */}
            <div className="sm:col-span-3 space-y-1.5">
              <label htmlFor="shopping-max-budget" className="text-xs font-bold text-[#0B1B33] block">
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
                  className="pl-9 h-11 text-sm bg-white border-[#DCE4EE] text-[#0B1B33] font-mono focus:border-[#0284C7] focus:ring-2 focus:ring-[#38BDF8]/20"
                  disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
                  required
                />
              </div>
            </div>

            {/* 3. Delivery SLA (3 cols) */}
            <div className="sm:col-span-3 space-y-1.5">
              <label htmlFor="shopping-delivery-time" className="text-xs font-bold text-[#0B1B33] block">
                Delivery Deadline
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="shopping-delivery-time"
                  value={maxDeliveryDays}
                  onChange={(e) => setMaxDeliveryDays(Number(e.target.value))}
                  className="w-full h-11 pl-9 pr-3 text-sm rounded-lg border border-[#DCE4EE] bg-white focus:bg-white text-[#0B1B33] focus:outline-none focus:border-[#0284C7] focus:ring-2 focus:ring-[#38BDF8]/20 transition-colors"
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
              className="text-xs font-semibold text-[#0284C7] hover:text-[#0B1B33] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvanced ? "Hide advanced preferences" : "Show advanced preferences"}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex flex-wrap items-center gap-4 text-xs">
                <span className="font-bold text-[#0B1B33]">Deal Priority:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#52607A]">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === "PRICE"}
                    onChange={() => setPriority("PRICE")}
                    className="text-[#0284C7] focus:ring-[#38BDF8]"
                  />
                  <span>Lowest Price</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#52607A]">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === "DELIVERY"}
                    onChange={() => setPriority("DELIVERY")}
                    className="text-[#0284C7] focus:ring-[#38BDF8]"
                  />
                  <span>Fastest Delivery</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-[#52607A]">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === "BALANCED"}
                    onChange={() => setPriority("BALANCED")}
                    className="text-[#0284C7] focus:ring-[#38BDF8]"
                  />
                  <span>Balanced Score</span>
                </label>
              </div>
            )}
          </div>

          {/* Primary Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#52607A]">
              Your budget is kept private and never exposed to seller agents.
            </p>

            <Button
              type="submit"
              size="lg"
              disabled={step === "DISCOVERING" || step === "NEGOTIATING" || !query.trim()}
              className="w-full sm:w-auto px-8 font-bold bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs gap-2 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-sky-200" />
              <span>Find my deal</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">Unable to complete request</p>
              <p className="font-medium text-[#52607A]">{errorMessage}</p>
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
        <div className="p-8 rounded-2xl bg-white border border-[#BAE6FD] text-center space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] mx-auto animate-spin">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#0B1B33]">Finding and negotiating your deal</h3>
            <p className="text-xs text-[#52607A]">{stepMessage}</p>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        EMPTY STATE
        ========================================================================
      */}
      {step === "OFFERS" && offers.length === 0 && (
        <div className="p-8 rounded-2xl bg-white border border-[#DCE4EE] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#52607A] mx-auto">
            <Search className="w-6 h-6 text-[#0284C7]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0B1B33]">No eligible offers found</h3>
            <p className="text-xs text-[#52607A]">
              No merchants could meet your budget of ${maxBudget} or delivery time of {maxDeliveryDays} days. Try adjusting your constraints.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-[#DCE4EE] text-[#0B1B33] hover:bg-[#F0F9FF]"
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
            <h3 className="text-lg font-bold text-[#0B1B33] flex items-center gap-2">
              <span>{offers.length} Negotiated Deals Found</span>
              <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
            </h3>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-[#52607A] hover:text-[#0284C7] flex items-center gap-1 cursor-pointer"
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
        <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
                <ShieldCheck className="w-4 h-4 text-[#059669]" />
                <span>Deal Selected &amp; Locked</span>
              </div>
              <h3 className="text-lg font-bold text-[#0B1B33]">
                Ready for your explicit review and approval
              </h3>
              <p className="text-xs text-[#52607A]">
                Review the exact price, delivery SLA, and terms before PayPal is charged.
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => router.push(`/agreement?id=${agreementId || session?.id}`)}
              className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 gap-2"
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
