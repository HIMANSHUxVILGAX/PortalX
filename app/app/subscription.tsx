import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Pressable, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';

// Safe import — RevenueCat only works in native builds, not Expo Go or Web
let Purchases: any = null;
try {
  Purchases = require('react-native-purchases').default;
} catch (e) {
  // Native module not available (Expo Go / Web)
}

const REVENUECAT_API_KEY = Platform.select({
  android: 'goog_VVWOqfBJKHGQUNMwnBHaBmBZFYn',
  ios: 'appl_PASTE_YOUR_IOS_KEY_HERE',
  default: '',
});

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscription } = useAppStore();

  const handleBack = () => {
    router.back();
  };

  // Initialize RevenueCat SDK on mount (native builds only)
  useEffect(() => {
    if (!Purchases || Platform.OS === 'web') return;
    try {
      Purchases.configure({ apiKey: REVENUECAT_API_KEY });
    } catch (e) {
      console.warn('[RevenueCat] Configure failed:', e);
    }
  }, []);

  const handleRestore = async () => {
    if (!Purchases) {
      Alert.alert('Not Available', 'In-app purchases require a native build. Run: npx expo run:android');
      return;
    }
    try {
      await Purchases.restorePurchases();
      Alert.alert('Success', 'Purchases restored!');
    } catch (e) {
      Alert.alert('Error', 'Restore failed. Try again.');
    }
  };

  const handleSelectPlan = async (tier: string) => {
    if (tier === 'free') return;
    if (!Purchases) {
      Alert.alert('Not Available', 'In-app purchases require a native build. Run: npx expo run:android');
      return;
    }
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages[0];
      if (!pkg) {
        Alert.alert('No Packages', 'No packages found. Check RevenueCat dashboard.');
        return;
      }
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active['premium']) {
        useAppStore.getState().setSubscription?.({ ...subscription, tier: 'premium' as any });
        Alert.alert('Success', 'Premium unlocked! 🎉');
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Purchase Failed', e.message || 'Something went wrong.');
      }
    }
  };

  const currentTier = subscription?.tier || 'premium';

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PortelX Premium</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleRow}>
              <MaterialCommunityIcons name="shield-check" size={24} color="#00E5FF" />
              <Text style={styles.heroTitle}>{subscription?.name || 'Premium'}</Text>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>Active</Text>
            </View>
          </View>

          <Text style={styles.renewalText}>Renews Dec 2026</Text>

          <View style={styles.heroFooter}>
            <Text style={styles.managedText}>Managed by RevenueCat</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Available Plans</Text>

        {/* Free Plan */}
        <Pressable
          style={[styles.planCard, currentTier === 'free' && styles.activePlanCard]}
          onPress={() => handleSelectPlan('free')}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>Basic</Text>
            <Text style={styles.planPrice}>Free</Text>
          </View>
          {currentTier === 'free' && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>CURRENT PLAN</Text>
            </View>
          )}
          <View style={styles.featureList}>
            <FeatureItem text="Basic verification" />
            <FeatureItem text="Standard support" />
            <FeatureItem text="Limited checks" />
          </View>
        </Pressable>

        {/* Premium Plan */}
        <Pressable
          style={[styles.planCard, styles.premiumCard, currentTier === 'premium' && styles.activePlanCard]}
          onPress={() => handleSelectPlan('premium')}
        >
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: '#00E5FF' }]}>Premium</Text>
            <Text style={styles.planPrice}>$9.99<Text style={styles.pricePeriod}>/mo</Text></Text>
          </View>
          {currentTier === 'premium' && (
            <View style={styles.currentBadgeAccent}>
              <Text style={styles.currentBadgeTextAccent}>CURRENT PLAN</Text>
            </View>
          )}
          <View style={styles.featureList}>
            <FeatureItem text="Advanced identity verification" color="#00E5FF" />
            <FeatureItem text="Priority support 24/7" color="#00E5FF" />
            <FeatureItem text="Unlimited checks" color="#00E5FF" />
            <FeatureItem text="Detailed activity reports" color="#00E5FF" />
          </View>
        </Pressable>

        {/* Enterprise Plan */}
        <Pressable
          style={[styles.planCard, styles.enterpriseCard, currentTier === 'enterprise' && styles.activePlanCard]}
          onPress={() => handleSelectPlan('enterprise')}
        >
          <View style={styles.bestValueBadge}>
            <Text style={styles.bestValueText}>BEST VALUE</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={[styles.planName, { color: '#F59E0B' }]}>Enterprise</Text>
            <Text style={styles.planPrice}>$29.99<Text style={styles.pricePeriod}>/mo</Text></Text>
          </View>
          {currentTier === 'enterprise' && (
            <View style={styles.currentBadgeGold}>
              <Text style={styles.currentBadgeTextGold}>CURRENT PLAN</Text>
            </View>
          )}
          <View style={styles.featureList}>
            <FeatureItem text="Everything in Premium" color="#F59E0B" />
            <FeatureItem text="Dedicated account manager" color="#F59E0B" />
            <FeatureItem text="API access & webhooks" color="#F59E0B" />
            <FeatureItem text="Custom compliance rules" color="#F59E0B" />
          </View>
        </Pressable>

        {/* Bottom Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={handleRestore}>
            <Text style={styles.linkText}>Restore Purchases</Text>
          </TouchableOpacity>
          <View style={styles.dot} />
          <TouchableOpacity>
            <Text style={styles.linkText}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const FeatureItem = ({ text, color = '#64748B' }: { text: string, color?: string }) => (
  <View style={styles.featureItem}>
    <Ionicons name="checkmark-circle" size={20} color={color} style={styles.featureIcon} />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

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
    paddingBottom: 16,
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
    padding: 20,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
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
    gap: 8,
  },
  heroTitle: {
    fontSize: 22,
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
  renewalText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 20,
  },
  heroFooter: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 12,
  },
  managedText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  planCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  premiumCard: {
    borderColor: '#00E5FF',
    backgroundColor: '#0A1224',
  },
  enterpriseCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#121008',
    marginTop: 8, // Space for best value badge
  },
  activePlanCard: {
    borderWidth: 2,
  },
  bestValueBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  pricePeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: '#94A3B8',
  },
  currentBadge: {
    backgroundColor: '#1E293B',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  currentBadgeAccent: {
    backgroundColor: 'rgba(0, 229, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  currentBadgeTextAccent: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5FF',
    letterSpacing: 0.5,
  },
  currentBadgeGold: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  currentBadgeTextGold: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
    letterSpacing: 0.5,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    marginTop: 2,
  },
  featureText: {
    fontSize: 15,
    color: '#CBD5E1',
    flex: 1,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  linkText: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#475569',
  },
});
