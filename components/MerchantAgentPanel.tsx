import React from "react";
import { MerchantConstraints } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Store, ShieldCheck, Lock, Tag, Bot } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MerchantAgentPanelProps {
  constraints: MerchantConstraints;
  storeName?: string;
  showFloorToMerchant?: boolean;
}

export function MerchantAgentPanel({
  constraints,
  storeName = "Apex Digital Merchant Store",
  showFloorToMerchant = false,
}: MerchantAgentPanelProps) {
  return (
    <Card className="border-indigo-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/25 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Merchant Autonomous Agent</CardTitle>
              <CardDescription className="text-xs text-indigo-300/80">
                Representing {storeName}
              </CardDescription>
            </div>
          </div>
          <Badge variant="purple" className="gap-1">
            <Bot className="w-3 h-3 text-indigo-300" />
            <span>AI Negotiator Active</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold block flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>Catalog List Price</span>
            </span>
            <span className="text-lg font-bold text-white block">
              {formatCurrency(constraints.originalPrice)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-indigo-500/30 space-y-1">
            <span className="text-indigo-400 text-[11px] uppercase tracking-wider font-semibold block flex items-center gap-1">
              <Lock className="w-3 h-3 text-indigo-400" />
              <span>Policy Economics</span>
            </span>
            {showFloorToMerchant ? (
              <span className="text-lg font-bold text-emerald-300 block">
                Floor: {formatCurrency(constraints.minAcceptablePrice)}
              </span>
            ) : (
              <span className="text-xs font-medium text-indigo-200 block pt-1">
                Deterministic Server Rules
              </span>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-indigo-950/40 border border-indigo-800/30 p-3 text-xs text-indigo-200/90 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-indigo-300 block">Merchant Policy Boundary Protection:</span>
            <span>
              The Merchant Agent negotiates within confidential merchant business rules. Offers outside acceptable margins are deterministically rejected server-side.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

