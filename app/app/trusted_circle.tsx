import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TrustedCircleScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600, useNativeDriver: true, }).start();
  }, []);

  const contacts = [
    { id: '1', name: 'Vikash Kumar (Family)', status: 'Verified Node' },
    { id: '2', name: 'Ananya Sharma (Colleague)', status: 'Verified Node' },
    { id: '3', name: 'Rohan Gupta (Friend)', status: 'Verified Node' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#4F8EF7" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Federated Trusted Circle</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>P2P verified contacts who can automatically spawn enclaves.</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {contacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactAvatar}>
                <Ionicons name="person" size={24} color="#0f172a" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <View style={styles.badgeContainer}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color="#34C759" />
                  <Text style={styles.badgeText}>{contact.status}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>

        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={24} color="#FFF" />
          <Text style={styles.fabText}>Add Node</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Cyber/Dark theme
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    color: '#4F8EF7',
    fontSize: 17,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFF',
  },
  headerRight: {
    width: 80,
  },
  subtitleContainer: {
    padding: 16,
    backgroundColor: 'rgba(79, 142, 247, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 142, 247, 0.2)',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollContent: {
    padding: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    color: '#34C759',
    marginLeft: 4,
    fontWeight: '500',
  },
  moreButton: {
    padding: 8,
  },
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F8EF7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#4F8EF7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
