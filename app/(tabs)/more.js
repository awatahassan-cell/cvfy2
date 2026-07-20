import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../../src/store/SettingsContext';

const RELIGIOUS = [
  { route: '/qibla', icon: 'compass', label: 'قیبلە', sub: 'ئاراستەی کەعبە' },
  { route: '/calendar', icon: 'calendar-month', label: 'تەقویمی هیجری', sub: 'ڕۆژژمێری کۆچی' },
  { route: '/hadiths', icon: 'book-open-variant', label: 'حەدیسەکان', sub: '٢٤٠ حەدیس' },
  { route: '/names', icon: 'star-four-points', label: '٩٩ ناوی خودا', sub: 'ئەسماء الحسنیٰ' },
  { route: '/seerah', icon: 'timeline-text', label: 'سیرەتی پێغەمبەر ﷺ', sub: 'ژیاننامە' },
  { route: '/companions', icon: 'account-group', label: 'هاوەڵان', sub: 'صەحابەکان' },
];

const TOOLS = [
  { route: '/search', icon: 'search', label: 'گەڕان' },
  { route: '/bookmarks', icon: 'bookmark', label: 'نیشانەکان' },
  { route: '/downloads', icon: 'cloud-download', label: 'داگرتنەکان' },
  { route: '/settings', icon: 'settings', label: 'ڕێکخستنەکان' },
];

export default function More() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 160 }}
    >
      <Text style={[styles.title, { color: c.ink }]}>زیاتر</Text>

      <Text style={[styles.section, { color: c.muted }]}>بابەتی ئاینی</Text>
      <View style={styles.grid}>
        {RELIGIOUS.map((item) => (
          <Pressable
            key={item.route}
            style={[styles.gridCard, { backgroundColor: c.card, borderColor: c.line }]}
            onPress={() => router.push(item.route)}
          >
            <View style={[styles.gridIcon, { backgroundColor: c.accentSoft }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={c.accent} />
            </View>
            <Text style={{ color: c.ink, fontSize: 14, fontWeight: '700', textAlign: 'right' }}>{item.label}</Text>
            <Text style={{ color: c.muted, fontSize: 11, textAlign: 'right', marginTop: 2 }}>{item.sub}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.section, { color: c.muted }]}>ئامرازەکان</Text>
      <View style={{ gap: 10 }}>
        {TOOLS.map((item) => (
          <Pressable
            key={item.route}
            style={[styles.listRow, { backgroundColor: c.card, borderColor: c.line }]}
            onPress={() => router.push(item.route)}
          >
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
              <Ionicons name={item.icon} size={20} color={c.accent} />
              <Text style={{ color: c.ink, fontSize: 14, fontWeight: '600' }}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-back" size={18} color={c.muted} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', textAlign: 'right', marginBottom: 8 },
  section: { fontSize: 12, fontWeight: '700', textAlign: 'right', marginTop: 20, marginBottom: 12 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  gridCard: { width: '47%', flexGrow: 1, borderRadius: 18, borderWidth: 1, padding: 16 },
  gridIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  listRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 14, borderWidth: 1 },
});
