import { z } from 'zod';

// Schema for order items
const orderItemSchema = z.object({
  description: z.string().max(500).optional(),
  quantity: z.number().int().positive().default(1),
  price: z.number().min(0).default(0),
});

// Schema for creating a new order
export const createOrderSchema = z.object({
  // Sender
  sender_email: z.string().email('Invalid email format').max(255),
  sender_phone: z.string().max(50).optional(),
  sender_name: z.string().max(255).optional(),
  sender_country: z.string().max(100).optional(),
  sender_city: z.string().max(100).optional(),
  sender_address: z.string().max(500).optional(),
  sender_address2: z.string().max(500).optional(),
  sender_postcode: z.string().max(20).optional(),
  // Recipient
  recipient_name: z.string().max(255).optional(),
  recipient_phone: z.string().max(50).optional(),
  recipient_country: z.string().max(100).optional(),
  recipient_region: z.string().max(100).optional(),
  recipient_city: z.string().max(100).optional(),
  recipient_street: z.string().max(255).optional(),
  recipient_house: z.string().max(50).optional(),
  recipient_apartment: z.string().max(50).optional(),
  recipient_postcode: z.string().max(20).optional(),
  delivery_service: z.string().max(100).optional(),
  // Parcel
  parcel_weight: z.union([z.string(), z.number()]).optional(),
  parcel_length: z.union([z.string(), z.number()]).optional(),
  parcel_width: z.union([z.string(), z.number()]).optional(),
  parcel_height: z.union([z.string(), z.number()]).optional(),
  // Items
  items: z.array(orderItemSchema).optional().default([]),
  // Collection
  collection_method: z.enum(['self', 'courier']).optional(),
  collection_date: z.string().optional().nullable(),
  collection_time: z.enum(['morning', 'afternoon']).optional(),
  // Payment
  payment_method: z.string().max(50).optional(),
  // Agreements
  agree_terms: z.union([z.boolean(), z.literal('on')]).optional(),
  agree_overweight: z.union([z.boolean(), z.literal('on')]).optional(),
  agree_insurance: z.union([z.boolean(), z.literal('on')]).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
