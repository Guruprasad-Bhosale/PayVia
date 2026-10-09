import React from "react";
import { BuyerConstraints } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Bot, Shield, DollarSign, Clock, Zap } from "lucide-react";

interface BuyerAgentPanelProps {
  constraints: BuyerConstraints;
  onChange: (updated: BuyerConstraints) => void;
  disabled?: boolean;
}

export function BuyerAgentPanel({
  constraints,
  onChange,
  disabled = false,
}: BuyerAgentPanelProps) {
  const currentNotes = constraints.notes || "";
  const isPrioritizePrice = currentNotes.includes("Prioritize lowest price");
  const isPrioritizeDelivery = currentNotes.includes("Prioritize fastest delivery");

  const setPriority = (priority: "price" | "delivery" | "balanced") => {
    let cleanNotes = currentNotes
      .replace(/Prioritize lowest price\.?\s*/g, "")
      .replace(/Prioritize fastest delivery\.?\s*/g, "")
      .trim();

    if (priority === "price") {
      cleanNotes = cleanNotes ? `Prioritize lowest price. ${cleanNotes}` : "Prioritize lowest price.";
    } else if (priority === "delivery") {
      cleanNotes = cleanNotes ? `Prioritize fastest delivery. ${cleanNotes}` : "Prioritize fastest delivery.";
    }

    onChange({
      ...constraints,
      notes: cleanNotes,
    });
  };

  return (
    <Card className="border-blue-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/25 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Your Buyer Agent</CardTitle>
              <CardDescription className="text-xs text-blue-300/80">
                Commands negotiation within your constraints
              </CardDescription>
            </div>
          </div>
          <Badge variant="info">Autonomous Buyer</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Budget Ceiling ($)"
            type="number"
            step="0.01"
            value={constraints.maxBudget || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                maxBudget: parseFloat(e.target.value) || 0,
              })
            }
            disabled={disabled}
            placeholder="e.g. 760.00"
          />

          <Input
            label="Opening Target Offer ($)"
            type="number"
            step="0.01"
            value={constraints.targetPrice || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                targetPrice: parseFloat(e.target.value) || 0,
              })
            }
            disabled={disabled}
            placeholder="e.g. 735.00"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Latest Acceptable Delivery (Days)"
            type="number"
            min={1}
            max={14}
            value={constraints.maxDeliveryDays || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                maxDeliveryDays: parseInt(e.target.value, 10) || 1,
              })
            }
            disabled={disabled}
            placeholder="e.g. 5"
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">Payment Preference</label>
            <div className="h-10 px-3 rounded-lg bg-slate-950/80 border border-slate-700/80 flex items-center justify-between text-xs text-slate-200">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Immediate PayPal Settlement</span>
              </span>
              <span className="text-[10px] text-slate-400">Eligible for seller discount</span>
            </div>
          </div>
        </div>

        {/* Strategy Preferences */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 block">Agent Strategy Preference</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPriority(isPrioritizePrice ? "balanced" : "price")}
              className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                isPrioritizePrice
                  ? "bg-blue-600/30 border-blue-500 text-blue-200"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Prioritize Price</span>
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() => setPriority(isPrioritizeDelivery ? "balanced" : "delivery")}
              className={`p-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                isPrioritizeDelivery
                  ? "bg-blue-600/30 border-blue-500 text-blue-200"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Prioritize Delivery</span>
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-blue-950/40 border border-blue-800/30 p-3 text-xs text-blue-200/90 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-blue-300 block">Strict Budget Boundary Guarantee:</span>
            <span>
              Your Buyer Agent will never exceed <strong className="text-white">${constraints.maxBudget || 0} USD</strong> or accept delivery past <strong className="text-white">{constraints.maxDeliveryDays || 5} days</strong>.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

