import { z } from 'zod';

// Schema for creating a new lead
export const createLeadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').max(255).optional(),
  phone: z.string().max(50).optional(),
  originCountryId: z.union([z.string(), z.number()]).optional(),
  destinationCountryId: z.union([z.string(), z.number()]).optional(),
  weightEstimateKg: z.number().positive().optional().nullable(),
  shipmentType: z.string().max(100).optional(),
  message: z.string().max(2000).optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
