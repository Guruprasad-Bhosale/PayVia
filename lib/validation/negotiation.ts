import { z } from "zod";

export const buyerConstraintsSchema = z.object({
  maxBudget: z.number().positive("Budget must be greater than 0"),
  targetPrice: z.number().positive("Target price must be greater than 0"),
  maxDeliveryDays: z.number().int().min(1, "Delivery days must be at least 1"),
  preferredPaymentMethod: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const startNegotiationRequestSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  buyerConstraints: buyerConstraintsSchema,
});

export const agentStepRequestSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  round: z.number().int().min(1),
  lastOffer: z.number().positive().optional(),
  proposedDeliveryOptionId: z.string().optional(),
});

export const approveAgreementSchema = z.object({
  agreementId: z.string().min(1, "Agreement ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  userConfirmation: z.literal(true, {
    errorMap: () => ({ message: "User must explicitly confirm terms" }),
  }),
});
