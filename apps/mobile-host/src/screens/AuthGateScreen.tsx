import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AuthGate'>;

export default function AuthGateScreen({ navigation, route }: Props) {
  const { sessionId } = route.params;
  const [handle, setHandle] = useState('');
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [authStep, setAuthStep] = useState<'credentials' | 'biometric' | 'risk'>('credentials');

  const handleCredentialSubmit = () => {
    if (!handle.trim() || !pin.trim()) return;
    setAuthStep('biometric');
  };

  const handleBiometricVerify = async () => {
    setIsVerifying(true);
    // TODO: Integrate expo-local-authentication for real biometric prompt
    setTimeout(() => {
      setAuthStep('risk');
    }, 1500);
  };

  const handleRiskClear = () => {
    // TODO: Call backend risk scoring API
    setTimeout(() => {
      setIsVerifying(false);
      navigation.replace('GuestVault', { sessionId, ttl: 300 });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>3-Factor Authentication</Text>
      <Text style={styles.sessionLabel}>Session: {sessionId}</Text>

      {/* Progress Steps */}
      <View style={styles.stepsRow}>
        <View style={[styles.step, authStep === 'credentials' && styles.stepActive, (authStep === 'biometric' || authStep === 'risk') && styles.stepDone]}>
          <Text style={styles.stepText}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.step, authStep === 'biometric' && styles.stepActive, authStep === 'risk' && styles.stepDone]}>
          <Text style={styles.stepText}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.step, authStep === 'risk' && styles.stepActive]}>
          <Text style={styles.stepText}>3</Text>
        </View>
      </View>
      <View style={styles.stepsLabelRow}>
        <Text style={styles.stepLabel}>Credentials</Text>
        <Text style={styles.stepLabel}>Biometric</Text>
        <Text style={styles.stepLabel}>Risk Check</Text>
      </View>

      {/* Factor 1: Credentials */}
      {authStep === 'credentials' && (
        <View style={styles.formSection}>
          <Text style={styles.factorTitle}>Factor 1: Identity Credentials</Text>
          <TextInput
            style={styles.input}
            placeholder="PortelX Handle / ID"
            placeholderTextColor="#64748B"
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Secure PIN"
            placeholderTextColor="#64748B"
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
          />
          <TouchableOpacity style={styles.actionButton} onPress={handleCredentialSubmit} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>Verify Credentials →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Factor 2: Biometric */}
      {authStep === 'biometric' && (
        <View style={styles.formSection}>
          <Text style={styles.factorTitle}>Factor 2: Biometric Attestation</Text>
          <Text style={styles.biometricIcon}>👆</Text>
          <Text style={styles.biometricText}>
            Place your finger on the sensor{'\n'}or use Face ID to verify
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleBiometricVerify} activeOpacity={0.8}>
            {isVerifying ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.actionButtonText}>Authenticate Biometric →</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Factor 3: Risk Scoring */}
      {authStep === 'risk' && (
        <View style={styles.formSection}>
          <Text style={styles.factorTitle}>Factor 3: Behavioral Risk Analysis</Text>
          <View style={styles.riskCard}>
            <Text style={styles.riskLabel}>Device Trust Score</Text>
            <Text style={styles.riskValue}>87 / 100</Text>
            <Text style={styles.riskLabel}>Location Anomaly</Text>
            <Text style={styles.riskValueGreen}>None Detected ✓</Text>
            <Text style={styles.riskLabel}>Session Risk Level</Text>
            <Text style={styles.riskValueGreen}>LOW ✓</Text>
          </View>
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonGreen]} onPress={handleRiskClear} activeOpacity={0.8}>
            <Text style={styles.actionButtonText}>✓ All Clear — Enter Vault</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sessionLabel: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },
  step: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#1D4ED8',
  },
  stepDone: {
    borderColor: '#22C55E',
    backgroundColor: '#166534',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLine: {
    width: 50,
    height: 2,
    backgroundColor: '#334155',
  },
  stepsLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  stepLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  formSection: {
    marginTop: 40,
    alignItems: 'center',
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 14,
  },
  actionButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonGreen: {
    backgroundColor: '#16A34A',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  biometricIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  biometricText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  riskCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  riskLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 10,
  },
  riskValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F59E0B',
  },
  riskValueGreen: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
  },
});
