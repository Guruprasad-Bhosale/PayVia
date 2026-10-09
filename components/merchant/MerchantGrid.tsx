"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  ColDef,
  ValueFormatterParams,
  ICellRendererParams,
} from "ag-grid-community";
import { MerchantTransactionRecord } from "@/lib/merchant/types";
import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";

// Register AG Grid Community Module
ModuleRegistry.registerModules([AllCommunityModule]);

const fintechLightGridTheme = themeQuartz.withParams({
  backgroundColor: "#FFFFFF",
  foregroundColor: "#111827",
  headerBackgroundColor: "#F8FAFC",
  headerTextColor: "#475569",
  rowHoverColor: "#F1F5F9",
  borderColor: "#E2E8F0",
  accentColor: "#0070E0",
  fontFamily: "inherit",
  fontSize: 13,
});

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
        headerName: "Product Name",
        flex: 2,
        minWidth: 200,
        pinned: "left",
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-bold text-foreground text-xs truncate leading-tight">
                {params.value}
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-payvia-navy border border-blue-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-payvia-blue animate-pulse" />
                  <span>Channel3</span>
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Direct Merchant
                </span>
              )}
            </div>
          );
        },
      },
      {
        field: "merchantName",
        headerName: "Merchant Domain",
        width: 160,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => (
          <span className="text-xs text-foreground font-medium truncate">{params.value || "Verified Merchant"}</span>
        ),
      },
      {
        field: "originalPrice",
        headerName: "List Price",
        width: 110,
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value, params.data?.currency || "USD"),
        cellClass: "font-mono text-xs text-muted-foreground line-through",
      },
      {
        field: "negotiatedPrice",
        headerName: "Agreed Price",
        width: 120,
        valueFormatter: (params: ValueFormatterParams) =>
          params.value > 0
            ? formatCurrency(params.value, params.data?.currency || "USD")
            : "—",
        cellClass: "font-mono text-xs font-bold text-payvia-navy",
      },
      {
        field: "savings",
        headerName: "Savings",
        width: 120,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const val = params.value;
          if (!val || val <= 0) return <span className="text-muted-foreground text-xs">—</span>;
          return (
            <span className="text-xs font-bold text-payvia-success">
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
          if (!pct || pct <= 0) return <span className="text-muted-foreground text-xs">—</span>;
          return (
            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-payvia-success border border-emerald-200">
              {pct}%
            </span>
          );
        },
      },
      {
        field: "deliveryDays",
        headerName: "Delivery SLA",
        width: 115,
        valueFormatter: (params: ValueFormatterParams) =>
          params.value ? `${params.value} days` : "—",
        cellClass: "text-xs text-foreground",
      },
      {
        field: "buyerMaxPrice",
        headerName: "Buyer Max",
        width: 115,
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value, params.data?.currency || "USD"),
        cellClass: "font-mono text-xs text-muted-foreground",
      },
      {
        field: "merchantMinPrice",
        headerName: "Policy Floor",
        width: 125,
        valueFormatter: (params: ValueFormatterParams) =>
          formatCurrency(params.value, params.data?.currency || "USD"),
        cellClass: "font-mono text-xs text-amber-700 font-semibold",
      },
      {
        field: "negotiationStatus",
        headerName: "Consensus",
        width: 130,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const status = params.value;
          if (status === "AGREED") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-payvia-success border border-emerald-300">
                ✓ AGREED
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-payvia-error border border-red-200">
              ✕ FAILED
            </span>
          );
        },
      },
      {
        field: "paymentStatus",
        headerName: "PayPal Settlement",
        width: 145,
        cellRenderer: (params: ICellRendererParams<MerchantTransactionRecord>) => {
          const status = params.value;
          if (status === "SETTLED") {
            return (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0070BA]/10 text-[#003087] border border-[#0070BA]/30">
                ● SETTLED
              </span>
            );
          }
          if (status === "PENDING_APPROVAL") {
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                Pending Approval
              </span>
            );
          }
          return <span className="text-muted-foreground text-xs">N/A</span>;
        },
      },
      {
        field: "createdAt",
        headerName: "Session Date",
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
        cellClass: "text-xs text-muted-foreground font-mono",
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-border shadow-sm">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search products, merchants, or negotiation IDs..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="pl-9 h-9 text-xs bg-slate-50 border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-border text-xs">
            <span className="text-[11px] text-muted-foreground px-2 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {(["ALL", "AGREED", "FAILED"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  statusFilter === st
                    ? "bg-payvia-navy text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "ALL" ? "All Deals" : st}
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground font-mono bg-slate-50 px-2.5 py-1.5 rounded-lg border border-border">
            {filteredData.length} records
          </span>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div className="rounded-xl overflow-hidden border border-border shadow-sm h-[440px] w-full bg-white">
        <AgGridReact
          theme={fintechLightGridTheme}
          rowData={filteredData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50]}
          rowHeight={48}
          headerHeight={42}
        />
      </div>
    </div>
  );
}
