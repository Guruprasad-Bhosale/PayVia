"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  BarChart,
  PieChart,
  Table,
  ShieldCheck,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  chartSuggestion?: string;
  chartTitle?: string;
  timestamp: string;
}

const PROMPT_STARTERS = [
  "Which products are negotiated most frequently?",
  "Which products have the highest average discount?",
  "Which products have the highest acceptance rate?",
  "Compare laptop negotiations against headphone negotiations",
  "Show me failed negotiations",
  "Create a chart of average savings by product",
];

export function MerchantAiPanel() {
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your **PayVia Merchant Intelligence Analyst** (powered by AG Studio Agent Framework and Google Gemini). Ask me questions about negotiation volumes, discount distributions, customer acceptance rates, or request custom dashboard charts.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    setInputQuery("");
    setErrorMessage(null);

    const userMessage: Message = {
      role: "user",
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/merchant/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to get AI analytics response.");
      }

      const aiMessage: Message = {
        role: "assistant",
        content: data.answer,
        chartSuggestion: data.suggestedChartType,
        chartTitle: data.chartTitle,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Error consulting Merchant AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-indigo-900/40 bg-slate-900/90 shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-800/80 bg-slate-950/60 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base text-white">Merchant AI Analyst</CardTitle>
              <p className="text-xs text-slate-400">
                Studio Agent Framework & Gemini 3.8 Flash
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Read-Only Guardrails Active</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Messages Stream */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-slate-950/90 border border-slate-800 text-slate-200"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1.5 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>PayVia Merchant Intelligence</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.chartSuggestion && m.chartTitle && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-indigo-300">
                    {m.chartSuggestion === "bar" && <BarChart className="w-3.5 h-3.5 text-blue-400" />}
                    {m.chartSuggestion === "pie" && <PieChart className="w-3.5 h-3.5 text-purple-400" />}
                    {m.chartSuggestion === "table" && <Table className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>Recommended View: <strong>{m.chartTitle}</strong></span>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.timestamp}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/40 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span>Analyzing transaction dataset with Gemini 3.8 Flash...</span>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Prompt Starters */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Suggested Analyst Inquiries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PROMPT_STARTERS.map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleAsk(starter)}
                disabled={isLoading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        {/* Query Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(inputQuery);
          }}
          className="flex gap-2 pt-2 border-t border-slate-800"
        >
          <Input
            type="text"
            placeholder="Ask Merchant AI about negotiation metrics, product margins, discounts..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="text-xs h-10 bg-slate-950 border-slate-700 text-white placeholder:text-slate-500"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="h-10 px-5 gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Ask</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
