import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  SafeAreaView,
  Modal,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';

const { width } = Dimensions.get('window');

const formatINR = (amount: number): string => {
  const abs = Math.abs(amount);
  const formatted = abs >= 100000
    ? `${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 2)}L`
    : abs.toLocaleString('en-IN');
  return amount < 0 ? `-₹${formatted}` : `₹${formatted}`;
};

export default function CryptoPortfolioScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const { wallets, totalCryptoBalance, user } = useAppStore();

  // Modals state
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [buyAmount, setBuyAmount] = useState('5000');
  const [buySuccess, setBuySuccess] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'sbi'>('upi');

  // New Wallet form
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('Ethereum (ERC-20)');

  // Filter state for crypto transactions
  const [cryptoTxFilter, setCryptoTxFilter] = useState<'all' | 'bought' | 'sold'>('all');

  const cryptoTransactions = [
    { id: 'c1', type: 'bought', title: 'Bought 0.024 ETH', via: 'Paid via GPay UPI', amount: '+₹5,000', date: 'Today, 4:10 PM', icon: 'arrow-down-circle', color: '#10B981' },
    { id: 'c2', type: 'sold', title: 'Sold 120 USDT', via: 'Credited to HDFC ••4521', amount: '-₹10,020', date: 'Yesterday, 6:30 PM', icon: 'arrow-up-circle', color: '#EF4444' },
    { id: 'c3', type: 'bought', title: 'Bought 1.5 SOL', via: 'Paid via ICICI UPI', amount: '+₹19,275', date: '14 Sep, 11:20 AM', icon: 'arrow-down-circle', color: '#10B981' },
    { id: 'c4', type: 'sold', title: 'Off-Ramp 0.05 BTC', via: 'Credited to SBI ••1123', amount: '-₹2,81,155', date: '11 Sep, 2:45 PM', icon: 'arrow-up-circle', color: '#EF4444' },
  ];

  const filteredCryptoTx = cryptoTransactions.filter(tx => {
    if (cryptoTxFilter === 'all') return true;
    return tx.type === cryptoTxFilter;
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSimulateBuy = () => {
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
      setBuySuccess(true);
      setTimeout(() => {
        setBuySuccess(false);
        setShowBuyModal(false);
      }, 2000);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#00E5FF" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>PORTELX WEB3 VAULT</Text>
          <Text style={styles.headerSub}>Self-Sovereign Multi-Chain Layer</Text>
        </View>
        <TouchableOpacity style={styles.networkBadge} onPress={() => setShowAddWalletModal(true)}>
          <Ionicons name="add-circle" size={16} color="#00E5FF" style={{ marginRight: 4 }} />
          <Text style={styles.networkBadgeText}>Add Wallet</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* MAIN PORTFOLIO CARD */}
          <View style={styles.portfolioCard}>
            <View style={styles.portfolioTop}>
              <View>
                <Text style={styles.portfolioLabel}>TOTAL WEB3 PORTFOLIO</Text>
                <Text style={styles.portfolioAmount}>{formatINR(totalCryptoBalance())}</Text>
              </View>
              <View style={styles.changeBadge}>
                <Ionicons name="caret-up" size={14} color="#10B981" />
                <Text style={styles.changeText}> +14.5% (24h)</Text>
              </View>
            </View>

            {/* Quick linked wallet banner */}
            <View style={styles.linkedAddressBar}>
              <Ionicons name="key-outline" size={14} color="#00E5FF" style={{ marginRight: 6 }} />
              <Text style={styles.linkedAddressText}>Vault Public Address: {wallets[0]?.displayAddress || '0x...'}</Text>
              <Text style={styles.alchemySync}>Alchemy Live</Text>
            </View>
          </View>

          {/* ACTION BUTTONS: RECHARGE VIA UPI / SELL / SWAP */}
          <View style={styles.actionRow}>
            {/* BUY / RECHARGE WITH UPI */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBuyModal(true)} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(0, 229, 255, 0.15)', borderColor: '#00E5FF' }]}>
                <Ionicons name="wallet-outline" size={24} color="#00E5FF" />
              </View>
              <Text style={[styles.actionText, { color: '#00E5FF' }]}>Buy via UPI</Text>
            </TouchableOpacity>

            {/* SELL / CASH-OUT */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBuyModal(true)} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B' }]}>
                <Ionicons name="cash-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.actionText}>Sell / Bank</Text>
            </TouchableOpacity>

            {/* SWAP */}
            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(168, 85, 247, 0.15)', borderColor: '#A855F7' }]}>
                <Ionicons name="swap-horizontal-outline" size={24} color="#A855F7" />
              </View>
              <Text style={styles.actionText}>Cross-Swap</Text>
            </TouchableOpacity>

            {/* ADD WALLET */}
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddWalletModal(true)} activeOpacity={0.8}>
              <View style={[styles.actionIconBg, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }]}>
                <Ionicons name="link-outline" size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Connect</Text>
            </TouchableOpacity>
          </View>

          {/* ASSET HOLDINGS LIST */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Verified Crypto Holdings</Text>
            <Text style={styles.assetCountText}>4 Tokens Syncing</Text>
          </View>

          <View style={styles.assetsList}>
            {wallets.map((coin) => (
              <View key={coin.id} style={styles.coinCard}>
                <View style={styles.coinLeft}>
                  <View style={styles.coinIconWrapper}>
                    <MaterialCommunityIcons name="currency-usd" size={24} color="#00E5FF" />
                  </View>
                  <View>
                    <Text style={styles.coinName}>{coin.chain}</Text>
                    <Text style={styles.coinSymbol}>{coin.symbol} • {coin.balance}</Text>
                  </View>
                </View>

                <View style={styles.coinRight}>
                  <Text style={styles.coinPrice}>{coin.fiatValue}</Text>
                  <View style={styles.coinChangeRow}>
                    <Text style={styles.coinRateText}>1 = ₹...</Text>
                    <Text
                      style={[
                        styles.coinChange,
                        { color: '#10B981' }
                      ]}
                    >
                      +0.0%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* FIAT-TO-CRYPTO ON-RAMP BANNER */}
          <View style={styles.onRampBanner}>
            <View style={styles.onRampLeft}>
              <Ionicons name="shield-checkmark" size={24} color="#00E5FF" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.onRampTitle}>Direct Bank to Blockchain Ramp</Text>
                <Text style={styles.onRampSub}>
                  Powered by NPCI UPI rails + MoonPay liquidity. Zero KYC friction.
                </Text>
              </View>
            </View>
          </View>

          {/* CRYPTO TRANSACTION HISTORY WITH FILTERS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Crypto On-Ramp & Off-Ramp History</Text>
          </View>

          {/* Filters */}
          <View style={styles.filterRow}>
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'bought', label: '🟢 Only Bought (UPI)' },
              { id: 'sold', label: '🔴 Only Sold (Bank Credit)' },
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, cryptoTxFilter === f.id && styles.filterChipActive]}
                onPress={() => setCryptoTxFilter(f.id as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    cryptoTxFilter === f.id && { color: '#07090E', fontWeight: '800' },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Filtered Tx List */}
          <View style={styles.txBox}>
            {filteredCryptoTx.map((tx, idx) => (
              <View
                key={tx.id}
                style={[
                  styles.txItem,
                  idx < filteredCryptoTx.length - 1 && { borderBottomWidth: 1, borderBottomColor: '#1E293B' },
                ]}
              >
                <View style={[styles.txIconBg, { backgroundColor: `${tx.color}18` }]}>
                  <Ionicons name={tx.icon as any} size={20} color={tx.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txVia}>{tx.via}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.txAmount, { color: tx.color }]}>{tx.amount}</Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL: FIAT TO CRYPTO ON-RAMP */}
      <Modal visible={showBuyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Fiat to Crypto On-Ramp</Text>
                <Text style={styles.modalSheetSub}>Convert INR directly to BTC, ETH or USDT</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBuyModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {buySuccess ? (
              <View style={styles.successStateBox}>
                <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                <Text style={styles.successStateTitle}>₹{buyAmount} Recharge Initiated!</Text>
                <Text style={styles.successStateSub}>
                  Payment request sent. Crypto will be deposited into your vault in ~30s.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.sheetLabel}>Amount in Indian Rupees (₹)</Text>
                <View style={styles.amountInputRow}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    value={buyAmount}
                    onChangeText={setBuyAmount}
                    keyboardType="number-pad"
                    style={styles.amountInput}
                  />
                </View>

                {/* Quick amount chips */}
                <View style={styles.quickAmountRow}>
                  {['1000', '5000', '10000', '25000', '50000'].map(amt => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.quickChip, buyAmount === amt && styles.quickChipActive]}
                      onPress={() => setBuyAmount(amt)}
                    >
                      <Text style={[styles.quickChipText, buyAmount === amt && { color: '#00E5FF' }]}>
                        ₹{amt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* You receive estimation */}
                <View style={styles.estimateCard}>
                  <Text style={styles.estimateLabel}>ESTIMATED CRYPTO TO RECEIVE</Text>
                  <Text style={styles.estimateValue}>
                    ≈ {(parseFloat(buyAmount || '0') / 5000000).toFixed(4)} BTC
                  </Text>
                  <Text style={styles.estimateFee}>Network Fee: ₹24 • Slippage: 0.1%</Text>
                </View>

                {/* Payment method selector */}
                <Text style={styles.sheetLabel}>Select Payment Method</Text>
                <TouchableOpacity 
                  style={[styles.paymentMethodCard, paymentMethod === 'upi' && styles.paymentMethodCardActive]} 
                  onPress={() => setPaymentMethod('upi')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Ionicons name="flash" size={20} color={paymentMethod === 'upi' ? "#00E5FF" : "#64748B"} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.paymentMethodTitle}>UPI (rahul@portelx)</Text>
                      <Text style={styles.paymentMethodSub}>Instant transfer</Text>
                    </View>
                  </View>
                  <View style={[styles.radioCircle, paymentMethod === 'upi' && styles.radioCircleActive]}>
                    {paymentMethod === 'upi' && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.paymentMethodCard, paymentMethod === 'sbi' && styles.paymentMethodCardActive]} 
                  onPress={() => setPaymentMethod('sbi')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Ionicons name="business" size={20} color={paymentMethod === 'sbi' ? "#00E5FF" : "#64748B"} />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.paymentMethodTitle}>SBI Bank Account (•••• 1123)</Text>
                      <Text style={styles.paymentMethodSub}>Takes 2-4 hours</Text>
                    </View>
                  </View>
                  <View style={[styles.radioCircle, paymentMethod === 'sbi' && styles.radioCircleActive]}>
                    {paymentMethod === 'sbi' && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.payNowBtn} onPress={handleSimulateBuy} activeOpacity={0.85} disabled={isBuying}>
                  {isBuying ? (
                    <ActivityIndicator color="#07090E" />
                  ) : (
                    <>
                      <Text style={styles.payNowText}>Instant Buy via {paymentMethod === 'upi' ? 'UPI' : 'SBI'}</Text>
                      <Ionicons name="arrow-forward" size={18} color="#07090E" />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* MODAL: ADD CRYPTO ACCOUNT */}
      <Modal visible={showAddWalletModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Add Crypto Account</Text>
                <Text style={styles.modalSheetSub}>Link public key to track on PortelX</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddWalletModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetLabel}>Select Network</Text>
            <View style={styles.quickAmountRow}>
              {['Ethereum (ERC-20)', 'Solana (SPL)', 'Bitcoin (SegWit)'].map(net => (
                <TouchableOpacity
                  key={net}
                  style={[styles.quickChip, walletNetwork === net && styles.quickChipActive]}
                  onPress={() => setWalletNetwork(net)}
                >
                  <Text style={[styles.quickChipText, walletNetwork === net && { color: '#00E5FF' }]}>
                    {net.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Enter Public Address / ENS</Text>
            <View style={styles.addressInputBox}>
              <TextInput
                placeholder="0x... or rahul.eth"
                placeholderTextColor="#64748B"
                value={newWalletAddress}
                onChangeText={setNewWalletAddress}
                style={styles.addressInput}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.payNowBtn}
              onPress={() => {
                setShowAddWalletModal(false);
                setNewWalletAddress('');
              }}
            >
              <Text style={styles.payNowText}>Connect & Sync Balance</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1.2,
  },
  headerSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  networkBadgeText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },

  portfolioCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
  },
  portfolioTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  portfolioLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  portfolioAmount: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 4,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  changeText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 12,
  },
  linkedAddressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  linkedAddressText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
  },
  alchemySync: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '800',
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBtn: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  actionIconBg: {
    width: 54,
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
  },
  actionText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  assetCountText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },

  assetsList: {
    gap: 10,
    marginBottom: 20,
  },
  coinCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  coinName: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  coinSymbol: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '600',
  },
  coinRight: {
    alignItems: 'flex-end',
  },
  coinPrice: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  coinChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  coinRateText: {
    color: '#64748B',
    fontSize: 10,
  },
  coinChange: {
    fontSize: 11,
    fontWeight: '800',
  },

  onRampBanner: {
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
    marginBottom: 20,
  },
  onRampLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onRampTitle: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '800',
  },
  onRampSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 15,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  filterChipActive: {
    backgroundColor: '#00E5FF',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },

  txBox: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 6,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  txIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  txVia: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  txDate: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalSheetTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
  },
  modalSheetSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  modalClose: {
    padding: 6,
    backgroundColor: '#1E293B',
    borderRadius: 10,
  },
  sheetLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rupeeSymbol: {
    color: '#00E5FF',
    fontSize: 24,
    fontWeight: '900',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  quickAmountRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  quickChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickChipActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
  },
  quickChipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  estimateCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  estimateLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  estimateValue: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 2,
  },
  estimateFee: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  paymentMethodCardActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  paymentMethodSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#00E5FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00E5FF',
  },
  payNowBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    gap: 8,
  },
  payNowText: {
    color: '#07090E',
    fontSize: 15,
    fontWeight: '900',
  },
  addressInputBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  addressInput: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  successStateBox: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  successStateTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 12,
  },
  successStateSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
