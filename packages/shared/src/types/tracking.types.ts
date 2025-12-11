/**
 * Tracking-related types
 */

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  location?: string;
  description?: string;
  createdByAdminId?: string;
  createdAt: string;
  eventDate: string;
}

export interface CreateTrackingEventDTO {
  status: string;
  location?: string;
  description?: string;
  eventDate?: string;
}

export interface TrackingResponse {
  trackingNumber: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: string;
  events: TrackingEvent[];
}
