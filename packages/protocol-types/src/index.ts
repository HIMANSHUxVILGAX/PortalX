/**
 * PortelX Ephemeral Identity Layer - Protocol Types
 */

export type SessionState = 
  | 'INITIALIZING'
  | 'CHALLENGE_PENDING'
  | 'ACTIVE'
  | 'REVOKED'
  | 'EXPIRED'
  | 'SHREDDED';

export interface UserIdentityToken {
  uit: string;
  nonce: string;
  salt: string;
  createdAt: number;
  expiresAt: number;
  hostDeviceId: string;
}

export interface EphemeralSession {
  sessionId: string;
  initiatorId: string;
  hostDeviceId: string;
  state: SessionState;
  ttlSeconds: number;
  remainingTtl: number;
  permissions: Array<'UPI_PAYMENT' | 'DOC_STREAM' | 'SSO_AUTH'>;
  createdAt: string;
}

export interface ShredSignal {
  sessionId: string;
  reason: 'USER_EXIT' | 'TIMEOUT' | 'PANIC_REVOCATION' | 'HEARTBEAT_LOSS';
  timestamp: number;
  wipeVerificationChecksum: string;
}
