import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string;
  statusCode: number;
}

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as ApiError)?.message || 'Error de servidor';
  }
  return 'Error desconocido';
};

export default api;
