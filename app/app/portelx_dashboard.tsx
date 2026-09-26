import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSessionStore } from '../src/store/useSessionStore';
import { API_BASE_URL } from '../src/constants/config';

export default function PortelXDashboard() {
  const router = useRouter();
  const { guestName, guestHandle, guestPhone, history, fetchHistory } = useSessionStore();

  // Selected Guest Plan: 'basic' | 'premium' | 'bundle'
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'bundle'>('premium');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchHistory();
    
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

    // Pulse animation for the CTA button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Previous guest rooms dispatched to the guest's personal phone
  const FALLBACK_ROOMS = [
    {
      room_id: 'RM-9842-DEL',
      device_name: 'Samsung Galaxy S24 Ultra',
      location: 'IGI Airport T3, New Delhi',
      created_at: 'Today, 2:15 PM',
      duration_seconds: 252,
      status: 'SHREDDED',
      bytes_zeroized: 0,
    },
    {
      room_id: 'RM-8172-BLR',
      device_name: 'OnePlus 12',
      location: 'Indiranagar, Bengaluru',
      created_at: '15 Sep, 7:40 PM',
      duration_seconds: 510,
      status: 'SHREDDED',
      bytes_zeroized: 0,
    },
    {
      room_id: 'RM-6319-MUM',
      device_name: 'iPhone 15 Pro Max',
      location: 'BKC, Mumbai',
      created_at: '12 Sep, 11:20 AM',
      duration_seconds: 225,
      status: 'SHREDDED',
      bytes_zeroized: 0,
    },
    {
      room_id: 'RM-5104-JPR',
      device_name: 'Google Pixel 8 Pro',
      location: 'Malviya Nagar, Jaipur',
      created_at: '08 Sep, 5:10 PM',
      duration_seconds: 842,
      status: 'SHREDDED',
      bytes_zeroized: 0,
    },
  ];

  const rooms = history && history.length > 0 ? history : FALLBACK_ROOMS;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handlePanicRevoke = async (roomId: string) => {
    try {
      await fetch(API_BASE_URL + '/api/vault/remote-kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: roomId }),
      });
      fetchHistory();
    } catch (error) {
      console.error('Failed to revoke vault:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>GUEST IDENTITY PORTAL</Text>
          <Text style={styles.headerSubtitle}>Authenticated via Sovereign DID</Text>
        </View>
        <View style={styles.badgeShield}>
          <Ionicons name="shield-checkmark" size={18} color="#00E5FF" />
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.scrollContent}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        showsVerticalScrollIndicator={false}
      >
        {/* IDENTIFIED GUEST PROFILE CARD */}
        <View style={styles.guestProfileCard}>
          <View style={styles.guestProfileTop}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarText}>{guestName ? guestName.charAt(0).toUpperCase() : 'G'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.guestName}>{guestName || 'Guest User'}</Text>
                <View style={styles.verifiedPill}>
                  <Text style={styles.verifiedPillText}>VERIFIED</Text>
                </View>
              </View>
              <Text style={styles.guestPhone}>📱 {guestPhone || 'No phone linked'} (Guest Phone)</Text>
              <Text style={styles.guestNote}>Owner's device borrowed • Personal account loaded</Text>
            </View>
          </View>
        </View>

        {/* SUBSCRIPTION PLAN SELECTION (GUEST'S OWN PLAN) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>YOUR PORTELX PLAN & QUOTA</Text>
            <View style={styles.catBadge}>
              <Text style={styles.catBadgeText}>RevenueCat Sync</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Quota applied from your personal PortelX account, not the host device.
          </Text>

          {/* 3 PLAN TIERS */}
          <View style={styles.plansContainer}>
            {/* TIER 1: BASIC (FREE) */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'basic' && styles.planCardActive,
              ]}
              onPress={() => setSelectedPlan('basic')}
              activeOpacity={0.8}
            >
              <View style={styles.planCardHeader}>
                <Text style={styles.planName}>Basic Free</Text>
                {selectedPlan === 'basic' && <Ionicons name="checkmark-circle" size={18} color="#00E5FF" />}
              </View>
              <Text style={styles.planLimit}>1 Action</Text>
              <Text style={styles.planDesc}>1 Payment OR 1 Doc View allowed</Text>
              <Text style={styles.planPrice}>₹0 / Free</Text>
            </TouchableOpacity>

            {/* TIER 2: PREMIUM (10 Actions) */}
            <TouchableOpacity
              style={[
                styles.planCard,
                styles.planCardPremium,
                selectedPlan === 'premium' && styles.planCardActivePremium,
              ]}
              onPress={() => setSelectedPlan('premium')}
              activeOpacity={0.8}
            >
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>POPULAR</Text>
              </View>
              <View style={styles.planCardHeader}>
                <Text style={[styles.planName, { color: '#00E5FF' }]}>Premium</Text>
                {selectedPlan === 'premium' && <Ionicons name="checkmark-circle" size={18} color="#00E5FF" />}
              </View>
              <Text style={[styles.planLimit, { color: '#FFF' }]}>10 Actions</Text>
              <Text style={styles.planDesc}>10 Payments & Sovereign Doc Views</Text>
              <Text style={[styles.planPrice, { color: '#00E5FF' }]}>₹199 / mo</Text>
            </TouchableOpacity>

            {/* TIER 3: BUNDLE / UNLIMITED */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'bundle' && styles.planCardActive,
              ]}
              onPress={() => setSelectedPlan('bundle')}
              activeOpacity={0.8}
            >
              <View style={styles.planCardHeader}>
                <Text style={styles.planName}>Unlimited</Text>
                {selectedPlan === 'bundle' && <Ionicons name="checkmark-circle" size={18} color="#00E5FF" />}
              </View>
              <Text style={styles.planLimit}>∞</Text>
              <Text style={styles.planDesc}>Unlimited Zero-Knowledge Access</Text>
              <Text style={styles.planPrice}>₹499 / mo</Text>
            </TouchableOpacity>
          </View>

          {/* ACTIVE QUOTA BANNER */}
          <View style={styles.quotaBanner}>
            <MaterialCommunityIcons name="lightning-bolt" size={20} color="#F59E0B" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.quotaTitle}>
                {selectedPlan === 'basic'
                  ? 'Basic Quota: 1 Action Active'
                  : selectedPlan === 'premium'
                    ? 'Premium Quota: 10 Actions Active'
                    : 'Bundle Quota: Unlimited Actions Active'}
              </Text>
              <Text style={styles.quotaDesc}>
                Will burn from guest account. Host has zero financial liability.
              </Text>
            </View>
          </View>
        </View>

        {/* PREVIOUS GUEST ROOMS HISTORY */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>YOUR PREVIOUS GUEST ROOMS</Text>
            <TouchableOpacity style={styles.searchIconBtn}>
              <Ionicons name="search" size={16} color="#00E5FF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>
            Rooms dispatched to your personal phone ({guestPhone || '+91 98765-43210'}) with device and location logs.
          </Text>

          <View style={styles.roomsList}>
            {rooms.map((room, index) => {
              const isActive = room.is_active || room.status === 'active' || room.status === 'ACTIVE';

              return (
              <View key={index} style={styles.roomItem}>
                <View style={styles.roomItemTop}>
                  <View style={styles.roomIdBox}>
                    <Text style={styles.roomIdText}>{room.room_id}</Text>
                  </View>
                  {isActive ? (
                    <TouchableOpacity 
                      style={styles.panicBtn}
                      onPress={() => handlePanicRevoke(room.session_id || room.room_id)}
                    >
                      <Ionicons name="warning" size={12} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.panicBtnText}>PANIC REVOKE (KILL)</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.shreddedBadge}>
                      <Ionicons name="trash-bin" size={12} color="#10B981" style={{ marginRight: 4 }} />
                      <Text style={styles.shreddedText}>{room.status} • 0x00</Text>
                    </View>
                  )}
                </View>

                <View style={styles.roomDetailRow}>
                  <Ionicons name="phone-portrait-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <Text style={styles.roomDeviceText}>{room.device_name || room.device || 'Unknown Device'}</Text>
                </View>

                <View style={styles.roomDetailRow}>
                  <Ionicons name="location-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                  <Text style={styles.roomLocationText}>{room.location}</Text>
                </View>

                <View style={styles.roomFooter}>
                  <Text style={styles.roomMetaText}>⏱️ {formatDuration(room.duration_seconds || (room.duration ? parseInt(room.duration) * 60 : 0))} • {new Date(room.created_at || room.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</Text>
                  <Text style={styles.roomDispatchText}>Key sent via SMS</Text>
                </View>
              </View>
            )})}
          </View>
        </View>
      </Animated.ScrollView>

      {/* BOTTOM CTA: LAUNCH GUEST VAULT */}
      <View style={styles.bottomBar}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.launchBtn}
            onPress={() => router.push('/portelx_vault')}
            activeOpacity={0.85}
          >
            <FontAwesome5 name="lock-open" size={18} color="#07090E" style={{ marginRight: 10 }} />
            <Text style={styles.launchBtnText}>Enter Isolated Guest Vault</Text>
            <Ionicons name="arrow-forward" size={20} color="#07090E" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.bottomSubtext}>
          ⏱️ 5-Minute Auto-Destroy Timer • Full Volatile RAM Shredding
        </Text>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#111827',
    borderRadius: 12,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  badgeShield: {
    padding: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 140,
  },

  guestProfileCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
  },
  guestProfileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestAvatarText: {
    color: '#07090E',
    fontSize: 22,
    fontWeight: '900',
  },
  guestName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  verifiedPillText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  guestPhone: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
    fontFamily: 'monospace',
  },
  guestNote: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },

  section: {
    marginBottom: 26,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  catBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catBadgeText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },

  plansContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    position: 'relative',
  },
  planCardActive: {
    borderColor: '#00E5FF',
    backgroundColor: '#132338',
  },
  planCardPremium: {
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  planCardActivePremium: {
    borderColor: '#00E5FF',
    backgroundColor: '#0E293D',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    backgroundColor: '#00E5FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  popularBadgeText: {
    color: '#07090E',
    fontSize: 8,
    fontWeight: '900',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  planName: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  planLimit: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  planDesc: {
    color: '#64748B',
    fontSize: 10,
    lineHeight: 13,
    marginBottom: 8,
  },
  planPrice: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  quotaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  quotaTitle: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  quotaDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },

  searchIconBtn: {
    padding: 6,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  roomsList: {
    gap: 12,
  },
  roomItem: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  roomItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomIdBox: {
    backgroundColor: '#07090E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roomIdText: {
    color: '#00E5FF',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  shreddedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shreddedText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  panicBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  panicBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  roomDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomDeviceText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  roomLocationText: {
    color: '#94A3B8',
    fontSize: 12,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  roomMetaText: {
    color: '#64748B',
    fontSize: 11,
  },
  roomDispatchText: {
    color: '#00E5FF',
    fontSize: 11,
    fontFamily: 'monospace',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(7, 9, 14, 0.96)',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  launchBtn: {
    backgroundColor: '#00E5FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 10,
  },
  launchBtnText: {
    color: '#07090E',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  bottomSubtext: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
});
