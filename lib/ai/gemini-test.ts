import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function testGemini() {
  const { text } = await generateText({
    model: google("gemini-3.8-flash"),
    prompt:
      "You are the AI engine for PayVia. Reply with exactly: PayVia Gemini connection successful.",
  });

  return text;
}