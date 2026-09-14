import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

const MOCK_SESSIONS = [
  { id: 'sess_a8f329d1', hostDevice: 'Samsung Galaxy S24 (Friend)', status: 'ACTIVE', remainingTtl: 142 },
];

export default function ActiveSessionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Active Guest Sessions</Text>
      <Text style={styles.subtitle}>Monitor all devices currently borrowing your identity</Text>

      <FlatList
        data={MOCK_SESSIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.sessId}>{item.id}</Text>
              <View style={styles.activeBadge}><Text style={styles.badgeText}>{item.status}</Text></View>
            </View>
            <Text style={styles.device}>🖥️ {item.hostDevice}</Text>
            <Text style={styles.meta}>TTL: {item.remainingTtl}s remaining</Text>
            <TouchableOpacity style={styles.revokeBtn} activeOpacity={0.8}>
              <Text style={styles.revokeText}>🚨 Revoke & Shred</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No active sessions</Text>}
      />

      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Back to Dashboard</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 30 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFF', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  list: { gap: 12 },
  card: { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sessId: { fontSize: 13, fontWeight: '600', color: '#E2E8F0' },
  activeBadge: { backgroundColor: '#166534', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  device: { fontSize: 14, color: '#CBD5E1', marginBottom: 4 },
  meta: { fontSize: 11, color: '#64748B' },
  revokeBtn: { backgroundColor: '#DC2626', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  revokeText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  empty: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 40 },
  back: { fontSize: 14, color: '#60A5FA', textAlign: 'center', marginTop: 20 },
});
