//lib/validation.ts
// ==============================================
// ECHO - Validation Schemas (Zod)
// ==============================================

import { z } from "zod";

/**
 * Deal schema
 */
export const DealSchema = z.object({
  dealId: z.string().min(1, "Deal ID is required"),
  customer: z.string().min(1, "Customer name is required"),
  amount: z.number().positive("Amount must be positive"),
  status: z.enum(["open", "closed", "pending"]).optional(),
  customerEmail: z.string().email().optional(),  // ← ⭐ AGREGADO ⭐
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  customerEmail: z.string().email().optional(),
});

/**
 * Sync request schema
 */
export const SyncRequestSchema = z.object({
  source: z.enum(["crm", "sheet", "manual"]),
  data: DealSchema,
  targets: z.array(z.enum(["slack", "sheets", "email", "calendar"])),
  userId: z.string().optional(),
  timestamp: z.string().optional(),
});

/**
 * Validate and parse data
 */
export function validateSyncRequest(data: unknown) {
  return SyncRequestSchema.parse(data);
}

/**
 * Safe validation (returns error instead of throwing)
 */
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    error: result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", "),
  };
}