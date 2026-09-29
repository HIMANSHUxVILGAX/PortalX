import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Modal,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'bank'>('upi');

  // New Wallet form
  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [walletNetwork, setWalletNetwork] = useState('Ethereum');

  // Filter state for crypto transactions
  const [cryptoTxFilter, setCryptoTxFilter] = useState<'all' | 'bought' | 'sold'>('all');

  const cryptoTransactions = [
    { id: 'c1', type: 'bought', title: 'Bought ETH', via: 'Paid via UPI', amount: '+₹5,000', date: 'Today, 4:10 PM', icon: 'arrow-down', color: '#10B981' },
    { id: 'c2', type: 'sold', title: 'Sold USDT', via: 'Credited to HDFC Bank', amount: '-₹10,020', date: 'Yesterday, 6:30 PM', icon: 'arrow-up', color: '#EF4444' },
    { id: 'c3', type: 'bought', title: 'Bought SOL', via: 'Paid via UPI', amount: '+₹19,275', date: '14 Sep, 11:20 AM', icon: 'arrow-down', color: '#10B981' },
    { id: 'c4', type: 'sold', title: 'Sold BTC', via: 'Credited to SBI Bank', amount: '-₹2,81,155', date: '11 Sep, 2:45 PM', icon: 'arrow-up', color: '#EF4444' },
  ];

  const filteredCryptoTx = cryptoTransactions.filter(tx => {
    if (cryptoTxFilter === 'all') return true;
    return tx.type === cryptoTxFilter;
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, useNativeDriver: true, }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500, useNativeDriver: true, }),
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
    }, 1500);
  };

  const getCoinIcon = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return <MaterialCommunityIcons name="bitcoin" size={24} color="#F7931A" />;
      case 'ETH': return <MaterialCommunityIcons name="ethereum" size={24} color="#627EEA" />;
      case 'SOL': return <MaterialCommunityIcons name="currency-usd" size={24} color="#14F195" />;
      case 'USDT': return <MaterialCommunityIcons name="currency-usd" size={24} color="#26A17B" />;
      default: return <MaterialCommunityIcons name="circle-multiple-outline" size={24} color="#94A3B8" />;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#07090E" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto Portfolio</Text>
        <TouchableOpacity style={styles.addWalletIcon} onPress={() => setShowAddWalletModal(true)}>
          <Ionicons name="add" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* MAIN PORTFOLIO CARD */}
          <View style={styles.portfolioCard}>
            <Text style={styles.portfolioLabel}>Total Balance</Text>
            <View style={styles.portfolioAmountRow}>
              <Text style={styles.portfolioAmount}>{formatINR(totalCryptoBalance())}</Text>
              <View style={styles.changeBadge}>
                <Ionicons name="caret-up" size={12} color="#10B981" />
                <Text style={styles.changeText}> 2.4%</Text>
              </View>
            </View>
            {wallets.length > 0 && (
              <View style={styles.linkedAddressBar}>
                <Text style={styles.linkedAddressText}>Primary Wallet: {wallets[0]?.displayAddress || 'Not connected'}</Text>
              </View>
            )}
          </View>

          {/* ACTION BUTTONS */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBuyModal(true)} activeOpacity={0.7}>
              <View style={styles.actionIconBg}>
                <Ionicons name="add-outline" size={22} color="#F8FAFC" />
              </View>
              <Text style={styles.actionText}>Buy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowBuyModal(true)} activeOpacity={0.7}>
              <View style={styles.actionIconBg}>
                <Ionicons name="arrow-down-outline" size={22} color="#F8FAFC" />
              </View>
              <Text style={styles.actionText}>Sell</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
              <View style={styles.actionIconBg}>
                <Ionicons name="swap-horizontal-outline" size={22} color="#F8FAFC" />
              </View>
              <Text style={styles.actionText}>Swap</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddWalletModal(true)} activeOpacity={0.7}>
              <View style={styles.actionIconBg}>
                <Ionicons name="link-outline" size={22} color="#F8FAFC" />
              </View>
              <Text style={styles.actionText}>Connect</Text>
            </TouchableOpacity>
          </View>

          {/* ASSET HOLDINGS LIST */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assets</Text>
          </View>

          <View style={styles.assetsList}>
            {wallets.map((coin) => (
              <View key={coin.id} style={styles.coinCard}>
                <View style={styles.coinLeft}>
                  <View style={styles.coinIconWrapper}>
                    {getCoinIcon(coin.symbol)}
                  </View>
                  <View>
                    <Text style={styles.coinName}>{coin.chain}</Text>
                    <Text style={styles.coinSymbol}>{coin.balance} {coin.symbol}</Text>
                  </View>
                </View>

                <View style={styles.coinRight}>
                  <Text style={styles.coinPrice}>{coin.fiatValue}</Text>
                </View>
              </View>
            ))}
            {wallets.length === 0 && (
               <Text style={styles.emptyText}>No assets found. Connect a wallet.</Text>
            )}
          </View>

          {/* CRYPTO TRANSACTION HISTORY */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
          </View>

          {/* Filters */}
          <View style={styles.filterRow}>
            {[
              { id: 'all', label: 'All' },
              { id: 'bought', label: 'Bought' },
              { id: 'sold', label: 'Sold' },
            ].map(f => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, cryptoTxFilter === f.id && styles.filterChipActive]}
                onPress={() => setCryptoTxFilter(f.id as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    cryptoTxFilter === f.id && { color: '#07090E', fontWeight: '600' },
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
                <View style={[styles.txIconBg, { backgroundColor: `${tx.color}15` }]}>
                  <Ionicons name={tx.icon as any} size={18} color={tx.color} />
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
            {filteredCryptoTx.length === 0 && (
               <Text style={styles.emptyText}>No transactions found.</Text>
            )}
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL: FIAT TO CRYPTO ON-RAMP */}
      <Modal visible={showBuyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalSheetTitle}>Buy Crypto</Text>
              <TouchableOpacity onPress={() => setShowBuyModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {buySuccess ? (
              <View style={styles.successStateBox}>
                <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                <Text style={styles.successStateTitle}>Payment Successful!</Text>
                <Text style={styles.successStateSub}>
                  ₹{buyAmount} added to your portfolio.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.amountInputRow}>
                  <Text style={styles.rupeeSymbol}>₹</Text>
                  <TextInput
                    value={buyAmount}
                    onChangeText={setBuyAmount}
                    keyboardType="number-pad"
                    style={styles.amountInput}
                    placeholderTextColor="#64748B"
                  />
                </View>

                {/* Quick amount chips */}
                <View style={styles.quickAmountRow}>
                  {['1000', '5000', '10000', '25000'].map(amt => (
                    <TouchableOpacity
                      key={amt}
                      style={[styles.quickChip, buyAmount === amt && styles.quickChipActive]}
                      onPress={() => setBuyAmount(amt)}
                    >
                      <Text style={[styles.quickChipText, buyAmount === amt && { color: '#0F172A' }]}>
                        ₹{amt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.estimateBox}>
                  <Text style={styles.estimateText}>You will get approx. {(parseFloat(buyAmount || '0') / 5000000).toFixed(4)} BTC</Text>
                </View>

                <Text style={styles.sheetLabel}>Pay using</Text>
                <TouchableOpacity 
                  style={[styles.paymentMethodCard, paymentMethod === 'upi' && styles.paymentMethodCardActive]} 
                  onPress={() => setPaymentMethod('upi')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Ionicons name="flash-outline" size={20} color={paymentMethod === 'upi' ? "#F8FAFC" : "#64748B"} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.paymentMethodTitle, paymentMethod === 'upi' && {color: '#F8FAFC'}]}>UPI Transfer</Text>
                      <Text style={styles.paymentMethodSub}>Instant • Zero fees</Text>
                    </View>
                  </View>
                  <View style={[styles.radioCircle, paymentMethod === 'upi' && styles.radioCircleActive]}>
                    {paymentMethod === 'upi' && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.paymentMethodCard, paymentMethod === 'bank' && styles.paymentMethodCardActive]} 
                  onPress={() => setPaymentMethod('bank')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentMethodLeft}>
                    <Ionicons name="business-outline" size={20} color={paymentMethod === 'bank' ? "#F8FAFC" : "#64748B"} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.paymentMethodTitle, paymentMethod === 'bank' && {color: '#F8FAFC'}]}>Bank Transfer</Text>
                      <Text style={styles.paymentMethodSub}>Up to 2 hours</Text>
                    </View>
                  </View>
                  <View style={[styles.radioCircle, paymentMethod === 'bank' && styles.radioCircleActive]}>
                    {paymentMethod === 'bank' && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.primaryBtn} onPress={handleSimulateBuy} activeOpacity={0.8} disabled={isBuying}>
                  {isBuying ? (
                    <ActivityIndicator color="#07090E" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Proceed to Pay</Text>
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
              <Text style={styles.modalSheetTitle}>Connect Wallet</Text>
              <TouchableOpacity onPress={() => setShowAddWalletModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sheetLabel}>Network</Text>
            <View style={styles.networkRow}>
              {['Ethereum', 'Solana', 'Bitcoin'].map(net => (
                <TouchableOpacity
                  key={net}
                  style={[styles.networkChip, walletNetwork === net && styles.networkChipActive]}
                  onPress={() => setWalletNetwork(net)}
                >
                  <Text style={[styles.networkChipText, walletNetwork === net && { color: '#0F172A' }]}>
                    {net}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sheetLabel}>Wallet Address</Text>
            <View style={styles.addressInputBox}>
              <TextInput
                placeholder="Enter public address or ENS"
                placeholderTextColor="#64748B"
                value={newWalletAddress}
                onChangeText={setNewWalletAddress}
                style={styles.addressInput}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                setShowAddWalletModal(false);
                setNewWalletAddress('');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Connect Wallet</Text>
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
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  addWalletIcon: {
    padding: 8,
    marginRight: -8,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 8,
  },

  portfolioCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  portfolioLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  portfolioAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  portfolioAmount: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '700',
    marginRight: 12,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 13,
  },
  linkedAddressBar: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  linkedAddressText: {
    color: '#94A3B8',
    fontSize: 13,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  actionBtn: {
    alignItems: 'center',
    width: (width - 60) / 4,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },

  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },

  assetsList: {
    gap: 12,
    marginBottom: 32,
  },
  coinCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  coinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  coinName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  coinSymbol: {
    color: '#94A3B8',
    fontSize: 14,
  },
  coinRight: {
    alignItems: 'flex-end',
  },
  coinPrice: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },

  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#F8FAFC',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },

  txBox: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 8,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  txIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  txVia: {
    color: '#94A3B8',
    fontSize: 13,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  txDate: {
    color: '#94A3B8',
    fontSize: 12,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalSheetTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '600',
  },
  modalClose: {
    padding: 4,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  rupeeSymbol: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: '#F8FAFC',
    minWidth: 120,
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  quickChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  quickChipActive: {
    backgroundColor: '#F8FAFC',
  },
  quickChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  estimateBox: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  estimateText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  sheetLabel: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodTitle: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentMethodSub: {
    color: '#64748B',
    fontSize: 13,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#38BDF8',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
  },
  primaryBtn: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryBtnText: {
    color: '#07090E',
    fontSize: 16,
    fontWeight: '600',
  },
  successStateBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successStateTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  successStateSub: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  networkRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  networkChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  networkChipActive: {
    backgroundColor: '#F8FAFC',
  },
  networkChipText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  addressInputBox: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addressInput: {
    color: '#F8FAFC',
    fontSize: 15,
    paddingVertical: 16,
  },
});
