import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Store, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="flex justify-center">
          <Badge variant="purple" className="px-3 py-1.5 text-xs font-semibold gap-1.5 shadow-lg shadow-purple-500/10">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PayPal AI Hackathon Project</span>
          </Badge>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Pay<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">via</span>
        </h1>

        <p className="text-xl sm:text-2xl font-medium text-slate-300">
          AI-powered transaction negotiation
        </p>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Buyer and merchant AI agents negotiate transaction terms before PayPal settlement.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/negotiate">
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-xl shadow-blue-500/20">
              <span>Start Negotiation</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <a
            href="https://developer.paypal.com/docs/api/overview/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <span>PayPal REST API Docs</span>
            </Button>
          </a>
        </div>
      </section>

      {/* Protocol Diagram / Flow Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">1. Buyer Agent</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Specify your max budget, timeline, and preferences. Your autonomous AI agent advocates for your utility.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Store className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">2. Merchant Agent</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            The merchant agent protects floor margins, bundles shipping, and dynamically formulates counter-offers.
          </p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">3. PayPal Settlement</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Upon human approval of agreed terms, payment is securely captured via PayPal Sandbox Orders v2 API.
          </p>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950/80 to-slate-900/80 backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Autonomous Commerce Protocol</h2>
            <p className="text-sm text-slate-400 mt-1">
              Zero-trust architecture ensuring safe agent boundaries and reliable settlement.
            </p>
          </div>
          <Badge variant="success">Sandbox Ready</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Strict Budget Limits</span>
              <span className="text-slate-400">Agents cannot exceed hard financial bounds.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Explicit Authorization</span>
              <span className="text-slate-400">Human approval is required before payment.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Server-Side Secrets</span>
              <span className="text-slate-400">PayPal Client Secret is strictly isolated.</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">PayPal Orders v2</span>
              <span className="text-slate-400">Native integration with PayPal REST APIs.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
