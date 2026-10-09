"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Dock, { DockItemData } from "@/components/react-bits/Dock";
import {
  Home,
  ShoppingBag,
  Store,
  Calendar,
  Brain,
  Code,
} from "lucide-react";

export function GlobalDock() {
  const router = useRouter();
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isNegotiate =
    pathname.startsWith("/negotiate") ||
    pathname.startsWith("/agreement") ||
    pathname.startsWith("/checkout");
  const isMerchant =
    pathname.startsWith("/merchant") && !pathname.includes("tab=developer");
  const isFulfillment = pathname.startsWith("/fulfillment");
  const isMemory = pathname.startsWith("/memory");
  const isDeveloper = pathname.includes("tab=developer");

  const dockItems: DockItemData[] = [
    {
      icon: <Home className="w-5 h-5 text-[#003087]" />,
      label: "Overview",
      active: isHome,
      onClick: () => router.push("/"),
      menu: [
        { label: "PayVia Architecture", onClick: () => router.push("/") },
        { separator: true },
        { label: "Start Buying", onClick: () => router.push("/negotiate") },
        { label: "Merchant Portal", onClick: () => router.push("/merchant") },
      ],
    },
    {
      icon: <ShoppingBag className="w-5 h-5 text-[#0070E0]" />,
      label: "Buyer Room",
      active: isNegotiate,
      onClick: () => router.push("/negotiate"),
      menu: [
        { label: "Autonomous Room", onClick: () => router.push("/negotiate") },
        { label: "Active Agreement", onClick: () => router.push("/agreement") },
        { label: "PayPal Checkout", onClick: () => router.push("/checkout") },
      ],
    },
    {
      icon: <Store className="w-5 h-5 text-[#003087]" />,
      label: "Merchant Control",
      active: isMerchant,
      onClick: () => router.push("/merchant"),
      menu: [
        { label: "Performance Overview", onClick: () => router.push("/merchant?tab=overview") },
        { label: "Negotiation Policy", onClick: () => router.push("/merchant?tab=policy") },
        { label: "Product Inventory", onClick: () => router.push("/merchant?tab=products") },
        { label: "Settlement Ledger", onClick: () => router.push("/merchant?tab=transactions") },
      ],
    },
    { separator: true },
    {
      icon: <Calendar className="w-5 h-5 text-[#16845B]" />,
      label: "Fulfillment",
      active: isFulfillment,
      onClick: () => router.push("/fulfillment"),
      menu: [
        { label: "Gantt Timeline", onClick: () => router.push("/fulfillment") },
        { label: "Fulfillment AI Assistant", onClick: () => router.push("/fulfillment") },
      ],
    },
    {
      icon: <Brain className="w-5 h-5 text-[#8B5CF6]" />,
      label: "AI Memory",
      active: isMemory,
      onClick: () => router.push("/memory"),
      menu: [
        { label: "Elasticsearch Vector Search", onClick: () => router.push("/memory") },
        { label: "Benchmark Logs", onClick: () => router.push("/memory") },
      ],
    },
    {
      icon: <Code className="w-5 h-5 text-[#0F172A]" />,
      label: "SDK & API",
      active: isDeveloper,
      onClick: () => router.push("/merchant?tab=developer"),
      menu: [
        { label: "Developer Credentials", onClick: () => router.push("/merchant?tab=developer") },
        { label: "TypeScript Client Reference", onClick: () => router.push("/merchant?tab=developer") },
      ],
    },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:block pointer-events-auto">
      <Dock
        items={dockItems}
        theme="light"
        position="bottom"
        baseItemSize={52}
        magnification={72}
        panelHeight={78}
        gap={12}
        roundness={0.45}
        accentColor="#003087"
        badgeColor="#D92D20"
        className="shadow-xl border border-[#D9E0E9]"
      />
    </div>
  );
}

export default GlobalDock;
