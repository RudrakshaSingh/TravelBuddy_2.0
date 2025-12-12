import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Function to create authenticated axios instance with Clerk token
export const createAuthenticatedApi = (getToken) => {
  const authApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  // Add request interceptor to include auth token
  authApi.interceptors.request.use(
    async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return authApi;
};

// User API service functions
export const userService = {
  register: async (authApi, userData) => {
    const response = await authApi.post('/users/register', userData);
    return response.data;
  },

  getProfile: async (authApi) => {
    const response = await authApi.get('/users/profile');
    return response.data;
  },

  updateProfile: async (authApi, profileData) => {
    const response = await authApi.patch('/users/update-profile', profileData);
    return response.data;
  },
};

export default api;
