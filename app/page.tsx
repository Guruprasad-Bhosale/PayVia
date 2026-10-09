import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InteractiveTransactionPreview } from "@/components/home/InteractiveTransactionPreview";
import { ShoppingIntentExperience } from "@/components/buyer/ShoppingIntentExperience";
import {
  Bot,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Lock,
  CreditCard,
  SlidersHorizontal,
  Store,
  ShoppingBag,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-24 py-4 sm:py-8">
      {/* Flagship Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto pt-6">
        <div className="flex justify-center">
          <Badge
            variant="purple"
            className="px-3.5 py-1.5 text-xs font-semibold gap-1.5 shadow-lg shadow-purple-500/10 border-purple-500/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI-Native Commerce Network</span>
          </Badge>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            MAKE YOUR COMMERCE <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">
              NEGOTIABLE.
            </span>
          </h1>

          <p className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            AI negotiates. PayPal settles.
          </p>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            PayVia lets buyer and merchant agents negotiate the economic terms of a transaction before PayPal securely settles it.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/negotiate" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto px-8 shadow-xl shadow-blue-500/25 text-base font-bold gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>Try as a Buyer</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>

          <Link href="/merchant" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-semibold gap-2 border-slate-700 bg-slate-900/80 hover:bg-slate-800">
              <Store className="w-5 h-5 text-indigo-400" />
              <span>Connect as a Merchant</span>
            </Button>
          </Link>
        </div>

        {/* Value Micro-Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AI proposes. You approve.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-400" />
            <span>Zero client price tampering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>PayPal Orders v2 Sandbox</span>
          </div>
        </div>
      </section>

      {/* Interactive Live Transaction Preview Section */}
      <section className="space-y-4">
        <div className="text-center space-y-1 mb-6">
          <span className="text-xs uppercase font-mono text-blue-400 font-semibold tracking-wider">
            Architecture in Action
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How PayVia Converges Buyer &amp; Merchant Intent
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Experience the step-by-step state machine from intent discovery to PayPal settlement.
          </p>
        </div>

        <InteractiveTransactionPreview />
      </section>

      {/* Flagship Live Buyer Experience */}
      <section id="buyer-experience" className="space-y-6 scroll-mt-24">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-mono text-emerald-400 font-semibold tracking-wider">
            Live Buyer Journey
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Tell PayVia What You Want.
          </h2>
          <p className="text-sm text-slate-300">
            Let your Buyer Agent discover live commerce, initiate parallel negotiations across registered PayVia merchants, and compare structured offers.
          </p>
        </div>

        <ShoppingIntentExperience />
      </section>

      {/* Visual User Journey / Flow Story */}
      <section id="how-it-works" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The 4 Pillars of Autonomous Negotiation
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
            <div className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Pillar 1</div>
            <h3 className="text-base font-bold text-white">Buyer Intent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Define target queries and ceiling budgets. Your constraints are defended as private mathematical boundaries.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3 relative group hover:border-indigo-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bot className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Pillar 2</div>
            <h3 className="text-base font-bold text-white">Parallel AI Negotiation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Concurrently negotiate with merchant agents under private merchant floor rules with deterministic validation.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3 relative group hover:border-emerald-500/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Pillar 3</div>
            <h3 className="text-base font-bold text-white">Human Approval Gate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review finalized price, delivery terms, and itemized savings. No transaction occurs without your explicit consent.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm space-y-3 relative group hover:border-[#0070BA]/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#0070BA]/20 border border-[#0070BA]/40 flex items-center justify-center text-[#009cde]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-xs font-semibold text-[#009cde] uppercase tracking-wider">Pillar 4</div>
            <h3 className="text-base font-bold text-white">PayPal Settlement</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              PayPal Orders v2 executes the exact negotiated amount. Verified capture receipt issued immediately.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="text-center p-10 rounded-3xl border border-blue-900/40 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 space-y-4 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Make Your Commerce Negotiable Today.
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Connect your catalog or start an autonomous shopping session. AI negotiates the terms, and PayPal settles the transaction.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link href="/negotiate">
            <Button size="lg" className="px-8 shadow-xl shadow-blue-500/20 text-base font-bold">
              <span>Start as Buyer</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/merchant">
            <Button variant="outline" size="lg" className="px-8 text-base font-semibold border-slate-700 bg-slate-900/80 hover:bg-slate-800">
              <span>Open Merchant Center</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

