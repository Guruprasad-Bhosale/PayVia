"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ShieldCheck,
  Sliders,
  DollarSign,
  Truck,
  CreditCard,
  Save,
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

    // Client-side validation
    if (formData.minimumPrice > formData.listPrice) {
      const msg = "Minimum price floor cannot exceed list price.";
      setSaving(false);
      toast({ title: "Validation Error", description: msg, variant: "error" });
      return;
    }

    if (formData.minimumDeliveryDays > formData.maximumDeliveryDays) {
      const msg = "Minimum delivery days cannot exceed maximum delivery days.";
      setSaving(false);
      toast({ title: "Validation Error", description: msg, variant: "error" });
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

      toast({
        title: "Policy Deployed",
        description: "Your autonomous Merchant Agent rules have been saved and activated.",
        variant: "success",
      });
      if (onSaveSuccess) onSaveSuccess();
    } catch (err: any) {
      const msg = err.message || "Failed to update merchant policy";
      toast({ title: "Save Failed", description: msg, variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-payvia-navy">
              PayVia Connect · Autonomous Merchant Agent Rules
            </span>
            <Badge variant={formData.enabled ? "success" : "secondary"} className="text-[10px] font-semibold">
              {formData.enabled ? "AI Negotiation Active" : "AI Negotiation Paused"}
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-foreground">Configure Autonomous Economics</h2>
          <p className="text-xs text-muted-foreground">
            Define your boundaries. PayVia enforces these rules server-side for every incoming buyer agent proposal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all border ${
              formData.enabled
                ? "bg-emerald-50 border-emerald-300 text-payvia-success hover:bg-emerald-100"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:text-foreground"
            }`}
          >
            {formData.enabled ? "● Pause AI Agent" : "○ Enable AI Agent"}
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Pricing Economics */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-payvia-blue">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Pricing Economics</h3>
                <p className="text-[11px] text-muted-foreground">Public list price & private negotiation floor</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Private Floor</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Catalog List Price ($)</label>
              <input
                type="number"
                value={formData.listPrice}
                onChange={(e) => setFormData({ ...formData, listPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-payvia-blue"
              />
              <span className="text-[10px] text-muted-foreground">Public starting price</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                <span>Minimum Floor ($)</span>
                <span className="text-payvia-error font-bold">*</span>
              </label>
              <input
                type="number"
                value={formData.minimumPrice}
                onChange={(e) => setFormData({ ...formData, minimumPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-amber-300 rounded-xl text-sm text-foreground focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-amber-700 font-medium">Never exposed to buyers</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-payvia-success shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">Anti-Tampering Guard:</span> The server-side policy engine will automatically block any proposal below <strong className="text-payvia-navy">${formData.minimumPrice}</strong>.
            </div>
          </div>
        </div>

        {/* Section 2: Fulfillment & Delivery Window */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delivery Capability</h3>
                <p className="text-[11px] text-muted-foreground">Expedited vs standard fulfillment bounds</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">Bryntum Connected</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Min Delivery (Days)</label>
              <input
                type="number"
                value={formData.minimumDeliveryDays}
                onChange={(e) => setFormData({ ...formData, minimumDeliveryDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-muted-foreground">Fastest expedited shipping</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Max Delivery (Days)</label>
              <input
                type="number"
                value={formData.maximumDeliveryDays}
                onChange={(e) => setFormData({ ...formData, maximumDeliveryDays: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-purple-500"
              />
              <span className="text-[10px] text-muted-foreground">Standard delivery SLA</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-border text-xs text-muted-foreground">
            Current Negotiable Window: <strong className="text-foreground">{formData.minimumDeliveryDays} to {formData.maximumDeliveryDays} days</strong>.
          </div>
        </div>

        {/* Section 3: Payment Incentives */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-50 text-payvia-success">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Payment Incentives</h3>
                <p className="text-[11px] text-muted-foreground">Rewards for instant PayPal checkout</p>
              </div>
            </div>
            <span className="text-[10px] text-[#0070BA] font-bold">PayPal Settled</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Immediate Payment Concession (%)</label>
            <input
                type="number"
                value={formData.immediateDiscountPercent}
                onChange={(e) => setFormData({ ...formData, immediateDiscountPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-sm text-foreground focus:outline-none focus:border-payvia-success"
            />
            <span className="text-[10px] text-muted-foreground">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-emerald-50 border border-emerald-300 text-payvia-success"
                      : "bg-slate-50 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {timing.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 4: Negotiable Dimensions */}
        <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Authorized Dimensions</h3>
                <p className="text-[11px] text-muted-foreground">Choose what parameters the AI can adjust</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-[10px]">Multi-Attribute</Badge>
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
                      ? "bg-blue-50/50 border-payvia-blue/40 text-payvia-navy"
                      : "bg-slate-50 border-border text-muted-foreground"
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
                    className="mt-1 rounded bg-white border-border text-payvia-blue focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-foreground">{dim.label}</div>
                    <div className="text-[10px] text-muted-foreground">{dim.desc}</div>
                  </div>
                </label>
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
          className="gap-2 px-8 py-3 bg-payvia-navy hover:bg-payvia-navy-dark text-white font-bold shadow-md text-sm"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Policy..." : "Deploy Negotiation Policy"}</span>
        </Button>
      </div>
    </div>
  );
}
