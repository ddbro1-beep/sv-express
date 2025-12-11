/**
 * Status constants
 */

export const USER_ROLES = {
  ADMIN: 'admin' as const,
  CUSTOMER: 'customer' as const,
} as const;

export const LEAD_STATUSES = {
  NEW: 'new' as const,
  CONTACTED: 'contacted' as const,
  CONVERTED: 'converted' as const,
  LOST: 'lost' as const,
} as const;

export const SHIPMENT_STATUSES = {
  CREATED: 'created' as const,
  PICKUP_SCHEDULED: 'pickup_scheduled' as const,
  IN_TRANSIT: 'in_transit' as const,
  CUSTOMS: 'customs' as const,
  OUT_FOR_DELIVERY: 'out_for_delivery' as const,
  DELIVERED: 'delivered' as const,
  CANCELLED: 'cancelled' as const,
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending' as const,
  PAID: 'paid' as const,
  REFUNDED: 'refunded' as const,
} as const;

export const SHIPMENT_TYPES = {
  DOCUMENT: 'document' as const,
  PACKAGE: 'package' as const,
  EXPRESS: 'express' as const,
  FRAGILE: 'fragile' as const,
} as const;

export const COUNTRY_REGIONS = {
  EU: 'eu' as const,
  CIS: 'cis' as const,
} as const;
