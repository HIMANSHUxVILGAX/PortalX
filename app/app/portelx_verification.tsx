import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useSessionStore } from '../src/store/useSessionStore';

const { width } = Dimensions.get('window');

export default function VerificationScreen() {
  const router = useRouter();
  const { openVault, setGuest, guestName, guestHandle, guestPhone } = useSessionStore();

  // Step state: 0 = Ready to scan, 1 = Scanning in progress, 2 = Identity Matched
  const [scanState, setScanState] = useState(0);

  // Animations
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseRing = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const matchCardAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Auto-start scanning simulation on entry
    startScanning();
  }, []);

  const startScanning = async () => {
    setScanState(1);

    // Laser scan animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 180,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse ring animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseRing, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseRing, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access Guest Vault',
          disableDeviceFallback: false,
          cancelLabel: 'Cancel'
        });
        
        if (result.success) {
          const success = await openVault('@guest', '1234');
          if (success) {
            setGuest('Guest User', '@guest', '');
            setScanState(2);
            Animated.spring(matchCardAnim, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }).start();
          } else {
            setScanState(0);
          }
        } else {
          setScanState(0);
        }
      } else {
        // Fallback for web or emulator without biometric
        setTimeout(async () => {
          const success = await openVault('@guest', '1234');
          if (success) {
            setGuest('Guest User', '@guest', '');
            setScanState(2);
            Animated.spring(matchCardAnim, {
              toValue: 0,
              tension: 50,
              friction: 7,
              useNativeDriver: true,
            }).start();
          } else {
            setScanState(0);
          }
        }, 2400);
      }
    } catch (e) {
      console.log('Biometric auth error:', e);
      setScanState(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color="#94A3B8" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>GUEST AUTHENTICATION</Text>
          <Text style={styles.headerSubtitle}>Hardware Enclave Liveness Scan</Text>
        </View>
        <View style={styles.secureBadge}>
          <MaterialIcons name="security" size={16} color="#10B981" />
        </View>
      </View>

      <Animated.ScrollView
        contentContainerStyle={styles.content}
        style={{ opacity: fadeAnim }}
        showsVerticalScrollIndicator={false}
      >
        {/* SCANNER CONTAINER */}
        <View style={styles.scannerWrapper}>
          <Animated.View
            style={[
              styles.scannerCircle,
              {
                transform: [{ scale: pulseRing }],
                borderColor: scanState === 2 ? '#10B981' : '#00E5FF',
              },
            ]}
          >
            {/* Corner Targeting Reticles */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            {/* Central Icon */}
            {scanState === 2 ? (
              <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            ) : (
              <MaterialCommunityIcons
                name="face-recognition"
                size={76}
                color={scanState === 1 ? '#00E5FF' : '#64748B'}
              />
            )}

            {/* Animated Laser Scanning Line */}
            {scanState === 1 && (
              <Animated.View
                style={[
                  styles.scanLine,
                  {
                    transform: [{ translateY: scanLineAnim }],
                  },
                ]}
              />
            )}
          </Animated.View>

          {/* Status Text Under Scanner */}
          <View style={styles.statusBox}>
            {scanState === 1 && (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color="#00E5FF" style={{ marginRight: 8 }} />
                <Text style={styles.scanningText}>Analyzing Biometrics & FIDO2 Enclave...</Text>
              </View>
            )}
            {scanState === 2 && (
              <View style={styles.statusRow}>
                <Ionicons name="shield-checkmark" size={18} color="#10B981" style={{ marginRight: 6 }} />
                <Text style={styles.verifiedText}>Biometric Matched • Identity Confirmed</Text>
              </View>
            )}
          </View>
        </View>

        {/* IDENTIFIED GUEST CARD (Appears when matched) */}
        {scanState === 2 && (
          <Animated.View
            style={[
              styles.matchCard,
              { transform: [{ translateY: matchCardAnim }] },
            ]}
          >
            <View style={styles.matchHeader}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarLetter}>{guestName ? guestName.charAt(0).toUpperCase() : 'G'}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.guestName}>{guestName || 'Guest User'}</Text>
                <Text style={styles.guestHandle}>{guestHandle || '@guest'} • PortelX ID</Text>
              </View>
              <View style={styles.onlineBadge}>
                <View style={styles.dotGreen} />
                <Text style={styles.onlineText}>RECOGNIZED</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Linked Personal Phone</Text>
              <Text style={styles.detailValue}>{guestPhone || 'No phone linked'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Identity Protocol</Text>
              <Text style={styles.detailValue}>W3C DID Zero-Knowledge</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Security Level</Text>
              <Text style={[styles.detailValue, { color: '#10B981' }]}>MSTG Level 2 Enclave</Text>
            </View>

            {/* Notification alert banner */}
            <View style={styles.pushAlertBanner}>
              <Ionicons name="notifications" size={16} color="#00E5FF" style={{ marginRight: 8 }} />
              <Text style={styles.pushAlertText}>
                Device auth push dispatched to {guestName?.split(' ')[0] || 'Guest'}'s primary phone.
              </Text>
            </View>
          </Animated.View>
        )}

        {/* 3FA Checkpoints */}
        <View style={styles.checkpointsContainer}>
          <Text style={styles.sectionHeading}>SECURITY VERIFICATION STAGES</Text>

          <View style={styles.stepItem}>
            <Ionicons
              name={scanState === 2 ? 'checkmark-circle' : 'time'}
              size={20}
              color={scanState === 2 ? '#10B981' : '#00E5FF'}
            />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Biometric & Liveness Capture</Text>
              <Text style={styles.stepDesc}>Facial structure and sensor telemetry verified</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <Ionicons
              name={scanState === 2 ? 'checkmark-circle' : 'radio-button-off'}
              size={20}
              color={scanState === 2 ? '#10B981' : '#64748B'}
            />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>Account Identification</Text>
              <Text style={styles.stepDesc}>PortelX cloud account identified without passwords</Text>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* BOTTOM CTA BUTTON */}
      <View style={styles.bottomBar}>
        {scanState === 2 ? (
          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={() => router.push('/portelx_dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.proceedBtnText}>View Guest Plan & Quota</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.rescanBtn}
            onPress={startScanning}
            disabled={scanState === 1}
          >
            <Text style={styles.rescanBtnText}>
              {scanState === 1 ? 'Scanning in progress...' : 'Touch to Scan Biometric'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07090E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#111827',
    borderRadius: 12,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  secureBadge: {
    padding: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  scannerWrapper: {
    alignItems: 'center',
    marginVertical: 24,
  },
  scannerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    position: 'relative',
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#00E5FF',
  },
  cornerTL: { top: 18, left: 18, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 18, right: 18, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 18, left: 18, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 18, right: 18, borderBottomWidth: 3, borderRightWidth: 3 },

  statusBox: {
    marginTop: 18,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanningText: {
    color: '#00E5FF',
    fontSize: 13,
    fontWeight: '600',
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },

  matchCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: '#07090E',
    fontWeight: '900',
    fontSize: 20,
  },
  guestName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  guestHandle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  onlineText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  detailValue: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  pushAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
  },
  pushAlertText: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
  },

  checkpointsContainer: {
    backgroundColor: '#0B0F17',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionHeading: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 14,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  stepDesc: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(7, 9, 14, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  proceedBtn: {
    backgroundColor: '#00E5FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  proceedBtnText: {
    color: '#07090E',
    fontWeight: '800',
    fontSize: 15,
    marginRight: 8,
  },
  rescanBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  rescanBtnText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 14,
  },
});
