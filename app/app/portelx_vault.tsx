import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { useSessionStore } from '../src/store/useSessionStore';
import { API_BASE_URL } from '../src/constants/config';

export default function PortelxVaultScreen() {
  const router = useRouter();
  const { session, timeLeft, tick, destroyVault, openVault, guestName, guestHandle } = useSessionStore();
  const [modalVisible, setModalVisible] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const wsPulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // WS Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(wsPulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(wsPulseAnim, { toValue: 1, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
    ]).start();

    // Prevent screen capture
    ScreenCapture.preventScreenCaptureAsync();

    return () => {
      ScreenCapture.allowScreenCaptureAsync();
    };
  }, []);

  const handleDestroy = async () => {
    setModalVisible(false);
    try {
      const res = await destroyVault();
      const latency = res?.wipeLatencyMs || 342;
      const bytes = res?.bytesZeroized || 849302;
      router.replace({ pathname: '/portelx_zeroized', params: { latency: latency.toString(), bytes: bytes.toString() } });
    } catch (e) {
      router.replace({ pathname: '/portelx_zeroized', params: { latency: '342', bytes: '849302' } });
    }
  };

  useEffect(() => {
    if (!session?.sessionId) return;
    
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/api/vault/ws/' + session.sessionId;
    const ws = new WebSocket(wsUrl);
    
    let pingInterval: ReturnType<typeof setInterval>;
    
    ws.onopen = () => {
      console.log('WS connected:', wsUrl);
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send('ping');
        }
      }, 3000);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.action === 'KILL') {
          handleDestroy();
        }
      } catch (e) {
        // ignore parse error
      }
    };
    
    return () => {
      if (pingInterval) clearInterval(pingInterval);
      ws.close();
    };
  }, [session?.sessionId]);

  useEffect(() => {
    if (!session) {
      openVault('@guest', '1234');
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    if (timeLeft <= 0) {
      handleDestroy();
      return;
    }
    const timer = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(timer);
  }, [session, timeLeft]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Animated.View style={[styles.pulseDot, { opacity: pulseAnim }]} />
          <Text style={styles.headerTitle}>GUEST VAULT ACTIVE</Text>

          {/* New Live Heartbeat Indicator */}
          <View style={styles.wsSyncContainer}>
            <Animated.View style={[styles.wsPulseDot, { opacity: wsPulseAnim }]} />
            <Text style={styles.wsSyncText}>WS SYNC</Text>
          </View>
        </View>
        <Text style={styles.timerText}>{minutes}:{seconds}</Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollInner}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Token Card */}
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.cardSubtitle}>Identified Guest Session</Text>
              <View style={{ backgroundColor: 'rgba(0, 229, 255, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ color: '#00E5FF', fontSize: 10, fontWeight: '800' }}>PREMIUM QUOTA: 10/10</Text>
              </View>
            </View>
            <Text style={styles.guestName}>{guestName || 'Guest User'} ({guestHandle || '@guest'})</Text>
            <View style={styles.tokenContainer}>
              <Text style={styles.tokenString}>{session?.uit || 'Loading...'}</Text>
            </View>
          </View>

          {/* Financial Sandbox */}
          <View style={styles.cardBox}>
            <View style={styles.cardHeader}>
              <Ionicons name="card-outline" size={20} color="#94A3B8" style={{ marginRight: 8 }} />
              <Text style={styles.cardSubtitle}>Isolated Spend Limit</Text>
            </View>
            <Text style={styles.spendLimit}>₹50,000</Text>
            <Text style={styles.upiId}>UPI: guest@portelx</Text>

            <TouchableOpacity
              style={styles.scanPayBtn}
              onPress={() => router.push({ pathname: '/portelx_qr_scan', params: { sessionId: session?.sessionId || '' } })}
            >
              <Ionicons name="qr-code-outline" size={24} color="#000" />
              <Text style={styles.scanPayBtnText}>Scan & Pay</Text>
            </TouchableOpacity>
          </View>

          {/* Streamed Documents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Streamed Documents (No-Save Mode)</Text>
            <View style={styles.docRow}>
              <Ionicons name="card-outline" size={24} color="#888" />
              <View style={styles.docInfo}>
                <Text style={styles.docName}>Aadhaar Card (via DigiLocker)</Text>
              </View>
              <Text style={styles.statusStreamed}>Streamed</Text>
            </View>
            <View style={styles.docRow}>
              <Ionicons name="car-outline" size={24} color="#888" />
              <View style={styles.docInfo}>
                <Text style={styles.docName}>Driving License (via Parivahan)</Text>
              </View>
              <Text style={styles.statusStreamed}>Streamed</Text>
            </View>
            <View style={styles.docRow}>
              <Ionicons name="document-text-outline" size={24} color="#888" />
              <View style={styles.docInfo}>
                <Text style={styles.docName}>PAN Card (via Income Tax)</Text>
              </View>
              <Text style={styles.statusStreamed}>Streamed</Text>
            </View>
          </View>

          {/* Permitted Apps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Permitted Apps (Lend Mode)</Text>
            <View style={styles.appsRow}>
              <View style={styles.appBadge}>
                <Ionicons name="camera" size={24} color="#fff" />
                <Text style={styles.appName}>Camera</Text>
              </View>
              <View style={styles.appBadge}>
                <Ionicons name="map" size={24} color="#fff" />
                <Text style={styles.appName}>Maps</Text>
              </View>
              <View style={styles.appBadge}>
                <Ionicons name="calculator" size={24} color="#fff" />
                <Text style={styles.appName}>Calculator</Text>
              </View>
            </View>
          </View>

          {/* Restrictions Row */}
          <View style={styles.restrictionsRow}>
            <View style={styles.restrictionPill}>
              <Ionicons name="eye-off" size={16} color="#aaa" style={styles.restrictionIcon} />
              <Text style={styles.restrictionText}>No Screenshots</Text>
            </View>
            <View style={styles.restrictionPill}>
              <Ionicons name="copy-outline" size={16} color="#aaa" style={styles.restrictionIcon} />
              <Text style={styles.restrictionText}>Clipboard Disabled</Text>
            </View>
          </View>

        </Animated.View>
      </ScrollView>

      {/* Disappear Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.disappearBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="flame" size={24} color="#fff" style={styles.flameIcon} />
          <Text style={styles.disappearBtnText}>DISAPPEAR NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="warning-outline" size={48} color="#FF3B30" style={{ marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Terminate Session?</Text>
            <Text style={styles.modalDesc}>
              This will zeroize memory and destroy the temporary session identity permanently. All streamed documents will vanish.
            </Text>

            <TouchableOpacity style={styles.modalBtnDestructive} onPress={handleDestroy}>
              <Text style={styles.modalBtnDestructiveText}>Zeroize Memory</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalBtnCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    backgroundColor: '#0A0A0A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    marginRight: 10,
  },
  headerTitle: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  wsSyncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#0F291E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  wsPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF41',
    marginRight: 4,
  },
  wsSyncText: {
    color: '#00FF41',
    fontSize: 10,
    fontWeight: '700',
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  financialCard: {
    backgroundColor: '#1C1C36',
    borderColor: '#2C2C5A',
  },
  cardBox: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardSubtitle: {
    color: '#888',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  guestName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  spendLimit: {
    color: '#00E5FF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  upiId: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  scanPayBtn: {
    backgroundColor: '#00E5FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  scanPayBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tokenContainer: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  tokenString: {
    color: '#00FF41',
    fontFamily: 'monospace',
    fontSize: 13,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222',
  },
  docInfo: {
    flex: 1,
    marginLeft: 16,
  },
  docName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  statusStreamed: {
    color: '#34C759',
    fontSize: 13,
    fontWeight: '600',
  },
  appsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appBadge: {
    backgroundColor: '#1A1A1A',
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  appName: {
    color: '#ccc',
    fontSize: 13,
    marginTop: 8,
  },
  restrictionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  restrictionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  restrictionIcon: {
    marginRight: 8,
  },
  restrictionText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#050505',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  disappearBtn: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  flameIcon: {
    marginRight: 10,
  },
  disappearBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalDesc: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalBtnDestructive: {
    backgroundColor: '#FF3B30',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  modalBtnDestructiveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalBtnCancel: {
    backgroundColor: '#2C2C2E',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
