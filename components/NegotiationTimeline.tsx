import React from "react";
import { AgentMessage } from "@/types/agent";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Bot, Store } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface NegotiationTimelineProps {
  messages: AgentMessage[];
}

export function NegotiationTimeline({ messages }: NegotiationTimelineProps) {
  if (messages.length === 0) {
    return (
      <Card className="text-center py-12 text-slate-500">
        <p className="text-sm">No negotiation dialogue yet. Configure constraints and start negotiation.</p>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <span>Agent-to-Agent Negotiation Feed</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </CardTitle>
          <Badge variant="info">{messages.length} Exchanges</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isBuyer = msg.sender === "buyer";
            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 p-4 rounded-xl border transition-all ${
                  isBuyer
                    ? "bg-blue-950/20 border-blue-900/40 text-blue-100 mr-8"
                    : "bg-indigo-950/20 border-indigo-900/40 text-indigo-100 ml-8"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isBuyer
                      ? "bg-blue-600/30 text-blue-400"
                      : "bg-indigo-600/30 text-indigo-400"
                  }`}
                >
                  {isBuyer ? <Bot className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs tracking-wider uppercase">
                      {isBuyer ? "Buyer Agent" : "Merchant Agent"}
                    </span>
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

                  <p className="text-sm leading-relaxed text-slate-200">
                    {msg.content}
                  </p>

                  {msg.proposedPrice !== undefined && (
                    <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-medium text-slate-300">Offer on table:</span>
                      <span className="text-sm font-bold text-white bg-slate-800 px-2 py-0.5 rounded-md">
                        {formatCurrency(msg.proposedPrice)}
                      </span>
                    </div>
                  )}

                  {msg.reasoning && (
                    <div className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60">
                      Strategy note: {msg.reasoning}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
