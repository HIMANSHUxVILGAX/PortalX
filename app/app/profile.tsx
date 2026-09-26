import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';
import { useSessionStore } from '../src/store/useSessionStore';

export default function ProfileScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { user, subscription } = useAppStore();
  const { session } = useSessionStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'RS';

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.profileName}>{user?.displayName || 'Rahul Sharma'}</Text>
            <View style={styles.verificationBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#34C759" />
              <Text style={styles.subtitleText}>Primary Device • Full KYC Verified</Text>
            </View>
          </View>

          {/* Subscription Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>PORTELX SUBSCRIPTION</Text>
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push('/subscription')}>
              <View style={styles.planCard}>
                <View style={styles.planHeaderRow}>
                  <View style={styles.planTitleContainer}>
                    <MaterialCommunityIcons name="star-circle" size={24} color="#F5C518" />
                    <Text style={styles.planName}>
                      {subscription?.tier === 'premium' ? 'PortelX Premium' : subscription?.tier === 'bundle' ? 'PortelX Bundle' : 'PortelX Free'}
                    </Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>ACTIVE</Text>
                  </View>
                </View>
                <Text style={styles.planPrice}>
                  {subscription?.tier === 'premium' ? '₹499/month' : subscription?.tier === 'bundle' ? '₹999/month' : 'Free'}
                </Text>
                <Text style={styles.planFeature}>
                  ✓ {subscription?.tier !== 'free' ? 'Unlimited Guest Vaults' : '3 Guest Vaults/month'}
                </Text>

                <View style={styles.divider} />

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{subscription?.sessionsUsed || 0}</Text>
                    <Text style={styles.statLabel}>Vaults Created</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{session ? '1' : '0'}</Text>
                    <Text style={styles.statLabel}>Active Now</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>100%</Text>
                    <Text style={styles.statLabel}>Shredded</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Guest Mode Banner */}
          <View style={styles.enclaveBanner}>
            <View style={styles.enclaveHeader}>
              <View style={styles.enclaveTitleRow}>
                <MaterialCommunityIcons name="shield-lock" size={24} color="#34C759" />
                <Text style={styles.enclaveTitle}>PortelX Enclave</Text>
              </View>
              <View style={styles.guestModeBadge}>
                <Text style={styles.guestModeText}>GUEST MODE</Text>
              </View>
            </View>
            <Text style={styles.enclaveDescription}>
              Lend this device securely. Opens a zero-trust isolated vault for guests. Leaves zero trace.
            </Text>
            <TouchableOpacity
              style={styles.openVaultButton}
              onPress={() => router.push('/portelx_verification')}
            >
              <Text style={styles.openVaultButtonText}>Scan Guest Biometric to Unlock</Text>
            </TouchableOpacity>
          </View>

          {/* Security Settings */}
          <View style={styles.sectionContainer}>
            <View style={styles.settingsGroup}>
              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="face-recognition" size={22} color="#000" />
                </View>
                <Text style={styles.settingLabel}>Face ID & Passcode</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="devices" size={22} color="#000" />
                </View>
                <Text style={styles.settingLabel}>Trusted Devices</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/trusted_circle')}>
                <View style={styles.settingIconContainer}>
                  <Ionicons name="people-outline" size={22} color="#000" />
                </View>
                <Text style={styles.settingLabel}>Trusted Circle (P2P)</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.settingDivider} />

              <TouchableOpacity style={styles.settingRow}>
                <View style={styles.settingIconContainer}>
                  <MaterialCommunityIcons name="bell-outline" size={22} color="#000" />
                </View>
                <Text style={styles.settingLabel}>Notification Preferences</Text>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    color: '#007AFF',
    fontSize: 17,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  headerRight: {
    width: 80,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarInitials: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFF',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F9E7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subtitleText: {
    fontSize: 13,
    color: '#15803d',
    fontWeight: '500',
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.5,
  },
  planCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  planPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3A3A3C',
    marginBottom: 4,
  },
  planFeature: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E5EA',
  },
  enclaveBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  enclaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  enclaveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enclaveTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  guestModeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  guestModeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  enclaveDescription: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  openVaultButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  openVaultButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsGroup: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
  },
  settingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 17,
    color: '#000',
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginLeft: 60,
  },
  bottomPadding: {
    height: 40,
  },
});
