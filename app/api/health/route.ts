import { NextResponse } from "next/server";
import {
  isAIConfigured,
  isPayPalConfigured,
  isChannel3Configured,
  isElasticConfigured,
  isDatabaseConfigured,
} from "@/lib/config/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const paypalReady = isPayPalConfigured();
  const aiReady = isAIConfigured();
  const channel3Ready = isChannel3Configured();
  const elasticReady = isElasticConfigured();
  const databaseReady = isDatabaseConfigured();

  return NextResponse.json({
    status: "ok",
    service: "Payvia AI Commerce Negotiation & Settlement Platform",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    integrations: {
      paypalConfigured: paypalReady,
      aiConfigured: aiReady,
      channel3Configured: channel3Ready,
      elasticConfigured: elasticReady,
      databaseConfigured: databaseReady,
    },
    message: "Payvia core API and negotiation services are operational.",
  });
}
