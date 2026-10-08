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
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AG Studio Analytics Dashboard</h3>
            <p className="text-xs text-slate-400">
              Visual performance metrics derived from verified PayVia multi-turn negotiations
            </p>
          </div>
        </div>
        <Badge variant="purple" className="text-[11px] gap-1 py-1">
          <Zap className="w-3 h-3 text-purple-400" />
          <span>AG Studio Engine</span>
        </Badge>
      </div>

      {/* Grid of Interactive Analytical Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Widget 1: Revenue by Product (Bar Visualization) */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Negotiated Revenue by Product</span>
              </CardTitle>
              <span className="text-[10px] text-slate-500 uppercase font-mono">USD</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {byProduct.map((prod) => {
              const pct = Math.round((prod.totalRevenue / maxRevenue) * 100);
              return (
                <div key={prod.productName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[65%]">
                      {prod.productName}
                    </span>
                    <span className="font-bold text-white font-mono">
                      {formatCurrency(prod.totalRevenue, "USD")}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{prod.agreedCount} closed deals</span>
                    <span>{prod.acceptanceRate}% acceptance</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Widget 2: Average Discount % by Product */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-blue-400" />
                <span>Average Negotiated Discount %</span>
              </CardTitle>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Rate</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5">
            {byProduct.map((prod) => {
              const pct = Math.round((prod.avgSavingsPct / maxSavingsPct) * 100);
              return (
                <div key={prod.productName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[65%]">
                      {prod.productName}
                    </span>
                    <span className="font-bold text-blue-400 font-mono">
                      {prod.avgSavingsPct}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Avg savings: ${prod.avgSavings.toFixed(2)}</span>
                    <span>Floor protected</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Widget 3: Outcome & Channel Distribution */}
        <Card className="border-slate-800 bg-slate-900/90 shadow-xl flex flex-col justify-between">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                <span>Outcomes & Traffic Channel</span>
              </CardTitle>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Mix</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Negotiation Outcomes */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Session Conversion
              </span>
              <div className="grid grid-cols-2 gap-2">
                {outcomeDistribution.map((out) => (
                  <div
                    key={out.status}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1"
                  >
                    <span className="text-[10px] text-slate-400 block truncate font-medium">
                      {out.status}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold text-white">{out.count}</span>
                      <span className="text-xs text-slate-400 font-semibold font-mono">
                        ({out.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Mix */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Product Discovery Source
              </span>
              <div className="space-y-1.5">
                {sourceDistribution.map((src) => (
                  <div
                    key={src.source}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800"
                  >
                    <span className="text-slate-300 font-medium">{src.source}</span>
                    <span className="font-bold text-white font-mono">{src.count} items</span>
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
