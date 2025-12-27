import apiClient from './client';

export interface OrderItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  // Sender
  sender_email?: string;
  sender_phone?: string;
  sender_name?: string;
  sender_country?: string;
  sender_city?: string;
  sender_address?: string;
  sender_address2?: string;
  sender_postcode?: string;
  // Recipient
  recipient_name?: string;
  recipient_phone?: string;
  recipient_country?: string;
  recipient_region?: string;
  recipient_city?: string;
  recipient_street?: string;
  recipient_house?: string;
  recipient_apartment?: string;
  recipient_postcode?: string;
  recipient_delivery_service?: string;
  // Parcel
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  // Items
  items?: OrderItem[];
  // Collection
  collection_method?: string;
  collection_date?: string;
  collection_time?: string;
  // Payment
  payment_method?: string;
  // Agreements
  agree_terms?: boolean;
  agree_overweight?: boolean;
  agree_insurance?: boolean;
  // Status
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    total: number;
    page: number;
    pages: number;
  };
}

export const ordersApi = {
  getOrders: async (params?: { status?: string; page?: number; limit?: number }): Promise<OrdersResponse> => {
    const response = await apiClient.get<OrdersResponse>('/orders', { params });
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  updateOrder: async (id: string, data: Partial<Order>) => {
    const response = await apiClient.put(`/orders/${id}`, data);
    return response.data;
  },

  getOrderPdfUrl: (id: string): string => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const token = localStorage.getItem('sv-admin-token');
    return `${baseUrl}/orders/${id}/pdf?token=${token}`;
  },
};

export default ordersApi;
