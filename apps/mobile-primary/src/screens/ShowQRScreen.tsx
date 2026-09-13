import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PrimaryStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<PrimaryStackParamList, 'ShowQR'>;

export default function ShowQRScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pair Guest Device</Text>
      <Text style={styles.subtitle}>
        Show this QR code to the host device running PortelX
      </Text>

      {/* QR Code Placeholder */}
      <View style={styles.qrContainer}>
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>▓▓▓ QR CODE ▓▓▓</Text>
          <Text style={styles.qrSubtext}>Session Pairing Payload</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Session ID</Text>
        <Text style={styles.infoValue}>sess_a8f3...29d1</Text>
        <Text style={styles.infoLabel}>Ephemeral Public Key</Text>
        <Text style={styles.infoValue}>04:7b:a3:f1:...encrypted</Text>
        <Text style={styles.infoLabel}>Expires In</Text>
        <Text style={[styles.infoValue, { color: '#F59E0B' }]}>60 seconds</Text>
      </View>

      <Text style={styles.securityNote}>
        🔒 QR contains a one-time challenge bound to this device's Secure Enclave.
        It cannot be reused or intercepted.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingVertical: 40, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center' },
  qrContainer: { marginTop: 30, marginBottom: 24 },
  qrPlaceholder: { width: 220, height: 220, backgroundColor: '#FFFFFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  qrText: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  qrSubtext: { fontSize: 10, color: '#64748B', marginTop: 4 },
  infoCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, width: '100%', borderWidth: 1, borderColor: '#334155' },
  infoLabel: { fontSize: 11, color: '#94A3B8', marginTop: 8 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#E2E8F0', fontFamily: 'monospace' },
  securityNote: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 10 },
});

