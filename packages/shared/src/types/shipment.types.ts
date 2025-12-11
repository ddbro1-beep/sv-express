/**
 * Shipment-related types
 */

import { ShipmentType } from './pricing.types';

export type ShipmentStatus =
  | 'created'
  | 'pickup_scheduled'
  | 'in_transit'
  | 'customs'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface Shipment {
  id: string;
  trackingNumber: string;
  customerId: string;
  assignedAdminId?: string;

  // Shipment details
  shipmentType: ShipmentType;
  weightKg: number;
  declaredValueEur?: number;

  // Origin
  originCountryId: number;
  originAddress: string;
  originCity?: string;
  originPostalCode?: string;

  // Destination
  destinationCountryId: number;
  destinationAddress: string;
  destinationCity?: string;
  destinationPostalCode?: string;
  recipientName?: string;
  recipientPhone?: string;

  // Pricing
  priceEur: number;
  paymentStatus: PaymentStatus;

  // Status
  status: ShipmentStatus;
  currentLocation?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  pickupDate?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;

  // Additional
  notes?: string;
  customsDeclaration?: string;
  insuranceAmountEur?: number;
}

export interface CreateShipmentDTO {
  customerId?: string; // Optional, can be set by admin
  shipmentType: ShipmentType;
  weightKg: number;
  declaredValueEur?: number;

  // Origin
  originCountryId: number;
  originAddress: string;
  originCity?: string;
  originPostalCode?: string;

  // Destination
  destinationCountryId: number;
  destinationAddress: string;
  destinationCity?: string;
  destinationPostalCode?: string;
  recipientName?: string;
  recipientPhone?: string;

  // Additional
  notes?: string;
  customsDeclaration?: string;
  insuranceAmountEur?: number;
}

export interface UpdateShipmentDTO {
  status?: ShipmentStatus;
  currentLocation?: string;
  assignedAdminId?: string;
  paymentStatus?: PaymentStatus;
  pickupDate?: string;
  estimatedDeliveryDate?: string;
  deliveredAt?: string;
  notes?: string;
}

export interface AssignAdminDTO {
  assignedAdminId: string;
}

export interface AddTrackingNumberDTO {
  trackingNumber: string;
}
