import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductDiscovery } from "@/components/ProductDiscovery";
import { SAMPLE_PRODUCTS } from "@/data/products";
import {
  Bot,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowDown,
  CreditCard,
  SlidersHorizontal,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-20 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-8">
        <div className="flex justify-center">
          <Badge
            variant="purple"
            className="px-3.5 py-1.5 text-xs font-semibold gap-1.5 shadow-lg shadow-purple-500/10 border-purple-500/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>PayPal AI Hackathon Project</span>
          </Badge>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            PAY<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">VIA</span>
          </h1>

          <p className="text-2xl sm:text-3xl font-bold text-slate-200 tracking-tight">
            AI-Powered Payment Negotiation
          </p>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Let AI negotiate a better deal.
            <br className="hidden sm:inline" />
            <span className="text-emerald-400 font-semibold"> You approve it.</span>{" "}
            <span className="text-[#009cde] font-semibold">PayPal settles it.</span>
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/negotiate" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-xl shadow-blue-500/25 text-base">
              <span>Start Negotiating</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
              <span>See How It Works</span>
              <ArrowDown className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* Value Micro-Pills */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AI proposes. You approve.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Server-validated pricing</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>PayPal Sandbox Orders v2</span>
          </div>
        </div>
      </section>

      {/* AI Shopping & Product Discovery Section */}
      <section className="space-y-6">
        <ProductDiscovery initialProducts={SAMPLE_PRODUCTS} />
      </section>

      {/* Visual User Journey / Flow Story */}
      <section id="how-it-works" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Autonomous Payment Negotiation Works
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A zero-trust workflow that bridges customer utility, seller margin policies, and verified payment capture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3 relative group hover:border-blue-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Step 1</div>
            <h3 className="text-base font-bold text-white">Define Constraints</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select an item and set your ceiling budget & delivery window. Your limits are mathematical bounds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3 relative group hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Step 2</div>
            <h3 className="text-base font-bold text-white">AI Agent Negotiation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buyer Agent and Merchant Agent negotiate multi-turn offers, trading discounts and perks dynamically.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3 relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Step 3</div>
            <h3 className="text-base font-bold text-white">Human Authorization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review finalized price & itemized savings. No transaction occurs without your explicit approval.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3 relative group hover:border-[#0070BA]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#0070BA]/20 border border-[#0070BA]/40 flex items-center justify-center text-[#009cde]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#009cde] uppercase tracking-wider">Step 4</div>
            <h3 className="text-base font-bold text-white">PayPal Settlement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PayPal Orders v2 executes the exact negotiated amount. Verified capture receipt issued immediately.
            </p>
          </div>
        </div>
      </section>

      {/* Concrete Comparison Box */}
      <section className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">Traditional Checkout vs. PayVia Intelligent Commerce</h2>
            <p className="text-xs text-slate-400 mt-1">
              Why static fixed prices are being replaced by autonomous agent negotiation.
            </p>
          </div>
          <Badge variant="info">Protocol Comparison</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Traditional */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-950/40 space-y-3">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Traditional E-Commerce
            </div>
            <div className="text-sm text-slate-300 font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              Customer ➔ Fixed Price ($800) ➔ Take It or Leave It ➔ Checkout
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buyers overpay or abandon carts. Merchants lose sales due to rigid list prices.
            </p>
          </div>

          {/* PayVia */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 space-y-3">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              PayVia Agent Protocol
            </div>
            <div className="text-sm text-emerald-300 font-mono bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20">
              Buyer Agent ↔ Merchant Agent ➔ Agreed ($750) ➔ You Approve ➔ PayPal
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Buyers save money and customize terms. Merchants defend margins while closing high-intent sales.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="text-center p-10 rounded-3xl border border-blue-900/40 bg-gradient-to-r from-blue-950/30 via-slate-900 to-indigo-950/30 space-y-4">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Ready to experience autonomous payment negotiation?
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Select a sample laptop, headphones, or smartwatch, specify your target budget, and watch the agents formulate an agreement.
        </p>
        <div className="pt-2">
          <Link href="/negotiate">
            <Button size="lg" className="px-8 shadow-xl shadow-blue-500/20 text-base">
              <span>Launch Agent Console</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
