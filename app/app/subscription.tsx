import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { subscription } = useAppStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderCard = (
    title: string,
    price: string,
    features: string[],
    isPremium: boolean,
    isBundle: boolean,
    tierId: string
  ) => {
    const isActive = subscription?.tier === tierId;

    let borderColor = '#334155';
    let badge = null;

    if (isPremium) {
      borderColor = '#00E5FF';
      badge = 'MOST POPULAR';
    }
    if (isBundle) {
      borderColor = '#F59E0B';
      badge = 'BEST VALUE';
    }

    return (
      <View style={[styles.card, { borderColor }]}>
        {badge && (
          <View style={[styles.badgeContainer, { backgroundColor: borderColor }]}>
            <Text style={[styles.badgeText, isBundle && { color: '#07090E' }]}>{badge}</Text>
          </View>
        )}
        
        <View style={styles.cardHeader}>
          <Text style={styles.planTitle}>{title}</Text>
          {isActive && (
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>Current Plan</Text>
            </View>
          )}
        </View>

        <Text style={styles.price}>{price}</Text>

        <View style={styles.featuresList}>
          {features.map((ft, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={isBundle ? '#F59E0B' : isPremium ? '#00E5FF' : '#94A3B8'} />
              <Text style={styles.featureText}>{ft}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[
            styles.subscribeBtn, 
            isActive && styles.subscribeBtnActive,
            isBundle && !isActive && { backgroundColor: '#F59E0B' }
          ]}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.subscribeBtnText, 
            isBundle && !isActive && { color: '#07090E' },
            isActive && { color: '#CBD5E1' }
          ]}>
            {isActive ? 'Current Plan' : 'Subscribe'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#00E5FF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PORTELX PLANS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {renderCard(
            'Free Tier',
            '₹0/month',
            [
              '3 guest sessions/month',
              'Basic AI risk scoring',
              'Standard encryption'
            ],
            false,
            false,
            'free'
          )}

          {renderCard(
            'Premium',
            '₹499/month',
            [
              'Unlimited guest sessions',
              'Priority AI risk scoring',
              'Real-time FCM alerts',
              'Sovereign doc streaming'
            ],
            true,
            false,
            'premium'
          )}

          {renderCard(
            'Bundle',
            '₹999/month',
            [
              'Everything in Premium',
              'Enterprise fleet management',
              'SIEM log integration',
              'Dedicated 24/7 support'
            ],
            false,
            true,
            'bundle'
          )}

          <TouchableOpacity style={styles.restoreBtn}>
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    marginBottom: 24,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#07090E',
    letterSpacing: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  activePill: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  activePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  price: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F8FAFC',
    marginBottom: 24,
  },
  featuresList: {
    gap: 12,
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 15,
    color: '#CBD5E1',
    marginLeft: 12,
    fontWeight: '500',
  },
  subscribeBtn: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  subscribeBtnActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#07090E',
  },
  restoreBtn: {
    alignItems: 'center',
    marginTop: 10,
  },
  restoreText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
});
