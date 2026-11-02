"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ShoppingIntentExperience } from "@/components/buyer/ShoppingIntentExperience";
import { InteractiveTransactionPreview } from "@/components/home/InteractiveTransactionPreview";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  FileCheck,
  Scale,
  Sparkles,
  Lock,
  Tag,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 py-2">
      {/* 
        ========================================================================
        DISTINCTIVE ASYMMETRICAL HERO SECTION
        - Left: Confident editorial headline (56-68px desktop scale), value proposition, primary action, proof pillars
        - Right: Interactive Live Autonomous Negotiation Engine Preview
        ========================================================================
      */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative pt-2 pb-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Bold Editorial Headline & Pitch (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] text-xs font-semibold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#EC4899] animate-pulse" />
              <span className="text-[#0B1B33]">Protocol Live:</span>
              <span>AI Negotiates. PayPal Settles.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-extrabold tracking-tight text-[#0B1B33] leading-[1.1] max-w-xl">
              Your next deal <br />
              starts with{" "}
              <span className="text-[#38BDF8] relative inline-block">
                AI
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#EC4899] rounded-full" />
              </span>
              .
            </h1>

            <p className="text-base sm:text-[17px] text-[#52607A] max-w-lg leading-relaxed">
              Tell us what you need. Let AI negotiate the terms. Approve the agreement and pay securely with PayPal.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <a href="#intent-composer">
                <Button size="lg" className="px-7 bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-semibold text-base min-h-[48px] gap-2">
                  <span>Start negotiating</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="px-6 bg-white border border-[#DCE4EE] text-[#0B1B33] hover:bg-[#F0F9FF] hover:border-[#BAE6FD] font-semibold text-base min-h-[48px]">
                  <span>Explore how it works</span>
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#DCE4EE] max-w-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#0284C7] font-semibold">
                  <Tag className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Negotiated Pricing</span>
                </div>
                <p className="text-[11px] text-[#52607A] leading-tight">
                  Transparent merchant policy floors
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#0284C7] font-semibold">
                  <Lock className="w-3.5 h-3.5 text-[#0284C7]" />
                  <span>Explicit Approval</span>
                </div>
                <p className="text-[11px] text-[#52607A] leading-tight">
                  Buyer reviews &amp; signs every deal
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-[#0284C7] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#EC4899]" />
                  <span>PayPal Settlement</span>
                </div>
                <p className="text-[11px] text-[#52607A] leading-tight">
                  Cryptographic tamper protection
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Transaction Engine (5 cols) */}
          <div className="lg:col-span-5">
            <InteractiveTransactionPreview />
          </div>
        </div>
      </motion.section>

      {/* 
        ========================================================================
        PURCHASE INTENT WORKSPACE (PRIMARY USER ACTION)
        ========================================================================
      */}
      <section id="intent-composer" className="scroll-mt-24 space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#DCE4EE] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
              <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
              <span>Purchase Intent Workspace</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B33] tracking-tight">
              Create an AI Negotiation Request
            </h2>
          </div>
          <span className="text-xs text-[#52607A]">
            Zero obligation · Authorize only after consensus
          </span>
        </div>

        <ShoppingIntentExperience />
      </section>

      {/* 
        ========================================================================
        HOW IT WORKS: 4-STEP CLEAR VISUAL WORKFLOW
        ========================================================================
      */}
      <section id="how-it-works" className="space-y-10 pt-6 scroll-mt-24 max-w-5xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0284C7]">
            <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>Structured Autonomous Protocol</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B33] tracking-tight">
            How PayVia Works
          </h2>
          <p className="text-sm text-[#52607A] max-w-xl mx-auto">
            From natural language shopping requirement to verified PayPal settlement in four bounded phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCE4EE] space-y-4 hover:border-[#BAE6FD] transition-all duration-200 hover:shadow-card group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#0284C7]">01</span>
              <span className="w-2 h-2 rounded-full bg-[#DCE4EE] group-hover:bg-[#0284C7] transition-colors" />
            </div>
            <h3 className="text-base font-bold text-[#0B1B33]">Tell PayVia what you need</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Describe your target product, budget ceiling, and delivery window. Private constraints remain strictly confidential.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCE4EE] space-y-4 hover:border-[#BAE6FD] transition-all duration-200 hover:shadow-card group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#0284C7]">02</span>
              <span className="w-2 h-2 rounded-full bg-[#DCE4EE] group-hover:bg-[#EC4899] transition-colors" />
            </div>
            <h3 className="text-base font-bold text-[#0B1B33]">AI agents negotiate terms</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Buyer and merchant AI agents negotiate dynamically within merchant-defined policy floors and inventory allocations.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCE4EE] space-y-4 hover:border-[#BAE6FD] transition-all duration-200 hover:shadow-card group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#0284C7]">03</span>
              <span className="w-2 h-2 rounded-full bg-[#DCE4EE] group-hover:bg-[#0284C7] transition-colors" />
            </div>
            <h3 className="text-base font-bold text-[#0B1B33]">Review &amp; approve agreement</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Inspect authoritative terms, SHA-256 seal, and explicitly authorize the binding agreement before payment.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-white border border-[#DCE4EE] space-y-4 hover:border-[#A7F3D0] transition-all duration-200 hover:shadow-card group">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black font-mono text-[#059669]">04</span>
              <span className="w-2 h-2 rounded-full bg-[#DCE4EE] group-hover:bg-[#059669] transition-colors" />
            </div>
            <h3 className="text-base font-bold text-[#0B1B33]">PayPal handles settlement</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Payment is captured securely via PayPal Orders v2 with immutable cryptographic verification.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        SYSTEM INTEGRITY & BOUNDARIES (FINTECH TRUST)
        ========================================================================
      */}
      <section className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#DCE4EE] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7]">Financial Boundaries</span>
            <h2 className="text-2xl font-extrabold text-[#0B1B33] tracking-tight">Built on Real Guarantees</h2>
          </div>
          <span className="text-xs text-[#52607A]">Zero autonomous financial mutations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#F0F9FF]/40 border border-[#DCE4EE] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
              <Scale className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1B33]">Merchant Policy Limits</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Agents cannot negotiate below merchant-authorized price floors or promise inventory outside validated allocations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F0F9FF]/40 border border-[#DCE4EE] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1B33]">Transparent Comparison</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Participating merchant offers are ranked by genuine total price, delivery timeline, and savings against real listings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F0F9FF]/40 border border-[#DCE4EE] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-[#BAE6FD] flex items-center justify-center text-[#0284C7]">
              <FileCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1B33]">Buyer Approval Required</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Every agreement requires explicit buyer review and signature. No charge is ever initiated autonomously.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F0F9FF]/40 border border-[#DCE4EE] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0B1B33]">PayPal Settlement</h3>
            <p className="text-xs text-[#52607A] leading-relaxed">
              Funds are held and captured securely via PayPal Orders v2 with cryptographic agreement tamper verification.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        MERCHANT & DEVELOPER CTA (HIGH CONTRAST BANNER)
        ========================================================================
      */}
      <section className="rounded-3xl bg-[#0B1B33] text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl max-w-5xl mx-auto border border-sky-900/40 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#0284C7]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#EC4899]/15 blur-3xl pointer-events-none" />

        <div className="space-y-2 text-left max-w-xl z-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#38BDF8]">
            <span className="w-2 h-2 rounded-full bg-[#EC4899]" />
            <span>Merchant Control Plane &amp; API</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Connect your catalog to PayVia
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Configure autonomous negotiation policies, protect your profit floors, and let AI agents negotiate deals directly with buyers.
          </p>
        </div>

        <div className="flex flex-wrap gap-3.5 flex-shrink-0 z-10">
          <Link href="/merchant">
            <Button size="lg" className="px-6 bg-[#38BDF8] hover:bg-[#0EA5E9] text-[#0B1B33] text-sm font-bold shadow-md cursor-pointer">
              <span>Merchant Console</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/merchant?tab=developer">
            <Button variant="outline" size="lg" className="px-6 border-slate-700 text-white hover:bg-slate-800 text-sm font-semibold cursor-pointer">
              <span>Developer API</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
