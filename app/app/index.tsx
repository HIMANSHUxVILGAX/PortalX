import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

/**
 * Role Selection Screen — Entry point of the entire app.
 * User chooses: "I am the owner" OR "I am lending my phone to someone"
 */
export default function RoleSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandSection}>
        <Text style={styles.logo}>PortelX</Text>
        <Text style={styles.tagline}>Borrow. Do. Disappear.</Text>
        <Text style={styles.subtitle}>Universal Temporary Identity Layer</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          Choose your role to continue.{'\n'}
          Your identity stays protected either way.
        </Text>
      </View>

      <View style={styles.roleSection}>
        {/* OWNER: I want to access my identity from a foreign device */}
        <TouchableOpacity
          style={styles.roleCard}
          onPress={() => router.push('/(owner)/dashboard')}
          activeOpacity={0.8}
        >
          <Text style={styles.roleIcon}>🔑</Text>
          <Text style={styles.roleTitle}>I am the Owner</Text>
          <Text style={styles.roleDesc}>
            Access your identity, UPI, or documents from any borrowed device
          </Text>
        </TouchableOpacity>

        {/* GUEST/HOST: I am lending my phone to someone */}
        <TouchableOpacity
          style={[styles.roleCard, styles.roleCardGuest]}
          onPress={() => router.push('/(guest)/welcome')}
          activeOpacity={0.8}
        >
          <Text style={styles.roleIcon}>📱</Text>
          <Text style={styles.roleTitle}>Lending My Phone</Text>
          <Text style={styles.roleDesc}>
            Open a secure guest room on this device for someone else
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.securityBadge}>
        🔒 FLAG_SECURE Active • Zero-Residue Enforced
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandSection: { alignItems: 'center', marginTop: 40 },
  logo: { fontSize: 42, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2 },
  tagline: { fontSize: 16, color: '#60A5FA', marginTop: 8, fontStyle: 'italic' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  infoSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: { fontSize: 14, color: '#CBD5E1', textAlign: 'center', lineHeight: 22 },
  roleSection: { gap: 14 },
  roleCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  roleCardGuest: { borderColor: '#1D4ED8' },
  roleIcon: { fontSize: 36, marginBottom: 8 },
  roleTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  roleDesc: { fontSize: 13, color: '#94A3B8', textAlign: 'center', lineHeight: 18 },
  securityBadge: { fontSize: 11, color: '#64748B', textAlign: 'center' },
});
