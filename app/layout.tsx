import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { StaggeredMenu } from "@/components/react-bits/StaggeredMenu";
import { GlobalDock } from "@/components/navigation/GlobalDock";

export const metadata: Metadata = {
  title: "PayVia — Agent Commerce & PayPal Settlement",
  description:
    "AI negotiates. PayPal settles. PayVia is the autonomous agent-to-agent negotiation protocol for commerce.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-fintech-grid min-h-screen flex flex-col antialiased text-[#101828] bg-[#F8FAFC]">
        <ToastProvider>
          {/* Primary PayVia Control Entry Point & StaggeredMenu (Replaces full-width top navbar) */}
          <StaggeredMenu
            isFixed={true}
            position="right"
            colors={["#001C55", "#003087", "#0070E0"]}
            accentColor="#0070E0"
            displayItemNumbering={true}
            displaySocials={true}
            closeOnClickAway={true}
          />

          {/* Main Application Page Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 mb-16">
            {children}
          </main>

          {/* Secondary Quick-Access Floating Dock */}
          <GlobalDock />

          {/* Clean Fintech Footer */}
          <footer className="border-t border-[#E2E8F0] bg-white py-8 text-xs text-[#5C6678]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#003087]">PayVia</span>
                <span>— Autonomous Agent Commerce Protocol</span>
              </div>
              <div className="flex items-center gap-6 text-[#5C6678] font-medium">
                <span className="text-[#003087] font-semibold">AI negotiates. PayPal settles.</span>
                <span>•</span>
                <span>Cryptographic SHA-256 Agreement Verification</span>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
