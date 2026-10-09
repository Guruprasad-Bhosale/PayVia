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
  storeName = "Verified Merchant Partner",
  showFloorToMerchant = false,
}: MerchantAgentPanelProps) {
  return (
    <Card className="border-[#E2E8F0] bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F5F3FF] border border-[#8B5CF6]/20 flex items-center justify-center text-[#6D28D9]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-[#111827]">Merchant Autonomous Agent</CardTitle>
              <CardDescription className="text-xs text-[#5B6472]">
                Representing {storeName}
              </CardDescription>
            </div>
          </div>
          <Badge variant="purple" className="gap-1">
            <Bot className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span>AI Negotiator</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
            <span className="text-[#5B6472] text-[11px] uppercase tracking-wider font-semibold block flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Catalog List Price</span>
            </span>
            <span className="text-lg font-bold text-[#111827] block font-mono">
              {formatCurrency(constraints.originalPrice)}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] space-y-1">
            <span className="text-[#003087] text-[11px] uppercase tracking-wider font-semibold block flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#003087]" />
              <span>Policy Economics</span>
            </span>
            {showFloorToMerchant ? (
              <span className="text-lg font-bold text-[#16845B] block font-mono">
                Floor: {formatCurrency(constraints.minAcceptablePrice)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-[#003087] block pt-1">
                Deterministic Server Rules
              </span>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-[#EFF8FF] border border-[#0070E0]/20 p-3 text-xs text-[#5B6472] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#0070E0] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-[#003087] block">Policy Boundary Defense:</span>
            <span>
              The Merchant Agent negotiates strictly within authorized merchant rules. Any proposal below the confidential floor price is deterministically blocked.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
