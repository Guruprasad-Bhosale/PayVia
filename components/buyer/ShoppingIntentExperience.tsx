"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OfferComparisonTable } from "./OfferComparisonTable";
import { CandidateOffer, ShoppingSession } from "@/lib/domain/types";
import LatticeLoader from "@/components/react-bits/LatticeLoader";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Search,
  Bot,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

export function ShoppingIntentExperience() {
  const router = useRouter();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  // Intent Form State
  const [query, setQuery] = useState("Developer Laptop under $760");
  const [maxBudget, setMaxBudget] = useState(760);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState(5);
  const [priority, setPriority] = useState<"PRICE" | "DELIVERY" | "BALANCED">("PRICE");

  // Flow State
  const [step, setStep] = useState<"INTENT" | "DISCOVERING" | "NEGOTIATING" | "OFFERS" | "SELECTED">("INTENT");
  const [stepMessage, setStepMessage] = useState("");
  const [session, setSession] = useState<ShoppingSession | null>(null);
  const [offers, setOffers] = useState<CandidateOffer[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [agreementId, setAgreementId] = useState<string | null>(null);

  const handleStartShopping = async () => {
    if (!query.trim()) return;
    setErrorMessage(null);
    setStep("DISCOVERING");
    setStepMessage("Scanning PayVia commerce network and merchant policies...");
    toastInfo("Buyer Agent Started", `Exploring deals for "${query}" within $${maxBudget}`);

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
      setStepMessage("Negotiating in parallel with merchant agents under private margin policies...");
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
      toastSuccess("Negotiations Complete", `${candidateOffers.length} competitive merchant offers ready for review`);
    } catch (err: any) {
      console.error("Shopping flow error:", err);
      const msg = err instanceof Error ? err.message : "Failed to complete shopping orchestration";
      setErrorMessage(msg);
      setStep("INTENT");
      toastError("Negotiation Error", msg);
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
      toastSuccess("Offer Selected & Agreement Locked", "Cryptographic terms generated. Ready for explicit human approval.");
    } catch (err: any) {
      const msg = err.message || "Failed to finalize offer selection";
      setErrorMessage(msg);
      toastError("Selection Error", msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Constraints Header */}
      <div className="p-6 rounded-xl bg-white border border-[#E2E8F0] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="info" className="text-xs">
                PayVia Buyer Network
              </Badge>
              <span className="text-xs text-[#5B6472]">Parallel Multi-Merchant Negotiation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#111827]">
              What are you looking to purchase?
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6472]">
              Express your intent and budget bounds. Your Buyer Agent negotiates directly with PayVia-enabled merchants to formulate competitive offers.
            </p>
          </div>
        </div>

        {/* Search Query Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="e.g. Developer Laptop under $760"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10 text-sm"
              disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
            />
          </div>

          <Button
            onClick={handleStartShopping}
            disabled={step === "DISCOVERING" || step === "NEGOTIATING" || !query.trim()}
            className="h-10 px-6 font-bold gap-2 text-sm"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Buyer Agent</span>
          </Button>
        </div>

        {/* Economic Constraints & Optimization Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E2E8F0]">
          <div className="space-y-1">
            <label className="text-xs text-[#5B6472] font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#16845B]" />
              <span>Budget Ceiling (USD):</span>
            </label>
            <Input
              type="number"
              step="10"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#5B6472] font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0070E0]" />
              <span>Max Delivery (Days):</span>
            </label>
            <Input
              type="number"
              min="1"
              max="14"
              value={maxDeliveryDays}
              onChange={(e) => setMaxDeliveryDays(Number(e.target.value))}
              disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
              className="h-9 text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#5B6472] font-semibold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#003087]" />
              <span>Optimization Priority:</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["PRICE", "DELIVERY", "BALANCED"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
                  className={`h-9 rounded-lg text-xs font-bold border transition-all ${
                    priority === p
                      ? "bg-[#EFF8FF] border-[#0070E0] text-[#003087] shadow-2xs"
                      : "bg-[#F5F7FA] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Real Agent Processing with React Bits LatticeLoader */}
        {(step === "DISCOVERING" || step === "NEGOTIATING") && (
          <div className="p-4 rounded-lg bg-[#EFF8FF] border border-[#0070E0]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LatticeLoader
                  status="working"
                  label={step === "DISCOVERING" ? "Discovering merchant candidates" : "Negotiating terms under merchant policies"}
                  pattern="orbit"
                  color="#003087"
                  doneColor="#16845B"
                  fontSize={13}
                  cellSize={6}
                />
              </div>
            </div>
            <p className="text-xs text-[#5B6472]">
              {stepMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-lg bg-[#FEF3F2] border border-[#D92D20]/30 text-xs text-[#D92D20] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Offers Ready or Selected State */}
      {(step === "OFFERS" || step === "SELECTED") && offers.length > 0 && (
        <div className="space-y-6">
          <OfferComparisonTable
            offers={offers}
            selectedOfferId={selectedOfferId}
            onSelectOffer={handleSelectOffer}
          />

          {step === "SELECTED" && agreementId && (
            <div className="p-6 rounded-xl bg-[#ECFDF5] border border-[#16845B]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#16845B]" />
                  <span className="text-sm font-bold text-[#111827]">
                    Authoritative Agreement Locked (SHA-256 Verified)
                  </span>
                </div>
                <p className="text-xs text-[#5B6472]">
                  Both agents converged on agreed economic terms. Proceed through the human approval gate to settle via PayPal.
                </p>
              </div>

              <Button
                onClick={() => router.push(`/agreement?id=${agreementId}`)}
                className="w-full sm:w-auto px-6 gap-2 bg-[#16845B] hover:bg-[#136C4A] font-bold text-sm text-white"
              >
                <span>Review Terms &amp; Consent</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
