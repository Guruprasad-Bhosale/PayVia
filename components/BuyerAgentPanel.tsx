import React from "react";
import { BuyerConstraints } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Bot, Sparkles } from "lucide-react";

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
  return (
    <Card className="border-blue-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Buyer AI Agent</CardTitle>
            <CardDescription>
              Set parameters for your autonomous bargaining representative
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Maximum Budget ($)"
            type="number"
            value={constraints.maxBudget || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                maxBudget: parseFloat(e.target.value) || 0,
              })
            }
            disabled={disabled}
            placeholder="e.g. 260.00"
          />

          <Input
            label="Target Ideal Price ($)"
            type="number"
            value={constraints.targetPrice || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                targetPrice: parseFloat(e.target.value) || 0,
              })
            }
            disabled={disabled}
            placeholder="e.g. 230.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Max Desired Delivery Time (Days)"
            type="number"
            value={constraints.maxDeliveryDays || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                maxDeliveryDays: parseInt(e.target.value, 10) || 1,
              })
            }
            disabled={disabled}
            placeholder="e.g. 3"
          />

          <Input
            label="Special Constraints / Instructions"
            type="text"
            value={constraints.notes || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                notes: e.target.value,
              })
            }
            disabled={disabled}
            placeholder="e.g. Prefer expedited shipping if within budget"
          />
        </div>

        <div className="rounded-xl bg-blue-950/30 border border-blue-800/30 p-3 text-xs text-blue-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <span>
            The Buyer Agent will strictly honor your maximum budget constraint and iteratively negotiate with the merchant agent.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
