import 'react-native-get-random-values'; // Must be first import
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { useEffect, useState, useCallback } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { initDatabase } from './src/db/database';
import { useSettingsStore } from './src/store/settingsStore';
import { useBibleStore } from './src/store/bibleStore';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const theme = useSettingsStore((s) => s.theme);
  const loadActivePlan = useBibleStore((s) => s.loadActivePlan);
  const systemScheme = useColorScheme();
  const isDark = theme === 'dark' || (theme === 'auto' && systemScheme === 'dark');

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        await initDatabase();
        await loadSettings();
        await loadActivePlan();
      } catch (e) {
        console.error('App init error:', e);
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady && (fontsLoaded || fontError)) {
      await SplashScreen.hideAsync();
    }
  }, [appReady, fontsLoaded, fontError]);

  if (!appReady || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
