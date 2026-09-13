import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PrimaryStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<PrimaryStackParamList, 'SessionAlert'>;

export default function SessionAlertScreen({ navigation, route }: Props) {
  const { sessionId, hostDeviceId, action } = route.params;

  const handleRecognized = () => {
    // TODO: Send approval to backend
    navigation.goBack();
  };

  const handleDispute = () => {
    // TODO: Trigger dispute quarantine pipeline + remote session kill
    alert('Session terminated & quarantined for investigation.');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.alertBanner}>
        <Text style={styles.alertIcon}>🚨</Text>
        <Text style={styles.alertTitle}>SESSION ACTIVITY ALERT</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailLabel}>Session</Text>
        <Text style={styles.detailValue}>{sessionId}</Text>

        <Text style={styles.detailLabel}>Host Device</Text>
        <Text style={styles.detailValue}>{hostDeviceId}</Text>

        <Text style={styles.detailLabel}>Action Requested</Text>
        <Text style={[styles.detailValue, { color: '#F59E0B' }]}>{action}</Text>

        <Text style={styles.detailLabel}>Timestamp</Text>
        <Text style={styles.detailValue}>{new Date().toLocaleString()}</Text>
      </View>

      <Text style={styles.promptText}>
        Did you authorize this activity?
      </Text>

      <View style={styles.buttonsRow}>
        <TouchableOpacity style={styles.approveButton} onPress={handleRecognized} activeOpacity={0.8}>
          <Text style={styles.approveText}>✓ Recognized</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.disputeButton} onPress={handleDispute} activeOpacity={0.8}>
          <Text style={styles.disputeText}>✕ Dispute & Kill</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'center' },
  alertBanner: { alignItems: 'center', marginBottom: 30 },
  alertIcon: { fontSize: 48, marginBottom: 10 },
  alertTitle: { fontSize: 20, fontWeight: '800', color: '#EF4444', letterSpacing: 1 },
  detailsCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 20, borderWidth: 1, borderColor: '#334155', marginBottom: 24 },
  detailLabel: { fontSize: 11, color: '#94A3B8', marginTop: 10 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#E2E8F0', fontFamily: 'monospace' },
  promptText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginBottom: 20 },
  buttonsRow: { flexDirection: 'row', gap: 12 },
  approveButton: { flex: 1, backgroundColor: '#16A34A', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  approveText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  disputeButton: { flex: 1, backgroundColor: '#DC2626', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  disputeText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
