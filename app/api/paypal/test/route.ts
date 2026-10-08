import { NextResponse } from "next/server";
import { assertServerEnv, env } from "@/lib/config/env";

export async function GET() {
  try {
    assertServerEnv();

    const credentials = Buffer.from(
      `${env.paypalClientId}:${env.paypalClientSecret}`
    ).toString("base64");

    const response = await fetch(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("PayPal OAuth failed:", data);

      return NextResponse.json(
        {
          success: false,
          error: "PayPal authentication failed",
          details: data,
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "PayVia PayPal Sandbox connection successful.",
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    });
  } catch (error) {
    console.error("PayPal test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "PayPal connection failed",
      },
      { status: 500 }
    );
  }
}