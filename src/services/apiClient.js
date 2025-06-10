import axios from 'axios';
import apiCallTracker from '../utils/apiCallTracker';
import apiPayloadDebugger from '../utils/apiPayloadDebugger';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5529/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simplified request interceptor - only adds auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Track API call for debugging duplicates
    apiCallTracker.track(config.url, config.method, config.data);

    // Debug API payload for common issues
    if (config.data) {
      apiPayloadDebugger.interceptRequest(config.url, config.method, config.data);
    }

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simplified response interceptor - only handles auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
