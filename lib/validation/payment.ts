import { z } from "zod";

export const createOrderSchema = z.object({
  agreementId: z.string().min(1, "Agreement ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
  itemDescription: z.string().min(1, "Item description is required"),
});

export const captureOrderSchema = z.object({
  orderId: z.string().min(1, "PayPal Order ID is required"),
  agreementId: z.string().min(1, "Agreement ID is required"),
});
