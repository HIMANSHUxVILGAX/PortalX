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
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function PortelXDashboard() {
  const router = useRouter();
  const { guestName, guestHandle, guestPhone, history, fetchHistory } = useSessionStore();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [detectedLocation, setDetectedLocation] = useState('Local Device (India)');
  const detectedDevice = Device.modelName || Device.deviceName || 'Android Device';

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        let geocode = await Location.reverseGeocodeAsync({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        if (geocode.length > 0) {
          const addr = geocode[0];
          setDetectedLocation(`${addr.city || addr.subregion || addr.region}, ${addr.region || addr.country}`);
        }
      } catch (e) {
        console.log('Location error:', e);
      }
    })();
  }, []);

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

  const displayRooms = history && history.length > 0
    ? history.map((room, index) => {
        if (index === 0) {
          return {
            ...room,
            device_name: Device.modelName || room.device_name || 'Unknown Device',
          };
        }
        return room;
      })
    : [];

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const handlePanicRevoke = async (roomId: string) => {
    if (roomId === 'N/A') return;
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
          </View>
          <Text style={styles.sectionSubtitle}>
            Quota applied from your personal PortelX account, not the host device.
          </Text>

          <View style={styles.premiumBanner}>
            <View style={styles.premiumBannerHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="star" size={16} color="#00E5FF" style={{ marginRight: 6 }} />
                <Text style={styles.premiumBannerTitle}>Premium Plan Active</Text>
              </View>
              <View style={styles.revenueCatBadge}>
                <Text style={styles.revenueCatText}>RevenueCat</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>7 of 10 sessions remaining</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '70%' }]} />
              </View>
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
            {displayRooms.length === 0 ? (
              <View style={styles.roomItem}>
                <Text style={{ color: '#94A3B8', textAlign: 'center', fontSize: 13 }}>
                  No previous guest sessions recorded
                </Text>
              </View>
            ) : (
              displayRooms.map((room, index) => {
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
                      <Ionicons name={room.room_id === 'N/A' ? 'information-circle' : 'trash-bin'} size={12} color="#10B981" style={{ marginRight: 4 }} />
                      <Text style={styles.shreddedText}>{room.status}{room.room_id !== 'N/A' && ' • 0x00'}</Text>
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

                {room.room_id !== 'N/A' && (
                  <View style={styles.roomFooter}>
                    <Text style={styles.roomMetaText}>⏱️ {formatDuration(room.duration_seconds || (room.duration ? parseInt(room.duration) * 60 : 0))} • {(() => { try { return new Date(room.created_at || room.date || Date.now()).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }); } catch { return 'Recent'; } })()}</Text>
                    <Text style={styles.roomDispatchText}>Key sent via SMS</Text>
                  </View>
                )}
              </View>
            )}))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* BOTTOM CTA: LAUNCH GUEST VAULT */}
      <View style={styles.bottomBar}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.launchBtn}
            onPress={async () => {
              const { openVault } = useSessionStore.getState();
              await openVault('@guest', '1234', {
                device_name: detectedDevice,
                device_brand: Device.brand || '',
                location: detectedLocation
              });
              router.push('/portelx_vault');
            }}
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
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 14,
  },

  premiumBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  premiumBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumBannerTitle: {
    color: '#00E5FF',
    fontSize: 16,
    fontWeight: '800',
  },
  revenueCatBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  revenueCatText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
    borderRadius: 3,
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
