import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanPair'>;

export default function ScanPairScreen({ navigation }: Props) {
  const [isPairing, setIsPairing] = useState(false);

  const handleScanComplete = async () => {
    setIsPairing(true);
    // TODO: Integrate actual QR camera scanner + backend pairing API
    // Simulating a pairing delay
    setTimeout(() => {
      setIsPairing(false);
      navigation.navigate('AuthGate', { sessionId: 'sess_demo_001' });
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pair with Primary Device</Text>
      <Text style={styles.subtitle}>
        Scan the QR code displayed on the initiator's primary phone
      </Text>

      {/* Camera Viewfinder Placeholder */}
      <View style={styles.cameraPlaceholder}>
        <View style={styles.cornerTL} />
        <View style={styles.cornerTR} />
        <View style={styles.cornerBL} />
        <View style={styles.cornerBR} />
        <Text style={styles.cameraText}>📷 Camera Viewfinder</Text>
        <Text style={styles.cameraSubtext}>
          Point at the QR code on the initiator's phone
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, isPairing && styles.scanButtonDisabled]}
        onPress={handleScanComplete}
        disabled={isPairing}
        activeOpacity={0.8}
      >
        {isPairing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.scanButtonText}>Simulate QR Scan</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  cameraPlaceholder: {
    width: 280,
    height: 280,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    borderStyle: 'dashed',
    position: 'relative',
  },
  cameraText: {
    fontSize: 24,
    color: '#64748B',
  },
  cameraSubtext: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  // Corner brackets for viewfinder effect
  cornerTL: { position: 'absolute', top: -2, left: -2, width: 30, height: 30, borderTopWidth: 3, borderLeftWidth: 3, borderColor: '#3B82F6', borderTopLeftRadius: 8 },
  cornerTR: { position: 'absolute', top: -2, right: -2, width: 30, height: 30, borderTopWidth: 3, borderRightWidth: 3, borderColor: '#3B82F6', borderTopRightRadius: 8 },
  cornerBL: { position: 'absolute', bottom: -2, left: -2, width: 30, height: 30, borderBottomWidth: 3, borderLeftWidth: 3, borderColor: '#3B82F6', borderBottomLeftRadius: 8 },
  cornerBR: { position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderBottomWidth: 3, borderRightWidth: 3, borderColor: '#3B82F6', borderBottomRightRadius: 8 },
  scanButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 40,
    width: '80%',
    alignItems: 'center',
  },
  scanButtonDisabled: {
    backgroundColor: '#334155',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  backText: {
    fontSize: 14,
    color: '#60A5FA',
    marginTop: 20,
  },
});

