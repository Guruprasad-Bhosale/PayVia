"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Package,
  Bot,
  Sliders,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  Lock,
} from "lucide-react";

interface OnboardingWizardProps {
  onComplete?: (merchantData: any) => void;
}

export function MerchantOnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  // Form State
  const [businessName, setBusinessName] = useState("Apex Performance Audio");
  const [email, setEmail] = useState("sales@apexperformance.example");
  const [settlementEmail, setSettlementEmail] = useState("sb-merchant@business.example.com");
  const [website, setWebsite] = useState("https://apexperformance.example");

  const [productTitle, setProductTitle] = useState("Apex Quantum Synthesizer Pro");
  const [sku, setSku] = useState("APEX-SYNTH-900");
  const [listPrice, setListPrice] = useState<number>(800);
  const [minimumPrice, setMinimumPrice] = useState<number>(750);

  const [negotiationEnabled, setNegotiationEnabled] = useState<boolean>(true);
  const [minDeliveryDays, setMinDeliveryDays] = useState<number>(2);
  const [maxDeliveryDays, setMaxDeliveryDays] = useState<number>(5);
  const [immediateDiscount, setImmediateDiscount] = useState<number>(3);

  const [dimPrice, setDimPrice] = useState<boolean>(true);
  const [dimDelivery, setDimDelivery] = useState<boolean>(true);
  const [dimPaymentTiming, setDimPaymentTiming] = useState<boolean>(true);
  const [dimQuantity, setDimQuantity] = useState<boolean>(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Create merchant
      const mRes = await fetch("/api/v1/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          email,
          settlementEmail,
        }),
      });
      const mData = await mRes.json();
      const merchantId = mData?.merchant?.id || "merchant_default";

      // 2. Ingest catalog item
      await fetch("/api/v1/catalog/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          title: productTitle,
          listPrice,
          sku,
          currency: "USD",
        }),
      });

      // 3. Set policy
      await fetch(`/api/v1/merchants/${merchantId}/policy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: negotiationEnabled,
          currency: "USD",
          listPrice,
          minimumPrice,
          minimumDeliveryDays: minDeliveryDays,
          maximumDeliveryDays: maxDeliveryDays,
          immediateDiscountPercent: immediateDiscount,
          allowedPaymentTiming: ["IMMEDIATE", "NET_30"],
          strategy: "BALANCED_ECONOMIC",
        }),
      });

      setCompleted(true);
      if (onComplete) {
        onComplete({ merchantId, businessName, productTitle, listPrice, minimumPrice });
      }
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Business Info" },
    { num: 2, title: "Catalog Item" },
    { num: 3, title: "Negotiation" },
    { num: 4, title: "Economic Policy" },
    { num: 5, title: "Dimensions" },
    { num: 6, title: "Review & Deploy" },
  ];

  if (completed) {
    return (
      <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/30 text-center space-y-6 max-w-xl mx-auto my-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Your Merchant Agent is Live!</h2>
          <p className="text-sm text-slate-400">
            <strong>{businessName}</strong> is now connected to PayVia. Incoming customer proposals for <strong>{productTitle}</strong> will be autonomously negotiated within your defined rules.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between text-slate-300">
            <span>List Price:</span>
            <span className="text-white font-bold">${listPrice} USD</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Private Floor:</span>
            <span className="text-amber-400 font-bold">${minimumPrice} USD (Hidden)</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Delivery Window:</span>
            <span className="text-purple-400">{minDeliveryDays}–{maxDeliveryDays} Days</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Settlement Rail:</span>
            <span className="text-blue-400 font-bold">PayPal Orders v2</span>
          </div>
        </div>

        <Button onClick={() => setCompleted(false)} className="gap-2">
          <span>Create Another Merchant Profile</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        {stepsList.map((s, idx) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s.num
                  ? "bg-blue-600 text-white ring-4 ring-blue-500/20"
                  : step > s.num
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-900 text-slate-500 border border-slate-800"
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs hidden sm:inline ${step === s.num ? "text-white font-semibold" : "text-slate-500"}`}>
              {s.title}
            </span>
            {idx < stepsList.length - 1 && <span className="text-slate-700 hidden sm:inline">/</span>}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        {/* Step 1: Business Information */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Badge variant="info">Step 1 of 6</Badge>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" />
                <span>Connect Your Business</span>
              </h2>
              <p className="text-xs text-slate-400">
                Provide your merchant details to establish your PayVia merchant control plane.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Store / Business Name</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Acme Sound Studio"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Website / Store URL</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="https://mystore.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <span>PayPal Merchant Settlement Email</span>
                  <span className="text-blue-400 font-bold">*</span>
                </label>
                <input
                  type="email"
                  value={settlementEmail}
                  onChange={(e) => setSettlementEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-blue-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
                  placeholder="merchant-paypal@business.example.com"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Catalog Item */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Badge variant="info">Step 2 of 6</Badge>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <span>Select or Register Initial Product</span>
              </h2>
              <p className="text-xs text-slate-400">
                Register the product or service class you wish to enable for AI-assisted autonomous negotiation.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Product Title</label>
                <input
                  type="text"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">SKU / Product ID</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Standard List Price ($)</label>
                  <input
                    type="number"
                    value={listPrice}
                    onChange={(e) => setListPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Negotiation Toggle */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Badge variant="info">Step 3 of 6</Badge>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-400" />
                <span>Autonomous AI Negotiation Master Switch</span>
              </h2>
              <p className="text-xs text-slate-400">
                Choose whether you want AI agents to actively negotiate on your behalf. You can pause or resume at any time.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white">AI Negotiation Engine</div>
                <div className="text-xs text-slate-400">
                  When enabled, PayVia Merchant Agent engages incoming buyer queries according to your economic policy bounds.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNegotiationEnabled(!negotiationEnabled)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  negotiationEnabled
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {negotiationEnabled ? "ON (Active)" : "OFF (Paused)"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Policy Floor & Economics */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Badge variant="info">Step 4 of 6</Badge>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                <span>Define Economic Rules & Private Floor</span>
              </h2>
              <p className="text-xs text-slate-400">
                You set the boundaries. The AI agent negotiates creatively within this envelope without ever violating your minimum price.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300">Catalog List Price</label>
                <div className="text-2xl font-bold text-white">${listPrice}</div>
                <span className="text-[10px] text-slate-500">Public base price</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/30 space-y-2">
                <label className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Private Floor Price</span>
                </label>
                <input
                  type="number"
                  value={minimumPrice}
                  onChange={(e) => setMinimumPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-amber-500/40 rounded-lg text-lg font-bold text-white focus:outline-none"
                />
                <span className="text-[10px] text-amber-400/80">Strictly private floor</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Delivery Capability (Days)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={minDeliveryDays}
                    onChange={(e) => setMinDeliveryDays(parseInt(e.target.value) || 1)}
                    className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={maxDeliveryDays}
                    onChange={(e) => setMaxDeliveryDays(parseInt(e.target.value) || 1)}
                    className="w-1/2 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Immediate Payment Incentive (%)</label>
                <input
                  type="number"
                  value={immediateDiscount}
                  onChange={(e) => setImmediateDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Negotiable Dimensions */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Badge variant="info">Step 5 of 6</Badge>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-purple-400" />
                <span>Authorized Negotiable Dimensions</span>
              </h2>
              <p className="text-xs text-slate-400">
                Select which attributes your Merchant Agent is authorized to negotiate with customers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dimPrice}
                  onChange={(e) => setDimPrice(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold text-white">Price Concessions</div>
                  <div className="text-[11px] text-slate-400">Discount down to floor ($ {minimumPrice})</div>
                </div>
              </label>

              <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dimDelivery}
                  onChange={(e) => setDimDelivery(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold text-white">Delivery Speed</div>
                  <div className="text-[11px] text-slate-400">Expedited vs economy shipping</div>
                </div>
              </label>

              <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dimPaymentTiming}
                  onChange={(e) => setDimPaymentTiming(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold text-white">Payment Timing</div>
                  <div className="text-[11px] text-slate-400">Immediate checkout discounts</div>
                </div>
              </label>

              <label className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dimQuantity}
                  onChange={(e) => setDimQuantity(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-blue-500"
                />
                <div>
                  <div className="text-sm font-semibold text-white">Quantity Thresholds</div>
                  <div className="text-[11px] text-slate-400">Multi-unit bundle incentives</div>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {step === 6 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <Badge variant="success">Step 6 of 6 · Ready to Deploy</Badge>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Review & Deploy Merchant Agent</span>
              </h2>
              <p className="text-xs text-slate-400">
                Confirm your configuration. When deployed, your merchant agent will autonomously enforce these parameters.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Merchant Store:</span>
                <span className="text-white font-bold">{businessName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Product:</span>
                <span className="text-white font-medium">{productTitle}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">List Price:</span>
                <span className="text-white font-bold">${listPrice} USD</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Private Policy Floor:</span>
                <span className="text-amber-400 font-bold">${minimumPrice} USD (Hidden from buyer)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-2">
                <span className="text-slate-400">Delivery Capability:</span>
                <span className="text-purple-400">{minDeliveryDays} to {maxDeliveryDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Settlement Rail:</span>
                <span className="text-emerald-400 font-bold">PayPal Orders v2 Sandbox</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              size="sm"
              onClick={() => setStep(step + 1)}
              className="gap-2 shadow-md shadow-blue-500/20"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={loading}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? "Deploying Agent..." : "Launch Merchant Agent"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
