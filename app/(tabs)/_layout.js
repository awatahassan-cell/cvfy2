import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/store/SettingsContext';
import MiniPlayer from '../../src/components/MiniPlayer';

export default function TabsLayout() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const tabBarHeight = 58 + insets.bottom;

  const icon = (Lib, name) => ({ color }) => <Lib name={name} size={22} color={color} />;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: c.accent,
          tabBarInactiveTintColor: c.muted,
          tabBarStyle: {
            backgroundColor: c.card,
            borderTopColor: c.line,
            borderTopWidth: 1,
            height: tabBarHeight,
            paddingTop: 8,
            paddingBottom: insets.bottom || 8,
          },
          tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: 'سەرەکی', tabBarIcon: icon(Ionicons, 'home-outline') }}
        />
        <Tabs.Screen
          name="prayer"
          options={{ title: 'نوێژ', tabBarIcon: icon(MaterialCommunityIcons, 'clock-time-four-outline') }}
        />
        <Tabs.Screen
          name="qibla"
          options={{ title: 'قیبلە', tabBarIcon: icon(MaterialCommunityIcons, 'compass-outline') }}
        />
        <Tabs.Screen
          name="azkar"
          options={{ title: 'ئەزکار', tabBarIcon: icon(MaterialCommunityIcons, 'hands-pray') }}
        />
        <Tabs.Screen
          name="more"
          options={{ title: 'زیاتر', tabBarIcon: icon(Ionicons, 'grid-outline') }}
        />
      </Tabs>
      <MiniPlayer bottom={tabBarHeight + 8} />
    </View>
  );
}
