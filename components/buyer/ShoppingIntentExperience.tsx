"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OfferComparisonTable } from "./OfferComparisonTable";
import { CandidateOffer, ShoppingSession } from "@/lib/domain/types";
import {
  Search,
  Bot,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";

export function ShoppingIntentExperience() {
  const router = useRouter();

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
    setStepMessage("Initializing Buyer Shopping Intent & discovering commerce network...");

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
      setStepMessage("Scanning PayVia-enabled merchants and commerce catalog...");
      const discoverRes = await fetch(`/api/v1/shopping-intents/${intentData.intent.id}/discover`, {
        method: "POST",
      });
      const discoverData = await discoverRes.json();
      if (!discoverRes.ok) {
        throw new Error(discoverData.error?.message || "Failed to discover candidates");
      }

      // 3. Parallel Multi-Merchant AI Negotiation
      setStep("NEGOTIATING");
      setStepMessage("Buyer Agent negotiating in parallel with merchant agents under private margin policies...");
      await new Promise((r) => setTimeout(r, 600));

      const negotiateRes = await fetch(`/api/v1/shopping-sessions/${activeSessionId}/negotiate`, {
        method: "POST",
      });
      const negotiateData = await negotiateRes.json();
      if (!negotiateRes.ok) {
        throw new Error(negotiateData.error?.message || "Failed to negotiate offers");
      }

      setSession(negotiateData.session);
      setOffers(negotiateData.offers || negotiateData.session?.candidateOffers || []);
      setStep("OFFERS");
    } catch (err: any) {
      console.error("Shopping flow error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to complete shopping orchestration");
      setStep("INTENT");
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

      setSession(data.session);
      setAgreementId(data.agreement?.id || data.transaction?.activeAgreementId || null);
      setStep("SELECTED");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to finalize offer selection");
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Constraints Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/20 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="text-xs gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>PayVia Autonomous Buyer Network</span>
              </Badge>
              <span className="text-xs text-slate-400">Parallel Multi-Merchant Negotiation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              What are you looking to buy?
            </h2>
            <p className="text-xs text-slate-300">
              Express your intent and budget bounds. Your Buyer Agent negotiates directly with PayVia-enabled merchants to formulate competitive offers.
            </p>
          </div>
        </div>

        {/* Search Query Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="e.g. Developer Laptop under $760"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 text-sm bg-slate-950/80 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
              disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
            />
          </div>

          <Button
            onClick={handleStartShopping}
            disabled={step === "DISCOVERING" || step === "NEGOTIATING" || !query.trim()}
            className="h-11 px-6 font-bold gap-2 bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 text-sm"
          >
            {step === "DISCOVERING" || step === "NEGOTIATING" ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Orchestrating...</span>
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                <span>Launch Buyer Agent</span>
              </>
            )}
          </Button>
        </div>

        {/* Economic Constraints & Optimization Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span>Budget Ceiling:</span>
            </label>
            <Input
              type="number"
              step="10"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
              className="h-9 text-xs bg-slate-950 border-slate-700 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-400" />
              <span>Max Delivery (Days):</span>
            </label>
            <Input
              type="number"
              min="1"
              max="14"
              value={maxDeliveryDays}
              onChange={(e) => setMaxDeliveryDays(Number(e.target.value))}
              disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
              className="h-9 text-xs bg-slate-950 border-slate-700 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-purple-400" />
              <span>Optimization Priority:</span>
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["PRICE", "DELIVERY", "BALANCED"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  disabled={step === "DISCOVERING" || step === "NEGOTIATING"}
                  className={`h-9 rounded-lg text-[10px] font-bold border transition-colors ${
                    priority === p
                      ? "bg-blue-600/30 border-blue-500 text-blue-300"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Parallel Multi-Merchant AI Negotiation Live Animation */}
        {step === "NEGOTIATING" && (
          <div className="p-6 rounded-2xl bg-slate-950 border border-blue-500/30 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider">
                  Live Autonomous Negotiation Mesh
                </span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Buyer Agent Negotiating Concurrently with 3 Merchants</span>
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Economic Terms Converging</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/40 space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Alpha Compute Direct</span>
                  <Badge variant="success" className="text-[10px] animate-pulse">Counter Offer</Badge>
                </div>
                <div className="text-xs text-slate-400">ThinkPad Workstation Pro</div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-slate-400 line-through">$800.00</span>
                  <span className="text-lg font-extrabold text-emerald-400 font-mono">$755.00</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>4 days delivery agreed</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Beta Tech Systems</span>
                  <Badge variant="purple" className="text-[10px] animate-pulse">Counter Offer</Badge>
                </div>
                <div className="text-xs text-slate-400">Dell XPS Developer Edition</div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-slate-400 line-through">$790.00</span>
                  <span className="text-lg font-extrabold text-indigo-300 font-mono">$760.00</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-indigo-400" />
                  <span>4 days delivery agreed</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-purple-500/40 space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Gamma Rapid Express</span>
                  <Badge variant="info" className="text-[10px] animate-pulse">Fastest SLA</Badge>
                </div>
                <div className="text-xs text-slate-400">MacBook Pro Refurb M-Series</div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xs text-slate-400 line-through">$820.00</span>
                  <span className="text-lg font-extrabold text-purple-300 font-mono">$765.00</span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span>3 days express transit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress State Banner */}
        {(step === "DISCOVERING" || step === "NEGOTIATING") && (
          <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 flex items-center gap-2.5 text-xs text-blue-300 animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400 flex-shrink-0" />
            <span className="font-mono">{stepMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
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
            <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl animate-in fade-in duration-300">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    Authoritative Agreement Locked (SHA-256 Verified)
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Both agents converged on agreed economic terms. Proceed through the human approval gate to settle via PayPal.
                </p>
              </div>

              <Button
                onClick={() => router.push(`/agreement?id=${agreementId}`)}
                className="w-full sm:w-auto px-8 gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold shadow-lg shadow-emerald-500/25 text-sm"
              >
                <span>Approve &amp; Pay with PayPal</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
