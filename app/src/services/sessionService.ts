import apiClient from './apiClient';

// ============================================================
// GUEST (Host Device) APIs
// ============================================================

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

/** Request a new ephemeral guest session. */
export async function createSession(hostDeviceId: string): Promise<SessionCreateResponse> {
  const res = await apiClient.post('/api/v1/sessions', { hostDeviceId });
  return res.data;
}

/** Submit 3FA credentials for session authentication. */
export async function authenticateSession(
  sessionId: string,
  payload: AuthPayload
): Promise<{ verified: boolean; riskScore: number }> {
  const res = await apiClient.post(`/api/v1/sessions/${sessionId}/authenticate`, payload);
  return res.data;
}

/** Terminate session and trigger server-side shredding. */
export async function terminateSession(
  sessionId: string,
  reason: 'manual' | 'timeout' | 'panic'
): Promise<{ shredded: boolean; wipeLatencyMs: number }> {
  const res = await apiClient.post(`/api/v1/sessions/${sessionId}/terminate`, { reason });
  return res.data;
}

/** Heartbeat ping to keep session alive. */
export async function sendHeartbeat(sessionId: string): Promise<{ alive: boolean; remainingTtl: number }> {
  const res = await apiClient.post(`/api/v1/sessions/${sessionId}/heartbeat`);
  return res.data;
}

// ============================================================
// OWNER (Primary Device) APIs
// ============================================================

/** Generate a new pairing QR payload. */
export async function generatePairingQR(): Promise<{
  sessionId: string;
  qrPayload: string;
  expiresInSeconds: number;
}> {
  const res = await apiClient.post('/api/v1/pairing/generate');
  return res.data;
}

/** Approve or reject a session action alert. */
export async function respondToAlert(
  sessionId: string,
  decision: 'approve' | 'dispute'
): Promise<{ success: boolean }> {
  const res = await apiClient.post(`/api/v1/sessions/${sessionId}/respond`, { decision });
  return res.data;
}

/** Revoke all active sessions — panic kill switch. */
export async function revokeAllSessions(): Promise<{ revokedCount: number }> {
  const res = await apiClient.post('/api/v1/sessions/revoke-all');
  return res.data;
}

/** Fetch list of active sessions. */
export async function getActiveSessions(): Promise<Array<{
  sessionId: string;
  hostDevice: string;
  status: string;
  remainingTtl: number;
}>> {
  const res = await apiClient.get('/api/v1/sessions/active');
  return res.data;
}
