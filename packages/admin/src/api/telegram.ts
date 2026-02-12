import apiClient from './client';

export interface AvailableChat {
  chatId: string;
  name: string;
  type: string;
  username?: string;
}

export const telegramApi = {
  sendTest: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/telegram/test');
    return response.data.data;
  },

  getChats: async (botToken: string): Promise<AvailableChat[]> => {
    const response = await apiClient.post('/telegram/chats', { botToken });
    return response.data.data.chats;
  },
};

export default telegramApi;
