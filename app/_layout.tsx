import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { getValidToken } from '@/utils/authToken';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AuthGate() {
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const token = await getValidToken();

        if (!mounted) return;

        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <AuthGate />
    </PaperProvider>
  );
}