/**
 * PortelX — TypeScript Interfaces & Types
 * Single source of truth for all data models across the app.
 */

// ─── User & Profile ─────────────────────────────────────────
export interface UserProfile {
  id: number;
  handle: string;
  displayName: string;
  upiId: string;
  avatarUrl: string;
  kycVerified: boolean;
  totalSpendLimit: number;
}

// ─── Subscription / RevenueCat ───────────────────────────────
export type SubscriptionTier = 'free' | 'premium' | 'bundle' | 'enterprise';

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: string;            // e.g. "₹0", "₹499/mo", "₹999/mo"
  sessionsAllowed: number;   // -1 = unlimited
  sessionsUsed: number;
  features: string[];
  isActive: boolean;
}

// ─── Payment Cards ───────────────────────────────────────────
export interface PaymentCard {
  id: string;
  bank: string;
  network: string;          // "Visa", "Mastercard", "RuPay"
  balance: number;
  maskedNumber: string;      // "•••• 4521"
  expires: string;           // "12/28"
  backgroundColor: string;
  badge: string;             // "Default", "UPI Linked", etc.
}

// ─── Crypto Wallet ───────────────────────────────────────────
export type ChainType = 'ETH' | 'SOL' | 'BTC';

export interface CryptoWallet {
  id: string;
  name: string;
  address: string;
  displayAddress: string;    // truncated "0x71C...3E4A"
  chain: ChainType;
  balance: number;
  symbol: string;
  fiatValue: string;
  change: string;
  isPositive: boolean | null;
  icon: string;
}

// ─── Transactions ────────────────────────────────────────────
export type TransactionType = 'sent' | 'received' | 'crypto';

export interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;            // negative for sent, positive for received
  formattedAmount: string;   // "−₹349" or "+₹2,500"
  timestamp: string;
  icon: string;
  type: TransactionType;
  source: string;            // "HDFC ••4521" or "Ethereum Vault"
}

// ─── Identity Documents ──────────────────────────────────────
export interface IdentityDocument {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  verified: boolean;
  source: string;            // "DigiLocker", "Parivahan", etc.
}

// ─── Guest Vault Session ─────────────────────────────────────
export interface VaultSession {
  sessionId: string;
  uit: string;
  ttl: number;
  createdAt: number;
  expiresAt: number;
  riskAssessment: RiskAssessment | null;
  isActive: boolean;
}

export interface RiskAssessment {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  flags: string[];
  recommendation: 'allow' | 'review' | 'block';
}

// ─── Vault History ───────────────────────────────────────────
export interface VaultHistoryEntry {
  id?: string;
  session_id?: string;
  room_id?: string;
  vaultId?: string;           // "VLT-9F2X"
  device_name?: string;
  device_brand?: string | null;
  device?: string;
  location?: string;
  duration?: string;          // "12m 34s"
  duration_seconds?: number;
  bytes_zeroized?: number;
  date?: string;
  created_at?: string;
  status: 'shredded' | 'expired' | 'active' | 'SHREDDED' | 'ACTIVE' | string;
  is_active?: boolean;
  risk_score?: number;
  riskScore?: number;
}

// ─── Payment (QR Scan) ──────────────────────────────────────
export interface PaymentRequest {
  sessionId: string;
  amount: number;
  vpa: string;
  merchantName: string;
  pin: string;
}

export interface PaymentResult {
  status: 'success' | 'error';
  message: string;
}

// ─── API Response Wrappers ───────────────────────────────────
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
}

export interface VaultOpenResponse {
  session_id: string;
  uit: string;
  ttl: number;
  expires_at: number;
  risk_assessment: {
    risk_score: number;
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    flags: string[];
    recommendation: 'allow' | 'review' | 'block';
  };
}

export interface VaultDestroyResponse {
  shredded: boolean;
  wipe_latency_ms: number;
  bytes_zeroized: number;
}
