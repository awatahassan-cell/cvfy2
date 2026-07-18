import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../../src/store/SettingsContext';
import { searchQuran, getSurah, getSurahs } from '../../src/lib/quran';
import { toArabicDigits } from '../../src/lib/format';

const ALL_SURAHS = getSurahs();

export default function Search() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    // Match surah names first, then ayah text.
    const nameMatches = ALL_SURAHS.filter((s) => s.name.includes(q) || (s.kurdishName || '').includes(q)).map((s) => ({
      type: 'surah',
      surah: s.number,
    }));
    const ayahMatches = searchQuran(q, 40).map((a) => ({ type: 'ayah', surah: a.surah, ayah: a.ayah, text: a.text }));
    return [...nameMatches, ...ayahMatches];
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8 }}>
      <Text style={[styles.title, { color: c.ink }]}>گەڕان</Text>
      <View style={[styles.searchBox, { backgroundColor: c.card, borderColor: c.line }]}>
        <Ionicons name="search" size={18} color={c.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="گەڕان بەناوی سوورەت یان دەق..."
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.ink }]}
          textAlign="right"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={c.muted} />
          </Pressable>
        ) : null}
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, i) => `${item.type}-${item.surah}-${item.ayah || 0}-${i}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          query ? (
            <Text style={{ color: c.muted, textAlign: 'center', marginTop: 40 }}>هیچ ئەنجامێک نەدۆزرایەوە</Text>
          ) : (
            <Text style={{ color: c.muted, textAlign: 'center', marginTop: 40 }}>ناوی سوورەت یان دەقی ئایەت بنووسە</Text>
          )
        }
        renderItem={({ item }) => {
          const surah = getSurah(item.surah);
          return (
            <Pressable
              style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}
              onPress={() => router.push('/reader/' + item.surah)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.accent, fontSize: 12, fontWeight: '700', textAlign: 'right' }}>
                  {surah?.name} {item.ayah ? `· ئایە ${toArabicDigits(item.ayah)}` : ''}
                </Text>
                {item.text ? (
                  <Text numberOfLines={2} style={[styles.ar, { color: c.ink }]}>
                    {item.text}
                  </Text>
                ) : (
                  <Text style={{ color: c.muted, fontSize: 12, textAlign: 'right', marginTop: 4 }}>
                    {surah?.place} · {toArabicDigits(surah?.numberOfAyahs)} ئایە
                  </Text>
                )}
              </View>
              <Ionicons name="chevron-back" size={18} color={c.muted} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', paddingHorizontal: 20, textAlign: 'right' },
  searchBox: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  ar: { fontFamily: 'UthmanicHafs', fontSize: 20, lineHeight: 40, textAlign: 'right', marginTop: 4 },
});
