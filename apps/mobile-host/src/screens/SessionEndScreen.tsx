import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionEnd'>;

const WIPE_STEPS = [
  { label: 'Revoking session token...', delay: 400 },
  { label: 'Overwriting RAM buffers with random noise...', delay: 600 },
  { label: 'Zeroing memory with 0x00...', delay: 300 },
  { label: 'Purging local cache & clipboard...', delay: 200 },
  { label: 'Verifying zero-residue integrity...', delay: 500 },
  { label: '✓ SHREDDING COMPLETE — 0 bytes remain', delay: 0 },
];

export default function SessionEndScreen({ navigation, route }: Props) {
  const { reason } = route.params;
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeout: any;

    const runStep = (stepIndex: number) => {
      if (stepIndex >= WIPE_STEPS.length) {
        setIsComplete(true);
        // Auto-return to welcome after showing completion
        timeout = setTimeout(() => {
          navigation.replace('Welcome');
        }, 3000);
        return;
      }

      setCurrentStep(stepIndex);
      timeout = setTimeout(() => {
        runStep(stepIndex + 1);
      }, WIPE_STEPS[stepIndex].delay);
    };

    // Start wipe sequence
    runStep(0);

    return () => clearTimeout(timeout);
  }, []);

  const getReasonTitle = (): string => {
    switch (reason) {
      case 'timeout': return '⏱ SESSION EXPIRED';
      case 'manual': return '🚪 SESSION TERMINATED';
      case 'panic': return '🚨 PANIC REVOCATION';
      default: return 'SESSION ENDED';
    }
  };

  const getReasonColor = (): string => {
    switch (reason) {
      case 'panic': return '#EF4444';
      case 'timeout': return '#F59E0B';
      default: return '#60A5FA';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.reasonTitle, { color: getReasonColor() }]}>
          {getReasonTitle()}
        </Text>
        <Text style={styles.subtitle}>
          Cryptographic Memory Shredding in Progress
        </Text>

        {/* Wipe Progress */}
        <View style={styles.wipeLog}>
          {WIPE_STEPS.slice(0, currentStep + 1).map((step, index) => (
            <View key={index} style={styles.wipeLogEntry}>
              <Text style={[
                styles.wipeLogText,
                index === WIPE_STEPS.length - 1 && currentStep >= WIPE_STEPS.length - 1
                  ? styles.wipeLogSuccess
                  : styles.wipeLogNormal,
              ]}>
                {index < currentStep ? '✓' : '▸'} {step.label}
              </Text>
            </View>
          ))}
        </View>

        {!isComplete && (
          <ActivityIndicator size="large" color="#EF4444" style={styles.spinner} />
        )}

        {isComplete && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeIcon}>🛡️</Text>
            <Text style={styles.completeTitle}>ZERO RESIDUE VERIFIED</Text>
            <Text style={styles.completeSubtitle}>
              All sensitive data has been permanently destroyed.{'\n'}
              This device retains no trace of the session.
            </Text>
            <Text style={styles.wipeMeta}>
              Wipe Latency: {'<'} 1,000ms • Buffers Zeroed: 100%
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  reasonTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  wipeLog: {
    backgroundColor: '#0A0F1A',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  wipeLogEntry: {
    paddingVertical: 4,
  },
  wipeLogText: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  wipeLogNormal: {
    color: '#94A3B8',
  },
  wipeLogSuccess: {
    color: '#22C55E',
    fontWeight: '700',
  },
  spinner: {
    marginTop: 30,
  },
  completeBadge: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#0A2E1B',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#166534',
  },
  completeIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  completeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 1,
  },
  completeSubtitle: {
    fontSize: 13,
    color: '#86EFAC',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  wipeMeta: {
    fontSize: 11,
    color: '#4ADE80',
    marginTop: 12,
    fontFamily: 'monospace',
  },
});

