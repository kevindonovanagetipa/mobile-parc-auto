import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getValidToken } from '@/utils/authToken';
import { getAppColors } from '@/constants/colors';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getAppColors(isDark);
  const paperTheme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: colors.primary,
      background: colors.background,
      surface: colors.surface,
      onSurface: colors.text,
      onBackground: colors.text,
      outline: colors.border,
    },
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.surface} />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colors.inputSurface,
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        <AuthGate />
      </PaperProvider>
    </SafeAreaProvider>
  );
}