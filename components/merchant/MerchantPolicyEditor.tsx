"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Sliders,
  DollarSign,
  Truck,
  CreditCard,
  Save,
  CheckCircle2,
  AlertTriangle,
  Lock,
} from "lucide-react";

export interface PolicyFormData {
  enabled: boolean;
  currency: string;
  listPrice: number;
  minimumPrice: number;
  minimumDeliveryDays: number;
  maximumDeliveryDays: number;
  immediateDiscountPercent: number;
  allowedPaymentTiming: ("IMMEDIATE" | "NET_15" | "NET_30" | "ESCROW_DELIVERY")[];
  strategy: "BALANCED_ECONOMIC" | "MARGIN_PRESERVATION" | "VOLUME_VELOCITY";
  negotiableDimensions: {
    price: boolean;
    delivery: boolean;
    paymentTiming: boolean;
    quantity: boolean;
  };
}

interface MerchantPolicyEditorProps {
  merchantId?: string;
  initialPolicy?: Partial<PolicyFormData>;
  onSaveSuccess?: () => void;
}

export function MerchantPolicyEditor({
  merchantId = "merchant_default",
  initialPolicy,
  onSaveSuccess,
}: MerchantPolicyEditorProps) {
  const [formData, setFormData] = useState<PolicyFormData>({
    enabled: initialPolicy?.enabled ?? true,
    currency: initialPolicy?.currency || "USD",
    listPrice: initialPolicy?.listPrice || 800,
    minimumPrice: initialPolicy?.minimumPrice || 750,
    minimumDeliveryDays: initialPolicy?.minimumDeliveryDays || 2,
    maximumDeliveryDays: initialPolicy?.maximumDeliveryDays || 5,
    immediateDiscountPercent: initialPolicy?.immediateDiscountPercent || 3,
    allowedPaymentTiming: initialPolicy?.allowedPaymentTiming || ["IMMEDIATE", "NET_30"],
    strategy: initialPolicy?.strategy || "BALANCED_ECONOMIC",
    negotiableDimensions: initialPolicy?.negotiableDimensions || {
      price: true,
      delivery: true,
      paymentTiming: true,
      quantity: false,
    },
  });

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    async function loadPolicy() {
      try {
        const res = await fetch(`/api/v1/merchants/${merchantId}/policy`);
        const data = await res.json();
        if (res.ok && data.success && data.policy) {
          const p = data.policy;
          setFormData((prev) => ({
            ...prev,
            enabled: p.enabled ?? prev.enabled,
            currency: p.currency || prev.currency,
            listPrice: p.listPrice ?? prev.listPrice,
            minimumPrice: p.minimumPrice ?? prev.minimumPrice,
            minimumDeliveryDays: p.minimumDeliveryDays ?? prev.minimumDeliveryDays,
            maximumDeliveryDays: p.maximumDeliveryDays ?? prev.maximumDeliveryDays,
            immediateDiscountPercent: p.immediateDiscountPercent ?? prev.immediateDiscountPercent,
            allowedPaymentTiming: p.allowedPaymentTiming || prev.allowedPaymentTiming,
            strategy: p.strategy || prev.strategy,
          }));
        }
      } catch {
        // Fallback to initial form data
      }
    }
    loadPolicy();
  }, [merchantId]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    setErrorMessage(null);

    // Client-side UX validation
    if (formData.minimumPrice > formData.listPrice) {
      setErrorMessage("Minimum price floor cannot exceed list price.");
      setSaving(false);
      setSaveStatus("error");
      return;
    }

    if (formData.minimumDeliveryDays > formData.maximumDeliveryDays) {
      setErrorMessage("Minimum delivery days cannot exceed maximum delivery days.");
      setSaving(false);
      setSaveStatus("error");
      return;
    }

    try {
      const res = await fetch(`/api/v1/merchants/${merchantId}/policy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: formData.enabled,
          currency: formData.currency,
          listPrice: Number(formData.listPrice),
          minimumPrice: Number(formData.minimumPrice),
          minimumDeliveryDays: Number(formData.minimumDeliveryDays),
          maximumDeliveryDays: Number(formData.maximumDeliveryDays),
          immediateDiscountPercent: Number(formData.immediateDiscountPercent),
          allowedPaymentTiming: formData.allowedPaymentTiming,
          strategy: formData.strategy,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Failed to save policy");
      }

      setSaveStatus("success");
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update merchant policy");
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              PayVia Connect · Autonomous Merchant Agent
            </span>
            <Badge variant={formData.enabled ? "success" : "default"} className="text-[10px]">
              {formData.enabled ? "AI NEGOTIATION ACTIVE" : "AI NEGOTIATION PAUSED"}
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white">Configure Negotiation Rules</h2>
          <p className="text-xs text-slate-400">
            Define your business economics. PayVia converts these rules into an autonomous merchant agent that negotiates on your behalf.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              formData.enabled
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
            }`}
          >
            {formData.enabled ? "● Pause AI Negotiation" : "○ Enable AI Negotiation"}
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Pricing Economics */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Pricing Economics</h3>
                <p className="text-[11px] text-slate-400">List price and private negotiation floor</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <Lock className="w-3 h-3" />
              <span>Floor is Server-Private</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Catalog List Price ($)</label>
              <input
                type="number"
                value={formData.listPrice}
                onChange={(e) => setFormData({ ...formData, listPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-500">Public starting price</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                <span>Minimum Floor ($)</span>
                <span className="text-rose-400 font-bold">*</span>
              </label>
              <input
                type="number"
                value={formData.minimumPrice}
                onChange={(e) => setFormData({ ...formData, minimumPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-amber-500/40 rounded-xl text-sm text-white focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-amber-400/80">Never exposed to buyers</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Anti-Tampering Guard:</span> The server-side policy engine will automatically block any AI offer or customer proposal below <strong className="text-white">${formData.minimumPrice}</strong>.
            </div>
          </div>
        </div>

        {/* Section 2: Fulfillment & Delivery Window */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Delivery Capability</h3>
                <p className="text-[11px] text-slate-400">Expedited vs standard fulfillment bounds</p>
              </div>
            </div>
            <Badge variant="purple" className="text-[10px]">Bryntum Connected</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Min Delivery (Days)</label>
              <input
                type="number"
                value={formData.minimumDeliveryDays}
                onChange={(e) => setFormData({ ...formData, minimumDeliveryDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-500">Fastest expedited shipping</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Max Delivery (Days)</label>
              <input
                type="number"
                value={formData.maximumDeliveryDays}
                onChange={(e) => setFormData({ ...formData, maximumDeliveryDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-slate-500">Standard delivery SLA</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
            Current Negotiable Window: <strong className="text-white">{formData.minimumDeliveryDays} to {formData.maximumDeliveryDays} days</strong>.
          </div>
        </div>

        {/* Section 3: Payment Incentives */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Payment Terms & Incentives</h3>
                <p className="text-[11px] text-slate-400">Rewards for instant PayPal checkout</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">PayPal Settled</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Immediate Payment Incentive (%)</label>
            <input
              type="number"
              value={formData.immediateDiscountPercent}
              onChange={(e) => setFormData({ ...formData, immediateDiscountPercent: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
            />
            <span className="text-[10px] text-slate-500">
              Additional concession merchant agent can grant for upfront instant settlement
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {["IMMEDIATE", "NET_15", "NET_30", "ESCROW_DELIVERY"].map((timing) => {
              const active = formData.allowedPaymentTiming.includes(timing as any);
              return (
                <button
                  key={timing}
                  type="button"
                  onClick={() => {
                    if (active) {
                      setFormData({
                        ...formData,
                        allowedPaymentTiming: formData.allowedPaymentTiming.filter((t) => t !== timing),
                      });
                    } else {
                      setFormData({
                        ...formData,
                        allowedPaymentTiming: [...formData.allowedPaymentTiming, timing as any],
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-400"
                  }`}
                >
                  {timing.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Negotiable Dimensions */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Negotiable Dimensions</h3>
                <p className="text-[11px] text-slate-400">Choose what terms the AI is authorized to adjust</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Multi-Attribute</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {[
              { id: "price", label: "Price / Discount", desc: "Allow price concessions" },
              { id: "delivery", label: "Delivery Speed", desc: "Expedited shipping tradeoffs" },
              { id: "paymentTiming", label: "Payment Timing", desc: "Instant vs Net-30 incentives" },
              { id: "quantity", label: "Quantity Bundles", desc: "Volume threshold pricing" },
            ].map((dim) => {
              const isChecked = (formData.negotiableDimensions as any)[dim.id];
              return (
                <label
                  key={dim.id}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    isChecked
                      ? "bg-indigo-950/20 border-indigo-500/30 text-indigo-200"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        negotiableDimensions: {
                          ...formData.negotiableDimensions,
                          [dim.id]: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 rounded bg-slate-900 border-slate-700 text-indigo-500 focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-200">{dim.label}</div>
                    <div className="text-[10px] text-slate-400">{dim.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {saveStatus === "success" && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Negotiation rules saved successfully! Your autonomous Merchant Agent policy is active.</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{errorMessage || "Failed to update negotiation rules."}</span>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 px-6 shadow-lg shadow-blue-500/20"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Rules..." : "Deploy Negotiation Rules"}</span>
        </Button>
      </div>
    </div>
  );
}
