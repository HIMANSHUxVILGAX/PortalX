/**
 * PortelX — Zustand Session Store
 * Manages guest vault session lifecycle: open → active → destroy → zeroized.
 */
import { create } from 'zustand';
import type { VaultSession, RiskAssessment, VaultHistoryEntry } from '../types';
import { api } from '../services/api';

export interface SessionState {
  // ─── Active Session ─────────────────────────────
  session: VaultSession | null;
  timeLeft: number;

  // ─── Identified Guest ───────────────────────────
  guestName: string;
  guestHandle: string;
  guestPhone: string;

  // ─── Vault History ──────────────────────────────
  history: VaultHistoryEntry[];

  // ─── Actions ────────────────────────────────────
  openVault: (handle?: string, pin?: string) => Promise<VaultSession | null>;
  destroyVault: () => Promise<{ wipeLatencyMs: number; bytesZeroized: number } | null>;
  setTimeLeft: (t: number) => void;
  tick: () => void;
  setGuest: (name: string, handle: string, phone: string) => void;
  fetchHistory: () => Promise<void>;
  reset: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  timeLeft: 0,
  guestName: 'Guest User',
  guestHandle: '@guest',
  guestPhone: '',
  history: [],

  openVault: async (handle = '@guest', pin = '1234') => {
    try {
      const data = await api.openVault(handle, pin);
      const session: VaultSession = {
        sessionId: data.session_id,
        uit: data.uit,
        ttl: data.ttl,
        createdAt: Date.now() / 1000,
        expiresAt: data.expires_at,
        riskAssessment: data.risk_assessment ? {
          riskScore: data.risk_assessment.risk_score,
          riskLevel: data.risk_assessment.risk_level,
          flags: data.risk_assessment.flags || [],
          recommendation: data.risk_assessment.recommendation,
        } : null,
        isActive: true,
      };
      set({ session, timeLeft: data.ttl });
      return session;
    } catch (e) {
      console.error('[SessionStore] openVault failed:', e);
      return null;
    }
  },

  destroyVault: async () => {
    const { session } = get();
    if (!session) return null;
    try {
      const data = await api.destroyVault(session.sessionId);
      set({ session: null, timeLeft: 0 });
      return {
        wipeLatencyMs: data.wipe_latency_ms,
        bytesZeroized: data.bytes_zeroized,
      };
    } catch (e) {
      console.error('[SessionStore] destroyVault failed:', e);
      // Still clear local state even if API fails
      set({ session: null, timeLeft: 0 });
      return null;
    }
  },

  setTimeLeft: (t) => set({ timeLeft: t }),
  tick: () => set((s) => ({ timeLeft: Math.max(0, s.timeLeft - 1) })),

  setGuest: (name, handle, phone) => set({
    guestName: name,
    guestHandle: handle,
    guestPhone: phone,
  }),

  fetchHistory: async () => {
    try {
      const data = await api.getVaultHistory();
      set({ history: data });
    } catch (e) {
      console.error('[SessionStore] fetchHistory failed:', e);
    }
  },

  reset: () => set({
    session: null,
    timeLeft: 0,
    guestName: 'Guest User',
    guestHandle: '@guest',
    guestPhone: '',
  }),
}));
