"use client";

import React, { useState } from "react";
import { AgentMessage } from "@/types/agent";
import { NegotiationAgreement } from "@/types/negotiation";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import LatticeLoader from "@/components/react-bits/LatticeLoader";
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
      <Card className="text-center py-12 text-[#475569] border-dashed border-[#CBD5E1] bg-white shadow-xs">
        <Bot className="w-9 h-9 mx-auto mb-2 text-[#64748B]" />
        <p className="text-sm font-semibold text-[#0A192F]">Negotiation Room Ready</p>
        <p className="text-xs text-[#475569] mt-1 max-w-sm mx-auto">
          Configure your budget ceiling and click &quot;Ask AI to Negotiate&quot; to begin autonomous multi-turn bargaining.
        </p>
      </Card>
    );
  }

  const finalPrice = agreement?.finalPrice ?? agreement?.finalAgreedPrice ?? 0;
  const originalPrice = agreement?.originalPrice ?? 0;
  const savings = agreement?.savings ?? agreement?.savingsAmount ?? (originalPrice - finalPrice);
  const percentage = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(1) : "0";

  return (
    <Card className="border-[#E2E8F0] bg-white shadow-xs">
      <CardHeader className="border-b border-[#E2E8F0] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-[#0A192F]">
              <span>Agent-to-Agent Negotiation Stream</span>
              {isNegotiating ? (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0052CC] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0052CC]"></span>
                </span>
              ) : agreement?.status === "AGREED" ? (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0E6245]"></span>
                </span>
              ) : null}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#475569] font-medium">
              {messages.length} {messages.length === 1 ? "Exchange" : "Exchanges"}
            </span>
            {agreement?.status === "AGREED" && (
              <Badge variant="success">✓ Consensus Reached</Badge>
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
                className={`flex gap-3.5 p-4 sm:p-5 rounded-xl border transition-all ${
                  isBuyer
                    ? "bg-[#EBF3FF]/70 border-[#0052CC]/30 text-[#0A192F] mr-4 sm:mr-10 shadow-xs"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#0A192F] ml-4 sm:ml-10 shadow-xs"
                }`}
              >
                {/* Agent Avatar */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs ${
                    isBuyer
                      ? "bg-[#0A192F] text-white"
                      : "bg-[#F5F3FF] text-[#581C87] border border-[#DDD6FE]"
                  }`}
                >
                  {isBuyer ? <Bot className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs tracking-wide uppercase text-[#0A192F]">
                        {isBuyer ? "Buyer AI Agent" : "Merchant AI Agent"}
                      </span>
                      <span className="text-[11px] text-[#475569]">
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

                  <p className="text-sm leading-relaxed text-[#0A192F] font-medium">
                    {msg.content}
                  </p>

                  {/* Proposal Metadata Pills */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-[#475569] border-t border-[#E2E8F0]">
                    {msg.proposedPrice !== undefined && (
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                        <span className="text-[#475569] text-[11px]">Proposed Price:</span>
                        <span className="font-bold text-[#0A192F] text-sm font-mono">
                          {formatCurrency(msg.proposedPrice)}
                        </span>
                      </div>
                    )}
                    {msg.deliveryDays !== undefined && (
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                        <Clock className="w-3.5 h-3.5 text-[#0052CC]" />
                        <span className="text-[#0A192F] font-medium">
                          {msg.deliveryDays} business days
                        </span>
                      </div>
                    )}

                    {msg.reasoning && (
                      <button
                        onClick={() => toggleReasoning(msg.id || index.toString())}
                        className="ml-auto inline-flex items-center gap-1 text-[11px] text-[#0052CC] hover:text-[#0A192F] font-semibold transition-colors py-1"
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
                    <div className="mt-2 p-3 rounded-lg bg-white border border-[#CBD5E1] text-[11px] text-[#475569] space-y-1">
                      <div className="flex items-center justify-between text-[#0A192F] font-semibold">
                        <span>Agent Strategy Rationale:</span>
                        <span className="text-[10px] text-[#0052CC]">AI proposes. PayVia validates.</span>
                      </div>
                      <p className="italic text-[#475569] leading-relaxed">
                        {msg.reasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Active Thinking Indicator with LatticeLoader */}
        {isNegotiating && (
          <div className="p-4 rounded-xl border border-[#0052CC]/20 bg-[#F0F5FF] text-[#0A192F] text-xs flex items-center justify-between">
            <LatticeLoader
              status="working"
              label={activeStatusText || "Agents formulating negotiation terms with Google Gemini"}
              pattern="orbit"
              color="#0052CC"
              doneColor="#0E6245"
              fontSize={13}
              cellSize={6}
            />
          </div>
        )}

        {/* Agreement Banner */}
        {agreement && agreement.status === "AGREED" && (
          <div className="p-5 rounded-xl bg-[#ECFDF5] border border-[#0E6245]/30 text-[#0A192F] space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#0E6245]/20 pb-3">
              <div className="flex items-center gap-2.5 font-bold text-base text-[#0A192F]">
                <CheckCircle2 className="w-5 h-5 text-[#0E6245] flex-shrink-0" />
                <span>Agreement Reached by AI Agents</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0E6245] bg-white px-3 py-1 rounded-full border border-[#0E6245]/30 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ready for Human Approval</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white border border-[#E2E8F0] space-y-0.5">
                <span className="text-[#475569] block text-[11px] uppercase tracking-wider font-medium">Original Listing</span>
                <span className="font-bold text-[#94A3B8] line-through text-base font-mono">
                  {formatCurrency(originalPrice, agreement.currency)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#0052CC] space-y-0.5 shadow-2xs">
                <span className="text-[#0052CC] block text-[11px] uppercase tracking-wider font-bold">
                  Final Negotiated Price
                </span>
                <span className="font-extrabold text-[#0A192F] text-xl font-mono">
                  {formatCurrency(finalPrice, agreement.currency)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-white border border-[#0E6245]/40 space-y-0.5">
                <span className="text-[#0E6245] block text-[11px] uppercase tracking-wider font-bold">Your Total Savings</span>
                <span className="font-extrabold text-[#0E6245] text-lg font-mono">
                  +{formatCurrency(savings, agreement.currency)} ({percentage}%)
                </span>
              </div>
            </div>

            <div className="text-[11px] text-[#475569] flex items-center gap-1.5 justify-center">
              <Info className="w-3.5 h-3.5 text-[#0052CC]" />
              <span>Terms locked server-side. Click below to review and authorize PayPal payment.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
