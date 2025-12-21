import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const verifyToken = () =>
  api.get('/auth/verify');

// Users
export const getUsers = () =>
  api.get('/users');

export const createUser = (userData: {
  email: string;
  password: string;
  name: string;
  role: string;
}) => api.post('/users', userData);

export const updateUser = (id: number, userData: Partial<{
  email: string;
  password: string;
  name: string;
  role: string;
}>) => api.put(`/users/${id}`, userData);

export const deleteUser = (id: number) =>
  api.delete(`/users/${id}`);

// Loads
export const getLoads = () =>
  api.get('/loads');

export const getLoadsByStatus = (status: string) =>
  api.get(`/loads/status/${status}`);

export const getLoad = (id: number) =>
  api.get(`/loads/${id}`);

export const createLoad = (loadData: {
  clientName: string;
  clientNumber: string;
  status?: string;
  assignedTo?: number;
}) => api.post('/loads', loadData);

export const updateLoad = (id: number, loadData: Partial<{
  clientName: string;
  clientNumber: string;
  status: string;
  assignedTo: number | null;
}>) => api.put(`/loads/${id}`, loadData);

export const deleteLoad = (id: number) =>
  api.delete(`/loads/${id}`);

export default api;
