"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  Key,
  Terminal,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  ArrowRight,
} from "lucide-react";

export function PayViaConnectDeveloper({ platformId = "plat_default" }: { platformId?: string }) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSdk, setCopiedSdk] = useState(false);

  const handleGenerateKey = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/v1/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Connected Store Environment" }),
      });
      const data = await res.json();
      if (res.ok && data?.credentials?.apiKey) {
        setApiKey(data.credentials.apiKey);
      } else {
        // Fallback demo key
        setApiKey(`pv_test_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`);
      }
    } catch {
      setApiKey(`pv_test_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sdkCodeSnippet = `import { createPayViaClient } from "@payvia/sdk";

// 1. Initialize PayVia SDK with Platform Credentials
const payvia = createPayViaClient({
  baseUrl: "https://payvia.onrender.com",
  apiKey: "${apiKey || "pv_live_xxxxxxxxxxxxxxxxxxxxxxxx"}",
  platformId: "${platformId}",
});

// 2. Create Transaction Intent
const transaction = await payvia.transactions.create({
  merchantId: "merchant_123",
  buyerId: "buyer_456",
  currency: "USD",
  items: [{ catalogItemId: "prod_synth", title: "Synthesizer", quantity: 1, listPrice: 800, currency: "USD" }],
  constraints: { maxTotal: 760, maxDeliveryDays: 5 },
});

// 3. Autonomously Negotiate & Lock Agreement
const { agreement } = await payvia.negotiations.runAutonomous(transaction.id);

// 4. Settle Agreement with PayPal Orders v2
const settlement = await payvia.settlements.create(agreement.id);
console.log("PayPal Checkout URL:", settlement.approvalUrl);`;

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/20 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="info" className="gap-1 text-xs">
            <Terminal className="w-3 h-3" />
            <span>Developer & Platform Integration</span>
          </Badge>
          <span className="text-xs text-slate-400 font-mono">REST API v1 + TypeScript SDK</span>
        </div>
        <h2 className="text-xl font-bold text-white">Embed PayVia into Your Commerce Stack</h2>
        <p className="text-xs text-slate-400 max-w-3xl">
          Integrate PayVia into external ecommerce websites, shopping carts, B2B procurement systems, or AI shopping agents. PayVia handles autonomous economic negotiation; PayPal settles the agreement.
        </p>
      </div>

      {/* Visual Architectural Story */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span>Integration Architecture Overview</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-mono text-blue-400">Step 1</span>
            <div className="text-xs font-bold text-white">Your Commerce Platform</div>
            <div className="text-[10px] text-slate-500">Shopify / WooCommerce / Custom</div>
          </div>

          <div className="hidden md:flex items-center justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono text-indigo-400">Step 2</span>
            <div className="text-xs font-bold text-white">PayVia AI Engine</div>
            <div className="text-[10px] text-slate-400">Multi-Turn Agent Consensus</div>
          </div>

          <div className="hidden md:flex items-center justify-center text-slate-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-1">
            <span className="text-[10px] font-mono text-emerald-400">Step 3</span>
            <div className="text-xs font-bold text-white">PayPal Settlement</div>
            <div className="text-[10px] text-emerald-400 font-mono">Authoritative Capture</div>
          </div>
        </div>
      </div>

      {/* Credentials Management & API Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Platform Credentials</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{platformId}</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Generate platform API credentials to authorize requests from your backend servers.
            </p>

            {apiKey ? (
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 font-mono text-xs">
                <div className="flex items-center justify-between text-amber-300 text-[10px]">
                  <span>API Key (Copy Now · Shown Once)</span>
                  <button
                    onClick={() => copyToClipboard(apiKey, setCopiedKey)}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="text-white truncate font-bold">{apiKey}</div>
              </div>
            ) : (
              <Button
                onClick={handleGenerateKey}
                disabled={generating}
                variant="outline"
                className="w-full gap-2 text-xs"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>{generating ? "Generating Key..." : "Generate New Platform API Key"}</span>
              </Button>
            )}

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Raw Secrets Stored</span>
              </div>
              <div>PayVia stores only SHA-256 hashes of credentials in the authoritative database.</div>
            </div>
          </div>
        </div>

        {/* SDK Code Snippet */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">TypeScript SDK Integration</h3>
            </div>
            <button
              onClick={() => copyToClipboard(sdkCodeSnippet, setCopiedSdk)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-all"
            >
              {copiedSdk ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSdk ? "Copied Code" : "Copy Snippet"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto max-h-[260px]">
            <pre>{sdkCodeSnippet}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
