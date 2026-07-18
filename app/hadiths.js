import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../src/store/SettingsContext';
import { HADITHS } from '../src/lib/religious';
import { toArabicDigits } from '../src/lib/format';

export default function Hadiths() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');

  const data = useMemo(() => {
    if (!q.trim()) return HADITHS;
    const s = q.trim();
    return HADITHS.filter((h) => (h.title || '').includes(s) || (h.kurdish || '').includes(s) || (h.arabic || '').includes(s));
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.ink }]}>حەدیسەکان</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={[styles.search, { backgroundColor: c.card, borderColor: c.line }]}>
        <Ionicons name="search" size={18} color={c.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="گەڕان لە حەدیسەکان..."
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.ink }]}
          textAlign="right"
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(h) => String(h.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        initialNumToRender={6}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
            <View style={styles.cardTop}>
              <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
                <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700' }}>{toArabicDigits(item.id)}</Text>
              </View>
              <Text style={{ flex: 1, color: c.accent, fontSize: 14, fontWeight: '800', textAlign: 'right' }}>{item.title}</Text>
            </View>
            <Text style={[styles.arabic, { color: c.ink }]}>{item.arabic}</Text>
            {item.kurdish ? <Text style={[styles.kurdish, { color: c.muted }]}>{item.kurdish.trim()}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  search: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 12 },
  badge: { minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  arabic: { fontFamily: 'UthmanicHafs', fontSize: 22, lineHeight: 46, textAlign: 'right', writingDirection: 'rtl' },
  kurdish: { fontSize: 14, lineHeight: 27, textAlign: 'right', marginTop: 12, writingDirection: 'rtl' },
});
