import { FulfillmentPlan } from "@/types/fulfillment";
import { validateAgreementForPayment } from "@/lib/ai/negotiation-store";
import {
  buildFulfillmentPlan,
  getFulfillmentPlan,
  getOrCreateFulfillmentPlan,
  saveFulfillmentPlan,
  getAllFulfillmentPlans,
} from "./store";
import { generateFulfillmentSchedule, validateScheduleDeadline } from "./scheduler";

/**
 * Creates or retrieves a verified fulfillment plan for a negotiated transaction.
 * Security Invariant: Requires a valid, agreed negotiation record.
 */
export function createFulfillmentPlanForNegotiation(
  negotiationIdOrAgreementId: string,
  options?: {
    paypalOrderId?: string;
    paypalCaptureId?: string;
    simulatedDelayHours?: number;
  }
): {
  success: boolean;
  plan?: FulfillmentPlan;
  error?: string;
} {
  const validation = validateAgreementForPayment(negotiationIdOrAgreementId);

  if (!validation.valid || !validation.agreement) {
    return {
      success: false,
      error: validation.error || "Cannot create fulfillment plan: Agreement is invalid or not in AGREED status.",
    };
  }

  const agreement = validation.agreement;
  const plan = buildFulfillmentPlan(agreement, options);
  saveFulfillmentPlan(plan);

  return {
    success: true,
    plan,
  };
}

export {
  buildFulfillmentPlan,
  getFulfillmentPlan,
  getOrCreateFulfillmentPlan,
  saveFulfillmentPlan,
  getAllFulfillmentPlans,
  generateFulfillmentSchedule,
  validateScheduleDeadline,
};
