"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Sliders,
  TrendingDown,
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
    }, 3800);

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
    { id: "DISCOVERY", label: "Multi-Merchant Discovery", number: "2" },
    { id: "NEGOTIATING", label: "AI Negotiation", number: "3" },
    { id: "OFFERS", label: "Offer Comparison", number: "4" },
    { id: "AGREEMENT", label: "Sealed Agreement", number: "5" },
    { id: "PAYPAL", label: "PayPal Settlement", number: "6" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl border border-slate-700/60 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300">
      {/* Top Protocol Status Bar */}
      <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">
            Live Protocol Simulation: Autonomous Convergence
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-700 transition"
              aria-label={isPlaying ? "Pause animation" : "Play animation"}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? "Pause" : "Auto-Play"}</span>
            </button>
          </div>
          <Badge variant="purple" className="text-[11px] font-mono">
            Zero-Tamper
          </Badge>
        </div>
      </div>

      {/* Interactive Step Indicator */}
      <div className="grid grid-cols-6 border-b border-slate-800/80 text-xs bg-slate-950/40 divide-x divide-slate-800/60 overflow-x-auto">
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
                  ? "bg-blue-950/40 text-blue-300 font-bold"
                  : isPassed
                  ? "text-emerald-400 font-medium hover:bg-slate-900/60"
                  : "text-slate-400 hover:bg-slate-900/30"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? "bg-blue-500 text-white"
                      : isPassed
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isPassed ? <Check className="w-2.5 h-2.5" /> : s.number}
                </span>
                <span className="truncate hidden sm:inline">{s.label}</span>
              </div>
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Dynamic Interactive Stage Content */}
      <div className="p-6 sm:p-8 min-h-[380px] flex flex-col justify-center">
        {stage === "INTENT" && (
          <div className="space-y-6 max-w-2xl mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <span className="text-xs uppercase font-mono text-blue-400 font-semibold tracking-wider">
                Stage 1 · Buyer Intent Specification
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                &ldquo;Programming laptop under $760, within 5 days.&rdquo;
              </h3>
              <p className="text-xs text-slate-300">
                The buyer states goals and private constraints. The Buyer Agent initiates autonomous candidate discovery.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Max Budget</span>
                <span className="text-base font-bold text-emerald-400 font-mono">$760.00</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Ceiling locked</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Max Delivery</span>
                <span className="text-base font-bold text-blue-400 font-mono">&le; 5 Days</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Express SLA</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Optimization</span>
                <span className="text-base font-bold text-indigo-400 font-mono">PRICE_FIRST</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Deterministic</span>
              </div>
            </div>
          </div>
        )}

        {stage === "DISCOVERY" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-blue-400 font-semibold tracking-wider">
                  Stage 2 · Discovered Commerce Topology
                </span>
                <h3 className="text-lg font-bold text-white">
                  3 PayVia-Enabled Merchants Found
                </h3>
              </div>
              <Badge variant="success" className="text-xs gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Negotiable Verified</span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white">Alpha Compute Direct</span>
                  <Badge variant="success" className="text-[10px]">AI Negotiable</Badge>
                </div>
                <div className="text-xs text-slate-400">ThinkPad Workstation Pro</div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-xs text-slate-400">List: $800</span>
                  <span className="text-xs text-blue-400">Policy: Active</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white">Beta Tech Systems</span>
                  <Badge variant="success" className="text-[10px]">AI Negotiable</Badge>
                </div>
                <div className="text-xs text-slate-400">Dell XPS Developer Edition</div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-xs text-slate-400">List: $790</span>
                  <span className="text-xs text-blue-400">Policy: Active</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-white">Gamma Rapid Express</span>
                  <Badge variant="success" className="text-[10px]">AI Negotiable</Badge>
                </div>
                <div className="text-xs text-slate-400">MacBook Pro Refurb M-Series</div>
                <div className="flex justify-between items-baseline pt-2">
                  <span className="text-xs text-slate-400">List: $820</span>
                  <span className="text-xs text-blue-400">Policy: Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "NEGOTIATING" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-indigo-400 font-semibold tracking-wider">
                  Stage 3 · Autonomous Multi-Turn Consensus
                </span>
                <h3 className="text-lg font-bold text-white">
                  Buyer Agent &amp; Merchant Agents Negotiating in Parallel
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Economic Terms Converging</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Alpha Card */}
              <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Alpha Compute</span>
                  <span className="text-emerald-400 font-mono text-xs animate-pulse">Round 2</span>
                </div>
                <div className="text-center py-2 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Live Offer</span>
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono transition-all duration-300">
                    ${merchantAlphaPrice}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{merchantAlphaDelivery} days delivery</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  &ldquo;Merchant conceded $45 margin for immediate settlement.&rdquo;
                </div>
              </div>

              {/* Beta Card */}
              <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Beta Tech Systems</span>
                  <span className="text-indigo-400 font-mono text-xs animate-pulse">Round 2</span>
                </div>
                <div className="text-center py-2 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Live Offer</span>
                  <div className="text-3xl font-extrabold text-indigo-300 font-mono transition-all duration-300">
                    ${merchantBetaPrice}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-indigo-400" />
                    <span>{merchantBetaDelivery} days delivery</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  &ldquo;Matched target budget with standard 4-day shipping.&rdquo;
                </div>
              </div>

              {/* Gamma Card */}
              <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Gamma Rapid Express</span>
                  <span className="text-purple-400 font-mono text-xs animate-pulse">Round 1</span>
                </div>
                <div className="text-center py-2 space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase">Live Offer</span>
                  <div className="text-3xl font-extrabold text-purple-300 font-mono transition-all duration-300">
                    ${merchantGammaPrice}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    <span>{merchantGammaDelivery} days delivery</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                  &ldquo;Expedited 3-day transit prioritized over max price cut.&rdquo;
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "OFFERS" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-mono text-emerald-400 font-semibold tracking-wider">
                  Stage 4 · Deterministic Candidate Offer Ranking
                </span>
                <h3 className="text-lg font-bold text-white">
                  3 Negotiated Offers Ready for Buyer Selection
                </h3>
              </div>
              <Badge variant="purple" className="text-xs">
                Ranked: PRICE_FIRST
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Option A */}
              <div
                onClick={() => setSelectedOffer("ALPHA")}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  selectedOffer === "ALPHA"
                    ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="success" className="text-[10px]">★ Best Price</Badge>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">$755.00</span>
                </div>
                <div className="text-xs font-bold text-white">ThinkPad Workstation Pro</div>
                <div className="text-[11px] text-slate-400">Alpha Compute Direct</div>
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-300">
                  <span>Saved: $45.00</span>
                  <span>4 days transit</span>
                </div>
              </div>

              {/* Option B */}
              <div
                onClick={() => setSelectedOffer("BETA")}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  selectedOffer === "BETA"
                    ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="purple" className="text-[10px]">Balanced</Badge>
                  <span className="text-xl font-extrabold text-white font-mono">$760.00</span>
                </div>
                <div className="text-xs font-bold text-white">Dell XPS Developer</div>
                <div className="text-[11px] text-slate-400">Beta Tech Systems</div>
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-300">
                  <span>Saved: $30.00</span>
                  <span>4 days transit</span>
                </div>
              </div>

              {/* Option C */}
              <div
                onClick={() => setSelectedOffer("GAMMA")}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  selectedOffer === "GAMMA"
                    ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="info" className="text-[10px]">⚡ Fastest</Badge>
                  <span className="text-xl font-extrabold text-white font-mono">$765.00</span>
                </div>
                <div className="text-xs font-bold text-white">MacBook Pro Refurb</div>
                <div className="text-[11px] text-slate-400">Gamma Rapid Express</div>
                <div className="mt-3 pt-3 border-t border-slate-800 text-xs flex justify-between text-slate-300">
                  <span>Saved: $55.00</span>
                  <span>3 days transit</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {stage === "AGREEMENT" && (
          <div className="max-w-xl mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono text-emerald-400 font-semibold tracking-wider">
                Stage 5 · Authoritative Cryptographic Agreement
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Agreement Locked: $755.00 USD
              </h3>
              <p className="text-xs text-slate-400">
                Both buyer and merchant agents converged on consensus. Zero client-side price tampering permitted.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Product:</span>
                <span className="font-bold text-white">ThinkPad Workstation Pro Laptop</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Merchant:</span>
                <span className="text-blue-400 font-medium">Alpha Compute Direct</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Original Listing:</span>
                <span className="line-through text-slate-500">$800.00 USD</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-emerald-400 border-t border-slate-800 pt-2">
                <span>Final Negotiated Price:</span>
                <span className="text-base font-mono">$755.00 USD (Save $45.00)</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate pt-1 border-t border-slate-800/60">
                SHA-256 Digest: 8f4a2b910e2c84d7719f932e604...
              </div>
            </div>
          </div>
        )}

        {stage === "PAYPAL" && (
          <div className="max-w-xl mx-auto space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-[#0070BA]/10 border border-[#0070BA]/30 flex items-center justify-center text-[#009cde] mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase font-mono text-[#009cde] font-semibold tracking-wider">
                Stage 6 · Verified PayPal Orders v2 Settlement
              </span>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                Payment Settled via PayPal
              </h3>
              <p className="text-xs text-slate-400">
                PayPal captures the exact immutable Agreement amount ($755.00). Autonomous Bryntum fulfillment initiated.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Transaction Complete &amp; Verified</span>
              </div>
              <div className="text-slate-300 text-xs pl-6">
                Settlement Rail: PayPal Orders v2 Sandbox · Order #ORDER_PAYPAL_VERIFIED
              </div>
              <div className="text-slate-300 text-xs pl-6">
                Fulfillment Status: On Track (4-Day Delivery SLA)
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Core Guarantee:</span> PayVia handles the multi-agent negotiation. PayPal settles the agreement.
        </div>
        <div className="flex items-center gap-3">
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
            <span>Next Stage</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
