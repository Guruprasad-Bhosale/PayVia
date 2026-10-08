import { z } from "zod";

export const createOrderSchema = z.object({
  agreementId: z.string().optional().default("payvia_tx"),
  amount: z.number().positive("Amount must be positive").default(1.0),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
  itemDescription: z.string().optional().default("PayVia Sandbox Test"),
});

export const captureOrderSchema = z.object({
  orderId: z.string().min(1, "PayPal Order ID is required"),
  agreementId: z.string().optional(),
});
