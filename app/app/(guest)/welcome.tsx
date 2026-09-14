import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function GuestWelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.logo}>PortelX</Text>
        <Text style={styles.tagline}>Borrow. Do. Disappear.</Text>
        <Text style={styles.subtitle}>Universal Temporary Identity Layer</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          This device will serve as a temporary guest terminal.{'\n'}
          No data will persist after the session ends.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(guest)/scan-pair')} activeOpacity={0.8}>
          <Text style={styles.primaryBtnText}>Open Guest Identity Room</Text>
        </TouchableOpacity>
        <Text style={styles.secBadge}>🔒 FLAG_SECURE Active • Zero-Residue Enforced</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 40 },
  brand: { alignItems: 'center', marginTop: 60 },
  logo: { fontSize: 42, fontWeight: '800', color: '#FFF', letterSpacing: 2 },
  tagline: { fontSize: 16, color: '#60A5FA', marginTop: 8, fontStyle: 'italic' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  infoBox: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155' },
  infoText: { fontSize: 14, color: '#CBD5E1', textAlign: 'center', lineHeight: 22 },
  actions: { alignItems: 'center', marginBottom: 20 },
  primaryBtn: { backgroundColor: '#1D4ED8', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 12, width: '100%', alignItems: 'center' },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  secBadge: { fontSize: 11, color: '#64748B', marginTop: 16 },
});
