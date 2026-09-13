import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import ScanPairScreen from '../screens/ScanPairScreen';
import AuthGateScreen from '../screens/AuthGateScreen';
import GuestVaultScreen from '../screens/GuestVaultScreen';
import SessionEndScreen from '../screens/SessionEndScreen';

export type RootStackParamList = {
  Welcome: undefined;
  ScanPair: undefined;
  AuthGate: { sessionId: string };
  GuestVault: { sessionId: string; ttl: number };
  SessionEnd: { reason: 'timeout' | 'manual' | 'panic' };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="ScanPair" component={ScanPairScreen} />
        <Stack.Screen name="AuthGate" component={AuthGateScreen} />
        <Stack.Screen name="GuestVault" component={GuestVaultScreen} />
        <Stack.Screen name="SessionEnd" component={SessionEndScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
