import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import RegisterPasskeyScreen from '../screens/RegisterPasskeyScreen';
import ShowQRScreen from '../screens/ShowQRScreen';
import SessionAlertScreen from '../screens/SessionAlertScreen';
import ActiveSessionsScreen from '../screens/ActiveSessionsScreen';

export type PrimaryStackParamList = {
  Dashboard: undefined;
  RegisterPasskey: undefined;
  ShowQR: undefined;
  SessionAlert: { sessionId: string; hostDeviceId: string; action: string };
  ActiveSessions: undefined;
};

const Stack = createNativeStackNavigator<PrimaryStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: '#0F172A' },
        }}
      >
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="RegisterPasskey" component={RegisterPasskeyScreen} />
        <Stack.Screen name="ShowQR" component={ShowQRScreen} />
        <Stack.Screen name="SessionAlert" component={SessionAlertScreen} />
        <Stack.Screen name="ActiveSessions" component={ActiveSessionsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

