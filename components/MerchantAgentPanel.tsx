import React from "react";
import { MerchantConstraints } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Store, ShieldAlert, Lock, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MerchantAgentPanelProps {
  constraints: MerchantConstraints;
  storeName?: string;
}

export function MerchantAgentPanel({
  constraints,
  storeName = "Apex Digital Merchant Store",
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
              <CardTitle className="text-base text-white">Merchant AI Agent</CardTitle>
              <CardDescription className="text-xs text-indigo-300/80">
                Representing the seller ({storeName})
              </CardDescription>
            </div>
          </div>
          <Badge variant="purple">Autonomous Seller</Badge>
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

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
            <span className="text-emerald-400 text-[11px] uppercase tracking-wider font-semibold block flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Protected Floor Price</span>
            </span>
            <span className="text-lg font-bold text-emerald-300 block">
              {formatCurrency(constraints.minAcceptablePrice)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-indigo-950/40 border border-indigo-800/30 p-3 text-xs text-indigo-200/90 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-indigo-300 block">Floor Margin Defense Policy:</span>
            <span>
              The Merchant Agent is authorized to offer discounts down to <strong className="text-white">{formatCurrency(constraints.minAcceptablePrice)}</strong>, but will reject any bid below that floor.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
