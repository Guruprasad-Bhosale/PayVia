"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  ValueFormatterParams,
  ICellRendererParams,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { MerchantTransactionRecord } from "@/lib/merchant/types";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

// Register AG Grid Community Module once
ModuleRegistry.registerModules([AllCommunityModule]);

interface MerchantGridProps {
  records: MerchantTransactionRecord[];
}

export function MerchantGrid({ records }: MerchantGridProps) {
  const [quickFilterText, setQuickFilterText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredData = useMemo(() => {
    if (statusFilter === "ALL") return records;
    return records.filter((r) => r.negotiationStatus === statusFilter);
  }, [records, statusFilter]);

  const columnDefs = useMemo<ColDef<MerchantTransactionRecord>[]>(() => {
    return [
      {
        field: "productName",
        headerName: "Product",
        flex: 2,
        minWidth: 200,
        pinned: "left",
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-white text-xs truncate leading-tight">
                {params.value}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                {params.data?.category || "Electronics"}
              </span>
            </div>
          );
        },
      },
      {
        field: "source",
        headerName: "Source",
        width: 130,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const isChannel3 = params.value === "channel3";
          return (
            <div className="flex items-center h-full">
              {isChannel3 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <span>Channel3</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  Demo Catalog
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: "merchantName",
        headerName: "Merchant / Domain",
        width: 150,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => (
          <span className="text-xs text-slate-300 truncate">{params.value || "Verified Merchant"}</span>
        ),
      },
      {
        field: "originalPrice",
        headerName: "List Price",
        width: 110,
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value, params.data?.currency || "USD"),
        cellClass: "font-mono text-xs text-slate-400 line-through",
      },
      {
        field: "negotiatedPrice",
        headerName: "Agreed Price",
        width: 120,
        valueFormatter: (params: ValueFormatterParams) =>
          params.value > 0
            ? formatCurrency(params.value, params.data?.currency || "USD")
            : "—",
        cellClass: "font-mono text-xs font-bold text-white",
      },
      {
        field: "savings",
        headerName: "Savings ($)",
        width: 120,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const val = params.value;
          if (!val || val <= 0) return <span className="text-slate-500 text-xs">—</span>;
          return (
            <span className="text-xs font-bold text-emerald-400">
              +{formatCurrency(val, params.data?.currency || "USD")}
            </span>
          );
        },
      },
      {
        field: "savingsPercentage",
        headerName: "Discount %",
        width: 115,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const pct = params.value;
          if (!pct || pct <= 0) return <span className="text-slate-500 text-xs">—</span>;
          return (
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              {pct}%
            </span>
          );
        },
      },
      {
        field: "deliveryDays",
        headerName: "Delivery",
        width: 100,
        valueFormatter: (params: ValueFormatterParams) =>
          params.value ? `${params.value} days` : "—",
        cellClass: "text-xs text-slate-300",
      },
      {
        field: "buyerMaxPrice",
        headerName: "Buyer Max",
        width: 115,
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value, params.data?.currency || "USD"),
        cellClass: "font-mono text-xs text-slate-400",
      },
      {
        field: "merchantMinPrice",
        headerName: "Merchant Floor",
        width: 125,
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value, params.data?.currency || "USD"),
        cellClass: "font-mono text-xs text-amber-400/90",
      },
      {
        field: "negotiationStatus",
        headerName: "Negotiation",
        width: 130,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const status = params.value;
          if (status === "AGREED") {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                ✓ AGREED
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
              ✕ FAILED
            </span>
          );
        },
      },
      {
        field: "paymentStatus",
        headerName: "PayPal Settlement",
        width: 140,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const status = params.value;
          if (status === "SETTLED") {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0070BA]/20 text-[#009cde] border border-[#0070BA]/40">
                ● SETTLED
              </span>
            );
          }
          if (status === "PENDING_APPROVAL") {
            return (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
                Pending Approval
              </span>
            );
          }
          return <span className="text-slate-500 text-xs">N/A</span>;
        },
      },
      {
        field: "createdAt",
        headerName: "Date / Time",
        width: 150,
        valueFormatter: (params: ValueFormatterParams) => {
          if (!params.value) return "—";
          try {
            return new Date(params.value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
          } catch {
            return params.value;
          }
        },
        cellClass: "text-xs text-slate-400 font-mono",
      },
    ];
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: false,
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Quick search products, merchants, or IDs..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-500 px-2 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            {(["ALL", "AGREED", "FAILED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {st === "ALL" ? "All Deals" : st}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
            {filteredData.length} records
          </span>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div className="ag-theme-quartz-dark rounded-2xl overflow-hidden border border-slate-800 shadow-2xl h-[420px] w-full">
        <AgGridReact
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          rowHeight={48}
          headerHeight={42}
          animateRows={true}
        />
      </div>
    </div>
  );
}
