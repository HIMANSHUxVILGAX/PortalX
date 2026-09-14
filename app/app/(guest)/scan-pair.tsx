import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function ScanPairScreen() {
  const [scanning, setScanning] = React.useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      router.push('/(guest)/auth-gate');
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pair with Primary Device</Text>
      <Text style={styles.subtitle}>Scan the PortelX QR code on the owner's phone</Text>

      <View style={styles.cameraBox}>
        <View style={[styles.corner, styles.tl]} />
        <View style={[styles.corner, styles.tr]} />
        <View style={[styles.corner, styles.bl]} />
        <View style={[styles.corner, styles.br]} />
        {scanning ? (
          <ActivityIndicator size="large" color="#60A5FA" />
        ) : (
          <Text style={styles.camText}>Camera Viewfinder</Text>
        )}
      </View>

      <TouchableOpacity style={styles.simBtn} onPress={simulateScan} disabled={scanning} activeOpacity={0.8}>
        <Text style={styles.simBtnText}>{scanning ? 'Verifying...' : 'Simulate QR Scan'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} disabled={scanning}>
        <Text style={styles.back}>← Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFF' },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 8 },
  cameraBox: { width: 280, height: 280, marginTop: 40, marginBottom: 40, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  camText: { color: '#64748B', fontSize: 14 },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#3B82F6', borderWidth: 0 },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  simBtn: { backgroundColor: '#1E293B', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  simBtnText: { color: '#60A5FA', fontSize: 16, fontWeight: '600' },
  back: { marginTop: 30, color: '#94A3B8', fontSize: 14 },
});
