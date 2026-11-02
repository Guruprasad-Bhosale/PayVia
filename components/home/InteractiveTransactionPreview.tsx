"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Lock,
  Bot,
  Store,
  CheckCircle2,
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
    shortLabel: "6. PayPal",
    title: "PayPal Orders v2 Settlement",
    subtitle: "Buyer authorizes payment on PayPal. Server captures funds and decrements merchant inventory.",
  },
];

export function InteractiveTransactionPreview() {
  const [currentIdx, setCurrentIdx] = useState(2); // Start at Negotiation phase for maximum visual engagement
  const currentStage = STAGES[currentIdx];

  const handleNext = () => {
    if (currentIdx < STAGES.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
  };

  return (
    <div className="rounded-2xl bg-white border border-[#DCE4EE] shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Top Protocol Header Bar */}
      <div className="bg-[#0B1B33] text-white p-3.5 px-5 flex items-center justify-between border-b border-sky-900/30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
          <span className="text-xs font-semibold font-mono tracking-wider text-sky-300 uppercase">
            PayVia Autonomous Engine
          </span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono">
            Demo Sandbox
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono text-slate-400">Step {currentIdx + 1} of 6</span>
        </div>
      </div>

      {/* Stage Tracker Navigation Pills */}
      <div className="flex border-b border-[#DCE4EE] bg-[#F0F9FF]/50 overflow-x-auto p-1.5 gap-1 scrollbar-none">
        {STAGES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrentIdx(idx)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
              idx === currentIdx
                ? "bg-[#0284C7] text-white font-semibold shadow-xs"
                : "text-[#52607A] hover:bg-white hover:text-[#0B1B33]"
            }`}
          >
            {s.shortLabel}
          </button>
        ))}
      </div>

      {/* Main Interactive Stage Body with Motion Transitions */}
      <div className="p-5 sm:p-6 space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
              Phase {currentStage.stepNumber}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B1B33] mt-0.5">{currentStage.title}</h3>
          <p className="text-xs text-[#52607A] leading-relaxed mt-0.5">{currentStage.subtitle}</p>
        </div>

        {/* Dynamic Mock View of Each Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-xl bg-[#F0F9FF]/60 border border-[#BAE6FD] p-4 text-xs space-y-2.5 min-h-[140px] flex flex-col justify-center"
          >
            {currentStage.id === "INTENT" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[#52607A]">
                  <span>Target Item:</span>
                  <strong className="text-[#0B1B33] font-medium">ThinkPad Workstation Laptop</strong>
                </div>
                <div className="flex justify-between items-center text-[#52607A]">
                  <span>Private Budget Ceiling:</span>
                  <strong className="text-[#0284C7] font-mono">$760.00 USD (Encrypted)</strong>
                </div>
                <div className="flex justify-between items-center text-[#52607A]">
                  <span>Max Transit SLA:</span>
                  <strong className="text-[#0B1B33]">5 Days</strong>
                </div>
              </div>
            )}

            {currentStage.id === "DISCOVERY" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">ThinkPad Certified Store</span>
                  <Badge variant="success" className="text-[10px]">Negotiable (Floor: $730)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Premier Hardware Co</span>
                  <Badge variant="success" className="text-[10px]">Negotiable (Floor: $740)</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Direct Logistics Hub</span>
                  <Badge variant="default" className="text-[10px]">Discovery Only</Badge>
                </div>
              </div>
            )}

            {currentStage.id === "NEGOTIATING" && (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white border border-[#DCE4EE] space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#0284C7] font-semibold text-[11px] flex items-center gap-1">
                      <Bot className="w-3 h-3" />
                      <span>Buyer Agent</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Round 2</span>
                  </div>
                  <p className="text-[#52607A] text-[11px] leading-relaxed">
                    &ldquo;Proposing $745 with 5-day delivery commitment for fast settlement.&rdquo;
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[#DCE4EE] space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#EC4899] font-semibold text-[11px] flex items-center gap-1">
                      <Store className="w-3 h-3" />
                      <span>Merchant Agent</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Counter</span>
                  </div>
                  <p className="text-[#52607A] text-[11px] leading-relaxed">
                    &ldquo;Consensus at $750.00 USD with guaranteed 3-day express dispatch.&rdquo;
                  </p>
                </div>
              </div>
            )}

            {currentStage.id === "OFFERS" && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-white border-2 border-[#0284C7] flex justify-between items-center shadow-xs">
                  <div>
                    <span className="font-semibold text-[#0B1B33] block">ThinkPad Certified Store</span>
                    <span className="text-[10px] text-[#059669]">Save $50.00 (3 days transit)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-[#0B1B33] font-mono">$750.00</span>
                    <Badge variant="pink" className="text-[9px] block">★ Best Value</Badge>
                  </div>
                </div>
              </div>
            )}

            {currentStage.id === "AGREEMENT" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Agreement Hash:</span>
                  <code className="text-[10px] font-mono font-bold text-[#0B1B33]">sha256:4f8e...9a12</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Buyer Authorization:</span>
                  <span className="text-[#059669] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Explicit Approval Required</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Locked Amount:</span>
                  <strong className="text-[#0B1B33] font-mono text-sm">$750.00 USD</strong>
                </div>
              </div>
            )}

            {currentStage.id === "PAYPAL" && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Settlement Gateway:</span>
                  <strong className="text-[#0284C7]">PayPal Orders v2 Sandbox</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Execution:</span>
                  <span className="text-[#059669] font-semibold">Atomic Server Capture</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#52607A]">Inventory Action:</span>
                  <span className="text-[#0B1B33]">1 Unit Decremented Permanently</span>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Stepper Navigation Buttons */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="text-xs border-[#DCE4EE] text-[#0B1B33] gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-[#52607A] gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </Button>

          {currentIdx < STAGES.length - 1 ? (
            <Button
              size="sm"
              onClick={handleNext}
              className="text-xs bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-semibold gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <Link href="/negotiate">
              <Button size="sm" className="text-xs bg-[#059669] hover:bg-[#047857] text-white font-semibold gap-1">
                <span>Start Live Deal</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default InteractiveTransactionPreview;
