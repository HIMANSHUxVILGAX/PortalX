/**
 * PortelX Host App — Configuration Constants
 */

// Backend API base URL
export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000'    // Android emulator → host machine
  : 'https://api.portelx.app'; // Production URL

// Session Defaults
export const DEFAULT_SESSION_TTL = 300;     // 5 minutes in seconds
export const HEARTBEAT_INTERVAL_MS = 15000; // Heartbeat every 15 seconds
export const MAX_AUTH_FAILURES = 3;         // Lock after 3 failed MFA attempts
export const LOCKOUT_DURATION_SECONDS = 300; // 5 minute progressive lockout

// Design Tokens
export const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceDark: '#0A0F1A',
  primary: '#1D4ED8',
  primaryLight: '#3B82F6',
  accent: '#60A5FA',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  border: '#334155',
} as const;

