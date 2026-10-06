import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Sidebar from './components/Sidebar/Sidebar';
import ToolsButton from './components/ToolsButton/ToolsButton';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';
import { registerServiceWorker } from './utils/pwa';
import GameView from './views/Game/Game';
import HomeView from './views/Home/Home';
import RankingView from './views/Ranking/Ranking';
import { getStyles } from './App.styles';

const styles = getStyles();

function MobileShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { screen } = useNavigation();

  return (
    <>
      {screen === 'home' && <HomeView />}
      {screen === 'game' && <GameView />}
      {screen === 'ranking' && <RankingView />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <ToolsButton visible={!sidebarOpen} onPress={() => setSidebarOpen(true)} />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  useEffect(() => {
    void registerServiceWorker();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationProvider>
            <MobileShell />
          </NavigationProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
