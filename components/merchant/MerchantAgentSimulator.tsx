"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  User,
  Play,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface SimulationResult {
  decision: "ACCEPT" | "COUNTER" | "REJECT" | "PAUSED";
  merchantAgentMessage: string;
  suggestedCounter?: {
    price: number;
    deliveryDays: number;
    paymentTiming: string;
    discountPercent: number;
  } | null;
  policyViolations?: string[];
  policyBounds?: {
    listPrice: number;
    deliveryWindow: string;
    immediateDiscount: string;
  };
}

export function MerchantAgentSimulator({ merchantId = "merchant_default" }: { merchantId?: string }) {
  const [buyerPrice, setBuyerPrice] = useState<number>(740);
  const [buyerDays, setBuyerDays] = useState<number>(3);
  const [buyerTiming, setBuyerTiming] = useState<"IMMEDIATE" | "NET_15" | "NET_30">("IMMEDIATE");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const presetQueries = [
    { label: "Lowball ($710, 2d)", price: 710, days: 2, timing: "IMMEDIATE" as const },
    { label: "Fair Counter ($760, 3d)", price: 760, days: 3, timing: "IMMEDIATE" as const },
    { label: "Slow Delivery ($770, 7d)", price: 770, days: 7, timing: "NET_30" as const },
    { label: "Full List ($800, 4d)", price: 800, days: 4, timing: "IMMEDIATE" as const },
  ];

  const handleRunSimulation = async (p = buyerPrice, d = buyerDays, t = buyerTiming) => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/merchants/preview-negotiation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          buyerOffer: {
            price: Number(p),
            deliveryDays: Number(d),
            paymentTiming: t,
            reasoning: `Simulated buyer offer for $${p}`,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
      } else {
        setResult({
          decision: "REJECT",
          merchantAgentMessage: data?.error?.message || "Simulation failed",
        });
      }
    } catch (err: any) {
      setResult({
        decision: "REJECT",
        merchantAgentMessage: err.message || "Network error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/20 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="purple" className="gap-1 text-xs">
            <Sparkles className="w-3 h-3" />
            <span>Deterministic Policy Sandbox</span>
          </Badge>
          <span className="text-xs text-slate-400 font-mono">Real-time Policy Evaluation</span>
        </div>
        <h2 className="text-xl font-bold text-white">Test Your Merchant Agent</h2>
        <p className="text-xs text-slate-400 max-w-3xl">
          Simulate incoming buyer proposals against your active negotiation rules. Verify that your floor price ($750) is never breached and observe how the agent automatically calculates concessions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Buyer Simulator Controls */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Simulated Buyer Offer</h3>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400">Quick Test Scenarios:</span>
            <div className="flex flex-wrap gap-2">
              {presetQueries.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setBuyerPrice(preset.price);
                    setBuyerDays(preset.days);
                    setBuyerTiming(preset.timing);
                    handleRunSimulation(preset.price, preset.days, preset.timing);
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Proposed Price</span>
                <span className="text-blue-400 font-bold">${buyerPrice} USD</span>
              </label>
              <input
                type="range"
                min="650"
                max="850"
                step="5"
                value={buyerPrice}
                onChange={(e) => setBuyerPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>$650 (Aggressive Low)</span>
                <span>$750 (Floor)</span>
                <span>$850 (Above List)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex justify-between">
                <span>Required Delivery</span>
                <span className="text-purple-400 font-bold">{buyerDays} Days</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={buyerDays}
                onChange={(e) => setBuyerDays(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 Day</span>
                <span>5 Days</span>
                <span>10 Days</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Payment Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {(["IMMEDIATE", "NET_15", "NET_30"] as const).map((timing) => (
                  <button
                    key={timing}
                    type="button"
                    onClick={() => setBuyerTiming(timing)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      buyerTiming === timing
                        ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {timing.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => handleRunSimulation()}
              disabled={loading}
              className="w-full gap-2 mt-2 shadow-md shadow-blue-500/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>Simulate Agent Response</span>
            </Button>
          </div>
        </div>

        {/* Live Merchant Agent Response Preview */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Merchant Agent Live Reasoning</h3>
              </div>
              {result && (
                <Badge
                  variant={
                    result.decision === "ACCEPT"
                      ? "success"
                      : result.decision === "COUNTER"
                      ? "info"
                      : "warning"
                  }
                  className="text-xs"
                >
                  {result.decision}
                </Badge>
              )}
            </div>

            {!result && !loading && (
              <div className="text-center py-16 space-y-3">
                <Bot className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs text-slate-400">
                  Select a test scenario or adjust the buyer offer sliders on the left to preview your merchant agent&apos;s autonomous response.
                </p>
              </div>
            )}

            {loading && (
              <div className="text-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 mx-auto text-blue-400 animate-spin" />
                <p className="text-xs text-slate-400">Evaluating against server-side policy rules...</p>
              </div>
            )}

            {result && !loading && (
              <div className="space-y-4">
                {/* Agent Response Card */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Bot className="w-3.5 h-3.5" />
                    <span>Merchant Agent Response to Buyer:</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans italic">
                    &ldquo;{result.merchantAgentMessage}&rdquo;
                  </p>
                </div>

                {/* Counter Terms Breakdown if COUNTER */}
                {result.suggestedCounter && (
                  <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-3">
                    <div className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Proposed Counteroffer Economics</span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Counter Price</span>
                        <span className="text-sm font-bold text-white">${result.suggestedCounter.price}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Delivery SLA</span>
                        <span className="text-sm font-bold text-purple-400">{result.suggestedCounter.deliveryDays} Days</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block">Discount Rate</span>
                        <span className="text-sm font-bold text-emerald-400">{result.suggestedCounter.discountPercent}% OFF</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Policy Violations if below floor */}
                {result.policyViolations && result.policyViolations.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5 text-amber-400">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Policy Bounds Enforced:</span>
                    </div>
                    {result.policyViolations.map((v, i) => (
                      <div key={i} className="text-[11px] text-slate-300 font-mono">
                        • {v}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Powered by Deterministic Policy Engine</span>
            <span className="text-emerald-400 font-semibold">0% Floor Leakage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
