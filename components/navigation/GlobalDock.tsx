"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  ShoppingBag,
  Store,
  Calendar,
  Brain,
  Code,
} from "lucide-react";

/**
 * GlobalDock Component
 * Repaired for pointer events and stacking context.
 * Provides quick access toolbar with genuine route destinations.
 */
export function GlobalDock() {
  const pathname = usePathname();

  // Avoid rendering dock on checkout and agreement review to eliminate cognitive distraction
  if (
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/agreement")
  ) {
    return null;
  }

  const isHome = pathname === "/";
  const isNegotiate = pathname.startsWith("/negotiate");
  const isMerchant = pathname.startsWith("/merchant") && !pathname.includes("tab=developer");
  const isFulfillment = pathname.startsWith("/fulfillment");
  const isMemory = pathname.startsWith("/memory");
  const isDeveloper = pathname.includes("tab=developer");

  const items = [
    { href: "/", label: "Home", icon: <Home className="w-4 h-4" />, active: isHome },
    { href: "/negotiate", label: "Shop", icon: <ShoppingBag className="w-4 h-4" />, active: isNegotiate },
    { href: "/merchant", label: "Merchant", icon: <Store className="w-4 h-4" />, active: isMerchant },
    { href: "/fulfillment", label: "Fulfillment", icon: <Calendar className="w-4 h-4" />, active: isFulfillment },
    { href: "/memory", label: "AI Memory", icon: <Brain className="w-4 h-4" />, active: isMemory },
    { href: "/merchant?tab=developer", label: "SDK/API", icon: <Code className="w-4 h-4" />, active: isDeveloper },
  ];

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 hidden md:block pointer-events-auto"
      role="toolbar"
      aria-label="Quick Navigation Bar"
    >
      <nav className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-lg">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              item.active
                ? "bg-[#EFF8FF] text-[#003087] font-bold border border-[#0070E0]/20 shadow-2xs"
                : "text-[#5C6678] hover:text-[#003087] hover:bg-[#F8FAFC]"
            }`}
            title={item.label}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export default GlobalDock;
