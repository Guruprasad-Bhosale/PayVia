"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  ShoppingBag,
  Store,
  Calendar,
  Brain,
  Code,
  HelpCircle,
} from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Handle ESC key for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinks = [
    {
      href: "/negotiate",
      label: "Shop",
      active:
        pathname.startsWith("/negotiate") ||
        pathname.startsWith("/agreement") ||
        pathname.startsWith("/checkout"),
    },
    {
      href: "/merchant",
      label: "For merchants",
      active: pathname.startsWith("/merchant"),
    },
    {
      href: "/fulfillment",
      label: "Fulfillment",
      active: pathname.startsWith("/fulfillment"),
    },
    {
      href: "/memory",
      label: "AI Memory",
      active: pathname.startsWith("/memory"),
    },
  ];

  const mobileNavLinks = [
    {
      href: "/negotiate",
      label: "Shop & Negotiate",
      icon: <ShoppingBag className="w-4 h-4 text-[#0070E0]" />,
      active: pathname.startsWith("/negotiate"),
    },
    {
      href: "/#how-it-works",
      label: "How It Works",
      icon: <HelpCircle className="w-4 h-4 text-[#003087]" />,
      active: pathname === "/",
    },
    {
      href: "/merchant",
      label: "Merchant Control Plane",
      icon: <Store className="w-4 h-4 text-[#003087]" />,
      active: pathname.startsWith("/merchant") && !pathname.includes("tab=developer"),
    },
    {
      href: "/fulfillment",
      label: "Fulfillment Timeline",
      icon: <Calendar className="w-4 h-4 text-[#16845B]" />,
      active: pathname.startsWith("/fulfillment"),
    },
    {
      href: "/memory",
      label: "AI Semantic Memory",
      icon: <Brain className="w-4 h-4 text-[#8B5CF6]" />,
      active: pathname.startsWith("/memory"),
    },
    {
      href: "/merchant?tab=developer",
      label: "Developer SDK & API",
      icon: <Code className="w-4 h-4 text-[#0F172A]" />,
      active: pathname.includes("tab=developer"),
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E2E8F0] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          {/* Left: PayVia Brand Mark & Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] p-1 -ml-1 group"
            aria-label="PayVia Homepage"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0052CC] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0A192F] transition-colors">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0A192F]">
              Pay<span className="text-[#0052CC]">Via</span>
            </span>
          </Link>

          {/* Middle: Primary Navigation Links (Desktop) */}
          <nav
            className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#475569]"
            aria-label="Primary Navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg transition-colors ${
                  link.active
                    ? "text-[#0A192F] font-bold bg-[#F1F5F9]"
                    : "hover:text-[#0A192F] hover:bg-[#F8FAFC]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Discreet Sandbox Status + Single Prominent CTA */}
          <div className="hidden md:flex items-center gap-4">
            <div
              className="flex items-center gap-1.5 text-xs text-[#0E6245] bg-[#ECFDF5] px-3 py-1.5 rounded-full border border-[#A7F3D0] font-semibold"
              title="Connected to PayPal Orders v2 Sandbox"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E6245]" />
              <span>PayPal Sandbox</span>
            </div>

            <Link href="/negotiate">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 bg-[#0052CC] hover:bg-[#0A192F] text-white text-sm font-bold px-4 py-2 rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:ring-offset-2"
              >
                <span>Start shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {/* Mobile Right Controls: Sandbox indicator + Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <div
              className="flex items-center gap-1 text-[11px] text-[#0E6245] bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0] font-semibold"
              title="PayPal Sandbox"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E6245] animate-pulse" />
              <span>Sandbox</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="min-h-[44px] min-w-[44px] p-2.5 rounded-lg border border-[#CBD5E1] text-[#0A192F] hover:bg-[#F8FAFC] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#0052CC]"
              aria-label="Open mobile navigation menu"
              aria-expanded={mobileOpen}
            >
              <Menu className="w-5 h-5 text-[#0A192F]" />
            </button>
          </div>
        </div>
      </header>

      {/* 
        ========================================================================
        MOBILE ACCESSIBLE NAVIGATION DRAWER
        ========================================================================
      */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div
            className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 border-l border-[#E2E8F0]"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Menu"
          >
            <div className="space-y-6">
              {/* Drawer Top */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0052CC] flex items-center justify-center text-white">
                    <Zap className="w-4 h-4 fill-white text-white" />
                  </div>
                  <span className="font-extrabold text-lg text-[#0A192F]">Pay<span className="text-[#0052CC]">Via</span></span>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-[44px] min-w-[44px] p-2 text-[#475569] hover:text-[#0A192F] flex items-center justify-center rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5" aria-label="Mobile Navigation Links">
                {mobileNavLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      link.active
                        ? "bg-[#F0F5FF] text-[#0052CC] font-bold"
                        : "text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0052CC]"
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Drawer Bottom CTA */}
            <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-[#0E6245] font-semibold bg-[#ECFDF5] p-2.5 rounded-lg border border-[#A7F3D0]">
                <ShieldCheck className="w-4 h-4 text-[#0E6245]" />
                <span>PayPal Orders v2 Sandbox</span>
              </div>

              <Link href="/negotiate" onClick={() => setMobileOpen(false)}>
                <button
                  type="button"
                  className="w-full bg-[#0052CC] hover:bg-[#0A192F] text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Start shopping</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
