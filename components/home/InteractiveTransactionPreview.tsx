"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

type FlowStage = "INTENT" | "DISCOVERY" | "NEGOTIATING" | "OFFERS" | "AGREEMENT" | "PAYPAL";

interface StageConfig {
  id: FlowStage;
  stepNumber: number;
  shortLabel: string;
  title: string;
  subtitle: string;
}

const STAGES: StageConfig[] = [
  {
    id: "INTENT",
    stepNumber: 1,
    shortLabel: "1. Intent",
    title: "Buyer Intent & Private Constraints",
    subtitle: "State target product goals and private budget ceilings. Never revealed to seller agents.",
  },
  {
    id: "DISCOVERY",
    stepNumber: 2,
    shortLabel: "2. Discovery",
    title: "Multi-Merchant Discovery",
    subtitle: "Identify registered PayVia merchants with matching inventory and active negotiation policies.",
  },
  {
    id: "NEGOTIATING",
    stepNumber: 3,
    shortLabel: "3. Negotiation",
    title: "Parallel AI Negotiation",
    subtitle: "Buyer agent negotiates terms concurrently within strict merchant margin floor boundaries.",
  },
  {
    id: "OFFERS",
    stepNumber: 4,
    shortLabel: "4. Comparison",
    title: "Deterministic Offer Ranking",
    subtitle: "Multi-merchant counter-offers ranked objectively by price, delivery speed, and composite score.",
  },
  {
    id: "AGREEMENT",
    stepNumber: 5,
    shortLabel: "5. Agreement",
    title: "Cryptographic SHA-256 Agreement",
    subtitle: "Winning offer is cryptographically sealed into an immutable agreement awaiting human approval.",
  },
  {
    id: "PAYPAL",
    stepNumber: 6,
    shortLabel: "6. Settlement",
    title: "PayPal Orders v2 Settlement",
    subtitle: "PayPal executes payment for the exact agreed amount. Server verifies and captures instantly.",
  },
];

export function InteractiveTransactionPreview() {
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const currentStage = STAGES[currentStageIndex];

  const handleNext = () => {
    if (currentStageIndex < STAGES.length - 1) {
      setCurrentStageIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStageIndex(0);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-[#D9E0E9] shadow-sm overflow-hidden flex flex-col">
      {/* 
        ========================================================================
        STEP PROGRESS BAR
        - Clean, responsive tabs showing progress across all 6 stages
        ========================================================================
      */}
      <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs">
        {STAGES.map((s, idx) => {
          const isActive = idx === currentStageIndex;
          const isPassed = idx < currentStageIndex;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrentStageIndex(idx)}
              className={`p-3 text-center sm:text-left transition-all relative border-r last:border-r-0 border-[#E2E8F0] focus:outline-none ${
                isActive
                  ? "bg-white text-[#003087] font-bold shadow-2xs"
                  : isPassed
                  ? "text-[#16845B] font-medium hover:bg-white/60"
                  : "text-[#5C6678] hover:bg-white/40"
              }`}
            >
              <div className="flex items-center justify-center sm:justify-start gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-[#003087] text-white"
                      : isPassed
                      ? "bg-[#ECFDF5] text-[#16845B] border border-[#16845B]/30"
                      : "bg-[#E2E8F0] text-[#5C6678]"
                  }`}
                >
                  {isPassed ? "✓" : s.stepNumber}
                </span>
                <span className="hidden sm:inline truncate">{s.shortLabel}</span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070E0]" />
              )}
            </button>
          );
        })}
      </div>

      {/* 
        ========================================================================
        STAGE CARD BODY
        - Renders ONLY the currently active stage with full clarity
        ========================================================================
      */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between min-h-[340px]">
        <div className="space-y-4">
          {/* Stage Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0070E0] bg-[#EFF8FF] px-2 py-0.5 rounded border border-[#0070E0]/20 inline-block">
                Stage {currentStage.stepNumber} of 6
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#101828] tracking-tight">
                {currentStage.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#5C6678] max-w-xl">
                {currentStage.subtitle}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-[#16845B] bg-[#ECFDF5] px-2.5 py-1 rounded-lg border border-[#16845B]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Rule</span>
            </div>
          </div>

          {/* Stage Content Switcher */}
          <div className="pt-2">
            {currentStage.id === "INTENT" && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#101828]">
                  <Bot className="w-4 h-4 text-[#0070E0]" />
                  <span>Buyer Request: ThinkPad Workstation under $760</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#5C6678] block">Max Budget Ceiling</span>
                    <span className="text-base font-bold text-[#16845B] font-mono">$760.00 USD</span>
                    <span className="text-[10px] text-[#5C6678] block">Private constraint</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#5C6678] block">Target Delivery</span>
                    <span className="text-base font-bold text-[#003087] font-mono">≤ 5 Days</span>
                    <span className="text-[10px] text-[#5C6678] block">Express shipping</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase font-bold text-[#5C6678] block">Ranking Priority</span>
                    <span className="text-base font-bold text-[#0070E0] font-mono">BALANCED</span>
                    <span className="text-[10px] text-[#5C6678] block">Price &amp; Speed score</span>
                  </div>
                </div>
              </div>
            )}

            {currentStage.id === "DISCOVERY" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#101828]">
                    <span>Alpha Direct</span>
                    <Badge variant="info" className="text-[9px]">Registered</Badge>
                  </div>
                  <div className="text-xs text-[#5C6678]">ThinkPad T14 Gen 4</div>
                  <div className="text-xs font-mono font-bold text-[#101828] pt-1">List: $800.00</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#101828]">
                    <span>Beta Systems</span>
                    <Badge variant="info" className="text-[9px]">Registered</Badge>
                  </div>
                  <div className="text-xs text-[#5C6678]">ThinkPad E14 Pro</div>
                  <div className="text-xs font-mono font-bold text-[#101828] pt-1">List: $790.00</div>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold text-[#101828]">
                    <span>Gamma Express</span>
                    <Badge variant="info" className="text-[9px]">Registered</Badge>
                  </div>
                  <div className="text-xs text-[#5C6678]">ThinkPad L15 Fast</div>
                  <div className="text-xs font-mono font-bold text-[#101828] pt-1">List: $820.00</div>
                </div>
              </div>
            )}

            {currentStage.id === "NEGOTIATING" && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#003087]">Multi-Turn Agent Exchange</span>
                  <span className="text-[#16845B] font-semibold">3 Rounds Completed</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <span>Alpha Direct Agent counter-offered:</span>
                    <strong className="text-[#0070E0] font-mono">$755.00 · 4 Days</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <span>Beta Systems Agent counter-offered:</span>
                    <strong className="text-[#0070E0] font-mono">$760.00 · 4 Days</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E8F0] flex items-center justify-between">
                    <span>Gamma Express Agent counter-offered:</span>
                    <strong className="text-[#0070E0] font-mono">$765.00 · 3 Days</strong>
                  </div>
                </div>
              </div>
            )}

            {currentStage.id === "OFFERS" && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#101828]">Ranked Offer Matrix (Top Match Selected)</span>
                  <Badge variant="success" className="text-[10px]">Rank #1 Selected</Badge>
                </div>
                <div className="p-3 bg-white rounded-lg border-2 border-[#0070E0] flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <strong className="text-[#003087] block">Alpha Direct — Best Composite Score</strong>
                    <span className="text-[#5C6678]">ThinkPad T14 Gen 4 · Free Express Delivery</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#16845B] font-mono">$755.00</span>
                    <span className="text-[10px] text-[#5C6678] block">Saved $45.00</span>
                  </div>
                </div>
              </div>
            )}

            {currentStage.id === "AGREEMENT" && (
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#101828]">Cryptographic Agreement Record</span>
                  <span className="font-mono text-[10px] text-[#16845B]">SHA-256 Validated</span>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5C6678]">Agreement ID:</span>
                    <span className="font-mono font-bold text-[#101828]">agr_alpha_755_prod</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6678]">Authoritative Final Price:</span>
                    <span className="font-mono font-bold text-[#16845B] text-sm">$755.00 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6678]">Human Approval Gate:</span>
                    <span className="text-[#0070E0] font-bold">Explicit Consent Required</span>
                  </div>
                </div>
              </div>
            )}

            {currentStage.id === "PAYPAL" && (
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#16845B]/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#16845B]">PayPal Orders v2 Sandbox Handshake</span>
                  <Badge variant="success" className="text-[10px]">Captured</Badge>
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#16845B]/20 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#5C6678]">PayPal Transaction:</span>
                    <span className="font-mono font-bold text-[#101828]">ORD_PAYPAL_9941_V2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6678]">Settled Exact Amount:</span>
                    <span className="font-mono font-bold text-[#16845B] text-sm">$755.00 USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5C6678]">Inventory Reservation:</span>
                    <span className="text-[#003087] font-semibold">Stock Decremented &amp; Confirmed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 
          ========================================================================
          STAGE CONTROLS & STEP NAVIGATION
          ========================================================================
        */}
        <div className="pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStageIndex === 0}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D9E0E9] bg-white text-[#5C6678] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 inline mr-1" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-[#5C6678] hover:text-[#003087] hover:bg-[#EFF8FF] transition"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              Reset
            </button>
          </div>

          <div className="flex items-center gap-3">
            {currentStageIndex < STAGES.length - 1 ? (
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1.5 bg-[#003087] hover:bg-[#002266] text-white font-bold text-xs px-4"
              >
                <span>Next: {STAGES[currentStageIndex + 1].shortLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Link href="/negotiate">
                <Button
                  size="sm"
                  className="gap-1.5 bg-[#16845B] hover:bg-[#136C4A] text-white font-bold text-xs px-4"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Live Negotiation</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InteractiveTransactionPreview;
