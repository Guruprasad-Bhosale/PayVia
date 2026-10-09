"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  ShieldCheck,
  ShoppingBag,
  Store,
  Calendar,
  Brain,
  Code,
  Menu,
} from "lucide-react";
import StaggeredMenu, { StaggeredMenuItem } from "@/components/react-bits/StaggeredMenu";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: "/negotiate",
      label: "Buyer Experience",
      icon: <ShoppingBag className="w-4 h-4" />,
      active: pathname.startsWith("/negotiate") || pathname.startsWith("/agreement") || pathname.startsWith("/checkout"),
    },
    {
      href: "/merchant",
      label: "Merchant Control",
      icon: <Store className="w-4 h-4" />,
      active: pathname.startsWith("/merchant") && !pathname.includes("tab=developer"),
    },
    {
      href: "/fulfillment",
      label: "Fulfillment",
      icon: <Calendar className="w-4 h-4" />,
      active: pathname.startsWith("/fulfillment"),
    },
    {
      href: "/memory",
      label: "AI Memory",
      icon: <Brain className="w-4 h-4" />,
      active: pathname.startsWith("/memory"),
    },
    {
      href: "/merchant?tab=developer",
      label: "SDK & API",
      icon: <Code className="w-4 h-4" />,
      active: pathname.includes("tab=developer"),
    },
  ];

  const staggeredItems: StaggeredMenuItem[] = [
    { label: "Home", link: "/", ariaLabel: "Go to PayVia Homepage" },
    { label: "Buyer Experience", link: "/negotiate", ariaLabel: "Explore Autonomous Buyer Experience" },
    { label: "Merchant Control", link: "/merchant", ariaLabel: "Open Merchant Control Plane" },
    { label: "Fulfillment Engine", link: "/fulfillment", ariaLabel: "View Bryntum Fulfillment Engine" },
    { label: "AI Vector Memory", link: "/memory", ariaLabel: "Explore Elasticsearch Memory Layer" },
    { label: "SDK & Developer API", link: "/merchant?tab=developer", ariaLabel: "Inspect PayVia TypeScript SDK" },
  ];

  const socialLinks = [
    { label: "PayPal Sandbox", link: "https://developer.paypal.com" },
    { label: "Channel3 Discovery", link: "https://channel3.ai" },
    { label: "Documentation", link: "/merchant?tab=developer" },
  ];

  return (
    <>
      <header className="border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left Brand Anchor */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[#003087] flex items-center justify-center text-white shadow-sm group-hover:bg-[#002266] transition-colors">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-[#003087]">
                Pay<span className="text-[#0070E0]">Via</span>
              </span>
              <span className="hidden xl:inline-block text-[10px] font-bold uppercase tracking-wider text-[#5B6472] px-2 py-0.5 rounded-md bg-[#F5F7FA] border border-[#E2E8F0]">
                Commerce Layer
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Visible on desktop & large tablets) */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-[#5B6472]">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  link.active
                    ? "bg-[#EFF8FF] text-[#003087] font-bold border border-[#0070E0]/20 shadow-xs"
                    : "hover:bg-[#F5F7FA] hover:text-[#003087]"
                }`}
              >
                <span className={link.active ? "text-[#0070E0]" : "text-[#5B6472]"}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right Area: PayPal Sandbox Verified Badge + Mobile Hamburger */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-[#16845B] bg-[#ECFDF5] px-3 py-1.5 rounded-full border border-[#16845B]/25 font-semibold shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
              <span className="hidden sm:inline">PayPal Sandbox</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#16845B] animate-pulse sm:hidden" />
            </div>

            {/* Mobile / Tablet Toggle Button for StaggeredMenu */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] text-[#003087] hover:bg-[#EBF3FF] transition-colors"
                aria-label="Open mobile navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile / Responsive StaggeredMenu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 pointer-events-auto">
          <StaggeredMenu
            isFixed={true}
            position="right"
            items={staggeredItems}
            socialItems={socialLinks}
            colors={["#001C55", "#003087", "#0070E0"]}
            accentColor="#0070E0"
            displayItemNumbering={true}
            displaySocials={true}
            closeOnClickAway={true}
            onMenuClose={() => setMobileMenuOpen(false)}
          />
        </div>
      )}
    </>
  );
}

export default Navbar;
