import { create } from 'zustand';

export type SessionState = 
  | 'IDLE'
  | 'PAIRING'
  | 'AUTHENTICATING'
  | 'ACTIVE'
  | 'SHREDDING'
  | 'DESTROYED';

interface SessionStore {
  // State
  sessionId: string | null;
  state: SessionState;
  remainingTtl: number;
  riskScore: number | null;

  // Actions
  setSessionId: (id: string) => void;
  setState: (state: SessionState) => void;
  setRemainingTtl: (ttl: number) => void;
  setRiskScore: (score: number) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  // Initial State
  sessionId: null,
  state: 'IDLE',
  remainingTtl: 0,
  riskScore: null,

  // Mutations
  setSessionId: (id) => set({ sessionId: id }),
  setState: (state) => set({ state }),
  setRemainingTtl: (ttl) => set({ remainingTtl: ttl }),
  setRiskScore: (score) => set({ riskScore: score }),
  resetSession: () =>
    set({
      sessionId: null,
      state: 'IDLE',
      remainingTtl: 0,
      riskScore: null,
    }),
}));
