import { create } from 'zustand';

// ============================================================
// Unified Store — handles BOTH roles in one place
// ============================================================

export type UserRole = 'owner' | 'guest' | null;

export type SessionState =
  | 'IDLE'
  | 'PAIRING'
  | 'AUTHENTICATING'
  | 'ACTIVE'
  | 'SHREDDING'
  | 'DESTROYED';

interface ActiveSession {
  sessionId: string;
  hostDevice: string;
  remainingTtl: number;
}

interface AppStore {
  // Role
  role: UserRole;
  setRole: (role: UserRole) => void;

  // Owner State
  handle: string;
  passkeyRegistered: boolean;
  activeSessions: ActiveSession[];
  setHandle: (handle: string) => void;
  setPasskeyRegistered: (registered: boolean) => void;
  setActiveSessions: (sessions: ActiveSession[]) => void;
  removeSession: (sessionId: string) => void;

  // Guest State
  sessionId: string | null;
  sessionState: SessionState;
  remainingTtl: number;
  riskScore: number | null;
  setSessionId: (id: string) => void;
  setSessionState: (state: SessionState) => void;
  setRemainingTtl: (ttl: number) => void;
  setRiskScore: (score: number) => void;

  // Full Reset (when switching roles or exiting)
  resetAll: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  // Role
  role: null,
  setRole: (role) => set({ role }),

  // Owner
  handle: '',
  passkeyRegistered: false,
  activeSessions: [],
  setHandle: (handle) => set({ handle }),
  setPasskeyRegistered: (registered) => set({ passkeyRegistered: registered }),
  setActiveSessions: (sessions) => set({ activeSessions: sessions }),
  removeSession: (sessionId) =>
    set((state) => ({
      activeSessions: state.activeSessions.filter((s) => s.sessionId !== sessionId),
    })),

  // Guest
  sessionId: null,
  sessionState: 'IDLE',
  remainingTtl: 0,
  riskScore: null,
  setSessionId: (id) => set({ sessionId: id }),
  setSessionState: (state) => set({ sessionState: state }),
  setRemainingTtl: (ttl) => set({ remainingTtl: ttl }),
  setRiskScore: (score) => set({ riskScore: score }),

  // Full Reset
  resetAll: () =>
    set({
      role: null,
      sessionId: null,
      sessionState: 'IDLE',
      remainingTtl: 0,
      riskScore: null,
      activeSessions: [],
    }),
}));
