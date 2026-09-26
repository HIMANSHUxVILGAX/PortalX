/**
 * PortelX — Zustand App Store
 * Centralized state for user profile, cards, wallets, transactions, and subscription.
 */
import { create } from 'zustand';
import type {
  UserProfile,
  PaymentCard,
  CryptoWallet,
  Transaction,
  IdentityDocument,
  SubscriptionPlan,
  ChainType,
} from '../types';

export interface AppState {
  // ─── User Profile ──────────────────────────────
  user: UserProfile;
  setUser: (user: Partial<UserProfile>) => void;

  // ─── Theme ─────────────────────────────────────
  isDarkMode: boolean;
  toggleTheme: () => void;

  // ─── Payment Cards ─────────────────────────────
  cards: PaymentCard[];
  setCards: (cards: PaymentCard[]) => void;

  // ─── Crypto Wallets ────────────────────────────
  wallets: CryptoWallet[];
  addWallet: (wallet: CryptoWallet) => void;
  removeWallet: (id: string) => void;

  // ─── Transactions ──────────────────────────────
  transactions: Transaction[];
  setTransactions: (txs: Transaction[]) => void;

  // ─── Identity Documents ────────────────────────
  documents: IdentityDocument[];
  setDocuments: (docs: IdentityDocument[]) => void;

  // ─── Subscription ──────────────────────────────
  subscription: SubscriptionPlan;
  setSubscription: (plan: Partial<SubscriptionPlan>) => void;

  // ─── Computed ──────────────────────────────────
  totalFiatBalance: () => number;
  totalCryptoBalance: () => number;
  totalNetWorth: () => number;
}

// ─── Default Seed Data (loaded on first launch, replaced by API) ─────
const DEFAULT_USER: UserProfile = {
  id: 1,
  handle: '@rahul',
  displayName: 'Rahul Sharma',
  upiId: 'rahul@portelx',
  avatarUrl: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=1E293B&color=00e5ff',
  kycVerified: true,
  totalSpendLimit: 50000,
};

const DEFAULT_CARDS: PaymentCard[] = [
  { id: 'c1', bank: 'HDFC Bank', network: 'Visa Platinum', balance: 112450, maskedNumber: '•••• 4521', expires: '12/28', backgroundColor: '#0F172A', badge: 'Default' },
  { id: 'c2', bank: 'ICICI Bank', network: 'Mastercard World', balance: 4230, maskedNumber: '•••• 8912', expires: '08/26', backgroundColor: '#EA580C', badge: 'UPI Linked' },
  { id: 'c3', bank: 'SBI', network: 'RuPay Select', balance: 45000, maskedNumber: '•••• 1123', expires: '03/27', backgroundColor: '#0284C7', badge: 'Credit on UPI' },
];

const DEFAULT_WALLETS: CryptoWallet[] = [
  { id: 'w1', name: 'Primary Vault', address: '0x71C7a3b2E9f8D5c1A4e6B0d3F2a9C8E7D1B5A3E4', displayAddress: '0x71C...3E4A', chain: 'ETH', balance: 645210, symbol: 'ETH', fiatValue: '₹6,45,210', change: '+5.1%', isPositive: true, icon: 'ethereum' },
  { id: 'w2', name: 'Phantom Hot Wallet', address: '9xP2kL8mQ4vR7nW1yT3jH6fU0cS5dA2bE9gV8iX', displayAddress: '9xP2...K891', chain: 'SOL', balance: 200000, symbol: 'SOL', fiatValue: '₹2,00,000', change: '+11.8%', isPositive: true, icon: 'flash' },
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', name: 'Swiggy Food Delivery', category: 'Food & Dining', amount: -349, formattedAmount: '-₹349', timestamp: 'Today, 2:15 PM', icon: 'fast-food-outline', type: 'sent', source: 'HDFC ••4521' },
  { id: 't2', name: 'Vikash Kumar', category: 'UPI Transfer', amount: 2500, formattedAmount: '+₹2,500', timestamp: 'Today, 11:30 AM', icon: 'arrow-down-circle-outline', type: 'received', source: 'SBI ••1123' },
  { id: 't3', name: 'MoonPay Web3 Ramp', category: 'Bought 0.015 ETH', amount: 45000, formattedAmount: '+₹45,000', timestamp: 'Yesterday, 8:40 PM', icon: 'logo-bitcoin', type: 'crypto', source: 'Ethereum Vault' },
  { id: 't4', name: 'Jio 5G Recharge', category: 'Utility Bills', amount: -599, formattedAmount: '-₹599', timestamp: 'Yesterday, 3:10 PM', icon: 'phone-portrait-outline', type: 'sent', source: 'ICICI ••8912' },
  { id: 't5', name: 'Ananya Sharma', category: 'Split Bill Repay', amount: 1200, formattedAmount: '+₹1,200', timestamp: '15 Sep, 6:20 PM', icon: 'arrow-down-circle-outline', type: 'received', source: 'HDFC ••4521' },
  { id: 't6', name: 'Amazon Prime Order', category: 'E-Commerce', amount: -1499, formattedAmount: '-₹1,499', timestamp: '14 Sep, 9:05 PM', icon: 'cart-outline', type: 'sent', source: 'HDFC ••4521' },
  { id: 't7', name: 'Uniswap Liquidity Swap', category: 'Swapped USDT to SOL', amount: 18500, formattedAmount: '+₹18,500', timestamp: '13 Sep, 1:12 PM', icon: 'swap-horizontal', type: 'crypto', source: 'Phantom 9xP2' },
];

const DEFAULT_DOCUMENTS: IdentityDocument[] = [
  { id: 'd1', title: 'Aadhaar Card', subtitle: 'UIDAI Verified • 9821-XXXX-4102', icon: 'finger-print-outline', verified: true, source: 'DigiLocker' },
  { id: 'd2', title: 'Driving License', subtitle: 'MoRTH Verified • DL-0420210084', icon: 'car-outline', verified: true, source: 'Parivahan' },
  { id: 'd3', title: 'ABHA Health ID', subtitle: 'National Health Authority • Active', icon: 'medical-outline', verified: true, source: 'ABHA' },
];

const DEFAULT_SUBSCRIPTION: SubscriptionPlan = {
  tier: 'premium',
  name: 'PortelX Premium',
  price: '₹499/month',
  sessionsAllowed: -1,
  sessionsUsed: 12,
  features: ['Unlimited Guest Vaults', 'Priority AI Risk Scoring', 'Real-time FCM Alerts', 'Sovereign Doc Streaming'],
  isActive: true,
};

export const useAppStore = create<AppState>((set, get) => ({
  // User
  user: DEFAULT_USER,
  setUser: (updates) => set((s) => ({ user: { ...s.user, ...updates } })),

  // Theme
  isDarkMode: false,
  toggleTheme: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

  // Cards
  cards: DEFAULT_CARDS,
  setCards: (cards) => set({ cards }),

  // Wallets
  wallets: DEFAULT_WALLETS,
  addWallet: (wallet) => set((s) => ({ wallets: [...s.wallets, wallet] })),
  removeWallet: (id) => set((s) => ({ wallets: s.wallets.filter((w) => w.id !== id) })),

  // Transactions
  transactions: DEFAULT_TRANSACTIONS,
  setTransactions: (transactions) => set({ transactions }),

  // Documents
  documents: DEFAULT_DOCUMENTS,
  setDocuments: (documents) => set({ documents }),

  // Subscription
  subscription: DEFAULT_SUBSCRIPTION,
  setSubscription: (updates) => set((s) => ({ subscription: { ...s.subscription, ...updates } })),

  // Computed
  totalFiatBalance: () => get().cards.reduce((sum, c) => sum + c.balance, 0),
  totalCryptoBalance: () => get().wallets.reduce((sum, w) => sum + w.balance, 0),
  totalNetWorth: () => get().totalFiatBalance() + get().totalCryptoBalance(),
}));
