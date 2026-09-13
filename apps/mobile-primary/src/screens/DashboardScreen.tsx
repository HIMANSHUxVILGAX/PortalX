import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PrimaryStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<PrimaryStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>PortelX</Text>
          <Text style={styles.tagline}>Your Sovereign Identity Anchor</Text>
        </View>

        {/* Identity Card */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <Text style={styles.identityLabel}>Identity Status</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>● Secure</Text>
            </View>
          </View>
          <Text style={styles.identityHandle}>@himanshu_portelx</Text>
          <Text style={styles.identityMeta}>Passkey: Hardware Enclave Bound • Active</Text>
        </View>

        {/* Action Cards */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ShowQR')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📲</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Pair a Guest Device</Text>
            <Text style={styles.actionSub}>Show QR to connect a temporary host</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('ActiveSessions')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🖥️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Active Sessions</Text>
            <Text style={styles.actionSub}>Monitor & revoke guest devices</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('RegisterPasskey')}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>🔑</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Passkeys</Text>
            <Text style={styles.actionSub}>Register or update biometric credentials</Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Panic Zone */}
        <View style={styles.panicSection}>
          <TouchableOpacity style={styles.panicButton} activeOpacity={0.8}>
            <Text style={styles.panicButtonText}>🚨 KILL ALL SESSIONS</Text>
          </TouchableOpacity>
          <Text style={styles.panicNote}>
            Instantly revoke all active guest sessions across all devices
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 13,
    color: '#60A5FA',
    marginTop: 4,
  },
  identityCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 28,
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  identityLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statusBadge: {
    backgroundColor: '#166534',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86EFAC',
  },
  identityHandle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  identityMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 14,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  actionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 18,
    color: '#64748B',
  },
  panicSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  panicButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  panicButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  panicNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 10,
    textAlign: 'center',
  },
});

