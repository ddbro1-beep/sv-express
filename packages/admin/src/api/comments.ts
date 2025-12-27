import apiClient from './client';

export interface Comment {
  id: string;
  entity_type: 'lead' | 'order';
  entity_id: string;
  user_id?: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface CommentsResponse {
  success: boolean;
  data: Comment[];
}

export const commentsApi = {
  getComments: async (type: 'lead' | 'order', entityId: string): Promise<Comment[]> => {
    const response = await apiClient.get<CommentsResponse>(`/comments/${type}/${entityId}`);
    return response.data.data;
  },

  addComment: async (type: 'lead' | 'order', entityId: string, content: string): Promise<Comment> => {
    const response = await apiClient.post<{ success: boolean; data: Comment }>('/comments', {
      entity_type: type,
      entity_id: entityId,
      content,
    });
    return response.data.data;
  },
};

export default commentsApi;
