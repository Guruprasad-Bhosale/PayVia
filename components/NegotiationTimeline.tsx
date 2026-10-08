"use client";

import React, { useState } from "react";
import { AgentMessage } from "@/types/agent";
import { NegotiationAgreement } from "@/types/negotiation";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Bot,
  Store,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface NegotiationTimelineProps {
  messages: AgentMessage[];
  agreement?: NegotiationAgreement | null;
  isNegotiating?: boolean;
  activeStatusText?: string;
}

export function NegotiationTimeline({
  messages,
  agreement,
  isNegotiating = false,
  activeStatusText,
}: NegotiationTimelineProps) {
  const [expandedReasonings, setExpandedReasonings] = useState<Record<string, boolean>>({});

  const toggleReasoning = (id: string) => {
    setExpandedReasonings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (messages.length === 0 && !isNegotiating) {
    return (
      <Card className="text-center py-14 text-slate-500 border-dashed border-slate-800 bg-slate-900/30">
        <Bot className="w-10 h-10 mx-auto mb-3 text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold text-slate-300">Negotiation Room Standing By</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Configure your budget ceiling and click &quot;Ask AI to Negotiate&quot; to begin autonomous bargaining.
        </p>
      </Card>
    );
  }

  const finalPrice = agreement?.finalPrice ?? agreement?.finalAgreedPrice ?? 0;
  const originalPrice = agreement?.originalPrice ?? 0;
  const savings = agreement?.savings ?? agreement?.savingsAmount ?? (originalPrice - finalPrice);
  const percentage = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(1) : "0";

  return (
    <Card className="border-slate-800 bg-slate-900/70 shadow-2xl">
      <CardHeader className="border-b border-slate-800/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <span>Agent-to-Agent Negotiation Stream</span>
              {isNegotiating ? (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
              ) : agreement?.status === "AGREED" ? (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              ) : null}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">
              {messages.length} {messages.length === 1 ? "Exchange" : "Exchanges"}
            </span>
            {agreement?.status === "AGREED" && (
              <Badge variant="success">✓ Agreement Reached</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isBuyer = msg.sender === "buyer";
            const isExpanded = expandedReasonings[msg.id || index.toString()] ?? false;

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
                  isBuyer
                    ? "bg-blue-950/20 border-blue-900/50 text-blue-50 mr-4 sm:mr-12 shadow-md shadow-blue-950/20"
                    : "bg-indigo-950/20 border-indigo-900/50 text-indigo-50 ml-4 sm:ml-12 shadow-md shadow-indigo-950/20"
                }`}
              >
                {/* Agent Avatar */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    isBuyer
                      ? "bg-blue-600/30 text-blue-400 border border-blue-500/40"
                      : "bg-indigo-600/30 text-indigo-400 border border-indigo-500/40"
                  }`}
                >
                  {isBuyer ? <Bot className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs tracking-wider uppercase">
                        {isBuyer ? "Buyer AI Agent" : "Merchant AI Agent"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {isBuyer ? "(on your behalf)" : "(representing seller)"}
                      </span>
                    </div>

                    {msg.decision && (
                      <Badge
                        variant={
                          msg.decision === "ACCEPT"
                            ? "success"
                            : msg.decision === "REJECT"
                            ? "warning"
                            : "info"
                        }
                      >
                        {msg.decision}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-slate-100 font-normal">
                    {msg.content}
                  </p>

                  {/* Proposal Metadata Pills */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300 border-t border-slate-800/60">
                    {msg.proposedPrice !== undefined && (
                      <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[11px]">Proposed Price:</span>
                        <span className="font-bold text-white text-sm">
                          {formatCurrency(msg.proposedPrice)}
                        </span>
                      </div>
                    )}
                    {msg.deliveryDays !== undefined && (
                      <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-slate-300 font-medium">
                          {msg.deliveryDays} business days
                        </span>
                      </div>
                    )}

                    {msg.reasoning && (
                      <button
                        onClick={() => toggleReasoning(msg.id || index.toString())}
                        className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors py-1"
                      >
                        <span>Why this offer?</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Expandable Reasoning */}
                  {msg.reasoning && isExpanded && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-300 space-y-1 animate-fadeIn">
                      <div className="flex items-center justify-between text-slate-400 font-medium">
                        <span>💡 Agent Strategy Rationale:</span>
                        <span className="text-[10px] text-blue-400/80">AI proposes. PayVia validates.</span>
                      </div>
                      <p className="italic text-slate-400 leading-relaxed">
                        {msg.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Active Thinking Indicator */}
        {isNegotiating && (
          <div className="p-4 rounded-2xl border border-blue-900/40 bg-blue-950/20 text-blue-300 text-xs flex items-center gap-3 animate-pulse">
            <Bot className="w-4 h-4 animate-spin text-blue-400 flex-shrink-0" />
            <span className="font-medium">
              {activeStatusText || "Agents formulating next turn with Google Gemini..."}
            </span>
          </div>
        )}

        {/* Agreement Banner */}
        {agreement && agreement.status === "AGREED" && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/50 text-emerald-300 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
              <div className="flex items-center gap-2.5 font-bold text-base text-white">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                <span>✓ Agreement Reached by AI Agents</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready for Human Authorization</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Original Listing</span>
                <span className="font-bold text-slate-300 line-through text-base">
                  {formatCurrency(originalPrice, agreement.currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-0.5 ring-1 ring-emerald-500/20">
                <span className="text-emerald-400 block text-[11px] uppercase tracking-wider font-bold">
                  Final Negotiated Price
                </span>
                <span className="font-extrabold text-white text-xl">
                  {formatCurrency(finalPrice, agreement.currency)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                <span className="text-slate-400 block text-[11px] uppercase tracking-wider">Your Total Savings</span>
                <span className="font-extrabold text-emerald-400 text-lg">
                  {formatCurrency(savings, agreement.currency)} ({percentage}%)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Terms locked server-side. Click below to review and authorize PayPal payment.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
