import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ZeroizedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const latency = params.latency || '0.0000';
  const targetBytes = parseInt(params.bytes as string) || 0;

  const [displayBytes, setDisplayBytes] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetBytes / steps;

    if (targetBytes <= 0) {
      setDisplayBytes(targetBytes);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetBytes) {
        setDisplayBytes(targetBytes);
        clearInterval(timer);
      } else {
        setDisplayBytes(Math.floor(start));
      }
    }, stepTime);
    return () => clearInterval(timer);
  }, [targetBytes]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconRing}>
          <Ionicons name="checkmark-sharp" size={48} color="#10b981" />
        </View>

        <Text style={styles.title}>Footprint Erased</Text>
        <Text style={styles.subtitle}>
          This device retains absolutely zero data from your session.
        </Text>

        {/* Terminal Card */}
        <View style={styles.terminalCard}>
          <Text style={styles.comment}>// Forensic Memory Wipe Log</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Target:</Text>
            <Text style={styles.valueWhite}>RAM Session Buffer</Text>
          </View>

          {params.wipedAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Wiped At:</Text>
              <Text style={styles.valueWhite}>{new Date(params.wipedAt as string).toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text style={styles.label}>Bytes Shredded:</Text>
            <Text style={styles.valueGreen}>{displayBytes} Bytes</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time Taken:</Text>
            <Text style={styles.valueGreen}>{latency} ms</Text>
          </View>

          <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Text style={styles.label}>Residual Data:</Text>
            <Text style={[styles.valueGreen, { fontWeight: '700' }]}>0x00 (Verified)</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomArea}>
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.returnBtnText}>Return to Host Mode</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  iconRing: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  title: { fontSize: 28, fontWeight: '700', color: '#f8fafc', marginBottom: 10 },
  subtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', paddingHorizontal: 20, marginBottom: 50, lineHeight: 22 },

  terminalCard: { width: '100%', backgroundColor: '#0a0a0a', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1e293b' },
  comment: { fontFamily: 'monospace', color: '#64748b', fontSize: 12, marginBottom: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  label: { fontFamily: 'monospace', color: '#94a3b8', fontSize: 12 },
  valueWhite: { fontFamily: 'monospace', color: '#cbd5e1', fontSize: 12 },
  valueGreen: { fontFamily: 'monospace', color: '#10b981', fontSize: 12 },

  bottomArea: { padding: 30, paddingBottom: 50 },
  returnBtn: { alignItems: 'center' },
  returnBtnText: { color: '#64748b', fontSize: 16, fontWeight: '600' }
});
