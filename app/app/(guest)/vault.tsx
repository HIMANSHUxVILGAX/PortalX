import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function VaultScreen() {
  const [timeLeft, setTimeLeft] = useState(300);
  const [tab, setTab] = useState<'PAY' | 'DOCS'>('PAY');

  useEffect(() => {
    if (timeLeft <= 0) {
      router.replace('/(guest)/session-end');
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}><Text style={styles.badgeText}>🔒 SECURE GUEST ROOM</Text></View>
        <Text style={[styles.timer, timeLeft < 60 && styles.timerDanger]}>{mins}:{secs}</Text>
      </View>
      <Text style={styles.secBar}>FLAG_SECURE • Clipboard Blocked • No Screenshots</Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity style={[styles.tab, tab === 'PAY' && styles.tabActive]} onPress={() => setTab('PAY')}>
          <Text style={[styles.tabText, tab === 'PAY' && styles.tabTextActive]}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === 'DOCS' && styles.tabActive]} onPress={() => setTab('DOCS')}>
          <Text style={[styles.tabText, tab === 'DOCS' && styles.tabTextActive]}>Documents</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'PAY' ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Isolated Sandbox Balance</Text>
            <Text style={styles.balance}>₹ **.***</Text>
            <Text style={styles.cardSub}>**** **** **** 4921</Text>
            <View style={styles.actRow}>
              <View style={styles.actBtn}><Text style={styles.actBtnTxt}>Send</Text></View>
              <View style={styles.actBtn}><Text style={styles.actBtnTxt}>Scan</Text></View>
              <View style={styles.actBtn}><Text style={styles.actBtnTxt}>History</Text></View>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Temporary ID Stream</Text>
            <View style={styles.docItem}>
              <Text style={styles.docIcon}>📄</Text>
              <View><Text style={styles.docName}>Aadhaar Card</Text><Text style={styles.docSub}>In-memory only</Text></View>
            </View>
            <View style={styles.docItem}>
              <Text style={styles.docIcon}>🪪</Text>
              <View><Text style={styles.docName}>PAN Card</Text><Text style={styles.docSub}>In-memory only</Text></View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/(guest)/session-end')}>
          <Text style={styles.exitTxt}>Exit & Disappear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.panicBtn} onPress={() => router.replace('/(guest)/session-end')}>
          <Text style={styles.panicTxt}>🚨 PANIC REVOKE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B', borderBottomWidth: 1, borderColor: '#334155' },
  badge: { backgroundColor: '#166534', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#86EFAC', fontSize: 10, fontWeight: '800' },
  timer: { fontSize: 24, fontWeight: '700', color: '#FFF', fontVariant: ['tabular-nums'] },
  timerDanger: { color: '#EF4444' },
  secBar: { backgroundColor: '#000', padding: 6, textAlign: 'center', fontSize: 10, color: '#64748B' },
  tabRow: { flexDirection: 'row', padding: 16, gap: 10 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#1E293B' },
  tabActive: { backgroundColor: '#1D4ED8' },
  tabText: { color: '#94A3B8', fontWeight: '600' },
  tabTextActive: { color: '#FFF' },
  content: { padding: 16 },
  card: { backgroundColor: '#1E293B', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { color: '#94A3B8', fontSize: 12, textTransform: 'uppercase', marginBottom: 10 },
  balance: { color: '#FFF', fontSize: 32, fontWeight: '800', marginBottom: 4 },
  cardSub: { color: '#60A5FA', fontSize: 12, fontFamily: 'monospace', marginBottom: 24 },
  actRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actBtn: { backgroundColor: '#0F172A', paddingVertical: 12, borderRadius: 8, flex: 1, marginHorizontal: 4, alignItems: 'center' },
  actBtnTxt: { color: '#E2E8F0', fontWeight: '600', fontSize: 13 },
  docItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 16, borderRadius: 10, marginBottom: 10 },
  docIcon: { fontSize: 24, marginRight: 16 },
  docName: { color: '#E2E8F0', fontSize: 15, fontWeight: '600' },
  docSub: { color: '#F59E0B', fontSize: 11, marginTop: 2 },
  footer: { padding: 20, gap: 12 },
  exitBtn: { backgroundColor: '#334155', padding: 16, borderRadius: 12, alignItems: 'center' },
  exitTxt: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  panicBtn: { backgroundColor: '#DC2626', padding: 16, borderRadius: 12, alignItems: 'center' },
  panicTxt: { color: '#FFF', fontWeight: '800', fontSize: 15 },
});
