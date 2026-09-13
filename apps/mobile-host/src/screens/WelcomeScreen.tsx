import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.brandSection}>
        <Text style={styles.logo}>PortelX</Text>
        <Text style={styles.tagline}>Borrow. Do. Disappear.</Text>
        <Text style={styles.subtitle}>
          Universal Temporary Identity Layer
        </Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoText}>
          This device will serve as a temporary guest terminal.{'\n'}
          No data will persist after the session ends.
        </Text>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('ScanPair')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            Open Guest Identity Room
          </Text>
        </TouchableOpacity>

        <Text style={styles.securityBadge}>
          🔒 FLAG_SECURE Active • Zero-Residue Enforced
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#60A5FA',
    marginTop: 8,
    fontStyle: 'italic',
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  infoText: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 22,
  },
  actionSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#1D4ED8',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityBadge: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 16,
  },
});
