import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/services/api';

interface PasswordEntry {
  id: string;
  service: string;
  username: string;
  password: string;
}

export default function PasswordsVaultScreen() {
  const router = useRouter();

  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);

  React.useEffect(() => {
    fetchPasswords();
  }, []);

  const fetchPasswords = async () => {
    try {
      const data = await api.getPasswords();
      setPasswords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch passwords:', error);
    }
  };

  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [modalVisible, setModalVisible] = useState(false);

  // New password form state
  const [newService, setNewService] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopy = (text: string) => {
    // In a real app we'd use Clipboard API. For the demo, we just simulate it.
    console.log('Copied to clipboard:', text);
    // Could add a toast notification here
  };

  const handleAddPassword = async () => {
    if (!newService || !newUsername || !newPassword) return;

    try {
      await api.addPassword(newService, newUsername, newPassword);
      await fetchPasswords();
      setNewService('');
      setNewUsername('');
      setNewPassword('');
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to add password:', error);
    }
  };

  const handleDeletePassword = async (id: string) => {
    try {
      await api.deletePassword(id);
      await fetchPasswords();
    } catch (error) {
      console.error('Failed to delete password:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#4ADE80" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="lock-closed" size={20} color="#4ADE80" style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>Local Secure Vault</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>SAVED CREDENTIALS</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
              <Ionicons name="add" size={20} color="#1E293B" />
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>

          {passwords.map((item) => {
            const isRevealed = revealedIds.has(item.id);
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceIconPlaceholder}>
                      <Text style={styles.serviceInitials}>{item.service?.substring(0, 1)?.toUpperCase() || '?'}</Text>
                    </View>
                    <Text style={styles.serviceName}>{item.service}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeletePassword(item.id)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>USERNAME</Text>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldValue} numberOfLines={1}>{item.username}</Text>
                    <TouchableOpacity onPress={() => handleCopy(item.username)} style={styles.actionButton}>
                      <Ionicons name="copy-outline" size={18} color="#94A3B8" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldContainer}>
                  <Text style={styles.fieldLabel}>PASSWORD</Text>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldValue} numberOfLines={1}>
                      {isRevealed ? item.password : '••••••••••••••••'}
                    </Text>
                    <View style={styles.actionsGroup}>
                      <TouchableOpacity onPress={() => toggleReveal(item.id)} style={styles.actionButton}>
                        <Ionicons name={isRevealed ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleCopy(item.password)} style={[styles.actionButton, { marginLeft: 8 }]}>
                        <Ionicons name="copy-outline" size={18} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Add Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Credential</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Service Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Netflix"
                  placeholderTextColor="#64748B"
                  value={newService}
                  onChangeText={setNewService}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username / Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="user@example.com"
                  placeholderTextColor="#64748B"
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor="#64748B"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddPassword}>
                <Text style={styles.saveButtonText}>Save to Vault</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617', // Very dark slate/blue for cyber feel
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
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  backText: {
    color: '#4ADE80',
    fontSize: 17,
    marginLeft: -4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F8FAFC',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 80,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#1E293B',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  serviceInitials: {
    color: '#4ADE80',
    fontSize: 18,
    fontWeight: '700',
  },
  serviceName: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020617',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  fieldValue: {
    color: '#E2E8F0',
    fontSize: 15,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    color: '#F8FAFC',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: Platform.OS === 'ios' ? 24 : 0,
  },
  saveButtonText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: '700',
  },
});
