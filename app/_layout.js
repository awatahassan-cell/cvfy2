import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { SettingsProvider, useTheme, useSettings } from '../src/store/SettingsContext';
import { PlayerProvider } from '../src/store/PlayerContext';
import { DownloadsProvider } from '../src/store/DownloadsContext';
import { installUIFontPatch, setUIFontFamily, familyForFont } from '../src/lib/uiFont';

SplashScreen.preventAutoHideAsync().catch(() => {});
installUIFontPatch();

function ThemedStack() {
  const theme = useTheme();
  const { fontId } = useSettings();
  // Apply the chosen UI font, then remount the tree so every Text re-renders with it.
  setUIFontFamily(familyForFont(fontId));
  return (
    <View style={{ flex: 1 }} key={fontId}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      {theme.gradient ? (
        <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFillObject} />
      ) : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="reader/[id]" />
        <Stack.Screen name="player" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    UthmanicHafs: require('../assets/fonts/UthmanicHafs.otf'),
    NotoNaskhArabic: require('../assets/fonts/NotoNaskhArabic.ttf'),
    NotoKufiArabic: require('../assets/fonts/NotoKufiArabic.ttf'),
    Vazirmatn: require('../assets/fonts/Vazirmatn.ttf'),
    Cairo: require('../assets/fonts/Cairo.ttf'),
    Lalezar: require('../assets/fonts/Lalezar.ttf'),
    SarkarKosary: require('../assets/fonts/SarkarKosary.ttf'),
    SarkarTesla: require('../assets/fonts/SarkarTesla.ttf'),
    RudawBold: require('../assets/fonts/RudawBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <DownloadsProvider>
            <PlayerProvider>
              <ThemedStack />
            </PlayerProvider>
          </DownloadsProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
