import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../context/ThemeContext';
import { registerServiceWorker } from '../utils/pwa';

export default function RootLayout() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="index" options={{ title: 'Home' }} />
            <Stack.Screen name="game" options={{ title: 'Game' }} />
            <Stack.Screen name="ranking" options={{ title: 'Ranking' }} />
            <Stack.Screen name="+not-found" options={{ title: 'Not found' }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
