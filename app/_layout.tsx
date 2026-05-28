import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { Redirect } from 'expo-router';

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </PaperProvider>
  );
}