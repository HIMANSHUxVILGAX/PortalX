import React from 'react';
import { Stack } from 'expo-router';

export default function GuestLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: '#0F172A' },
      }}
    />
  );
}
