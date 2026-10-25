import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingIntentExperience } from "@/components/buyer/ShoppingIntentExperience";
import {
  ArrowRight,
  ShieldCheck,
  CreditCard,
  SlidersHorizontal,
  FileCheck,
  Scale,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-20 py-2">
      {/* 
        ========================================================================
        HERO SECTION & INTENT COMPOSER
        ========================================================================
      */}
      <section className="space-y-8 max-w-4xl mx-auto text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#0E6245]/20 text-[#0E6245] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI negotiates. PayPal settles.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0A192F] leading-[1.1]">
            Your AI negotiates. You choose the deal.
          </h1>

          <p className="text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
            Tell PayVia what you need. AI negotiates eligible offers within merchant-approved limits. You review the agreement and pay securely with PayPal.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a href="#intent-composer">
              <Button size="lg" className="px-6 bg-[#0052CC] hover:bg-[#0A192F] text-white font-bold shadow-xs">
                <span>Start negotiating</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </a>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg" className="px-6 bg-white border border-[#CBD5E1] text-[#0A192F] hover:bg-[#F8FAFC] font-semibold">
                <span>How it works</span>
              </Button>
            </a>
          </div>
        </div>

        {/* Embedded Primary Shopping Intent Form */}
        <div className="text-left pt-2">
          <ShoppingIntentExperience />
        </div>
      </section>

      {/* 
        ========================================================================
        HOW IT WORKS: 3 ESSENTIAL STEPS
        ========================================================================
      */}
      <section id="how-it-works" className="space-y-8 pt-4 scroll-mt-24 max-w-5xl mx-auto">
        <div className="text-center space-y-1.5">
          <span className="text-xs uppercase font-bold tracking-wider text-[#0052CC]">
            Simple Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight">
            How PayVia Works
          </h2>
          <p className="text-xs sm:text-sm text-[#475569]">
            Three steps from purchase request to verified settlement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#F0F5FF] text-[#0052CC] font-mono font-bold flex items-center justify-center text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-[#0A192F]">Describe what you need</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Enter what you want to buy, your budget ceiling, and delivery requirements. Your constraints remain strictly confidential.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#F0F5FF] text-[#0052CC] font-mono font-bold flex items-center justify-center text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-[#0A192F]">AI negotiates eligible offers</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Buyer and merchant AI agents negotiate terms in parallel, strictly constrained by merchant-authorized pricing floors and inventory rules.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-white border border-[#E2E8F0] space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] text-[#0E6245] font-mono font-bold flex items-center justify-center text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-[#0A192F]">Review agreement &amp; pay with PayPal</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Review authoritative commercial terms and approve the cryptographic agreement before PayPal processes the secure checkout.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        TRUST & TRANSPARENCY: SYSTEM BOUNDARIES
        ========================================================================
      */}
      <section className="space-y-6 max-w-5xl mx-auto">
        <div className="text-center space-y-1.5">
          <span className="text-xs uppercase font-bold tracking-wider text-[#0052CC]">
            System Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A192F] tracking-tight">
            Built on Real Boundaries
          </h2>
          <p className="text-xs sm:text-sm text-[#475569]">
            Autonomous negotiation with strict human-in-the-loop authorization and settlement guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <Scale className="w-5 h-5 text-[#0052CC]" />
            <h3 className="text-sm font-bold text-[#0A192F]">Merchant Policy Limits</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Agents cannot negotiate below merchant-authorized price floors or promise inventory outside validated allocations.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <SlidersHorizontal className="w-5 h-5 text-[#0052CC]" />
            <h3 className="text-sm font-bold text-[#0A192F]">Clear Offer Comparison</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Participating merchant offers are ranked by genuine total price, delivery timeline, and savings against real reference listings.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <FileCheck className="w-5 h-5 text-[#0052CC]" />
            <h3 className="text-sm font-bold text-[#0A192F]">Buyer Approval Required</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Every agreement requires explicit buyer review and signature. No charge is ever initiated autonomously.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
            <CreditCard className="w-5 h-5 text-[#0052CC]" />
            <h3 className="text-sm font-bold text-[#0A192F]">PayPal Settlement</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Funds are held and captured securely via PayPal Orders v2 with cryptographic agreement tamper verification.
            </p>
          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        MERCHANT & DEVELOPER CTA
        ========================================================================
      */}
      <section className="rounded-2xl border border-[#CBD5E1] bg-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs max-w-5xl mx-auto">
        <div className="space-y-1.5 text-left max-w-xl">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#0052CC]">
            For Merchants &amp; Developers
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A192F] tracking-tight">
            Connect your catalog to PayVia
          </h2>
          <p className="text-xs sm:text-sm text-[#475569]">
            Configure autonomous negotiation policies, protect your profit floors, and let AI agents negotiate deals directly with buyers.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 flex-shrink-0">
          <Link href="/merchant">
            <Button size="lg" className="px-6 bg-[#0052CC] hover:bg-[#0A192F] text-white text-sm font-bold shadow-xs">
              <span>Merchant Console</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
          <Link href="/merchant?tab=developer">
            <Button variant="secondary" size="lg" className="px-6 bg-[#F8FAFC] border border-[#CBD5E1] text-[#0052CC] hover:bg-[#F0F5FF] text-sm font-semibold">
              <span>Developer API</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
