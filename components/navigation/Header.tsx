"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
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
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll for soft elevation enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      icon: <ShoppingBag className="w-4 h-4 text-[#0284C7]" />,
      active: pathname.startsWith("/negotiate"),
    },
    {
      href: "/#how-it-works",
      label: "How It Works",
      icon: <HelpCircle className="w-4 h-4 text-[#52607A]" />,
      active: pathname === "/",
    },
    {
      href: "/merchant",
      label: "Merchant Control Plane",
      icon: <Store className="w-4 h-4 text-[#0284C7]" />,
      active: pathname.startsWith("/merchant") && !pathname.includes("tab=developer"),
    },
    {
      href: "/fulfillment",
      label: "Fulfillment Timeline",
      icon: <Calendar className="w-4 h-4 text-[#059669]" />,
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
      icon: <Code className="w-4 h-4 text-[#0B1B33]" />,
      active: pathname.includes("tab=developer"),
    },
  ];

  return (
    <>
      {/* 
        ========================================================================
        FLOATING NAVIGATION DOCK
        - Centered pill-shaped dock with subtle border, soft shadow, white canvas
        - Perfectly balanced paddings, icon-text alignment, and flex-shrink protection
        ========================================================================
      */}
      <div className="sticky top-0 z-40 w-full pt-3.5 sm:pt-4 md:pt-5 px-3 sm:px-6 pointer-events-none">
        <header
          className={`mx-auto max-w-5xl pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl md:rounded-full border border-[#DCE4EE] transition-all duration-200 ${
            scrolled
              ? "shadow-md shadow-slate-900/[0.06] border-[#CBD5E1]"
              : "shadow-sm shadow-slate-900/[0.03]"
          }`}
        >
          <div className="h-16 md:h-[66px] px-3.5 sm:px-5 md:px-6 flex items-center justify-between gap-3 sm:gap-4">
            {/* ================================================================== */}
            {/* LEFT: PayVia Brand Identity                                       */}
            {/* ================================================================== */}
            <div className="flex-shrink-0 flex items-center">
              <Logo size="md" />
            </div>

            {/* ================================================================== */}
            {/* CENTER: Navigation Links with Soft Ice-Blue Active Pill           */}
            {/* ================================================================== */}
            <nav
              className="hidden md:flex items-center gap-1 text-[14px] font-medium"
              aria-label="Primary Navigation"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full transition-all duration-150 flex items-center justify-center ${
                    link.active
                      ? "text-[#0284C7] font-semibold bg-[#F0F9FF]"
                      : "text-[#52607A] hover:text-[#0B1B33] hover:bg-[#F8FAFC]"
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* ================================================================== */}
            {/* RIGHT: Compact Sandbox Chip & Primary Action Button               */}
            {/* ================================================================== */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {/* Discrete Sandbox Status Chip */}
              <div
                className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#059669] bg-[#ECFDF5] px-3 py-1.5 rounded-full border border-[#A7F3D0] font-medium select-none"
                title="Connected to PayPal Orders v2 Sandbox Environment"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#059669] flex-shrink-0" />
                <span className="font-semibold whitespace-nowrap">PayPal Sandbox</span>
              </div>

              {/* Primary Action Button - Perfectly Balanced Padding & Sizing */}
              <Link href="/negotiate" className="flex-shrink-0">
                <button
                  type="button"
                  className="group inline-flex items-center justify-center gap-2.5 bg-[#0284C7] hover:bg-[#0EA5E9] active:bg-[#0369A1] text-white text-sm font-semibold h-[42px] px-5 rounded-full transition-all duration-150 shadow-xs focus:outline-none focus:ring-2 focus:ring-[#38BDF8] focus:ring-offset-2 cursor-pointer flex-shrink-0 whitespace-nowrap"
                >
                  <span>Start shopping</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
                </button>
              </Link>
            </div>

            {/* ================================================================== */}
            {/* MOBILE CONTROLS: Sandbox Tag + CTA + Mobile Hamburger             */}
            {/* ================================================================== */}
            <div className="flex md:hidden items-center gap-2 flex-shrink-0">
              <Link href="/negotiate" className="flex-shrink-0">
                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#0284C7] hover:bg-[#0EA5E9] active:bg-[#0369A1] text-white text-xs font-semibold h-[38px] px-4 rounded-full transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Shop</span>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                </button>
              </Link>

              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="min-h-[38px] min-w-[38px] p-2 rounded-full border border-[#DCE4EE] text-[#0B1B33] hover:bg-[#F8FAFC] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#38BDF8] cursor-pointer flex-shrink-0"
                aria-label="Open mobile navigation menu"
                aria-expanded={mobileOpen}
              >
                <Menu className="w-4 h-4 text-[#0B1B33]" />
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* ==================================================================== */}
      {/* MOBILE ACCESSIBLE NAVIGATION DRAWER                                 */}
      {/* ==================================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex justify-end md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-[#0B1B33]/40 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 border-l border-[#DCE4EE]"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile Navigation Menu"
            >
              <div className="space-y-6">
                {/* Drawer Top */}
                <div className="flex items-center justify-between pb-4 border-b border-[#DCE4EE]">
                  <Logo size="md" href="/" />

                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="min-h-[40px] min-w-[40px] p-2 text-[#52607A] hover:text-[#0B1B33] flex items-center justify-center rounded-lg cursor-pointer"
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
                          ? "bg-[#F0F9FF] text-[#0284C7] font-bold border border-[#BAE6FD]/60"
                          : "text-[#52607A] hover:bg-[#F8FAFC] hover:text-[#0284C7]"
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Drawer Bottom CTA */}
              <div className="pt-4 border-t border-[#DCE4EE] space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-[#059669] font-medium bg-[#ECFDF5] p-2.5 rounded-lg border border-[#A7F3D0]">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" />
                  <span>PayPal Orders v2 Sandbox</span>
                </div>

                <Link href="/negotiate" onClick={() => setMobileOpen(false)}>
                  <button
                    type="button"
                    className="w-full bg-[#0284C7] hover:bg-[#0EA5E9] text-white font-semibold text-sm h-[44px] rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Start shopping</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Header;
