import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated, TextInput, Platform, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import { useSessionStore } from '../src/store/useSessionStore';
import api from '../src/services/api';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function PortelxQRScanScreen() {
  const router = useRouter();
  const { session } = useSessionStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const scanLineAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Zero-trace mode: No screenshots allowed in payment scanner
    if (Platform.OS !== 'web') {
      try {
        ScreenCapture.preventScreenCaptureAsync();
      } catch (e) { }
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: SCAN_FRAME_SIZE,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        })
      ])
    ).start();

    return () => {
      if (Platform.OS !== 'web') {
        try {
          ScreenCapture.allowScreenCaptureAsync();
        } catch (e) { }
      }
    };
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera for QR Scanning.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    let vpa = 'Unknown VPA';
    let name = 'Unknown Merchant';
    let amount = '';

    if (data.includes('upi://pay')) {
      const urlParams = new URLSearchParams(data.split('?')[1]);
      vpa = urlParams.get('pa') || vpa;
      try {
        name = urlParams.get('pn') ? decodeURIComponent(urlParams.get('pn')!) : name;
      } catch (e) {
        name = 'Unknown Merchant';
      }
      amount = urlParams.get('am') || '';
    } else {
      Alert.alert("Invalid QR", "This is not a valid UPI payment QR code.");
      setScanned(false);
      return;
    }

    setPaymentData({ vpa, name, amount, raw: data });
  };

  const executePayment = async () => {
    if (!pin || pin.length < 4) {
      Alert.alert("Error", "Please enter a valid 4-digit PIN!");
      return;
    }
    setIsProcessing(true);
    try {
      const res = await api.makePayment({
        sessionId: session?.sessionId || '',
        amount: parseFloat(paymentData.amount || '0'),
        vpa: paymentData.vpa,
        merchantName: paymentData.name,
        pin: pin
      });
      if (res.status === 'success' || res.status === 'completed') {
        Alert.alert("Success", res.message || 'Payment Successful');
        router.back();
      } else {
        Alert.alert("Payment Failed", res.message);
        setPin('');
      }
    } catch (e: any) {
      Alert.alert("Error", "Network error or payment failed: " + (e.message || 'Unknown error'));
      setPin('');
    }
    setIsProcessing(false);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Dark overlay for scanner framing */}
      <View style={styles.overlay}>
        <View style={styles.overlayTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Scan BharatQR / UPI</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.overlayMiddle}>
          <View style={styles.overlaySide} />
          <View style={styles.scanFrame}>
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineAnim }] }]} />
            {/* Corner brackets */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <View style={styles.overlaySide} />
        </View>

        <View style={styles.overlayBottom}>
          <Text style={styles.instructionText}>
            Point at a QR code to securely pay from the active PortelX Vault.
          </Text>
        </View>
      </View>

      {/* Payment Confirmation Modal */}
      {scanned && paymentData && (
        <View style={styles.paymentModal}>
          <View style={styles.paymentCard}>
            <View style={styles.merchantIcon}>
              <Ionicons name="storefront" size={32} color="#00E5FF" />
            </View>
            <Text style={styles.merchantName}>{paymentData.name}</Text>
            <Text style={styles.merchantVpa}>{paymentData.vpa}</Text>

            <View style={styles.amountBox}>
              <Text style={styles.rupeeSymbol}>₹</Text>
              {!paymentData.raw.includes('am=') ? (
                <TextInput
                  style={[styles.amountText, { borderBottomWidth: 1, borderColor: '#00E5FF', minWidth: 100 }]}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#64748B"
                  value={paymentData.amount}
                  onChangeText={(t) => setPaymentData({ ...paymentData, amount: t })}
                  autoFocus
                />
              ) : (
                <Text style={styles.amountText}>{paymentData.amount}</Text>
              )}
            </View>

            <View style={{ backgroundColor: 'rgba(0, 229, 255, 0.1)', padding: 10, borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="wallet-outline" size={16} color="#00E5FF" />
              <Text style={{ color: '#00E5FF', fontSize: 12, marginLeft: 8, fontWeight: '700' }}>Funding Source: PortelX Web3 Wallet</Text>
            </View>

            <TextInput
              style={styles.pinInput}
              keyboardType="numeric"
              secureTextEntry
              placeholder="Enter 4-Digit UPI PIN (1234)"
              placeholderTextColor="#64748B"
              value={pin}
              onChangeText={setPin}
              maxLength={4}
            />

            <TouchableOpacity
              style={styles.payBtn}
              onPress={executePayment}
              disabled={isProcessing}
            >
              <Text style={styles.payBtnText}>{isProcessing ? "Processing..." : "Pay Securely via Vault"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setScanned(false); setPin(''); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: '#00E5FF',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 40,
  },
  btnText: {
    textAlign: 'center',
    color: '#000',
    fontWeight: 'bold',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  overlayMiddle: {
    flexDirection: 'row',
    height: SCAN_FRAME_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanFrame: {
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00E5FF',
  },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  paymentModal: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  paymentCard: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  merchantIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  merchantName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  merchantVpa: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  rupeeSymbol: {
    color: '#00E5FF',
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 8,
  },
  amountText: {
    color: '#fff',
    fontSize: 42,
    fontWeight: 'bold',
  },
  pinInput: {
    backgroundColor: '#0F172A',
    width: '100%',
    padding: 16,
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  payBtn: {
    backgroundColor: '#00E5FF',
    width: '100%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  payBtnText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    padding: 16,
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 16,
  },
});
