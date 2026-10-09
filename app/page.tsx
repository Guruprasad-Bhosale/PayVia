import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InteractiveTransactionPreview } from "@/components/home/InteractiveTransactionPreview";
import { ShoppingIntentExperience } from "@/components/buyer/ShoppingIntentExperience";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  SlidersHorizontal,
  Store,
  ShoppingBag,
  Bot,
  FileCheck,
  Terminal,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-24 py-2">
      {/* 
        ========================================================================
        PART 3 — THE NEGOTIATION DESK (Asymmetrical Editorial Hero Composition)
        ========================================================================
      */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Asymmetrical Product Statement & Actions (5 Columns) */}
        <div className="lg:col-span-5 space-y-6 pt-2">
          {/* Architecture Status Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFF8FF] border border-[#0070E0]/20 text-[#003087] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#0070E0] animate-pulse" />
            <span className="tracking-tight">Agent-to-Agent Commerce Protocol</span>
          </div>

          {/* Main Editorial Statement */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-[#101828] leading-[1.08]">
              Commerce, with room to negotiate.
            </h1>

            <p className="text-lg sm:text-xl font-bold text-[#0070E0] tracking-tight">
              AI negotiates. PayPal settles.
            </p>

            <p className="text-sm sm:text-base text-[#5C6678] font-normal leading-relaxed">
              Your buyer agent discovers terms across participating merchants within your private budget bounds. Merchant rules enforce strict price floors. You review the cryptographic agreement. PayPal executes the exact settlement.
            </p>
          </div>

          {/* Direct Workspace Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link href="/negotiate" className="flex-1 sm:flex-initial">
              <Button size="lg" className="w-full px-6 text-sm font-bold gap-2 bg-[#003087] hover:bg-[#002266] text-white shadow-sm">
                <ShoppingBag className="w-4 h-4" />
                <span>Start Buyer Journey</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/merchant" className="flex-1 sm:flex-initial">
              <Button variant="secondary" size="lg" className="w-full text-sm font-semibold gap-2 bg-[#F8FAFC] border border-[#D9E0E9] text-[#003087] hover:bg-[#EFF8FF]">
                <Store className="w-4 h-4 text-[#003087]" />
                <span>Merchant Control</span>
              </Button>
            </Link>
          </div>

          {/* Three Immutable Guarantees */}
          <div className="pt-4 border-t border-[#E2E8F0] grid grid-cols-1 gap-2.5 text-xs text-[#5C6678]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16845B] flex-shrink-0" />
              <span><strong className="text-[#101828]">Explicit Human Consent:</strong> No charge without review.</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#003087] flex-shrink-0" />
              <span><strong className="text-[#101828]">Zero-Tamper Hash:</strong> SHA-256 sealed contract payload.</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0070E0] flex-shrink-0" />
              <span><strong className="text-[#101828]">PayPal Orders v2:</strong> Verified Sandbox capture & webhook sync.</span>
            </div>
          </div>
        </div>

        {/* Right Column: The Negotiation Terminal / Desk Centerpiece (7 Columns) */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[#D9E0E9] bg-white p-2 sm:p-3 shadow-lg">
            <InteractiveTransactionPreview />
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        LIVE BUYER EXPERIENCE SECTION (Interactive Discovery & Live Negotiation)
        ========================================================================
      */}
      <section id="buyer-workspace" className="space-y-6 pt-4 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0070E0]">
              <Terminal className="w-4 h-4" />
              <span>Autonomous Commerce Suite</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
              Direct Negotiation Workspace
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5C6678] max-w-md">
            Query catalog items, establish mathematical constraints, and trigger parallel negotiation with real-time settlement prep.
          </p>
        </div>

        <ShoppingIntentExperience />
      </section>

      {/* 
        ========================================================================
        ZERO-TRUST COMMERCE PROTOCOL: 4 ARCHITECTURAL PILLARS
        ========================================================================
      */}
      <section className="space-y-6 pt-6">
        <div className="space-y-2 text-center max-w-2xl mx-auto">
          <span className="text-xs uppercase font-bold text-[#003087] tracking-wider">
            Architecture Blueprint
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#101828] tracking-tight">
            How Autonomous Negotiation Settle in PayVia
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6678]">
            A zero-trust workflow bridging buyer utility, merchant margin boundaries, and PayPal settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Pillar 1 */}
          <div className="p-5 rounded-xl border border-[#D9E0E9] bg-white space-y-3 hover:border-[#0070E0] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#0070E0] bg-[#EFF8FF] px-2 py-0.5 rounded">01_INTENT</span>
              <SlidersHorizontal className="w-4 h-4 text-[#0070E0]" />
            </div>
            <h3 className="text-sm font-bold text-[#101828]">Buyer Budget Bounds</h3>
            <p className="text-xs text-[#5C6678] leading-relaxed">
              Target product parameters and private budget ceilings are mathematically protected from merchant agent leakage.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-5 rounded-xl border border-[#D9E0E9] bg-white space-y-3 hover:border-[#0070E0] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#6D28D9] bg-[#F5F3FF] px-2 py-0.5 rounded">02_PARALLEL</span>
              <Bot className="w-4 h-4 text-[#6D28D9]" />
            </div>
            <h3 className="text-sm font-bold text-[#101828]">Deterministic Floors</h3>
            <p className="text-xs text-[#5C6678] leading-relaxed">
              Seller agents propose counter-offers under strict, server-enforced merchant floor margins and delivery timelines.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-5 rounded-xl border border-[#D9E0E9] bg-white space-y-3 hover:border-[#0070E0] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#16845B] bg-[#ECFDF5] px-2 py-0.5 rounded">03_SEAL</span>
              <FileCheck className="w-4 h-4 text-[#16845B]" />
            </div>
            <h3 className="text-sm font-bold text-[#101828]">SHA-256 Agreement</h3>
            <p className="text-xs text-[#5C6678] leading-relaxed">
              Selected offer generates an immutable, cryptographically sealed agreement requiring explicit human consent.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-5 rounded-xl border border-[#D9E0E9] bg-white space-y-3 hover:border-[#0070E0] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#003087] bg-[#EFF8FF] px-2 py-0.5 rounded">04_SETTLE</span>
              <CreditCard className="w-4 h-4 text-[#003087]" />
            </div>
            <h3 className="text-sm font-bold text-[#101828]">PayPal Orders v2</h3>
            <p className="text-xs text-[#5C6678] leading-relaxed">
              Authoritative server capture executes against the sealed amount with immediate stock reservation decrement.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        DEVELOPER & MERCHANT ACCESS CTA
        ========================================================================
      */}
      <section className="rounded-2xl border border-[#003087] bg-[#003087] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 text-left max-w-xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
            Developer Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Integrate PayVia with Your Commerce API.
          </h2>
          <p className="text-xs sm:text-sm text-blue-100">
            Publish your catalog, configure margin policies, and allow AI buyer agents to negotiate directly against your inventory rules.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 flex-shrink-0">
          <Link href="/merchant?tab=developer">
            <Button size="lg" className="px-6 bg-white text-[#003087] hover:bg-slate-100 text-sm font-bold shadow-xs">
              <Terminal className="w-4 h-4 mr-1.5" />
              <span>Developer SDK</span>
            </Button>
          </Link>
          <Link href="/merchant">
            <Button variant="outline" size="lg" className="px-6 bg-transparent border-white/40 text-white hover:bg-white/10 text-sm font-semibold">
              <span>Merchant Console</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
