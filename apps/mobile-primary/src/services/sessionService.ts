import apiClient from './apiClient';

/**
 * Generate a new pairing QR payload for host device to scan.
 */
export async function generatePairingQR(): Promise<{
  sessionId: string;
  qrPayload: string;
  expiresInSeconds: number;
}> {
  const response = await apiClient.post('/api/v1/pairing/generate');
  return response.data;
}

/**
 * Approve or reject a session action alert from a host device.
 */
export async function respondToAlert(
  sessionId: string,
  decision: 'approve' | 'dispute'
): Promise<{ success: boolean }> {
  const response = await apiClient.post(`/api/v1/sessions/${sessionId}/respond`, { decision });
  return response.data;
}

/**
 * Revoke all active sessions — panic kill switch.
 */
export async function revokeAllSessions(): Promise<{ revokedCount: number }> {
  const response = await apiClient.post('/api/v1/sessions/revoke-all');
  return response.data;
}

/**
 * Fetch list of all active sessions.
 */
export async function getActiveSessions(): Promise<Array<{
  sessionId: string;
  hostDevice: string;
  status: string;
  remainingTtl: number;
}>> {
  const response = await apiClient.get('/api/v1/sessions/active');
  return response.data;
}

