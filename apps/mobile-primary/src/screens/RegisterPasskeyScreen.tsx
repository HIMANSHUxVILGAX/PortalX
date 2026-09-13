import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PrimaryStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<PrimaryStackParamList, 'RegisterPasskey'>;

export default function RegisterPasskeyScreen({ navigation }: Props) {
  const handleRegister = () => {
    // TODO: Integrate expo-local-authentication for actual hardware keystore registration
    alert('Passkey registered to Hardware Secure Enclave (simulated)');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🔑 Register Passkey</Text>
      <Text style={styles.subtitle}>
        Your passkey private key will be generated inside the device's
        hardware security module (StrongBox / Secure Enclave) and marked
        as non-exportable.
      </Text>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Enclave Type</Text>
        <Text style={styles.infoValue}>Android StrongBox / iOS Secure Enclave</Text>
        <Text style={styles.infoLabel}>Algorithm</Text>
        <Text style={styles.infoValue}>ECDSA P-256 (FIDO2 WebAuthn)</Text>
        <Text style={styles.infoLabel}>Exportable</Text>
        <Text style={[styles.infoValue, { color: '#EF4444' }]}>NO — Hardware Bound</Text>
      </View>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.8}>
        <Text style={styles.registerButtonText}>👆 Register with Biometric</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingVertical: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 30 },
  infoCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 30 },
  infoLabel: { fontSize: 11, color: '#94A3B8', marginTop: 10 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#E2E8F0' },
  registerButton: { backgroundColor: '#1D4ED8', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  registerButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  backText: { fontSize: 14, color: '#60A5FA', textAlign: 'center' },
});
