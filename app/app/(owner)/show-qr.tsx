import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';

export default function ShowQRScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pair Guest Device</Text>
      <Text style={styles.subtitle}>Show this QR code to the host device running PortelX</Text>

      <View style={styles.qrBox}>
        <Text style={styles.qrText}>▓▓▓ QR CODE ▓▓▓</Text>
        <Text style={styles.qrSub}>Session Pairing Payload</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.label}>Session ID</Text>
        <Text style={styles.value}>sess_a8f3...29d1</Text>
        <Text style={styles.label}>Ephemeral Public Key</Text>
        <Text style={styles.value}>04:7b:a3:f1:...encrypted</Text>
        <Text style={styles.label}>Expires In</Text>
        <Text style={[styles.value, { color: '#F59E0B' }]}>60 seconds</Text>
      </View>

      <Text style={styles.note}>🔒 QR contains a one-time challenge bound to this device's Secure Enclave.</Text>

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center' },
  qrBox: { width: 220, height: 220, backgroundColor: '#FFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 24 },
  qrText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  qrSub: { fontSize: 10, color: '#64748B', marginTop: 4 },
  info: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, width: '100%', borderWidth: 1, borderColor: '#334155' },
  label: { fontSize: 11, color: '#94A3B8', marginTop: 8 },
  value: { fontSize: 13, fontWeight: '600', color: '#E2E8F0' },
  note: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 10 },
  back: { fontSize: 14, color: '#60A5FA', marginTop: 20 },
});
