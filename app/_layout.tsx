import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sidebar from '../components/Sidebar/Sidebar';
import ToolsButton from '../components/ToolsButton/ToolsButton';
import { ThemeProvider } from '../context/ThemeContext';
import { registerServiceWorker } from '../utils/pwa';

function MobileShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
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
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToolsButton visible={!sidebarOpen} onPress={() => setSidebarOpen(true)} />
      <StatusBar style="light" />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <MobileShell />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
