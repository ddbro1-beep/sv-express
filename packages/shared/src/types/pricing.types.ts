/**
 * Pricing-related types
 */

export type ShipmentType = 'document' | 'package' | 'express' | 'fragile';

export interface PricingTier {
  id: number;
  name: string;
  description?: string;
  weightMinKg: number;
  weightMaxKg?: number;
  basePriceEur: number;
  shipmentType: ShipmentType;
  createdAt: string;
  updatedAt: string;
}

export interface CalculatePriceRequest {
  shipmentType: ShipmentType;
  weightKg: number;
  originCountryId: number;
  destinationCountryId: number;
}

export interface PriceModifiers {
  weight: number;
  route: number;
  type: number;
}

export interface CalculatePriceResponse {
  basePrice: number;
  modifiers: PriceModifiers;
  totalPrice: number;
  currency: string;
}
