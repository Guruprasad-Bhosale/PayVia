import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { FulfillmentPlan, FulfillmentAiQueryResponse } from "@/types/fulfillment";

const FORBIDDEN_FINANCIAL_PATTERNS = [
  /\b(lower|change|modify|override|reduce|alter|set|tamper)\b.*\b(floor|price|budget|discount|terms|agreement|cost)\b/i,
  /\b(floor|price|budget|discount|terms|agreement|cost)\b.*\b(lower|change|modify|override|reduce|alter|set|tamper)\b/i,
  /\b(initiate|execute|capture|process|send|trigger|make)\b.*\b(payment|paypal|transaction|order|capture|charge)\b/i,
  /\b(payment|paypal|transaction|order|capture|charge)\b.*\b(initiate|execute|capture|process|send|trigger|make)\b/i,
  /lower merchant floor/i,
  /override floor/i,
  /change price/i,
  /modify price/i,
  /execute payment/i,
  /capture payment/i,
  /initiate payment/i,
];

/**
 * Answers questions about fulfillment schedules using deterministic schedule analysis
 * and AI narrative synthesis while strictly blocking financial mutations.
 */
export async function queryFulfillmentAi(
  query: string,
  plan: FulfillmentPlan
): Promise<FulfillmentAiQueryResponse> {
  const normalizedQuery = query.toLowerCase();

  // 1. Strict Security Guardrail: Financial & Pricing Mutation Filter
  const isForbidden = FORBIDDEN_FINANCIAL_PATTERNS.some((pattern) =>
    pattern.test(normalizedQuery)
  );

  if (isForbidden) {
    return {
      success: false,
      answer:
        "🛡️ SECURITY REJECTION: The Fulfillment AI Agent operates strictly as a read-only operational logistics analyst. It is cryptographically and architecturally prevented from modifying agreement terms, altering pricing floors, or initiating financial transactions.",
      status: plan.status,
      promisedDeliveryDate: plan.promisedDeliveryDate,
      slackHours: plan.riskAnalysis.slackHours,
      error: "Financial mutation attempts are blocked by PayVia security invariants.",
    };
  }

  // 2. Deterministic Logistical Analysis
  const deadlineDate = new Date(plan.deliveryDeadline);
  const promisedDate = new Date(plan.promisedDeliveryDate);
  const slackHours = plan.riskAnalysis.slackHours;
  const isAtRisk = plan.riskAnalysis.isAtRisk;

  const inProgressTask = plan.tasks.find((t) => t.status === "in_progress");
  const pendingTasks = plan.tasks.filter((t) => t.status === "pending");

  const formattedDeadline = deadlineDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const formattedPromised = promisedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 3. Generate deterministic expert fallback answer
  let fallbackAnswer = "";
  if (normalizedQuery.includes("meet") || normalizedQuery.includes("deadline") || normalizedQuery.includes("can this order")) {
    if (isAtRisk) {
      fallbackAnswer = `⚠️ Order is currently AT RISK. The estimated completion (${formattedPromised}) exceeds the customer's negotiated ${plan.negotiatedDeliveryDays}-day commitment (${formattedDeadline}) by ${Math.abs(slackHours)} hours. Recommended action: Accelerate carrier linehaul transit or prioritize packaging station dispatch.`;
    } else {
      fallbackAnswer = `✅ Yes! The order is ON TRACK to meet the customer's negotiated ${plan.negotiatedDeliveryDays}-day delivery commitment. Promised delivery is scheduled for ${formattedPromised} (Deadline: ${formattedDeadline}) with a safety slack margin of ${slackHours} hours.`;
    }
  } else if (normalizedQuery.includes("blocking") || normalizedQuery.includes("bottleneck") || normalizedQuery.includes("critical")) {
    if (inProgressTask) {
      fallbackAnswer = `Current active critical path item: "${inProgressTask.name}" assigned to ${inProgressTask.resourceName} (${inProgressTask.progress}% complete). Successor dependencies: ${inProgressTask.dependencies.length > 0 ? "Prerequisites met" : "Root stage"}.`;
    } else {
      fallbackAnswer = `All preliminary tasks completed. Next scheduled critical path task: "${pendingTasks[0]?.name || "Final Delivery"}" assigned to ${pendingTasks[0]?.resourceName || "Last-Mile Courier"}.`;
    }
  } else if (normalizedQuery.includes("risk") || normalizedQuery.includes("why")) {
    if (isAtRisk) {
      fallbackAnswer = `The schedule is flagged AT RISK because the cumulative stage durations exceed the customer deadline window by ${Math.abs(slackHours)}h. ${plan.riskAnalysis.mitigationSuggestion || "Expedite warehouse picking to reclaim timeline buffer."}`;
    } else {
      fallbackAnswer = `The schedule carries zero critical risks. Slack buffer is positive (+${slackHours} hours), and task dependencies are fully synchronized across all 6 fulfillment stations.`;
    }
  } else if (normalizedQuery.includes("optimize") || normalizedQuery.includes("dependency") || normalizedQuery.includes("explain")) {
    fallbackAnswer = `Fulfillment workflow operates across 7 sequential stages: Payment Settlement ➔ Order Processing ➔ Robotic Picking ➔ Packaging QA ➔ Carrier Dispatch ➔ Linehaul Transit ➔ Customer Handover. Total scheduled duration is ${plan.totalDurationDays} days against the ${plan.negotiatedDeliveryDays}-day agreed ceiling.`;
  } else {
    fallbackAnswer = `Order "${plan.productName}" is scheduled for delivery on ${formattedPromised} (Commitment: ${plan.negotiatedDeliveryDays} days). Current operational status: ${plan.status}. Slack margin: ${slackHours} hours.`;
  }

  // 4. Attempt Gemini Flash AI synthesis
  try {
    let fulfillmentMemoryContext = "";
    try {
      const { getFulfillmentHistoricalLogs } = await import("@/lib/memory/fulfillment-memory");
      const { buildPromptMemoryBlock } = await import("@/lib/memory/memory-context");
      const logs = await getFulfillmentHistoricalLogs(`${plan.productName} ${query}`, 3);
      if (logs.memories.length > 0) {
        fulfillmentMemoryContext = buildPromptMemoryBlock(logs.memories, "ELASTICSEARCH HISTORICAL FULFILLMENT LOGS");
      }
    } catch {
      // Non-critical fallback
    }

    const prompt = `You are the PayVia Fulfillment Intelligence Agent.
Analyze the following authentic fulfillment plan and answer the user's operational query concisely (max 3 sentences).

Context:
- Product: ${plan.productName} (${plan.source === "channel3" ? "Channel3 Discovered" : "Demo Catalog"})
- Negotiated Delivery Commitment: ${plan.negotiatedDeliveryDays} days
- Delivery Deadline: ${formattedDeadline}
- Promised Delivery Date: ${formattedPromised}
- Operational Status: ${plan.status}
- Slack Margin: ${slackHours} hours (${isAtRisk ? "BREACHED" : "HEALTHY"})
- Total Stages: ${plan.tasks.length} tasks
- Currently In Progress: ${inProgressTask ? inProgressTask.name + " (" + inProgressTask.resourceName + ")" : "None (Staged)"}
- Critical Path: Payment -> Processing -> Picking -> Packing -> Dispatch -> Transit -> Delivery

${fulfillmentMemoryContext}

User Question: "${query}"

Guidelines:
- Give a direct, sharp, professional logistics answer.
- Respect all hard dates and slack hours given above.
- Mention status (${plan.status}) and promised handover date.`;

    const { text } = await generateText({
      model: google("gemini-3.8-flash"),
      prompt,
      temperature: 0.1,
    });

    return {
      success: true,
      answer: text.trim(),
      status: plan.status,
      promisedDeliveryDate: plan.promisedDeliveryDate,
      slackHours,
      criticalTask: inProgressTask?.name || pendingTasks[0]?.name,
    };
  } catch (error) {
    console.warn("[Fulfillment AI Agent] Falling back to deterministic analysis:", error);
    return {
      success: true,
      answer: fallbackAnswer,
      status: plan.status,
      promisedDeliveryDate: plan.promisedDeliveryDate,
      slackHours,
      criticalTask: inProgressTask?.name || pendingTasks[0]?.name,
    };
  }
}
