"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Clock,
  Check,
  Play,
  Pause,
} from "lucide-react";

type FlowStage = "INTENT" | "DISCOVERY" | "NEGOTIATING" | "OFFERS" | "AGREEMENT" | "PAYPAL";

export function InteractiveTransactionPreview() {
  const [stage, setStage] = useState<FlowStage>("INTENT");
  const [isPlaying, setIsPlaying] = useState(true);

  // Animated negotiation price and delivery convergence state
  const [merchantAlphaPrice, setMerchantAlphaPrice] = useState(800);
  const [merchantAlphaDelivery, setMerchantAlphaDelivery] = useState(6);
  const [merchantBetaPrice, setMerchantBetaPrice] = useState(790);
  const [merchantBetaDelivery, setMerchantBetaDelivery] = useState(5);
  const [merchantGammaPrice, setMerchantGammaPrice] = useState(820);
  const [merchantGammaDelivery, setMerchantGammaDelivery] = useState(4);
  const [selectedOffer, setSelectedOffer] = useState<"ALPHA" | "BETA" | "GAMMA">("ALPHA");

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setStage((prev) => {
        if (prev === "INTENT") return "DISCOVERY";
        if (prev === "DISCOVERY") return "NEGOTIATING";
        if (prev === "NEGOTIATING") return "OFFERS";
        if (prev === "OFFERS") return "AGREEMENT";
        if (prev === "AGREEMENT") return "PAYPAL";
        return "INTENT";
      });
    }, 4000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Animate numbers during negotiation stage
  useEffect(() => {
    if (stage === "NEGOTIATING") {
      setMerchantAlphaPrice(800);
      setMerchantAlphaDelivery(6);
      setMerchantBetaPrice(790);
      setMerchantBetaDelivery(5);
      setMerchantGammaPrice(820);
      setMerchantGammaDelivery(4);

      const t1 = setTimeout(() => {
        setMerchantAlphaPrice(775);
        setMerchantAlphaDelivery(5);
        setMerchantBetaPrice(770);
        setMerchantGammaPrice(780);
        setMerchantGammaDelivery(3);
      }, 700);

      const t2 = setTimeout(() => {
        setMerchantAlphaPrice(755);
        setMerchantAlphaDelivery(4);
        setMerchantBetaPrice(760);
        setMerchantBetaDelivery(4);
        setMerchantGammaPrice(765);
        setMerchantGammaDelivery(3);
      }, 1500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else if (stage === "OFFERS" || stage === "AGREEMENT" || stage === "PAYPAL") {
      setMerchantAlphaPrice(755);
      setMerchantAlphaDelivery(4);
      setMerchantBetaPrice(760);
      setMerchantBetaDelivery(4);
      setMerchantGammaPrice(765);
      setMerchantGammaDelivery(3);
    }
  }, [stage]);

  const stages: { id: FlowStage; label: string; number: string }[] = [
    { id: "INTENT", label: "Buyer Intent", number: "1" },
    { id: "DISCOVERY", label: "Discovery", number: "2" },
    { id: "NEGOTIATING", label: "Negotiation", number: "3" },
    { id: "OFFERS", label: "Comparison", number: "4" },
    { id: "AGREEMENT", label: "Agreement", number: "5" },
    { id: "PAYPAL", label: "PayPal Settlement", number: "6" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-xl border border-[#E2E8F0] bg-white shadow-sm overflow-hidden transition-all">
      {/* Top Protocol Status Bar */}
      <div className="px-6 py-3.5 bg-[#F5F7FA] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0070E0] animate-pulse" />
          <span className="text-xs font-semibold text-[#111827]">
            PayVia Protocol Simulation · Autonomous Multi-Agent Consensus
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold text-[#5B6472] hover:text-[#111827] bg-white border border-[#E2E8F0] shadow-2xs hover:bg-[#F8FAFC] transition"
            aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current text-[#0070E0]" />}
            <span>{isPlaying ? "Pause" : "Auto-Play"}</span>
          </button>
          <span className="text-[11px] font-mono font-medium text-[#16845B] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#16845B]/20">
            Server-Authoritative
          </span>
        </div>
      </div>

      {/* Step Indicator Tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 border-b border-[#E2E8F0] text-xs bg-[#F8FAFC] divide-x divide-[#E2E8F0] overflow-x-auto">
        {stages.map((s, idx) => {
          const isActive = stage === s.id;
          const isPassed = stages.findIndex((x) => x.id === stage) > idx;

          return (
            <button
              key={s.id}
              onClick={() => {
                setStage(s.id);
                setIsPlaying(false);
              }}
              className={`p-3 text-left transition-all relative ${
                isActive
                  ? "bg-white text-[#003087] font-bold shadow-2xs"
                  : isPassed
                  ? "text-[#16845B] font-medium hover:bg-white/60"
                  : "text-[#5B6472] hover:bg-white/40"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-[#003087] text-white"
                      : isPassed
                      ? "bg-[#ECFDF5] text-[#16845B] border border-[#16845B]/30"
                      : "bg-[#E2E8F0] text-[#5B6472]"
                  }`}
                >
                  {isPassed ? <Check className="w-2.5 h-2.5" /> : s.number}
                </span>
                <span className="truncate">{s.label}</span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070E0]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Interactive Stage Content */}
      <div className="p-6 sm:p-8 min-h-[360px] flex flex-col justify-center bg-white">
        {stage === "INTENT" && (
          <div className="space-y-6 max-w-2xl mx-auto text-center">
            <div className="w-12 h-12 rounded-xl bg-[#EFF8FF] border border-[#0070E0]/20 flex items-center justify-center text-[#0070E0] mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase font-semibold text-[#0070E0] tracking-wider">
                Step 1 · Buyer Intent &amp; Private Constraints
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                &ldquo;Programming laptop under $760, delivered within 5 days.&rdquo;
              </h3>
              <p className="text-xs sm:text-sm text-[#5B6472]">
                The buyer states target product goals and private budget ceilings. Constraints are strictly defended from seller discovery.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="text-[11px] text-[#5B6472] block uppercase font-medium">Max Budget</span>
                <span className="text-base font-bold text-[#16845B] font-mono">$760.00</span>
                <span className="text-[10px] text-[#5B6472] block mt-0.5">Private ceiling</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="text-[11px] text-[#5B6472] block uppercase font-medium">Delivery SLA</span>
                <span className="text-base font-bold text-[#003087] font-mono">&le; 5 Days</span>
                <span className="text-[10px] text-[#5B6472] block mt-0.5">Express fulfillment</span>
              </div>
              <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0]">
                <span className="text-[11px] text-[#5B6472] block uppercase font-medium">Strategy</span>
                <span className="text-base font-bold text-[#0070E0] font-mono">PRICE_FIRST</span>
                <span className="text-[10px] text-[#5B6472] block mt-0.5">Deterministic rank</span>
              </div>
            </div>
          </div>
        )}

        {stage === "DISCOVERY" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-[#0070E0] tracking-wider">
                  Step 2 · Discovered Commerce Topology
                </span>
                <h3 className="text-lg font-bold text-[#111827]">
                  3 PayVia-Verified Merchants Discovered
                </h3>
              </div>
              <Badge variant="success" className="text-xs gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Negotiation Active</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#111827]">Alpha Compute Direct</span>
                  <Badge variant="info" className="text-[10px]">PayVia Enabled</Badge>
                </div>
                <div className="text-xs text-[#5B6472]">ThinkPad Workstation Pro</div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#E2E8F0] text-xs">
                  <span className="text-[#5B6472]">List: $800.00</span>
                  <span className="text-[#0070E0] font-medium">Policy: In Scope</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#111827]">Beta Tech Systems</span>
                  <Badge variant="info" className="text-[10px]">PayVia Enabled</Badge>
                </div>
                <div className="text-xs text-[#5B6472]">Dell XPS Developer Edition</div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#E2E8F0] text-xs">
                  <span className="text-[#5B6472]">List: $790.00</span>
                  <span className="text-[#0070E0] font-medium">Policy: In Scope</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-[#111827]">Gamma Rapid Express</span>
                  <Badge variant="info" className="text-[10px]">PayVia Enabled</Badge>
                </div>
                <div className="text-xs text-[#5B6472]">MacBook Pro Refurb M-Series</div>
                <div className="flex justify-between items-baseline pt-2 border-t border-[#E2E8F0] text-xs">
                  <span className="text-[#5B6472]">List: $820.00</span>
                  <span className="text-[#0070E0] font-medium">Policy: In Scope</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "NEGOTIATING" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-[#0070E0] tracking-wider">
                  Step 3 · Autonomous Multi-Turn Consensus
                </span>
                <h3 className="text-lg font-bold text-[#111827]">
                  Buyer &amp; Seller Agents Negotiating in Parallel
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#003087] bg-[#EFF8FF] px-3 py-1 rounded-full border border-[#0070E0]/20">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0070E0]" />
                <span className="font-semibold">Economic Terms Converging</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alpha Card */}
              <div className="p-5 rounded-xl bg-white border border-[#0070E0] shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#111827]">Alpha Compute</span>
                  <span className="text-[#16845B] font-mono text-xs font-bold bg-[#ECFDF5] px-2 py-0.5 rounded">Round 2</span>
                </div>
                <div className="text-center py-2 space-y-1">
                  <span className="text-[11px] text-[#5B6472] uppercase font-semibold">Live Proposal</span>
                  <div className="text-3xl font-extrabold text-[#16845B] font-mono transition-all duration-300">
                    ${merchantAlphaPrice}
                  </div>
                  <div className="text-xs text-[#5B6472] flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0070E0]" />
                    <span>{merchantAlphaDelivery} days delivery</span>
                  </div>
                </div>
                <div className="text-xs text-[#5B6472] bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                  &ldquo;Merchant conceded $45 margin under pre-authorized floor policy.&rdquo;
                </div>
              </div>

              {/* Beta Card */}
              <div className="p-5 rounded-xl bg-white border border-[#CBD5E1] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#111827]">Beta Tech Systems</span>
                  <span className="text-[#0070E0] font-mono text-xs font-bold bg-[#EFF8FF] px-2 py-0.5 rounded">Round 2</span>
                </div>
                <div className="text-center py-2 space-y-1">
                  <span className="text-[11px] text-[#5B6472] uppercase font-semibold">Live Proposal</span>
                  <div className="text-3xl font-extrabold text-[#003087] font-mono transition-all duration-300">
                    ${merchantBetaPrice}
                  </div>
                  <div className="text-xs text-[#5B6472] flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0070E0]" />
                    <span>{merchantBetaDelivery} days delivery</span>
                  </div>
                </div>
                <div className="text-xs text-[#5B6472] bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                  &ldquo;Matched target budget with standard 4-day shipping SLA.&rdquo;
                </div>
              </div>

              {/* Gamma Card */}
              <div className="p-5 rounded-xl bg-white border border-[#CBD5E1] space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#111827]">Gamma Rapid Express</span>
                  <span className="text-[#0070E0] font-mono text-xs font-bold bg-[#EFF8FF] px-2 py-0.5 rounded">Round 1</span>
                </div>
                <div className="text-center py-2 space-y-1">
                  <span className="text-[11px] text-[#5B6472] uppercase font-semibold">Live Proposal</span>
                  <div className="text-3xl font-extrabold text-[#003087] font-mono transition-all duration-300">
                    ${merchantGammaPrice}
                  </div>
                  <div className="text-xs text-[#5B6472] flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#0070E0]" />
                    <span>{merchantGammaDelivery} days delivery</span>
                  </div>
                </div>
                <div className="text-xs text-[#5B6472] bg-[#F5F7FA] p-2.5 rounded-lg border border-[#E2E8F0]">
                  &ldquo;Expedited 3-day transit offered over maximum price cut.&rdquo;
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "OFFERS" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-[#0070E0] tracking-wider">
                  Step 4 · Candidate Offer Comparison
                </span>
                <h3 className="text-lg font-bold text-[#111827]">
                  Select Winning Offer to Lock Agreement
                </h3>
              </div>
              <Badge variant="info" className="text-xs">
                Ranked: PRICE_FIRST
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A */}
              <div
                onClick={() => setSelectedOffer("ALPHA")}
                className={`p-5 rounded-xl cursor-pointer transition-all border ${
                  selectedOffer === "ALPHA"
                    ? "bg-white border-[#0070E0] shadow-md ring-2 ring-[#0070E0]/20"
                    : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="success" className="text-[10px]">★ Best Price</Badge>
                  <span className="text-xl font-extrabold text-[#16845B] font-mono">$755.00</span>
                </div>
                <div className="text-xs font-bold text-[#111827]">ThinkPad Workstation Pro</div>
                <div className="text-[11px] text-[#5B6472]">Alpha Compute Direct</div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] text-xs flex justify-between text-[#5B6472]">
                  <span className="font-semibold text-[#16845B]">Save $45.00</span>
                  <span>4 days transit</span>
                </div>
              </div>

              {/* Option B */}
              <div
                onClick={() => setSelectedOffer("BETA")}
                className={`p-5 rounded-xl cursor-pointer transition-all border ${
                  selectedOffer === "BETA"
                    ? "bg-white border-[#0070E0] shadow-md ring-2 ring-[#0070E0]/20"
                    : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="default" className="text-[10px]">Balanced</Badge>
                  <span className="text-xl font-extrabold text-[#111827] font-mono">$760.00</span>
                </div>
                <div className="text-xs font-bold text-[#111827]">Dell XPS Developer</div>
                <div className="text-[11px] text-[#5B6472]">Beta Tech Systems</div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] text-xs flex justify-between text-[#5B6472]">
                  <span className="font-semibold text-[#16845B]">Save $30.00</span>
                  <span>4 days transit</span>
                </div>
              </div>

              {/* Option C */}
              <div
                onClick={() => setSelectedOffer("GAMMA")}
                className={`p-5 rounded-xl cursor-pointer transition-all border ${
                  selectedOffer === "GAMMA"
                    ? "bg-white border-[#0070E0] shadow-md ring-2 ring-[#0070E0]/20"
                    : "bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="info" className="text-[10px]">⚡ Fastest</Badge>
                  <span className="text-xl font-extrabold text-[#111827] font-mono">$765.00</span>
                </div>
                <div className="text-xs font-bold text-[#111827]">MacBook Pro Refurb</div>
                <div className="text-[11px] text-[#5B6472]">Gamma Rapid Express</div>
                <div className="mt-3 pt-3 border-t border-[#E2E8F0] text-xs flex justify-between text-[#5B6472]">
                  <span className="font-semibold text-[#16845B]">Save $55.00</span>
                  <span>3 days transit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "AGREEMENT" && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] border border-[#16845B]/25 flex items-center justify-center text-[#16845B] mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold text-[#16845B] tracking-wider">
                Step 5 · Authoritative Agreement Sealing
              </span>
              <h3 className="text-2xl font-bold text-[#111827] tracking-tight">
                Agreement Locked: $755.00 USD
              </h3>
              <p className="text-xs text-[#5B6472]">
                Both buyer and seller agents reached mathematical consensus. Sealed with SHA-256 integrity hash.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-left space-y-2.5">
              <div className="flex justify-between text-xs text-[#5B6472]">
                <span>Product:</span>
                <span className="font-bold text-[#111827]">ThinkPad Workstation Pro</span>
              </div>
              <div className="flex justify-between text-xs text-[#5B6472]">
                <span>Merchant:</span>
                <span className="text-[#003087] font-semibold">Alpha Compute Direct</span>
              </div>
              <div className="flex justify-between text-xs text-[#5B6472]">
                <span>List Price:</span>
                <span className="line-through text-[#94A3B8]">$800.00 USD</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-[#16845B] border-t border-[#E2E8F0] pt-2">
                <span>Agreed Final Price:</span>
                <span className="text-base font-mono">$755.00 USD (Save $45.00)</span>
              </div>
              <div className="text-[10px] font-mono text-[#94A3B8] truncate pt-1 border-t border-[#E2E8F0]">
                SHA-256: 8f4a2b910e2c84d7719f932e604724a...
              </div>
            </div>
          </div>
        )}

        {stage === "PAYPAL" && (
          <div className="max-w-xl mx-auto space-y-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#EFF8FF] border border-[#0070E0]/30 flex items-center justify-center text-[#003087] mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-semibold text-[#003087] tracking-wider">
                Step 6 · PayPal Orders v2 Settlement
              </span>
              <h3 className="text-2xl font-bold text-[#111827] tracking-tight">
                Payment Settled via PayPal
              </h3>
              <p className="text-xs text-[#5B6472]">
                PayPal captures the exact locked Agreement amount ($755.00). Stock decremented atomically.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#16845B]/30 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#16845B] font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Transaction Complete &amp; Cryptographically Bound</span>
              </div>
              <div className="text-[#5B6472] text-xs pl-6">
                Settlement Rail: PayPal Orders v2 Sandbox · Order #ORDER_PAYPAL_VERIFIED
              </div>
              <div className="text-[#5B6472] text-xs pl-6">
                Fulfillment SLA: 4-Day Transit Verified (Bryntum Scheduler Synced)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="px-6 py-3.5 bg-[#F5F7FA] border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-[#5B6472]">
          <span className="font-semibold text-[#111827]">Core Promise:</span> AI negotiates. PayPal settles.
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setStage((prev) => {
              const idx = stages.findIndex((x) => x.id === prev);
              const nextIdx = (idx + 1) % stages.length;
              return stages[nextIdx].id;
            });
            setIsPlaying(false);
          }}
        >
          <span>Next Step</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
