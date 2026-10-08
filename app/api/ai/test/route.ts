import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { assertServerEnv } from "@/lib/config/env";

export async function GET() {
  try {
    assertServerEnv();

    const { text } = await generateText({
      model: google("gemini-3.8-flash"),
      prompt:
        "Reply with exactly: PayVia Gemini connection successful.",
    });

    return NextResponse.json({
      success: true,
      message: text,
    });
  } catch (error) {
    console.error("Gemini test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Gemini connection failed",
      },
      { status: 500 }
    );
  }
}