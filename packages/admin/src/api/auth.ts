import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    refreshToken: string;
  };
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authApi;
