import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Zap, ShieldCheck, ShoppingBag, Store, Calendar, Brain, Code } from "lucide-react";

export const metadata: Metadata = {
  title: "PayVia — An AI Negotiation Layer for Commerce",
  description:
    "AI negotiates. PayPal settles. PayVia lets buyer and merchant AI agents negotiate the economic terms of a transaction before PayPal securely settles it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-mesh-glow min-h-screen flex flex-col antialiased text-slate-100">
        {/* Flagship Header */}
        <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white">
                  Pay<span className="text-blue-400">Via</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60">
                  AI Commerce Layer
                </span>
              </div>
            </Link>

            {/* Main Navigation */}
            <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-slate-300">
              <Link
                href="/negotiate"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-blue-400" />
                <span>Buyer</span>
              </Link>

              <Link
                href="/merchant"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 text-indigo-300"
              >
                <Store className="w-4 h-4 text-indigo-400" />
                <span>Merchant</span>
              </Link>

              <Link
                href="/fulfillment"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 text-cyan-300 hidden md:flex"
              >
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Fulfillment</span>
              </Link>

              <Link
                href="/memory"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 text-pink-300 hidden md:flex"
              >
                <Brain className="w-4 h-4 text-pink-400" />
                <span>Memory</span>
              </Link>

              <Link
                href="/merchant?tab=developer"
                className="px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hidden lg:flex"
              >
                <Code className="w-4 h-4 text-slate-400" />
                <span>Developer</span>
              </Link>

              <div className="ml-2 flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PayPal Sandbox</span>
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">PayVia</span>
              <span>— An AI Negotiation Layer for Commerce</span>
            </div>
            <div className="flex items-center gap-6 text-slate-400 font-medium">
              <span>AI Negotiates. PayPal Settles.</span>
              <span>•</span>
              <span>Zero Client-Side Price Tampering</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

