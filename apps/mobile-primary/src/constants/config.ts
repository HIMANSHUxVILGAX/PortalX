/**
 * PortelX Primary App — Configuration Constants
 */

export const API_BASE_URL = __DEV__
  ? 'http://10.0.2.2:8000'
  : 'https://api.portelx.app';

export const COLORS = {
  background: '#0F172A',
  surface: '#1E293B',
  primary: '#1D4ED8',
  accent: '#60A5FA',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  textPrimary: '#FFFFFF',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  border: '#334155',
} as const;
