import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'GuestVault'>;

export default function GuestVaultScreen({ navigation, route }: Props) {
  const { sessionId, ttl } = route.params;
  const [remainingSeconds, setRemainingSeconds] = useState(ttl);
  const [activeTab, setActiveTab] = useState<'upi' | 'documents'>('upi');
  const timerRef = useRef<any>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Session expired — trigger shredding
          navigation.replace('SessionEnd', { reason: 'timeout' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (remainingSeconds <= 30) return '#EF4444';
    if (remainingSeconds <= 60) return '#F59E0B';
    return '#22C55E';
  };

  const handleManualExit = () => {
    Alert.alert(
      'Exit & Destroy Session?',
      'All temporary data on this device will be permanently shredded. This action cannot be undone.',
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Disappear',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) clearInterval(timerRef.current);
            navigation.replace('SessionEnd', { reason: 'manual' });
          },
        },
      ]
    );
  };

  const handlePanicRevoke = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    navigation.replace('SessionEnd', { reason: 'panic' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header: Timer + Session Badge */}
      <View style={styles.header}>
        <View style={styles.sessionBadge}>
          <Text style={styles.sessionBadgeText}>🔒 SECURE GUEST ROOM</Text>
        </View>
        <View style={[styles.timerBadge, { borderColor: getTimerColor() }]}>
          <Text style={[styles.timerText, { color: getTimerColor() }]}>
            ⏱ {formatTime(remainingSeconds)}
          </Text>
        </View>
      </View>

      {/* Security Status Bar */}
      <View style={styles.securityBar}>
        <Text style={styles.securityItem}>🛡️ FLAG_SECURE</Text>
        <Text style={styles.securityItem}>📵 Clipboard Blocked</Text>
        <Text style={styles.securityItem}>🚫 No Screenshot</Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upi' && styles.tabActive]}
          onPress={() => setActiveTab('upi')}
        >
          <Text style={[styles.tabText, activeTab === 'upi' && styles.tabTextActive]}>
            💳 UPI / Payment
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'documents' && styles.tabActive]}
          onPress={() => setActiveTab('documents')}
        >
          <Text style={[styles.tabText, activeTab === 'documents' && styles.tabTextActive]}>
            📄 Documents
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content: UPI Tab */}
      {activeTab === 'upi' && (
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>Temporary UPI Access</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceValue}>₹ *,***.**</Text>
          </View>
          <View style={styles.upiActions}>
            <TouchableOpacity style={styles.upiButton}>
              <Text style={styles.upiButtonIcon}>📤</Text>
              <Text style={styles.upiButtonLabel}>Send Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.upiButton}>
              <Text style={styles.upiButtonIcon}>📥</Text>
              <Text style={styles.upiButtonLabel}>Request</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.upiButton}>
              <Text style={styles.upiButtonIcon}>📊</Text>
              <Text style={styles.upiButtonLabel}>History</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.upiDisclaimer}>
            Transactions are routed through your verified bank.
            Host device has zero access to your credentials.
          </Text>
        </View>
      )}

      {/* Content: Documents Tab */}
      {activeTab === 'documents' && (
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>DigiLocker Memory Stream</Text>
          <Text style={styles.docDisclaimer}>
            Documents are streamed into volatile RAM only.{'\n'}
            Zero bytes written to device storage.
          </Text>
          <View style={styles.docList}>
            <View style={styles.docItem}>
              <Text style={styles.docIcon}>🪪</Text>
              <View>
                <Text style={styles.docName}>Aadhaar Card</Text>
                <Text style={styles.docMeta}>UIDAI • Memory-Only Stream</Text>
              </View>
            </View>
            <View style={styles.docItem}>
              <Text style={styles.docIcon}>💳</Text>
              <View>
                <Text style={styles.docName}>PAN Card</Text>
                <Text style={styles.docMeta}>Income Tax Dept • Memory-Only Stream</Text>
              </View>
            </View>
            <View style={styles.docItem}>
              <Text style={styles.docIcon}>🚗</Text>
              <View>
                <Text style={styles.docName}>Driving License</Text>
                <Text style={styles.docMeta}>RTO • Memory-Only Stream</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleManualExit}
          activeOpacity={0.8}
        >
          <Text style={styles.exitButtonText}>🚪 Exit & Disappear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.panicButton}
          onPress={handlePanicRevoke}
          activeOpacity={0.8}
        >
          <Text style={styles.panicButtonText}>🚨 PANIC REVOKE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sessionBadge: {
    backgroundColor: '#166534',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sessionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#86EFAC',
  },
  timerBadge: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  securityBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 12,
  },
  securityItem: {
    fontSize: 10,
    color: '#94A3B8',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1D4ED8',
  },
  tabText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  contentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: '#94A3B8',
  },
  balanceValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22C55E',
  },
  upiActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  upiButton: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  upiButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  upiButtonLabel: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  upiDisclaimer: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  docDisclaimer: {
    fontSize: 12,
    color: '#F59E0B',
    marginBottom: 16,
    lineHeight: 18,
  },
  docList: {
    gap: 12,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 14,
    borderRadius: 10,
    gap: 14,
  },
  docIcon: {
    fontSize: 28,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 16,
  },
  exitButton: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  exitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  panicButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  panicButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

