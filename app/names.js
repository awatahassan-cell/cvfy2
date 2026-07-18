import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../src/store/SettingsContext';
import { NAMES } from '../src/lib/religious';
import { toArabicDigits } from '../src/lib/format';

export default function Names() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.ink }]}>٩٩ ناوی خودا</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={NAMES}
        keyExtractor={(n) => String(n.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
            <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
              <Text style={{ color: c.accent, fontSize: 12, fontWeight: '700' }}>{toArabicDigits(item.id)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.arabic, { color: c.accent }]}>{item.arabic}</Text>
              {item.kurdish ? <Text style={[styles.meaning, { color: c.muted }]}>{item.kurdish}</Text> : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  card: { flexDirection: 'row-reverse', gap: 14, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10, alignItems: 'flex-start' },
  badge: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  arabic: { fontFamily: 'UthmanicHafs', fontSize: 26, textAlign: 'right' },
  meaning: { fontSize: 14, lineHeight: 25, textAlign: 'right', marginTop: 6, writingDirection: 'rtl' },
});
