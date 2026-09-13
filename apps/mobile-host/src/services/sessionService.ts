import apiClient from './apiClient';

export interface SessionCreateResponse {
  sessionId: string;
  ttl: number;
  createdAt: number;
  expiresAt: number;
  hostDeviceId: string;
}

export interface AuthPayload {
  handle: string;
  pin: string;
  biometricToken?: string;
}

/**
 * Request a new ephemeral guest session from the backend.
 */
export async function createSession(hostDeviceId: string): Promise<SessionCreateResponse> {
  const response = await apiClient.post('/api/v1/sessions', { hostDeviceId });
  return response.data;
}

/**
 * Submit 3FA credentials for session authentication.
 */
export async function authenticateSession(
  sessionId: string,
  payload: AuthPayload
): Promise<{ verified: boolean; riskScore: number }> {
  const response = await apiClient.post(`/api/v1/sessions/${sessionId}/authenticate`, payload);
  return response.data;
}

/**
 * Terminate a session and trigger server-side shredding.
 */
export async function terminateSession(
  sessionId: string,
  reason: 'manual' | 'timeout' | 'panic'
): Promise<{ shredded: boolean; wipeLatencyMs: number }> {
  const response = await apiClient.post(`/api/v1/sessions/${sessionId}/terminate`, { reason });
  return response.data;
}

/**
 * Send heartbeat ping to keep session alive.
 */
export async function sendHeartbeat(sessionId: string): Promise<{ alive: boolean; remainingTtl: number }> {
  const response = await apiClient.post(`/api/v1/sessions/${sessionId}/heartbeat`);
  return response.data;
}
