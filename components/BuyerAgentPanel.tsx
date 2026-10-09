import React from "react";
import { BuyerConstraints } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Bot } from "lucide-react";

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
    <Card className="border-[#E2E8F0] bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EFF8FF] border border-[#0070E0]/20 flex items-center justify-center text-[#0070E0]">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-[#111827]">Your Buyer Agent</CardTitle>
              <CardDescription className="text-xs text-[#5B6472]">
                Negotiates within your private constraints
              </CardDescription>
            </div>
          </div>
          <Badge variant="info">Autonomous Buyer</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Budget Ceiling (USD)"
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
            label="Opening Target Offer (USD)"
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
            label="Max Delivery SLA (Days)"
            type="number"
            min={1}
            max={14}
            value={constraints.maxDeliveryDays || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                maxDeliveryDays: parseInt(e.target.value, 10) || 5,
              })
            }
            disabled={disabled}
            placeholder="e.g. 5"
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#5B6472]">
              Settlement Rail
            </label>
            <div className="w-full rounded-lg border border-[#E2E8F0] bg-[#F5F7FA] px-3.5 py-2 text-sm text-[#003087] font-semibold">
              PayPal Orders v2
            </div>
          </div>
        </div>

        {/* Priority Selector */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-[#5B6472]">
            Negotiation Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPriority("price")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                isPrioritizePrice
                  ? "bg-[#EFF8FF] border-[#0070E0] text-[#003087]"
                  : "bg-[#F5F7FA] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827]"
              }`}
            >
              Lowest Price
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPriority("delivery")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                isPrioritizeDelivery
                  ? "bg-[#EFF8FF] border-[#0070E0] text-[#003087]"
                  : "bg-[#F5F7FA] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827]"
              }`}
            >
              Fastest Shipping
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setPriority("balanced")}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                !isPrioritizePrice && !isPrioritizeDelivery
                  ? "bg-[#EFF8FF] border-[#0070E0] text-[#003087]"
                  : "bg-[#F5F7FA] border-[#E2E8F0] text-[#5B6472] hover:text-[#111827]"
              }`}
            >
              Balanced
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
