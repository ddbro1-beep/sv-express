import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - добавляет токен к каждому запросу
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - обрабатывает ошибки
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - попробовать обновить
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          localStorage.setItem('token', data.data.token);

          // Повторить оригинальный запрос
          error.config.headers.Authorization = `Bearer ${data.data.token}`;
          return axios.request(error.config);
        } catch {
          // Refresh failed - выйти
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
