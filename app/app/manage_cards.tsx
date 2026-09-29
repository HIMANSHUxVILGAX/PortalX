import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/useAppStore';

const { width } = Dimensions.get('window');

const CARD_WIDTH = width - 40;
const CARD_HEIGHT = CARD_WIDTH * 0.63;

interface CardProps {
  type: string;
  bank: string;
  number: string;
  color: string;
  delay: number;
}

const PaymentCard: React.FC<CardProps> = ({ type, bank, number, color, delay }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        { backgroundColor: color, opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardBank}>{bank}</Text>
        <MaterialCommunityIcons name="integrated-circuit-chip" size={32} color="rgba(255,255,255,0.7)" />
      </View>
      <View style={styles.cardNumberContainer}>
        <Text style={styles.cardNumber}>{number}</Text>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardType}>{type}</Text>
        <MaterialCommunityIcons name="nfc" size={24} color="#FFF" />
      </View>
    </Animated.View>
  );
};

export default function ManageCardsScreen() {
  const router = useRouter();
  const { cards } = useAppStore();
  const nfcScale = useRef(new Animated.Value(1)).current;
  const nfcOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(nfcScale, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(nfcScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(nfcOpacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(nfcOpacity, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [nfcOpacity, nfcScale]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Global Cards & UPI</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.nfcSection}>
          <View style={styles.nfcIconContainer}>
            <Animated.View
              style={[
                styles.nfcPulse,
                { transform: [{ scale: nfcScale }], opacity: nfcOpacity },
              ]}
            />
            <MaterialCommunityIcons name="contactless-payment" size={48} color="#007AFF" />
          </View>
          <Text style={styles.nfcText}>Ready to Tap & Pay</Text>
        </View>

        <View style={styles.cardsStack}>
          {cards.map((card, idx) => (
            <PaymentCard
              key={card.id}
              type={card.network}
              bank={card.bank}
              number={card.maskedNumber}
              color={card.backgroundColor}
              delay={100 + (idx * 150)}
            />
          ))}

          <TouchableOpacity style={styles.addCardButton}>
            <Ionicons name="add" size={32} color="#8E8E93" />
            <Text style={styles.addCardText}>Add New Payment Method</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  nfcSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
  },
  nfcIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  nfcPulse: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    opacity: 0.2,
  },
  nfcText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  cardsStack: {
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBank: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 1,
  },
  cardNumberContainer: {
    marginTop: 20,
  },
  cardNumber: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFF',
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    fontStyle: 'italic',
  },
  addCardButton: {
    width: CARD_WIDTH,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 8,
  },
});
