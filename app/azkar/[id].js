import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { useTheme } from '../../src/store/SettingsContext';
import { getDhikrCategory, getDhikrByCategory } from '../../src/lib/religious';
import { toArabicDigits } from '../../src/lib/format';

export default function AzkarDetail() {
  const { id } = useLocalSearchParams();
  const catId = parseInt(id, 10);
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const category = getDhikrCategory(catId);
  const items = useMemo(() => getDhikrByCategory(catId), [catId]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text numberOfLines={1} style={[styles.hTitle, { color: c.ink }]}>{category?.name || 'ئەزکار'}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {items.map((item, i) => (
          <DhikrCard key={item.id} c={c} item={item} index={i + 1} />
        ))}
      </ScrollView>
    </View>
  );
}

function DhikrCard({ c, item, index }) {
  const target = item.count || 1;
  const [done, setDone] = useState(0);
  const complete = done >= target;

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: complete ? c.accent : c.line }]}>
      <View style={styles.cardTop}>
        <View style={[styles.idx, { backgroundColor: c.accentSoft }]}>
          <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700' }}>{toArabicDigits(index)}</Text>
        </View>
        {target > 1 && (
          <Text style={{ color: c.muted, fontSize: 12 }}>
            جار: {toArabicDigits(target)}
          </Text>
        )}
      </View>

      <Text style={[styles.arabic, { color: c.ink }]}>{item.arabic}</Text>
      {item.kurdish ? <Text style={[styles.kurdish, { color: c.muted }]}>{item.kurdish}</Text> : null}

      <Pressable
        onPress={() => setDone((d) => (d >= target ? 0 : d + 1))}
        style={[styles.counter, { backgroundColor: complete ? c.accent : c.accentSoft }]}
      >
        <Ionicons
          name={complete ? 'checkmark-circle' : 'add-circle-outline'}
          size={20}
          color={complete ? c.onAccent : c.accent}
        />
        <Text style={{ color: complete ? c.onAccent : c.accent, fontSize: 14, fontWeight: '700' }}>
          {complete ? 'تەواو بوو' : `${toArabicDigits(done)} / ${toArabicDigits(target)}`}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  idx: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  arabic: { fontFamily: 'UthmanicHafs', fontSize: 24, lineHeight: 50, textAlign: 'right', writingDirection: 'rtl' },
  kurdish: { fontSize: 14, lineHeight: 26, textAlign: 'right', marginTop: 10, writingDirection: 'rtl' },
  counter: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12, marginTop: 14 },
});
