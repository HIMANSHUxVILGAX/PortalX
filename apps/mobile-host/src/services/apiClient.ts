import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-PortelX-Client': 'host',
  },
});

// Request interceptor — attach session token
apiClient.interceptors.request.use((config) => {
  // TODO: Inject ephemeral session token from zustand store
  return config;
});

// Response interceptor — handle session expiry / revocation
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 410) {
      // Session expired or revoked — trigger immediate shredding
      // TODO: Navigate to SessionEnd screen
      console.warn('[PortelX] Session invalidated by server. Initiating shred.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
