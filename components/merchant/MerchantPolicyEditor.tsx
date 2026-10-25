"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ShieldCheck,
  DollarSign,
  Truck,
  CreditCard,
  Save,
  Lock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
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
  const { toast } = useToast();
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

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

  const validate = (): string | null => {
    if (formData.minimumPrice > formData.listPrice) {
      return "Minimum price floor cannot exceed catalog list price.";
    }
    if (formData.minimumPrice <= 0) {
      return "Minimum price floor must be greater than zero.";
    }
    if (formData.minimumDeliveryDays > formData.maximumDeliveryDays) {
      return "Minimum delivery days cannot exceed maximum delivery days.";
    }
    if (formData.minimumDeliveryDays <= 0) {
      return "Delivery window days must be positive.";
    }
    if (formData.allowedPaymentTiming.length === 0) {
      return "At least one payment timing option must be permitted.";
    }
    return null;
  };

  const handleSave = async () => {
    setValidationError(null);
    const err = validate();
    if (err) {
      setValidationError(err);
      toast({ title: "Validation Error", description: err, variant: "error" });
      return;
    }

    setSaving(true);
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

      const timestamp = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSavedAt(timestamp);
      toast({
        title: "Policy Deployed",
        description: "Your autonomous Merchant Agent rules have been saved and activated.",
        variant: "success",
      });
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      const msg = err.message || "Failed to update merchant policy";
      setValidationError(msg);
      toast({ title: "Save Failed", description: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">
              Autonomous Merchant Agent Rules
            </span>
            <Badge variant={formData.enabled ? "success" : "secondary"} className="text-[10px] font-semibold">
              {formData.enabled ? "AI Negotiation Active" : "AI Negotiation Paused"}
            </Badge>
            {lastSavedAt && (
              <span className="text-[11px] font-mono text-[#0E6245] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Saved at {lastSavedAt}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-[#0A192F] tracking-tight">
            Configure Negotiation Economics &amp; Strategy
          </h2>
          <p className="text-xs text-[#475569]">
            Define acceptable price floors, delivery constraints, and concession strategies. PayVia enforces these rules server-side for every incoming buyer agent proposal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              formData.enabled
                ? "bg-emerald-50 border-emerald-300 text-[#0E6245] hover:bg-emerald-100"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:text-[#0A192F]"
            }`}
          >
            {formData.enabled ? "● Pause AI Agent" : "○ Enable AI Agent"}
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Pricing Economics */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-[#0052CC]">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A192F]">1. Pricing Economics</h3>
                <p className="text-[11px] text-[#475569]">Public list price &amp; private negotiation floor</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Private Floor</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A192F]">Catalog List Price ($ USD)</label>
              <input
                type="number"
                value={formData.listPrice}
                onChange={(e) => setFormData({ ...formData, listPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#0A192F] focus:outline-none focus:border-[#0052CC]"
              />
              <span className="text-[10px] text-[#475569]">Public starting price</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A192F] flex items-center gap-1">
                <span>Minimum Floor ($ USD)</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="number"
                value={formData.minimumPrice}
                onChange={(e) => setFormData({ ...formData, minimumPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-sm text-[#0A192F] focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-amber-700 font-medium">Strict confidential floor</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#475569] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#0E6245] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0A192F]">Anti-Tampering Guard:</span> The server-side policy engine will automatically reject any buyer offer below <strong className="text-[#0A192F]">${formData.minimumPrice}</strong>.
            </div>
          </div>
        </div>

        {/* Section 2: Fulfillment & Delivery Window */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A192F]">2. Delivery Capability</h3>
                <p className="text-[11px] text-[#475569]">Expedited vs standard fulfillment bounds</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">SLA Bounds</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A192F]">Min Delivery (Days)</label>
              <input
                type="number"
                value={formData.minimumDeliveryDays}
                onChange={(e) => setFormData({ ...formData, minimumDeliveryDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#0A192F] focus:outline-none focus:border-[#0052CC]"
              />
              <span className="text-[10px] text-[#475569]">Fastest rush dispatch</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A192F]">Max Delivery (Days)</label>
              <input
                type="number"
                value={formData.maximumDeliveryDays}
                onChange={(e) => setFormData({ ...formData, maximumDeliveryDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#0A192F] focus:outline-none focus:border-[#0052CC]"
              />
              <span className="text-[10px] text-[#475569]">Standard shipping ceiling</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs text-[#475569]">
            Current Negotiable Window: <strong className="text-[#0A192F]">{formData.minimumDeliveryDays} to {formData.maximumDeliveryDays} business days</strong>.
          </div>
        </div>

        {/* Section 3: Payment Incentives */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-[#0E6245]">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A192F]">3. Payment Incentives</h3>
                <p className="text-[11px] text-[#475569]">Incentives for immediate PayPal checkout</p>
              </div>
            </div>
            <span className="text-[10px] text-[#0052CC] font-bold">PayPal Settled</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#0A192F]">Immediate Payment Concession (%)</label>
            <input
              type="number"
              value={formData.immediateDiscountPercent}
              onChange={(e) => setFormData({ ...formData, immediateDiscountPercent: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-[#E2E8F0] rounded-xl text-sm text-[#0A192F] focus:outline-none focus:border-[#0052CC]"
            />
            <span className="text-[10px] text-[#475569]">
              Additional discount granted when buyer chooses upfront PayPal settlement
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-[#0A192F] block">Permitted Payment Timing Modes:</label>
            <div className="flex flex-wrap gap-2">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      active
                        ? "bg-emerald-50 border-emerald-300 text-[#0E6245]"
                        : "bg-slate-50 border-[#E2E8F0] text-[#475569] hover:text-[#0A192F]"
                    }`}
                  >
                    {timing.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 4: Negotiation Strategy */}
        <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0A192F]">4. Autonomous Strategy Mode</h3>
                <p className="text-[11px] text-[#475569]">Defines AI concession cadence &amp; behavior</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">Algorithm</Badge>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "BALANCED_ECONOMIC" as const,
                title: "Balanced Economic (Recommended)",
                desc: "Equally balances margin protection with deal closure. Concedes moderately towards floor.",
              },
              {
                id: "MARGIN_PRESERVATION" as const,
                title: "Margin Preservation",
                desc: "Strictly defends price ceiling. Concedes slowly and prioritizes delivery tradeoffs over price cuts.",
              },
              {
                id: "VOLUME_VELOCITY" as const,
                title: "Volume Velocity",
                desc: "Prioritizes immediate consensus. Moves more aggressively to lock in deal conversion.",
              },
            ].map((strat) => {
              const active = formData.strategy === strat.id;
              return (
                <div
                  key={strat.id}
                  onClick={() => setFormData({ ...formData, strategy: strat.id })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    active
                      ? "bg-blue-50/70 border-[#0052CC] text-[#0A192F]"
                      : "bg-slate-50 border-[#E2E8F0] text-[#475569] hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A192F]">{strat.title}</span>
                    {active && <span className="w-2 h-2 rounded-full bg-[#0052CC]" />}
                  </div>
                  <p className="text-[11px] text-[#475569] mt-1 leading-relaxed">{strat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 px-8 py-3 bg-[#0A192F] hover:bg-[#0052CC] text-white font-bold shadow-sm text-sm h-11"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Deploying Policy..." : "Save & Activate Negotiation Rules"}</span>
        </Button>
      </div>
    </div>
  );
}
