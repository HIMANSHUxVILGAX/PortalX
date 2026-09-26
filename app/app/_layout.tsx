import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="portelx_dashboard" />
      <Stack.Screen name="portelx_verification" />
      <Stack.Screen name="portelx_vault" />
      <Stack.Screen name="portelx_qr_scan" />
      <Stack.Screen name="crypto_portfolio" />
      <Stack.Screen name="manage_cards" />
      <Stack.Screen name="portelx_zeroized" />
      <Stack.Screen name="trusted_circle" />
      <Stack.Screen name="passwords_otp" />
      <Stack.Screen name="passwords_vault" />
    </Stack>
  );
}
