import apiClient from './client';

export interface Lead {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  origin_country?: {
    id: number;
    name_ru: string;
    name_en: string;
    code: string;
  };
  destination_country?: {
    id: number;
    name_ru: string;
    name_en: string;
    code: string;
  };
  weight_estimate_kg?: number;
  shipment_type?: string;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LeadsResponse {
  success: boolean;
  data: {
    leads: Lead[];
    total: number;
    page: number;
    pages: number;
  };
}

export const leadsApi = {
  getLeads: async (params?: { status?: string; page?: number; limit?: number }): Promise<LeadsResponse> => {
    const response = await apiClient.get<LeadsResponse>('/leads', { params });
    return response.data;
  },

  getLead: async (id: string) => {
    const response = await apiClient.get(`/leads/${id}`);
    return response.data;
  },

  updateLead: async (id: string, data: Partial<Lead>) => {
    const response = await apiClient.put(`/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id: string) => {
    const response = await apiClient.delete(`/leads/${id}`);
    return response.data;
  },
};

export default leadsApi;
