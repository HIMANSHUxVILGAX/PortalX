import { create } from 'zustand';

interface PrimaryStore {
  // Identity
  handle: string;
  passkeyRegistered: boolean;

  // Active Sessions
  activeSessions: Array<{ sessionId: string; hostDevice: string; remainingTtl: number }>;

  // Actions
  setHandle: (handle: string) => void;
  setPasskeyRegistered: (registered: boolean) => void;
  setActiveSessions: (sessions: PrimaryStore['activeSessions']) => void;
  removeSession: (sessionId: string) => void;
}

export const usePrimaryStore = create<PrimaryStore>((set) => ({
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
}));
