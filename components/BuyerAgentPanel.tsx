import React from "react";
import { BuyerConstraints } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Bot, Shield } from "lucide-react";

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
    <Card className="border-blue-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/25 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Buyer AI Agent</CardTitle>
              <CardDescription className="text-xs text-blue-300/80">
                Negotiating on your behalf
              </CardDescription>
            </div>
          </div>
          <Badge variant="info">Autonomous Buyer</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Your Maximum Budget ($)"
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
            label="Ideal Target Price ($)"
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
            label="Max Delivery Window (Days)"
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

          <Input
            label="Special Preferences"
            type="text"
            value={constraints.notes || ""}
            onChange={(e) =>
              onChange({
                ...constraints,
                notes: e.target.value,
              })
            }
            disabled={disabled}
            placeholder="e.g. Free express delivery requested"
          />
        </div>

        <div className="rounded-xl bg-blue-950/40 border border-blue-800/30 p-3 text-xs text-blue-200/90 flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-blue-300 block">Strict Budget Boundary Guarantee:</span>
            <span>
              The Buyer Agent cannot offer or accept any amount above <strong className="text-white">${constraints.maxBudget || 0} USD</strong>.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
