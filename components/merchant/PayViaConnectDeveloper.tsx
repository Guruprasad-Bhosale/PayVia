"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/ToastProvider";
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
  const { toast } = useToast();

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
      toast({
        title: "API Key Generated",
        description: "New platform credentials generated. Copy the key now.",
        variant: "success",
      });
    } catch {
      setApiKey(`pv_test_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void, label = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: label,
      description: "Content successfully copied.",
      variant: "success",
    });
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
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-xs font-bold text-payvia-navy">
            <Terminal className="w-3 h-3 text-payvia-blue" />
            <span>Developer & Platform Integration</span>
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">REST API v1 + TypeScript SDK</span>
        </div>
        <h2 className="text-xl font-bold text-foreground">Embed PayVia into Your Commerce Stack</h2>
        <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
          Integrate PayVia into external ecommerce websites, shopping carts, B2B procurement workflows, or AI shopping agents. PayVia manages multi-attribute autonomous negotiations; PayPal settles the final locked agreement.
        </p>
      </div>

      {/* Visual Architectural Story */}
      <div className="p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-payvia-blue" />
          <span>Integration Architecture Overview</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-border text-center space-y-1">
            <span className="text-[10px] font-mono text-payvia-blue font-bold">Step 1</span>
            <div className="text-xs font-bold text-foreground">Your Commerce App</div>
            <div className="text-[10px] text-muted-foreground">Shopify / Headless / Custom</div>
          </div>

          <div className="hidden md:flex items-center justify-center text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-center space-y-1">
            <span className="text-[10px] font-mono text-payvia-navy font-bold">Step 2</span>
            <div className="text-xs font-bold text-payvia-navy">PayVia Agent Engine</div>
            <div className="text-[10px] text-muted-foreground">Multi-Turn Agreement</div>
          </div>

          <div className="hidden md:flex items-center justify-center text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-center space-y-1">
            <span className="text-[10px] font-mono text-payvia-success font-bold">Step 3</span>
            <div className="text-xs font-bold text-payvia-success">PayPal Settlement</div>
            <div className="text-[10px] text-emerald-800 font-mono">Authoritative Capture</div>
          </div>
        </div>
      </div>

      {/* Credentials Management & API Keys */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-border shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-foreground">Platform Credentials</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{platformId}</span>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Generate platform API credentials to authorize requests from your backend servers.
            </p>

            {apiKey ? (
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-amber-300 font-mono text-xs">
                <div className="flex items-center justify-between text-amber-800 text-[10px] font-semibold">
                  <span>API Key (Copy Now · Shown Once)</span>
                  <button
                    onClick={() => copyToClipboard(apiKey, setCopiedKey, "API Key Copied")}
                    className="flex items-center gap-1 text-payvia-blue hover:text-payvia-navy"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-payvia-success" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="text-foreground truncate font-bold">{apiKey}</div>
              </div>
            ) : (
              <Button
                onClick={handleGenerateKey}
                disabled={generating}
                variant="outline"
                className="w-full gap-2 text-xs font-semibold"
              >
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>{generating ? "Generating Key..." : "Generate New Platform API Key"}</span>
              </Button>
            )}

            <div className="p-3 rounded-xl bg-slate-50 border border-border text-[11px] text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-payvia-success" />
                <span>Zero Plaintext Secrets Stored</span>
              </div>
              <div>PayVia stores only cryptographic SHA-256 digests of credentials in the authoritative database.</div>
            </div>
          </div>
        </div>

        {/* SDK Code Snippet */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-payvia-blue" />
              <h3 className="text-sm font-bold text-foreground">TypeScript SDK Integration</h3>
            </div>
            <button
              onClick={() => copyToClipboard(sdkCodeSnippet, setCopiedSdk, "SDK Snippet Copied")}
              className="flex items-center gap-1.5 text-xs text-payvia-blue hover:text-payvia-navy font-medium transition-all"
            >
              {copiedSdk ? <Check className="w-3.5 h-3.5 text-payvia-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSdk ? "Copied Code" : "Copy Snippet"}</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 overflow-x-auto max-h-[260px]">
            <pre>{sdkCodeSnippet}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
