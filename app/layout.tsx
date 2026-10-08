import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Zap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Payvia - AI-Powered Payment Negotiation",
  description:
    "Buyer and merchant AI agents negotiate transaction terms before PayPal settlement.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-mesh-glow min-h-screen flex flex-col antialiased">
        <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Pay<span className="text-blue-400">via</span>
              </span>
            </Link>

            <nav className="flex items-center gap-6 text-sm text-slate-400">
              <Link
                href="/negotiate"
                className="hover:text-white transition-colors"
              >
                Negotiate
              </Link>
              <Link
                href="/agreement"
                className="hover:text-white transition-colors"
              >
                Agreements
              </Link>
              <Link
                href="/checkout"
                className="hover:text-white transition-colors"
              >
                Checkout
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>PayPal Sandbox</span>
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-900 bg-slate-950/40 py-6 text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>Payvia © {new Date().getFullYear()} — Built for the PayPal AI Hackathon</p>
            <p className="text-slate-600">
              Agent-to-Agent Autonomous Commerce Layer
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
