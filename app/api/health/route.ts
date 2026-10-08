import { NextResponse } from "next/server";
import { isAIConfigured, isPayPalConfigured } from "@/lib/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const paypalReady = isPayPalConfigured();
  const aiReady = isAIConfigured();

  return NextResponse.json({
    status: "ok",
    service: "Payvia AI Payment Platform",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
    environment: process.env.NODE_ENV || "development",
    integrations: {
      paypalConfigured: paypalReady,
      aiConfigured: aiReady,
    },
    message: "Payvia core API is operational.",
  });
}
