import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { PrimaryStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<PrimaryStackParamList, 'ActiveSessions'>;

interface SessionItem {
  id: string;
  hostDevice: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  remainingTtl: number;
  createdAt: string;
}

const MOCK_SESSIONS: SessionItem[] = [
  {
    id: 'sess_a8f329d1',
    hostDevice: 'Samsung Galaxy S24 (Friend)',
    status: 'ACTIVE',
    remainingTtl: 142,
    createdAt: '2 min ago',
  },
];

export default function ActiveSessionsScreen({ navigation }: Props) {
  const handleRevoke = (sessionId: string) => {
    // TODO: Call backend terminate API + trigger host-side shredding
    alert(`Session ${sessionId} revoked. Remote wipe initiated.`);
  };

  const renderSession = ({ item }: { item: SessionItem }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionId}>{item.id}</Text>
        <View style={[styles.badge, item.status === 'ACTIVE' ? styles.badgeActive : styles.badgeDead]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.sessionDevice}>🖥️ {item.hostDevice}</Text>
      <Text style={styles.sessionMeta}>Created: {item.createdAt} • TTL: {item.remainingTtl}s remaining</Text>
      {item.status === 'ACTIVE' && (
        <TouchableOpacity style={styles.revokeButton} onPress={() => handleRevoke(item.id)} activeOpacity={0.8}>
          <Text style={styles.revokeText}>🚨 Revoke & Shred</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Active Guest Sessions</Text>
      <Text style={styles.subtitle}>Monitor all devices currently borrowing your identity</Text>

      <FlatList
        data={MOCK_SESSIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No active sessions</Text>}
      />

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 30 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  listContent: { gap: 12 },
  sessionCard: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessionId: { fontSize: 13, fontWeight: '600', color: '#E2E8F0', fontFamily: 'monospace' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeActive: { backgroundColor: '#166534' },
  badgeDead: { backgroundColor: '#7F1D1D' },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  sessionDevice: { fontSize: 14, color: '#CBD5E1', marginBottom: 4 },
  sessionMeta: { fontSize: 11, color: '#64748B' },
  revokeButton: { backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  revokeText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 40 },
  backText: { fontSize: 14, color: '#60A5FA', textAlign: 'center', marginTop: 20 },
});
