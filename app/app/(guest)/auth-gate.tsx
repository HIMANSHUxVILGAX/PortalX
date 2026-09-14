import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function AuthGateScreen() {
  const [step, setStep] = useState(1);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Session Authentication</Text>
      
      <View style={styles.progress}>
        <View style={[styles.circle, step >= 1 && styles.circleActive]}><Text style={styles.cText}>1</Text></View>
        <View style={[styles.line, step >= 2 && styles.lineActive]} />
        <View style={[styles.circle, step >= 2 && styles.circleActive]}><Text style={styles.cText}>2</Text></View>
        <View style={[styles.line, step >= 3 && styles.lineActive]} />
        <View style={[styles.circle, step >= 3 && styles.circleActive]}><Text style={styles.cText}>3</Text></View>
      </View>

      {step === 1 && (
        <View style={styles.stepBox}>
          <Text style={styles.stepTitle}>Credentials</Text>
          <TextInput style={styles.input} placeholder="@handle" placeholderTextColor="#64748B" value="@himanshu" editable={false} />
          <TextInput style={styles.input} placeholder="PIN" placeholderTextColor="#64748B" secureTextEntry value="1234" editable={false} />
          <TouchableOpacity style={styles.btn} onPress={() => setStep(2)}>
            <Text style={styles.btnText}>Verify Credentials</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && (
        <View style={styles.stepBox}>
          <Text style={styles.stepTitle}>Biometric Verification</Text>
          <Text style={styles.bioIcon}>👆</Text>
          <TouchableOpacity style={styles.btn} onPress={() => setStep(3)}>
            <Text style={styles.btnText}>Authenticate Biometric</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 3 && (
        <View style={styles.stepBox}>
          <Text style={styles.stepTitle}>Risk Assessment</Text>
          <View style={styles.riskCard}>
            <Text style={styles.rLabel}>Device Trust: <Text style={styles.rVal}>87/100</Text></Text>
            <Text style={styles.rLabel}>Location: <Text style={styles.rVal}>Safe Zone</Text></Text>
            <Text style={styles.rLabel}>Overall Risk: <Text style={[styles.rVal, { color: '#22C55E' }]}>LOW</Text></Text>
          </View>
          <TouchableOpacity style={[styles.btn, { backgroundColor: '#166534' }]} onPress={() => router.replace('/(guest)/vault')}>
            <Text style={styles.btnText}>Enter Guest Vault</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', paddingHorizontal: 24, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#FFF', textAlign: 'center', marginBottom: 30 },
  progress: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  circle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#334155' },
  circleActive: { backgroundColor: '#1D4ED8', borderColor: '#3B82F6' },
  cText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  line: { width: 40, height: 2, backgroundColor: '#334155' },
  lineActive: { backgroundColor: '#3B82F6' },
  stepBox: { backgroundColor: '#1E293B', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  stepTitle: { fontSize: 18, fontWeight: '600', color: '#FFF', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#0F172A', borderRadius: 8, padding: 14, color: '#FFF', marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  btn: { width: '100%', backgroundColor: '#1D4ED8', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  bioIcon: { fontSize: 48, marginBottom: 20 },
  riskCard: { width: '100%', backgroundColor: '#0F172A', padding: 16, borderRadius: 8, marginBottom: 20 },
  rLabel: { color: '#94A3B8', fontSize: 13, marginBottom: 6 },
  rVal: { color: '#FFF', fontWeight: '600' },
});
