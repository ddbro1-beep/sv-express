import apiClient from './client';

export interface Setting {
  key: string;
  value: string | null;
  updated_at: string;
}

export const settingsApi = {
  getAll: async (): Promise<Setting[]> => {
    const response = await apiClient.get('/settings');
    return response.data.data;
  },

  update: async (key: string, value: string | null): Promise<Setting> => {
    const response = await apiClient.put(`/settings/${key}`, { value });
    return response.data.data;
  },
};

export default settingsApi;
