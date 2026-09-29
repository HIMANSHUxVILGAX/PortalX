import Constants from 'expo-constants';

// Dynamically extract host IP from Expo Metro server so Wi-Fi changes never break connection
const debuggerHost = Constants.expoConfig?.hostUri;
const hostIp = debuggerHost ? debuggerHost.split(':')[0] : '192.168.72.44';

// Backend API base URL
export const API_BASE_URL = `http://${hostIp}:8001`;

// Session Defaults
export const DEFAULT_SESSION_TTL = 300;      // 5 minutes
export const HEARTBEAT_INTERVAL_MS = 15000;  // 15 seconds
export const MAX_AUTH_FAILURES = 3;
export const LOCKOUT_DURATION_SECONDS = 300;

// Design Tokens — Single source of truth
export const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceDark: '#0A0F1A',
  primary: '#1D4ED8',
  primaryLight: '#3B82F6',
  accent: '#60A5FA',
  success: '#22C55E',
  successDark: '#166534',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  border: '#334155',
} as const;

// Global type for React Native __DEV__
declare const __DEV__: boolean;
