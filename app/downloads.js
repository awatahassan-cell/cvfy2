import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../src/store/SettingsContext';
import { useDownloads } from '../src/store/DownloadsContext';
import { getSurah } from '../src/lib/quran';
import { getReciter } from '../src/lib/reciters';
import { listDownloaded, totalSizeBytes } from '../src/lib/downloads';
import { toArabicDigits } from '../src/lib/format';

function fmtSize(bytes) {
  if (!bytes) return '٠';
  const mb = bytes / (1024 * 1024);
  return toArabicDigits(mb.toFixed(1)) + ' MB';
}

export default function Downloads() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { downloaded, remove } = useDownloads();
  const [items, setItems] = useState([]);
  const [size, setSize] = useState(0);

  const load = useCallback(async () => {
    setItems(await listDownloaded());
    setSize(await totalSizeBytes());
  }, []);

  useEffect(() => {
    load();
  }, [load, downloaded]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.ink }]}>داگرتنەکان</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={[styles.summary, { backgroundColor: c.card, borderColor: c.line }]}>
        <Text style={{ color: c.muted, fontSize: 13 }}>{toArabicDigits(items.length)} سوورەت داگیراوە</Text>
        <Text style={{ color: c.accent, fontSize: 14, fontWeight: '700' }}>{fmtSize(size)}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(x) => x.key}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 60 }}>
            <Ionicons name="cloud-download-outline" size={48} color={c.muted} />
            <Text style={{ color: c.muted, marginTop: 12 }}>هیچ دەنگێک داگیراوە نییە</Text>
            <Text style={{ color: c.muted, marginTop: 4, fontSize: 12 }}>لە پەڕەی خوێندنەوە دوگمەی داگرتن لێبدە</Text>
          </View>
        }
        renderItem={({ item }) => {
          const surah = getSurah(item.surah);
          const reciter = getReciter(item.reciterId);
          return (
            <Pressable
              style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}
              onPress={() => router.push('/reader/' + item.surah)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.ink, fontSize: 15, fontWeight: '700', textAlign: 'right' }}>{surah?.name}</Text>
                <Text style={{ color: c.muted, fontSize: 12, textAlign: 'right', marginTop: 2 }}>{reciter?.name}</Text>
              </View>
              <Pressable hitSlop={10} onPress={() => remove(item.reciterId, item.surah)}>
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
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  summary: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', margin: 16, padding: 14, borderRadius: 14, borderWidth: 1 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
});
