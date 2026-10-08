import React from "react";
import { MerchantConstraints } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Store, ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MerchantAgentPanelProps {
  constraints: MerchantConstraints;
  storeName?: string;
}

export function MerchantAgentPanel({
  constraints,
  storeName = "Apex Retailers Official",
}: MerchantAgentPanelProps) {
  return (
    <Card className="border-indigo-900/40 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">Merchant AI Agent</CardTitle>
              <CardDescription>{storeName}</CardDescription>
            </div>
          </div>
          <Badge variant="info">Autonomous Seller</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400 block mb-1">Catalog Asking Price</span>
            <span className="text-base font-semibold text-white">
              {formatCurrency(constraints.originalPrice)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
            <span className="text-slate-400 block mb-1">Floor Price (Protected)</span>
            <span className="text-base font-semibold text-emerald-400">
              {formatCurrency(constraints.minAcceptablePrice)}
            </span>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/40 border border-slate-800 p-3 text-xs text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            The Merchant Agent safeguards product margins, evaluates bundle requests, and adjusts shipping concessions dynamically.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
