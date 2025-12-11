/**
 * Lead-related types
 */

import { ShipmentType } from './pricing.types';

export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';

export interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  originCountryId?: number;
  destinationCountryId?: number;
  weightEstimateKg?: number;
  shipmentType?: ShipmentType;
  message?: string;
  status: LeadStatus;
  convertedToUserId?: string;
  assignedToAdminId?: string;
  createdAt: string;
  updatedAt: string;
  contactedAt?: string;
}

export interface CreateLeadDTO {
  name?: string;
  email?: string;
  phone?: string;
  originCountryId?: number;
  destinationCountryId?: number;
  weightEstimateKg?: number;
  shipmentType?: ShipmentType;
  message?: string;
}

export interface UpdateLeadDTO {
  status?: LeadStatus;
  assignedToAdminId?: string;
  contactedAt?: string;
}

export interface ConvertLeadDTO {
  password: string;
}
