import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function PasskeyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🔑 Register Passkey</Text>
      <Text style={styles.subtitle}>Your passkey private key will be generated inside the device's hardware security module and marked as non-exportable.</Text>

      <View style={styles.info}>
        <Text style={styles.label}>Enclave Type</Text>
        <Text style={styles.value}>Android StrongBox / iOS Secure Enclave</Text>
        <Text style={styles.label}>Algorithm</Text>
        <Text style={styles.value}>ECDSA P-256 (FIDO2 WebAuthn)</Text>
        <Text style={styles.label}>Exportable</Text>
        <Text style={[styles.value, { color: '#EF4444' }]}>NO — Hardware Bound</Text>
      </View>

      <TouchableOpacity style={styles.registerBtn} activeOpacity={0.8}>
        <Text style={styles.registerText}>👆 Register with Biometric</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 30 },
  info: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 30 },
  label: { fontSize: 11, color: '#94A3B8', marginTop: 10 },
  value: { fontSize: 15, fontWeight: '600', color: '#E2E8F0' },
  registerBtn: { backgroundColor: '#1D4ED8', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  registerText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  back: { fontSize: 14, color: '#60A5FA', textAlign: 'center' },
});
