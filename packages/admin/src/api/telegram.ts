import apiClient from './client';

export const telegramApi = {
  sendTest: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/telegram/test');
    return response.data.data;
  },
};

export default telegramApi;
