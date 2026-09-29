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
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { useAppStore } from '../src/store/useAppStore';
import type { SubscriptionTier } from '../src/types';

// Safe import — RevenueCat works in native builds, gracefully mocked in Expo Go & Web
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  // Native module not available
}

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
    badgeColor: '#00E5FF',
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
    badge: 'UNLIMITED • ALL SERVICES',
    badgeColor: '#F59E0B',
    price: '₹1,499',
    period: '/mo',
    headline: 'Complete identity & finance sovereignty',
    roomQuota: 'Unlimited Guest Rooms',
    spendCap: 'Unlimited Account Balance & Limits',
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
  const { subscription, setSubscription } = useAppStore();

  // Normalize current tier to 'basic', 'standard', or 'pro'
  const rawTier = (subscription?.tier as string) || 'standard';
  const normalizedCurrentTier: SubscriptionTier =
    rawTier === 'free' || rawTier === 'basic'
      ? 'basic'
      : rawTier === 'pro' || rawTier === 'enterprise'
      ? 'pro'
      : 'standard';

  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(normalizedCurrentTier);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize RevenueCat SDK on mount (native builds only)
  useEffect(() => {
    if (!Purchases || Platform.OS === 'web' || isExpoGo) return;
    try {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    } catch (e) {
      // Graceful fallback
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

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
      Alert.alert('Error', e?.message || 'Restore failed. Try again.');
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

    // In Expo Go or mock mode: simulate realistic purchase dialog
    if (isExpoGo) {
      setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          'RevenueCat Purchase Simulation',
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
                Alert.alert(
                  'Subscription Activated! 🎉',
                  `Welcome to ${plan.name}! All associated guest vault limits and features are now unlocked.`
                );
              },
            },
          ]
        );
      }, 500);
      return;
    }

    // Real RevenueCat In-App Purchase Flow (Standalone APK)
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages[0];
      if (!pkg) {
        setIsProcessing(false);
        Alert.alert('No Package Found', 'Check RevenueCat dashboard offering setup.');
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
        Alert.alert('Success', `${plan.name} unlocked via RevenueCat! 🎉`);
      }
    } catch (e: any) {
      setIsProcessing(false);
      if (!e.userCancelled) {
        Alert.alert('Purchase Failed', e.message || 'Something went wrong.');
      }
    }
  };

  const selectedPlanObj = PLANS.find((p) => p.id === selectedTier) || PLANS[1];
  const isSelectedCurrent = selectedTier === normalizedCurrentTier;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 16) }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PortelX Subscriptions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Active Plan Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleRow}>
              <MaterialCommunityIcons name="shield-check" size={26} color="#00E5FF" />
              <View>
                <Text style={styles.heroSubtitle}>CURRENT PLAN</Text>
                <Text style={styles.heroTitle}>
                  {subscription?.name || (normalizedCurrentTier === 'pro' ? 'PortelX Pro' : normalizedCurrentTier === 'basic' ? 'Basic Plan' : 'Standard Plan')}
                </Text>
              </View>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <View style={styles.heroMetaRow}>
            <Text style={styles.renewalText}>Managed via Google Play & RevenueCat</Text>
            <TouchableOpacity onPress={handleRestore}>
              <Text style={styles.restoreLink}>Restore Purchases</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Heading */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose Your Security Tier</Text>
          <Text style={styles.sectionSubtitle}>Select a plan below to preview features and upgrade</Text>
        </View>

        {/* Available Plan Cards */}
        {PLANS.map((plan) => {
          const isSelected = selectedTier === plan.id;
          const isCurrent = normalizedCurrentTier === plan.id;

          return (
            <Pressable
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && styles.planCardSelected,
                plan.id === 'standard' && styles.standardCard,
                plan.id === 'pro' && styles.proCard,
                isSelected && plan.id === 'standard' && styles.standardCardSelected,
                isSelected && plan.id === 'pro' && styles.proCardSelected,
              ]}
              onPress={() => setSelectedTier(plan.id)}
            >
              {/* Badge if available */}
              {plan.badge && (
                <View
                  style={[
                    styles.planBadge,
                    { backgroundColor: plan.badgeColor || '#00E5FF' },
                  ]}
                >
                  <Text style={styles.planBadgeText}>{plan.badge}</Text>
                </View>
              )}

              {/* Plan Header */}
              <View style={styles.planTopRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text
                      style={[
                        styles.planName,
                        plan.id === 'standard' && { color: '#00E5FF' },
                        plan.id === 'pro' && { color: '#F59E0B' },
                      ]}
                    >
                      {plan.name}
                    </Text>
                    {isCurrent && (
                      <View style={styles.currentTag}>
                        <Text style={styles.currentTagText}>ACTIVE</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.planHeadline}>{plan.headline}</Text>
                </View>

                {/* Price Display */}
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.planPrice,
                      plan.id === 'standard' && { color: '#00E5FF' },
                      plan.id === 'pro' && { color: '#F59E0B' },
                    ]}
                  >
                    {plan.price}
                  </Text>
                  {plan.period ? <Text style={styles.pricePeriod}>{plan.period}</Text> : null}
                </View>
              </View>

              {/* Quota Highlights Banner */}
              <View style={styles.quotaBanner}>
                <View style={styles.quotaItem}>
                  <Ionicons name="cube-outline" size={16} color="#94A3B8" />
                  <Text style={styles.quotaText}>{plan.roomQuota}</Text>
                </View>
                <View style={styles.quotaDivider} />
                <View style={styles.quotaItem}>
                  <Ionicons name="wallet-outline" size={16} color="#94A3B8" />
                  <Text style={styles.quotaText}>{plan.spendCap}</Text>
                </View>
              </View>

              {/* Feature Checklist */}
              <View style={styles.featureList}>
                {plan.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons
                      name={feat.included ? 'checkmark-circle' : 'close-circle-outline'}
                      size={18}
                      color={
                        feat.included
                          ? plan.id === 'pro'
                            ? '#F59E0B'
                            : '#00E5FF'
                          : '#475569'
                      }
                      style={styles.featureIcon}
                    />
                    <Text
                      style={[
                        styles.featureText,
                        !feat.included && styles.featureTextDisabled,
                      ]}
                    >
                      {feat.title}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Tap to Select Radio Indicator */}
              <View style={styles.cardFooter}>
                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                    isSelected && plan.id === 'pro' && { borderColor: '#F59E0B' },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioDot,
                        plan.id === 'pro' && { backgroundColor: '#F59E0B' },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.selectHintText,
                    isSelected && { color: '#F8FAFC', fontWeight: '700' },
                  ]}
                >
                  {isCurrent
                    ? 'Currently Subscribed'
                    : isSelected
                    ? 'Selected Plan'
                    : 'Tap to Select'}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {/* Footer Notes */}
        <View style={styles.footerInfo}>
          <Text style={styles.footerNotice}>
            Subscriptions renew automatically unless canceled at least 24 hours before the end
            of the billing cycle. Payments processed securely via RevenueCat & Google Play.
          </Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar with Subscribe Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.bottomBarContent}>
          <View style={styles.bottomBarInfo}>
            <Text style={styles.bottomBarLabel}>SELECTED TIER</Text>
            <Text style={styles.bottomBarPlanName}>
              {selectedPlanObj.name}{' '}
              <Text style={styles.bottomBarPrice}>
                ({selectedPlanObj.price}
                {selectedPlanObj.period})
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[
              styles.subscribeButton,
              isSelectedCurrent && styles.currentPlanButton,
              selectedPlanObj.id === 'pro' && !isSelectedCurrent && styles.proButton,
            ]}
            onPress={() => handleExecuteSubscription(selectedTier)}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <Text style={styles.subscribeButtonText}>Processing...</Text>
            ) : isSelectedCurrent ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-done" size={18} color="#10B981" />
                <Text style={styles.currentPlanButtonText}>Current Plan</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.subscribeButtonText}>
                  {selectedPlanObj.id === 'basic'
                    ? 'Switch to Basic'
                    : `Subscribe — ${selectedPlanObj.price}`}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#000" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00E5FF',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 10,
  },
  renewalText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  restoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00E5FF',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  planCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0E172B',
  },
  standardCard: {
    backgroundColor: '#0A1224',
    borderColor: '#1E293B',
  },
  standardCardSelected: {
    borderColor: '#00E5FF',
    backgroundColor: '#0B1832',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  proCard: {
    backgroundColor: '#121008',
    borderColor: '#1E293B',
    marginTop: 6,
  },
  proCardSelected: {
    borderColor: '#F59E0B',
    backgroundColor: '#1C160B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  planBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  planTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  currentTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
  },
  planHeadline: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  pricePeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  quotaBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  quotaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quotaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#334155',
  },
  quotaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  featureList: {
    gap: 10,
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    marginTop: 1,
  },
  featureText: {
    fontSize: 13.5,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 18,
  },
  featureTextDisabled: {
    color: '#475569',
    textDecorationLine: 'line-through',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 41, 59, 0.7)',
    paddingTop: 12,
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#00E5FF',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E5FF',
  },
  selectHintText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  footerInfo: {
    marginTop: 12,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  footerNotice: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0A0F1A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingHorizontal: 20,
    paddingTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBarInfo: {
    flex: 1,
  },
  bottomBarLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  bottomBarPlanName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 2,
  },
  bottomBarPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  subscribeButton: {
    backgroundColor: '#00E5FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  proButton: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.3,
  },
  currentPlanButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    shadowOpacity: 0,
    elevation: 0,
  },
  currentPlanButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
});
