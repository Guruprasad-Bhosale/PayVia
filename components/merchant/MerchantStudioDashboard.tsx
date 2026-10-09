"use client";

import React from "react";
import { MerchantAnalyticsDataset } from "@/lib/merchant/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  Zap,
  Percent,
  DollarSign,
} from "lucide-react";

interface MerchantStudioDashboardProps {
  dataset: MerchantAnalyticsDataset;
}

export function MerchantStudioDashboard({ dataset }: MerchantStudioDashboardProps) {
  const { byProduct, outcomeDistribution, sourceDistribution } = dataset;

  const maxRevenue = Math.max(...byProduct.map((p) => p.totalRevenue), 1);
  const maxSavingsPct = Math.max(...byProduct.map((p) => p.avgSavingsPct), 1);

  return (
    <div className="space-y-6">
      {/* Top Header Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-payvia-navy">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">AG Studio Analytics Dashboard</h3>
            <p className="text-xs text-muted-foreground">
              Performance metrics calculated from verified PayVia multi-turn negotiations
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[11px] gap-1 py-1 font-semibold text-payvia-navy">
          <Zap className="w-3 h-3 text-payvia-blue" />
          <span>AG Studio Engine</span>
        </Badge>
      </div>

      {/* Grid of Analytical Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Widget 1: Revenue by Product */}
        <Card className="border-border bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-payvia-success" />
                <span>Negotiated Revenue by SKU</span>
              </CardTitle>
              <span className="text-[10px] text-muted-foreground uppercase font-mono">USD</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {byProduct.map((prod) => {
              const pct = Math.round((prod.totalRevenue / maxRevenue) * 100);
              return (
                <div key={prod.productName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold truncate max-w-[65%]">
                      {prod.productName}
                    </span>
                    <span className="font-bold text-payvia-navy font-mono">
                      {formatCurrency(prod.totalRevenue, "USD")}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-payvia-blue to-payvia-cyan transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{prod.agreedCount} closed deals</span>
                    <span>{prod.acceptanceRate}% acceptance</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Widget 2: Average Discount % */}
        <Card className="border-border bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Percent className="w-4 h-4 text-payvia-blue" />
                <span>Average Agreed Discount %</span>
              </CardTitle>
              <span className="text-[10px] text-muted-foreground uppercase font-mono">Rate</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {byProduct.map((prod) => {
              const pct = Math.round((prod.avgSavingsPct / maxSavingsPct) * 100);
              return (
                <div key={prod.productName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground font-semibold truncate max-w-[65%]">
                      {prod.productName}
                    </span>
                    <span className="font-bold text-payvia-blue font-mono">
                      {prod.avgSavingsPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-payvia-blue transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>Avg savings: ${prod.avgSavings.toFixed(2)}</span>
                    <span className="font-medium text-emerald-700">Floor protected</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Widget 3: Outcome & Channel Distribution */}
        <Card className="border-border bg-white shadow-sm flex flex-col justify-between">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-600" />
                <span>Outcomes & Traffic Channel</span>
              </CardTitle>
              <span className="text-[10px] text-muted-foreground uppercase font-mono">Mix</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Negotiation Outcomes */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Session Conversion
              </span>
              <div className="grid grid-cols-2 gap-2">
                {outcomeDistribution.map((out) => (
                  <div
                    key={out.status}
                    className="p-3 rounded-xl bg-slate-50 border border-border space-y-1"
                  >
                    <span className="text-[10px] text-muted-foreground block truncate font-medium">
                      {out.status}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-foreground">{out.count}</span>
                      <span className="text-xs text-muted-foreground font-semibold font-mono">
                        ({out.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Mix */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Product Discovery Source
              </span>
              <div className="space-y-1.5">
                {sourceDistribution.map((src) => (
                  <div
                    key={src.source}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-border"
                  >
                    <span className="text-foreground font-semibold">{src.source}</span>
                    <span className="font-bold text-payvia-navy font-mono">{src.count} items</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
