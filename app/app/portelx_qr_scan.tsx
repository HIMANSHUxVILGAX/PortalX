import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';

const { width, height } = Dimensions.get('window');
const SCAN_FRAME_SIZE = width * 0.7;

export default function PortelxQRScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const scanLineAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Zero-trace mode: No screenshots allowed in payment scanner
    ScreenCapture.preventScreenCaptureAsync();

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
      ScreenCapture.allowScreenCaptureAsync();
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

    // Mock parsing BharatQR / UPI string
    setPaymentData({
      vpa: data.includes('pa=') ? data.split('pa=')[1].split('&')[0] : 'merchant@upi',
      name: data.includes('pn=') ? decodeURIComponent(data.split('pn=')[1].split('&')[0]) : 'Local Merchant',
      raw: data
    });
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject} 
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
              <Text style={styles.amountText}>150.00</Text>
            </View>

            <TouchableOpacity 
              style={styles.payBtn} 
              onPress={() => {
                // Return to vault after payment
                router.back();
              }}
            >
              <Text style={styles.payBtnText}>Pay Securely via Vault</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setScanned(false)}>
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
    ...StyleSheet.absoluteFillObject,
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
    ...StyleSheet.absoluteFillObject,
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
