import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function SessionEndScreen() {
  const [step, setStep] = useState(0);

  const STEPS = [
    'Revoking ephemeral token...',
    'Overwriting RAM buffers...',
    'Zeroing secure memory...',
    'Purging network cache...',
    'Verifying cryptographic integrity...'
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setStep(current);
      if (current >= STEPS.length) {
        clearInterval(interval);
        setTimeout(() => {
          router.replace('/');
        }, 3000); // Auto-redirect to home
      }
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.title}>Session Terminated</Text>
      <Text style={styles.subtitle}>Memory Shredding Sequence Initiated</Text>

      <View style={styles.logBox}>
        <Text style={styles.logHeader}>// Forensic Memory Wipe Log</Text>
        {STEPS.map((text, i) => (
          <View key={i} style={{ opacity: step >= i ? 1 : 0.2 }}>
            <Text style={styles.logLine}>
              <Text style={styles.logArrow}>{'>'}</Text> {text} {step > i ? '✓' : ''}
            </Text>
          </View>
        ))}
      </View>

      {step >= STEPS.length && (
        <View style={styles.successBox}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>ZERO RESIDUE VERIFIED</Text>
          <Text style={styles.successSub}>This device retains absolutely zero data.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, justifyContent: 'center' },
  icon: { fontSize: 64, textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '800', color: '#EF4444', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 40 },
  logBox: { backgroundColor: '#000', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155' },
  logHeader: { color: '#64748B', fontFamily: 'monospace', fontSize: 12, marginBottom: 16 },
  logLine: { color: '#E2E8F0', fontFamily: 'monospace', fontSize: 12, marginBottom: 12 },
  logArrow: { color: '#60A5FA' },
  successBox: { marginTop: 40, alignItems: 'center', backgroundColor: '#0A2F1D', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#166534' },
  successIcon: { fontSize: 32, color: '#4ADE80', marginBottom: 10 },
  successTitle: { color: '#4ADE80', fontWeight: '800', fontSize: 16, letterSpacing: 1 },
  successSub: { color: '#86EFAC', fontSize: 12, marginTop: 4 },
});
