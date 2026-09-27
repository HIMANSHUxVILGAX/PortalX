/**
 * PortelX — Centralized API Service Layer
 * All backend communication flows through this module.
 * Screens never call axios/fetch directly.
 */
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constants/config';
import type { VaultHistoryEntry } from '../types';

const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor (logging) ────────────────────────
client.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor (error normalization) ───────────
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (__DEV__) {
      console.error('[API Error]', error?.response?.status, error?.response?.data || error.message);
    }
    return Promise.reject(error);
  },
);

// ─── Vault Endpoints ──────────────────────────────────────
async function openVault(
  handle: string = '@guest',
  pin: string = '1234',
  deviceInfo?: { device_name?: string; device_brand?: string; location?: string }
) {
  const payload = {
    handle,
    pin,
    device_name: deviceInfo?.device_name || 'Mobile Device',
    device_brand: deviceInfo?.device_brand || null,
    location: deviceInfo?.location || 'Unknown Location'
  };
  const { data } = await client.post('/api/vault/open', payload);
  return data;
}

async function destroyVault(sessionId: string) {
  const { data } = await client.post('/api/vault/destroy', { session_id: sessionId });
  return data;
}

async function verifyToken(uit: string, sessionId: string) {
  const { data } = await client.post('/api/vault/verify-token', { uit, session_id: sessionId });
  return data;
}

// ─── Payment ──────────────────────────────────────────────
async function makePayment(params: {
  sessionId: string;
  amount: number;
  vpa: string;
  merchantName: string;
  pin: string;
}) {
  const { data } = await client.post('/api/vault/pay', {
    session_id: params.sessionId,
    amount: params.amount,
    vpa: params.vpa,
    merchant_name: params.merchantName,
    pin: params.pin,
  });
  return data;
}

// ─── Risk Scoring ─────────────────────────────────────────
async function scoreRisk(handle: string, deviceId: string, sessionCountToday: number) {
  const { data } = await client.post('/api/risk/score', {
    handle,
    device_id: deviceId,
    session_count_today: sessionCountToday,
  });
  return data;
}

// ─── Sessions ─────────────────────────────────────────────
async function getActiveSessions() {
  const { data } = await client.get('/api/sessions/active');
  return data;
}

// ─── User Profile ─────────────────────────────────────────
async function getUserProfile() {
  const { data } = await client.get('/api/user/profile');
  return data;
}

// ─── Vault History ────────────────────────────────────────
async function getVaultHistory(): Promise<VaultHistoryEntry[]> {
  try {
    const { data } = await client.get('/api/vault/history');
    return data.sessions || [];
  } catch {
    // Fallback: return empty when endpoint not yet available
    return [];
  }
}

// ─── Transactions ─────────────────────────────────────────
async function getTransactions() {
  try {
    const { data } = await client.get('/api/transactions');
    return data.transactions || [];
  } catch {
    return [];
  }
}

async function getCards() {
  const { data } = await client.get('/api/cards');
  return data;
}

async function addCard(cardData: any) {
  const { data } = await client.post('/api/cards', cardData);
  return data;
}

async function getDocs() {
  const { data } = await client.get('/api/docs');
  return data;
}

async function addDoc(docData: any) {
  const { data } = await client.post('/api/docs', docData);
  return data;
}

// ─── Passwords ────────────────────────────────────────────
async function getPasswords() {
  const { data } = await client.get('/api/passwords');
  return data;
}
async function addPassword(service: string, username: string, password: string) {
  const { data } = await client.post('/api/passwords', { service, username, password });
  return data;
}
async function deletePassword(id: number | string) {
  const { data } = await client.delete(`/api/passwords/${id}`);
  return data;
}

// ─── Export ───────────────────────────────────────────────
export const api = {
  openVault,
  destroyVault,
  verifyToken,
  makePayment,
  scoreRisk,
  getActiveSessions,
  getUserProfile,
  getVaultHistory,
  getTransactions,
  getCards,
  addCard,
  getDocs,
  addDoc,
  getPasswords,
  addPassword,
  deletePassword,
};

export default api;
