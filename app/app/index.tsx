import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();

  // 1. Theme State (Dark / Light Mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 2. Transaction Filter State ('all' | 'received' | 'sent' | 'crypto')
  const [txFilter, setTxFilter] = useState<'all' | 'received' | 'sent' | 'crypto'>('all');

  // 3. Add Crypto Account Modal State
  const [showAddCryptoModal, setShowAddCryptoModal] = useState(false);
  const [walletAddressInput, setWalletAddressInput] = useState('');
  const [selectedChain, setSelectedChain] = useState<'ETH' | 'SOL' | 'BTC'>('ETH');
  const [connectedWallets, setConnectedWallets] = useState([
    { id: 'w1', name: 'Primary Vault', address: '0x71C...3E4A', chain: 'ETH', balance: '₹6,45,210' },
    { id: 'w2', name: 'Phantom Hot Wallet', address: '9xP2...K891', chain: 'SOL', balance: '₹2,00,000' },
  ]);

  // Entrance Animations
  const animValues = useRef([...Array(6)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      100,
      animValues.map(anim =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const getAnimStyle = (index: number) => ({
    opacity: animValues[index],
    transform: [
      {
        translateY: animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  // Cards Data (Fiat & Global)
  const cards = [
    { id: 1, bank: 'HDFC Bank', network: 'Visa Platinum', balance: '₹1,12,450', number: '•••• 4521', expires: '12/28', bg: '#0F172A', badge: 'Default' },
    { id: 2, bank: 'ICICI Bank', network: 'Mastercard World', balance: '₹4,230', number: '•••• 8912', expires: '08/26', bg: '#EA580C', badge: 'UPI Linked' },
    { id: 3, bank: 'SBI', network: 'RuPay Select', balance: '₹45,000', number: '•••• 1123', expires: '03/27', bg: '#0284C7', badge: 'Credit on UPI' },
  ];

  // Quick Action Buttons
  const quickActions = [
    { icon: 'qr-code-outline', label: 'Scan & Pay', color: '#2563EB', action: () => router.push('/manage_cards') },
    { icon: 'send-outline', label: 'Send Money', color: '#10B981', action: () => router.push('/manage_cards') },
    { icon: 'wallet-outline', label: 'Buy Crypto', color: '#F59E0B', action: () => router.push('/crypto_portfolio') },
    { icon: 'card-outline', label: 'All Cards', color: '#8B5CF6', action: () => router.push('/manage_cards') },
  ];

  // Documents Data
  const documents = [
    { id: 1, title: 'Aadhaar Card', subtitle: 'UIDAI Verified • 9821-XXXX-4102', icon: 'finger-print-outline', verified: true },
    { id: 2, title: 'Driving License', subtitle: 'MoRTH Verified • DL-0420210084', icon: 'car-outline', verified: true },
    { id: 3, title: 'ABHA Health ID', subtitle: 'National Health Authority • Active', icon: 'medical-outline', verified: true },
  ];

  // Transactions Data (with type tags for real filtering)
  const allTransactions = [
    { id: 1, name: 'Swiggy Food Delivery', category: 'Food & Dining', amount: '-₹349', time: 'Today, 2:15 PM', icon: 'fast-food-outline', type: 'sent', bank: 'HDFC ••4521' },
    { id: 2, name: 'Vikash Kumar', category: 'UPI Transfer', amount: '+₹2,500', time: 'Today, 11:30 AM', icon: 'arrow-down-circle-outline', type: 'received', bank: 'SBI ••1123' },
    { id: 3, name: 'MoonPay Web3 Ramp', category: 'Bought 0.015 ETH', amount: '+₹45,000', time: 'Yesterday, 8:40 PM', icon: 'logo-bitcoin', type: 'crypto', bank: 'Ethereum Vault' },
    { id: 4, name: 'Jio 5G Recharge', category: 'Utility Bills', amount: '-₹599', time: 'Yesterday, 3:10 PM', icon: 'phone-portrait-outline', type: 'sent', bank: 'ICICI ••8912' },
    { id: 5, name: 'Ananya Sharma', category: 'Split Bill Repay', amount: '+₹1,200', time: '15 Sep, 6:20 PM', icon: 'arrow-down-circle-outline', type: 'received', bank: 'HDFC ••4521' },
    { id: 6, name: 'Amazon Prime Order', category: 'E-Commerce', amount: '-₹1,499', time: '14 Sep, 9:05 PM', icon: 'cart-outline', type: 'sent', bank: 'HDFC ••4521' },
    { id: 7, name: 'Uniswap Liquidity Swap', category: 'Swapped USDT to SOL', amount: '+₹18,500', time: '13 Sep, 1:12 PM', icon: 'swap-horizontal', type: 'crypto', bank: 'Phantom 9xP2' },
  ];

  // Filtered list
  const filteredTransactions = allTransactions.filter(tx => {
    if (txFilter === 'all') return true;
    return tx.type === txFilter;
  });

  const handleAddWallet = () => {
    if (walletAddressInput.trim()) {
      const newWallet = {
        id: `w_${Date.now()}`,
        name: `${selectedChain} Imported Wallet`,
        address: walletAddressInput.length > 12 
          ? `${walletAddressInput.slice(0, 6)}...${walletAddressInput.slice(-4)}` 
          : walletAddressInput,
        chain: selectedChain,
        balance: '₹50,000',
      };
      setConnectedWallets([...connectedWallets, newWallet]);
      setWalletAddressInput('');
      setShowAddCryptoModal(false);
    }
  };

  // Dynamic Theme Colors
  const theme = {
    bg: isDarkMode ? '#07090E' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    text: isDarkMode ? '#F8FAFC' : '#0F172A',
    subText: isDarkMode ? '#94A3B8' : '#64748B',
    searchBg: isDarkMode ? '#111827' : '#FFFFFF',
    pillBg: isDarkMode ? '#1E293B' : '#F1F5F9',
    tabBg: isDarkMode ? '#0B0F17' : '#FFFFFF',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 1. HEADER (Greeting, Dark/Light Mode Switch, Profile Avatar) */}
        <Animated.View style={[styles.headerContainer, getAnimStyle(0)]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greetingText, { color: theme.subText }]}>Namaste,</Text>
              <Text style={[styles.nameText, { color: theme.text }]}>Rahul Sharma</Text>
              {/* UPI ID Badge */}
              <View style={[styles.upiIdBadge, { backgroundColor: isDarkMode ? 'rgba(0, 229, 255, 0.1)' : '#EFF6FF' }]}>
                <Ionicons name="flash" size={12} color="#00E5FF" />
                <Text style={styles.upiIdText}>rahul@portelx</Text>
                <Text style={styles.upiVerified}>• Multi-Rail Verified</Text>
              </View>
            </View>

            <View style={styles.headerActionBtns}>
              {/* DARK / LIGHT MODE TOGGLE */}
              <TouchableOpacity
                style={[styles.themeToggleBtn, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}
                onPress={() => setIsDarkMode(!isDarkMode)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isDarkMode ? 'sunny' : 'moon'}
                  size={20}
                  color={isDarkMode ? '#F59E0B' : '#6366F1'}
                />
              </TouchableOpacity>

              {/* Profile Avatar */}
              <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarButton}>
                <Image
                  source={{ uri: 'https://ui-avatars.com/api/?name=Rahul+Sharma&background=1E293B&color=00e5ff' }}
                  style={styles.avatar}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* NET WORTH SUMMARY BAR */}
          <View style={[styles.netWorthCard, { backgroundColor: isDarkMode ? '#0B0F19' : '#0F172A' }]}>
            <View style={styles.netWorthTop}>
              <View>
                <Text style={styles.netWorthLabel}>TOTAL COMBINED NET WORTH</Text>
                <Text style={styles.netWorthAmount}>₹10,06,890.50</Text>
              </View>
              <View style={styles.growthPill}>
                <Ionicons name="trending-up" size={14} color="#10B981" />
                <Text style={styles.growthText}> +8.4%</Text>
              </View>
            </View>
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownItem}>
                <View style={[styles.dotIndicator, { backgroundColor: '#0284C7' }]} />
                <Text style={styles.breakdownText}>Fiat UPI: ₹1,61,680</Text>
              </View>
              <View style={styles.breakdownItem}>
                <View style={[styles.dotIndicator, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.breakdownText}>Web3 Crypto: ₹8,45,210</Text>
              </View>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View style={[styles.searchBar, { backgroundColor: theme.searchBg, borderColor: theme.cardBorder }]}>
            <Ionicons name="search-outline" size={20} color={theme.subText} />
            <TextInput
              placeholder="Search contacts, UPI IDs, crypto txns..."
              placeholderTextColor={theme.subText}
              style={[styles.searchInput, { color: theme.text }]}
            />
            <TouchableOpacity style={styles.qrSearchBtn}>
              <Ionicons name="scan-outline" size={18} color="#00E5FF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 2. CARDS & WEb3 WALLETS SECTION */}
        <Animated.View style={[styles.cardsSection, getAnimStyle(1)]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Rails & Wallets</Text>
            <TouchableOpacity onPress={() => router.push('/manage_cards')}>
              <Text style={styles.manageAllText}>Manage All ({cards.length + 1}) →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
            {/* FIAT / BANK CARDS */}
            {cards.map((card) => (
              <View key={card.id} style={[styles.card, { backgroundColor: card.bg }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardBank}>{card.bank}</Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>{card.badge}</Text>
                  </View>
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
                  <Text style={styles.balanceText}>{card.balance}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardNumber}>{card.number}</Text>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.expiresLabel}>{card.network}</Text>
                    <Text style={styles.expiresText}>Exp {card.expires}</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* WEB3 CRYPTO PORTFOLIO CARD */}
            <TouchableOpacity
              onPress={() => router.push('/crypto_portfolio')}
              activeOpacity={0.9}
              style={[styles.card, styles.cryptoCard]}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="logo-bitcoin" size={22} color="#F59E0B" style={{ marginRight: 6 }} />
                  <Text style={[styles.cardBank, { color: '#00E5FF' }]}>PortelX Web3 Vault</Text>
                </View>
                <View style={styles.cryptoLiveBadge}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.cryptoLiveText}>LIVE SYNC</Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.balanceLabel, { color: '#94A3B8' }]}>WEB3 ASSETS TOTAL</Text>
                <Text style={[styles.balanceText, { color: '#FFF' }]}>₹8,45,210.00</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={[styles.cardNumber, { color: '#00E5FF', fontSize: 13 }]}>0x71C...3E4A (ETH/SOL)</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.expiresLabel, { color: '#10B981', fontWeight: '800' }]}>+12.4%</Text>
                  <Text style={[styles.expiresText, { color: '#94A3B8' }]}>24h Yield</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ADD CRYPTO WALLET CARD BUTTON */}
            <TouchableOpacity
              onPress={() => setShowAddCryptoModal(true)}
              style={[styles.card, styles.addWalletCard, { borderColor: theme.cardBorder }]}
              activeOpacity={0.8}
            >
              <View style={styles.addWalletIconCircle}>
                <Ionicons name="add" size={28} color="#00E5FF" />
              </View>
              <Text style={[styles.addWalletTitle, { color: theme.text }]}>+ Add Crypto Account</Text>
              <Text style={[styles.addWalletSub, { color: theme.subText }]}>Connect MetaMask, Phantom, or paste public address</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* 3. QUICK ACTIONS */}
        <Animated.View style={[styles.quickActionsContainer, getAnimStyle(2)]}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionButton} onPress={action.action}>
              <View style={[styles.actionIconBg, { backgroundColor: `${action.color}15`, borderColor: `${action.color}30` }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* 4. LEND PHONE (PORTELX GUEST ENCLAVE) BANNER */}
        <Animated.View style={[{ paddingHorizontal: 20, marginVertical: 10 }, getAnimStyle(3)]}>
          <TouchableOpacity
            style={styles.lendBanner}
            onPress={() => router.push('/portelx_verification')}
            activeOpacity={0.85}
          >
            <View style={styles.lendBannerLeft}>
              <View style={styles.lendIconBadge}>
                <Ionicons name="finger-print" size={24} color="#00E5FF" />
              </View>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.lendBannerTitle}>Lend Device • Guest Mode</Text>
                  <View style={styles.guestPill}>
                    <Text style={styles.guestPillText}>ZERO-TRACE</Text>
                  </View>
                </View>
                <Text style={styles.lendBannerSub}>
                  Biometric attestation loads guest's own account, plan, & past rooms.
                </Text>
              </View>
            </View>
            <View style={styles.lendBtnArrow}>
              <Ionicons name="arrow-forward" size={18} color="#07090E" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* 5. IDENTITY DOCUMENTS */}
        <Animated.View style={[styles.sectionContainer, getAnimStyle(4)]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Identity Documents (DigiLocker)</Text>
            <Text style={styles.verifiedCountText}>3 Verified</Text>
          </View>
          {documents.map((doc) => (
            <View key={doc.id} style={[styles.documentItem, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
              <View style={[styles.documentIconContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                <Ionicons name={doc.icon as any} size={22} color={isDarkMode ? '#00E5FF' : '#374151'} />
              </View>
              <View style={styles.documentInfo}>
                <Text style={[styles.documentTitle, { color: theme.text }]}>{doc.title}</Text>
                <Text style={[styles.documentSubtitle, { color: theme.subText }]}>{doc.subtitle}</Text>
              </View>
              {doc.verified && (
                <View style={styles.verifiedDocBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.verifiedDocText}>Verified</Text>
                </View>
              )}
            </View>
          ))}
        </Animated.View>

        {/* 6. PAYMENT & TRANSACTION HISTORY (WITH FILTERS) */}
        <Animated.View style={[styles.sectionContainer, getAnimStyle(5)]}>
          <View style={styles.historyHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment & Web3 History</Text>
            <TouchableOpacity onPress={() => router.push('/manage_cards')}>
              <Text style={styles.seeAllText}>View Statement →</Text>
            </TouchableOpacity>
          </View>

          {/* REAL FILTER CHIPS (All, Only Received, Only Sent, Crypto) */}
          <View style={styles.filterChipsRow}>
            {[
              { id: 'all', label: 'All', icon: 'list' },
              { id: 'received', label: '🟢 Received', icon: 'arrow-down-circle' },
              { id: 'sent', label: '🔴 Sent', icon: 'arrow-up-circle' },
              { id: 'crypto', label: '🪙 Crypto Only', icon: 'logo-bitcoin' },
            ].map(chip => (
              <TouchableOpacity
                key={chip.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: txFilter === chip.id ? '#00E5FF' : theme.pillBg },
                  txFilter === chip.id && styles.filterChipActive,
                ]}
                onPress={() => setTxFilter(chip.id as any)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: txFilter === chip.id ? '#07090E' : theme.subText },
                    txFilter === chip.id && { fontWeight: '800' },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TRANSACTION LIST ITEMS */}
          <View style={[styles.txListWrapper, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            {filteredTransactions.length === 0 ? (
              <View style={styles.emptyFilterBox}>
                <Text style={[styles.emptyFilterText, { color: theme.subText }]}>No transactions in this filter.</Text>
              </View>
            ) : (
              filteredTransactions.map((tx, idx) => (
                <View
                  key={tx.id}
                  style={[
                    styles.transactionItem,
                    idx < filteredTransactions.length - 1 && { borderBottomColor: theme.cardBorder, borderBottomWidth: 1 },
                  ]}
                >
                  <View
                    style={[
                      styles.transactionIconContainer,
                      {
                        backgroundColor:
                          tx.type === 'received'
                            ? 'rgba(16, 185, 129, 0.12)'
                            : tx.type === 'crypto'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(239, 68, 68, 0.12)',
                      },
                    ]}
                  >
                    <Ionicons
                      name={tx.icon as any}
                      size={20}
                      color={
                        tx.type === 'received' ? '#10B981' : tx.type === 'crypto' ? '#F59E0B' : '#EF4444'
                      }
                    />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionName, { color: theme.text }]}>{tx.name}</Text>
                    <Text style={[styles.transactionCategory, { color: theme.subText }]}>
                      {tx.category} • {tx.bank}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color:
                            tx.type === 'received' || tx.type === 'crypto' ? '#10B981' : theme.text,
                        },
                      ]}
                    >
                      {tx.amount}
                    </Text>
                    <Text style={styles.txTimeText}>{tx.time}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 7. MODAL: ADD CRYPTO ACCOUNT / CONNECT WALLET */}
      <Modal visible={showAddCryptoModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: isDarkMode ? '#FFF' : '#0F172A' }]}>
                  Connect Web3 Account
                </Text>
                <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                  Add public wallet address for balance & fiat on-ramp
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddCryptoModal(false)} style={styles.closeModalBtn}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* CHAIN SELECTOR */}
            <Text style={styles.inputLabel}>Select Blockchain Network</Text>
            <View style={styles.chainRow}>
              {[
                { key: 'ETH', label: 'Ethereum (ERC-20)', icon: 'logo-bitcoin' },
                { key: 'SOL', label: 'Solana (SPL)', icon: 'flash' },
                { key: 'BTC', label: 'Bitcoin (SegWit)', icon: 'shield' },
              ].map(c => (
                <TouchableOpacity
                  key={c.key}
                  style={[
                    styles.chainBtn,
                    selectedChain === c.key && styles.chainBtnActive,
                  ]}
                  onPress={() => setSelectedChain(c.key as any)}
                >
                  <Text style={[styles.chainBtnText, selectedChain === c.key && { color: '#00E5FF' }]}>
                    {c.key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* WALLET ADDRESS INPUT */}
            <Text style={styles.inputLabel}>Public Address or ENS Name</Text>
            <View style={styles.modalInputWrapper}>
              <TextInput
                placeholder="e.g. 0x71C...3E4A or rahul.eth"
                placeholderTextColor="#64748B"
                value={walletAddressInput}
                onChangeText={setWalletAddressInput}
                style={[styles.modalInput, { color: isDarkMode ? '#FFF' : '#000' }]}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setWalletAddressInput('0x89A1b6F4938D82bC491024D9')}
                style={styles.pasteBtn}
              >
                <Text style={styles.pasteText}>Sample</Text>
              </TouchableOpacity>
            </View>

            {/* ALREADY CONNECTED WALLETS LIST */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Active Linked Wallets ({connectedWallets.length})</Text>
            {connectedWallets.map(w => (
              <View key={w.id} style={styles.linkedWalletItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="wallet-outline" size={18} color="#00E5FF" style={{ marginRight: 8 }} />
                  <View>
                    <Text style={{ color: isDarkMode ? '#FFF' : '#0F172A', fontWeight: '700', fontSize: 13 }}>
                      {w.name} ({w.chain})
                    </Text>
                    <Text style={{ color: '#94A3B8', fontSize: 11, fontFamily: 'monospace' }}>
                      {w.address}
                    </Text>
                  </View>
                </View>
                <Text style={{ color: '#10B981', fontWeight: '700', fontSize: 13 }}>{w.balance}</Text>
              </View>
            ))}

            {/* SAVE BUTTON */}
            <TouchableOpacity style={styles.confirmAddBtn} onPress={handleAddWallet}>
              <Text style={styles.confirmAddText}>Link Web3 Wallet</Text>
              <Ionicons name="checkmark-circle" size={18} color="#07090E" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 8. FIXED BOTTOM TAB BAR */}
      <View style={[styles.tabBar, { backgroundColor: theme.tabBg, borderTopColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={24} color="#00E5FF" />
          <Text style={[styles.tabLabel, { color: '#00E5FF' }]}>Super Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/crypto_portfolio')}>
          <Ionicons name="logo-bitcoin" size={24} color="#94A3B8" />
          <Text style={[styles.tabLabel, { color: theme.subText }]}>Web3</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/manage_cards')}>
          <Ionicons name="card-outline" size={24} color="#94A3B8" />
          <Text style={[styles.tabLabel, { color: theme.subText }]}>Cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/profile')}>
          <Ionicons name="person-outline" size={24} color="#94A3B8" />
          <Text style={[styles.tabLabel, { color: theme.subText }]}>Enclave</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  upiIdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  upiIdText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  upiVerified: {
    color: '#64748B',
    fontSize: 10,
    marginLeft: 4,
  },
  headerActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  themeToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatarButton: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00E5FF',
  },
  avatar: {
    width: 44,
    height: 44,
  },

  netWorthCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  netWorthTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  netWorthLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  netWorthAmount: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  growthText: {
    color: '#10B981',
    fontWeight: '800',
    fontSize: 11,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  breakdownText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  qrSearchBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },

  cardsSection: {
    marginVertical: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  manageAllText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    width: width * 0.78,
    height: 175,
    borderRadius: 22,
    padding: 18,
    marginRight: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBank: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  cardBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardBody: {
    marginVertical: 6,
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardNumber: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    letterSpacing: 1,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  expiresLabel: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 9,
    fontWeight: '700',
  },
  expiresText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  cryptoCard: {
    backgroundColor: '#0B1120',
    borderWidth: 1.5,
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  cryptoLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5FF',
    marginRight: 4,
  },
  cryptoLiveText: {
    color: '#00E5FF',
    fontSize: 9,
    fontWeight: '900',
  },

  addWalletCard: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addWalletIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  addWalletTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  addWalletSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 8,
  },

  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  actionButton: {
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
  actionLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  lendBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#07090E',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  lendBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  lendIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.25)',
  },
  lendBannerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  guestPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  guestPillText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
  },
  lendBannerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  lendBtnArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionContainer: {
    paddingHorizontal: 20,
    marginVertical: 12,
  },
  verifiedCountText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  documentIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  documentSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  verifiedDocBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  verifiedDocText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAllText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '700',
  },

  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipActive: {
    shadowColor: '#00E5FF',
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  txListWrapper: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  emptyFilterBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 14,
    fontWeight: '700',
  },
  transactionCategory: {
    fontSize: 11,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  txTimeText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  closeModalBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#1E293B',
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  chainRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chainBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chainBtnActive: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  chainBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  modalInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
  },
  pasteBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  pasteText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  linkedWalletItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  confirmAddBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00E5FF',
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 14,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  confirmAddText: {
    color: '#07090E',
    fontSize: 15,
    fontWeight: '900',
  },

  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingBottom: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: '600',
  },
});
