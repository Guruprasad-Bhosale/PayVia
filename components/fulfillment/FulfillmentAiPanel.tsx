"use client";

import React, { useState } from "react";
import { FulfillmentPlan, FulfillmentAiQueryResponse } from "@/types/fulfillment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
} from "lucide-react";

interface FulfillmentAiPanelProps {
  plan: FulfillmentPlan;
}

const PRESET_QUESTIONS = [
  "Can this order meet the customer's deadline?",
  "Which task is currently blocking delivery?",
  "Explain the fulfillment dependency chain",
  "Why is this order on track or at risk?",
  "Can you optimize this schedule for earlier delivery?",
];

export const FulfillmentAiPanel: React.FC<FulfillmentAiPanelProps> = ({ plan }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<FulfillmentAiQueryResponse | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const handleAsk = async (textToAsk: string) => {
    if (!textToAsk.trim() || loading) return;

    setLoading(true);
    setLastQuery(textToAsk);

    try {
      const res = await fetch("/api/fulfillment/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: textToAsk,
          negotiationId: plan.negotiationId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setResponse({
          success: false,
          answer: data.details || data.error || "Failed to process query",
          status: plan.status,
          promisedDeliveryDate: plan.promisedDeliveryDate,
          slackHours: plan.riskAnalysis.slackHours,
          error: data.error,
        });
      }
    } catch (err) {
      setResponse({
        success: false,
        answer: "Failed to connect to Fulfillment AI Agent service.",
        status: plan.status,
        promisedDeliveryDate: plan.promisedDeliveryDate,
        slackHours: plan.riskAnalysis.slackHours,
        error: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <span>Fulfillment AI Assistant</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                Gemini 3.8 Flash
              </span>
            </CardTitle>
            <p className="text-[11px] text-slate-400">
              Autonomous schedule reasoning, critical path analysis & risk verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Read-Only Invariant Guard</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Preset Quick Actions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-indigo-400" />
            <span>Suggested Operational Inquiries</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(q);
                  handleAsk(q);
                }}
                disabled={loading}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-left flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                <span>{q}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Query Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(query);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask Fulfillment AI about this schedule (e.g. 'Can this meet the 5-day deadline?')..."
              className="w-full h-10 px-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={!query.trim() || loading}
            className="h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2 font-medium"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Ask AI</span>
          </Button>
        </form>

        {/* AI Answer Card */}
        {response && (
          <div className="p-4 rounded-xl bg-slate-950/90 border border-indigo-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-400" />
                <span>Fulfillment Intelligence Report</span>
              </span>
              {response.status === "AT_RISK" ? (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>AT RISK</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ON TRACK</span>
                </span>
              )}
            </div>

            {lastQuery && (
              <p className="text-xs text-slate-400 italic">
                &ldquo;{lastQuery}&rdquo;
              </p>
            )}

            <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {response.answer}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <div>
                Promised Milestone:{" "}
                <strong className="text-slate-300">
                  {new Date(response.promisedDeliveryDate).toLocaleDateString()}
                </strong>
              </div>
              <div>
                Buffer Slack:{" "}
                <strong className={response.slackHours < 0 ? "text-amber-400" : "text-emerald-400"}>
                  {response.slackHours > 0 ? `+${response.slackHours}h` : `${response.slackHours}h`}
                </strong>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
