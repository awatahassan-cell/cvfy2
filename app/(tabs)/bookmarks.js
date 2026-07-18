import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSettings, useTheme } from '../../src/store/SettingsContext';
import { getSurah, getSurahAyahs } from '../../src/lib/quran';
import { toArabicDigits } from '../../src/lib/format';

export default function Bookmarks() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { bookmarks, toggleBookmark } = useSettings();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 8 }}>
      <Text style={[styles.title, { color: c.ink }]}>نیشانەکان</Text>
      <FlatList
        data={bookmarks}
        keyExtractor={(b) => `${b.surah}:${b.ayah}`}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="bookmark-outline" size={48} color={c.muted} />
            <Text style={{ color: c.muted, marginTop: 12 }}>هیچ نیشانەیەک زیاد نەکراوە</Text>
          </View>
        }
        renderItem={({ item }) => {
          const surah = getSurah(item.surah);
          const ayah = getSurahAyahs(item.surah).find((a) => a.ayah === item.ayah);
          return (
            <Pressable
              style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}
              onPress={() => router.push('/reader/' + item.surah)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.accent, fontSize: 12, fontWeight: '700', textAlign: 'right' }}>
                  {surah?.name} · ئایە {toArabicDigits(item.ayah)}
                </Text>
                {ayah ? (
                  <Text numberOfLines={2} style={[styles.ar, { color: c.ink }]}>
                    {ayah.text}
                  </Text>
                ) : null}
              </View>
              <Pressable hitSlop={10} onPress={() => toggleBookmark(item.surah, item.ayah)}>
                <Ionicons name="trash-outline" size={20} color={c.muted} />
              </Pressable>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', paddingHorizontal: 20, textAlign: 'right' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  ar: { fontFamily: 'UthmanicHafs', fontSize: 20, lineHeight: 40, textAlign: 'right', marginTop: 4 },
});
