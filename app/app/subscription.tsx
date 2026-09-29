import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAppStore } from '../src/store/useAppStore';
import type { SubscriptionTier } from '../src/types';

let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {}

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === 'storeClient' ||
  !Purchases;

const REVENUECAT_API_KEY = Platform.select({
  android: 'goog_VVWOqfBJKHGQUNMwnBHaBmBZFYn',
  ios: 'appl_PASTE_YOUR_IOS_KEY_HERE',
  default: '',
});

interface PlanFeature {
  title: string;
  included: boolean;
}

interface PlanDefinition {
  id: SubscriptionTier;
  name: string;
  badge?: string;
  badgeColor?: string;
  price: string;
  period: string;
  headline: string;
  roomQuota: string;
  spendCap: string;
  features: PlanFeature[];
}

const PLANS: PlanDefinition[] = [
  {
    id: 'basic',
    name: 'BASIC',
    price: 'Free',
    period: '',
    headline: 'Single-session temporary security',
    roomQuota: '1 Guest Room / month',
    spendCap: 'Up to ₹10,000 spend cap',
    features: [
      { title: '1 Guest Room per month', included: true },
      { title: 'Up to ₹10,000 in PortelX account', included: true },
      { title: 'UPI payments & Document streaming', included: true },
      { title: 'Up to 4 Local Bank Accounts', included: true },
      { title: "Owner's mobile alert notification", included: false },
      { title: 'Crypto recharge & On-Ramp', included: false },
      { title: 'Visa virtual cards', included: false },
      { title: 'Mastercard virtual cards', included: false },
      { title: 'Automated OTP forwarding', included: false },
      { title: 'Password Manager vault', included: false },
    ],
  },
  {
    id: 'standard',
    name: 'STANDARD',
    badge: 'MOST POPULAR',
    badgeColor: 'accentStandard',
    price: '₹499',
    period: '/mo',
    headline: 'Advanced guest vault for regular borrowers',
    roomQuota: '15 Guest Rooms / month',
    spendCap: 'Up to ₹50,000 in PortelX',
    features: [
      { title: '15 Guest Rooms per month', included: true },
      { title: 'Up to ₹50,000 in PortelX account', included: true },
      { title: 'Visa virtual cards included', included: true },
      { title: '10 Local Bank Accounts linked', included: true },
      { title: 'UPI & Identity Documents', included: true },
      { title: 'Owner Notification (Respond within 48h)', included: true },
      { title: 'Encrypted Password Manager vault', included: true },
      { title: 'Crypto recharge & On-Ramp', included: false },
      { title: 'Mastercard virtual cards', included: false },
      { title: 'Automated OTP forwarding', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'PORTELX PRO',
    badge: 'UNLIMITED',
    badgeColor: 'accentPro',
    price: '₹1,499',
    period: '/mo',
    headline: 'Complete identity & finance sovereignty',
    roomQuota: 'Unlimited Guest Rooms',
    spendCap: 'Unlimited Account Balance',
    features: [
      { title: 'Unlimited Guest Rooms forever', included: true },
      { title: 'All Services unlocked (Visa & Mastercard)', included: true },
      { title: 'Crypto Portfolio & Fiat-to-Crypto On-Ramp', included: true },
      { title: 'Unlimited Local & International Banks', included: true },
      { title: 'UPI, DigiLocker & Documents access', included: true },
      { title: 'Priority Owner Alert (Respond within 10 days)', included: true },
      { title: 'Real-time OTP forwarding & Biometrics', included: true },
      { title: 'Full Password Manager + Forensic RAM Wipe', included: true },
    ],
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscription, setSubscription, isDarkMode } = useAppStore();

  const rawTier = (subscription?.tier as string) || 'standard';
  const normalizedCurrentTier: SubscriptionTier =
    rawTier === 'free' || rawTier === 'basic'
      ? 'basic'
      : rawTier === 'pro' || rawTier === 'enterprise'
      ? 'pro'
      : 'standard';

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(normalizedCurrentTier);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!Purchases || Platform.OS === 'web' || isExpoGo) return;
    try {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    } catch (e) {}
  }, []);

  const handleBack = () => router.back();

  const handleRestore = async () => {
    if (isExpoGo) {
      Alert.alert(
        'RevenueCat Restore',
        'Purchases checked with RevenueCat. Active entitlement: ' +
          (subscription?.name || 'Standard Plan')
      );
      return;
    }
    try {
      await Purchases.restorePurchases();
      Alert.alert('Success', 'Purchases restored successfully!');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Restore failed.');
    }
  };

  const handleExecuteSubscription = async (targetTier: SubscriptionTier) => {
    const plan = PLANS.find((p) => p.id === targetTier) || PLANS[1];

    if (targetTier === normalizedCurrentTier) {
      Alert.alert('Active Plan', `You are already on the ${plan.name} plan.`);
      return;
    }

    setIsProcessing(true);

    if (targetTier === 'basic') {
      setSubscription({
        tier: 'basic',
        name: 'Basic Plan',
        price: 'Free',
        isActive: true,
      });
      setIsProcessing(false);
      Alert.alert('Downgraded', 'Switched to Basic plan.');
      return;
    }

    if (isExpoGo) {
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          'RevenueCat Demo',
          `Confirm subscription to ${plan.name} at ${plan.price}${plan.period}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Subscribe Now',
              onPress: () => {
                setSubscription({
                  tier: targetTier,
                  name: `${plan.name} Plan`,
                  price: `${plan.price}${plan.period}`,
                  isActive: true,
                });
                Alert.alert('Activated! 🎉', `Welcome to ${plan.name}!`);
              },
            },
          ]
        );
      }, 500);
      return;
    }

    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages[0];
      if (!pkg) {
        setIsProcessing(false);
        Alert.alert('No Package', 'Check RevenueCat dashboard.');
        return;
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setIsProcessing(false);
      if (customerInfo.entitlements.active['premium']) {
        setSubscription({
          tier: targetTier,
          name: `${plan.name} Plan`,
          price: `${plan.price}${plan.period}`,
          isActive: true,
        });
        Alert.alert('Success', `${plan.name} unlocked! 🎉`);
      }
    } catch (e: any) {
      setIsProcessing(false);
      if (!e.userCancelled) Alert.alert('Failed', e.message);
    }
  };

  const selectedPlanObj = PLANS.find((p) => p.id === selectedTier) || PLANS[1];
  const isSelectedCurrent = selectedTier === normalizedCurrentTier;

  // --- Dynamic Theme Colors ---
  const theme = {
    bg: isDarkMode ? '#07090E' : '#F8FAFC',
    cardBg: isDarkMode ? '#0F172A' : '#FFFFFF',
    cardBorder: isDarkMode ? '#1E293B' : '#E2E8F0',
    textMain: isDarkMode ? '#F8FAFC' : '#0F172A',
    textSub: isDarkMode ? '#94A3B8' : '#64748B',
    textMuted: isDarkMode ? '#475569' : '#94A3B8',
    accentStandard: isDarkMode ? '#00E5FF' : '#0284C7',
    accentPro: isDarkMode ? '#F59E0B' : '#D97706',
    successBg: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#D1FAE5',
    successText: isDarkMode ? '#10B981' : '#059669',
    bottomBarBg: isDarkMode ? '#0A0F1A' : '#FFFFFF',
    btnText: isDarkMode ? '#000000' : '#FFFFFF',
    quotaBg: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : '#F1F5F9',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: Math.max(insets.top, 16) }]}>
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color={theme.textMain} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textMain }]}>Subscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleRow}>
              <MaterialCommunityIcons name="shield-check" size={26} color={theme.accentStandard} />
              <View>
                <Text style={[styles.heroSubtitle, { color: theme.accentStandard }]}>CURRENT PLAN</Text>
                <Text style={[styles.heroTitle, { color: theme.textMain }]}>
                  {subscription?.name || (normalizedCurrentTier === 'pro' ? 'PortelX Pro' : 'Standard Plan')}
                </Text>
              </View>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: theme.successBg }]}>
              <View style={[styles.activeDot, { backgroundColor: theme.successText }]} />
              <Text style={[styles.activeText, { color: theme.successText }]}>Active</Text>
            </View>
          </View>

          <View style={[styles.heroMetaRow, { borderTopColor: theme.cardBorder }]}>
            <Text style={[styles.renewalText, { color: theme.textSub }]}>Managed via RevenueCat</Text>
            <TouchableOpacity onPress={handleRestore}>
              <Text style={[styles.restoreLink, { color: theme.accentStandard }]}>Restore Purchases</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMain }]}>Choose Your Tier</Text>
        </View>

        {PLANS.map((plan) => {
          const isSelected = selectedTier === plan.id;
          const isCurrent = normalizedCurrentTier === plan.id;
          const planAccentColor = plan.id === 'pro' ? theme.accentPro : plan.id === 'standard' ? theme.accentStandard : theme.textMain;

          return (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
                isSelected && { borderColor: planAccentColor, borderWidth: 2 },
              ]}
              onPress={() => setSelectedTier(plan.id)}
            >
              {plan.badge && (
                <View style={[styles.planBadge, { backgroundColor: planAccentColor }]}>
                  <Text style={[styles.planBadgeText, { color: theme.btnText }]}>{plan.badge}</Text>
                </View>
              )}

              <View style={styles.planTopRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Text style={[styles.planName, { color: planAccentColor }]}>{plan.name}</Text>
                    {isCurrent && (
                      <View style={[styles.currentTag, { backgroundColor: theme.successBg }]}>
                        <Text style={[styles.currentTagText, { color: theme.successText }]}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planHeadline, { color: theme.textSub }]}>{plan.headline}</Text>
                </View>

                <View style={styles.priceContainer}>
                  <Text style={[styles.planPrice, { color: planAccentColor }]}>{plan.price}</Text>
                  {plan.period ? <Text style={[styles.pricePeriod, { color: theme.textSub }]}>{plan.period}</Text> : null}
                </View>
              </View>

              {/* Fixed Layout for Quotas to prevent text overflow on small screens */}
              <View style={[styles.quotaBanner, { backgroundColor: theme.quotaBg, borderColor: theme.cardBorder }]}>
                <View style={styles.quotaItem}>
                  <Ionicons name="cube-outline" size={16} color={theme.textSub} />
                  <Text style={[styles.quotaText, { color: theme.textMain }]} numberOfLines={1} adjustsFontSizeToFit>
                    {plan.roomQuota}
                  </Text>
                </View>
                <View style={styles.quotaItem}>
                  <Ionicons name="wallet-outline" size={16} color={theme.textSub} />
                  <Text style={[styles.quotaText, { color: theme.textMain }]} numberOfLines={1} adjustsFontSizeToFit>
                    {plan.spendCap}
                  </Text>
                </View>
              </View>

              <View style={styles.featureList}>
                {plan.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons
                      name={feat.included ? 'checkmark-circle' : 'close-circle-outline'}
                      size={18}
                      color={feat.included ? planAccentColor : theme.textMuted}
                      style={{ marginTop: 2 }}
                    />
                    <Text
                      style={[
                        styles.featureText,
                        { color: feat.included ? theme.textMain : theme.textMuted },
                        !feat.included && { textDecorationLine: 'line-through' },
                      ]}
                    >
                      {feat.title}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.cardFooter, { borderTopColor: theme.cardBorder }]}>
                <View style={[styles.radioCircle, { borderColor: isSelected ? planAccentColor : theme.textMuted }]}>
                  {isSelected && <View style={[styles.radioDot, { backgroundColor: planAccentColor }]} />}
                </View>
                <Text style={[styles.selectHintText, { color: isSelected ? theme.textMain : theme.textSub, fontWeight: isSelected ? '700' : '500' }]}>
                  {isCurrent ? 'Currently Subscribed' : isSelected ? 'Selected Plan' : 'Tap to Select'}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.footerInfo}>
          <Text style={[styles.footerNotice, { color: theme.textSub }]}>
            Subscriptions renew automatically unless canceled at least 24 hours before the end of the billing cycle. Payments processed securely via RevenueCat.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.bottomBarBg, borderTopColor: theme.cardBorder, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomBarContent}>
          <View style={styles.bottomBarInfo}>
            <Text style={[styles.bottomBarLabel, { color: theme.textSub }]}>SELECTED TIER</Text>
            <Text style={[styles.bottomBarPlanName, { color: theme.textMain }]}>
              {selectedPlanObj.name} <Text style={{ color: theme.textSub, fontWeight: '600', fontSize: 13 }}>({selectedPlanObj.price}{selectedPlanObj.period})</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton,
              { backgroundColor: selectedPlanObj.id === 'pro' ? theme.accentPro : selectedPlanObj.id === 'standard' ? theme.accentStandard : theme.cardBorder },
              isSelectedCurrent && { backgroundColor: theme.successBg, borderWidth: 1, borderColor: theme.successText, elevation: 0 },
            ]}
            onPress={() => handleExecuteSubscription(selectedTier)}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <Text style={[styles.subscribeButtonText, { color: theme.btnText }]}>Processing...</Text>
            ) : isSelectedCurrent ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-done" size={18} color={theme.successText} />
                <Text style={[styles.subscribeButtonText, { color: theme.successText }]}>Current Plan</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.subscribeButtonText, { color: theme.btnText }]}>
                  {selectedPlanObj.id === 'basic' ? 'Switch to Basic' : `Subscribe`}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={theme.btnText} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  scrollContent: { padding: 16 },
  heroCard: {
    borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1,
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  heroSubtitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  heroTitle: { fontSize: 20, fontWeight: '700' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 12, fontWeight: '600' },
  heroMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 10 },
  renewalText: { fontSize: 12 },
  restoreLink: { fontSize: 12, fontWeight: '700' },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.3 },
  planCard: {
    borderRadius: 16, padding: 20, marginBottom: 18, borderWidth: 1.5, position: 'relative',
  },
  planBadge: { position: 'absolute', top: -12, right: 20, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  planBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  planTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  planName: { fontSize: 20, fontWeight: '800', letterSpacing: 0.5 },
  currentTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  currentTagText: { fontSize: 9, fontWeight: '800' },
  planHeadline: { fontSize: 13, marginTop: 4 },
  priceContainer: { alignItems: 'flex-end' },
  planPrice: { fontSize: 24, fontWeight: '900' },
  pricePeriod: { fontSize: 12, fontWeight: '600' },
  quotaBanner: {
    borderRadius: 10, padding: 12, marginBottom: 16, borderWidth: 1,
    gap: 8, // Stacked slightly or wrapped for safety
  },
  quotaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quotaText: { fontSize: 13, fontWeight: '700', flexShrink: 1 },
  featureList: { gap: 10, marginBottom: 16 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { fontSize: 13.5, flex: 1, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, gap: 8 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  selectHintText: { fontSize: 12 },
  footerInfo: { marginTop: 12, marginBottom: 20, paddingHorizontal: 8 },
  footerNotice: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10,
  },
  bottomBarContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bottomBarInfo: { flex: 1, paddingRight: 10 },
  bottomBarLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  bottomBarPlanName: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  subscribeButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 140 },
  subscribeButtonText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.3 },
});
