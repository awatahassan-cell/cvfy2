import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../../src/store/SettingsContext';
import { getSurahs, getSurah, getJuzList, getHizbList, getPageList } from '../../src/lib/quran';
import { toArabicDigits } from '../../src/lib/format';

const SURAHS = getSurahs();
const JUZ = getJuzList();
const HIZB = getHizbList();
const PAGES = getPageList();
const TABS = ['سوورە', 'جوزء', 'حزب', 'پەڕە'];

export default function Quran() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);

  const { data, kind } = useMemo(() => {
    if (tab === 1) return { data: JUZ, kind: 'juz' };
    if (tab === 2) return { data: HIZB, kind: 'hizb' };
    if (tab === 3) return { data: PAGES, kind: 'page' };
    return { data: SURAHS, kind: 'surah' };
  }, [tab]);

  const Header = (
    <View>
      <View style={styles.head}>
        <Text style={[styles.h1, { color: c.ink }]}>قورئان</Text>
        <Pressable onPress={() => router.push('/search')} style={[styles.searchBtn, { backgroundColor: c.card, borderColor: c.line }]}>
          <Ionicons name="search" size={18} color={c.muted} />
        </Pressable>
      </View>
      <View style={[styles.tabs, { borderBottomColor: c.line }]}>
        {TABS.map((t, i) => (
          <Pressable key={t} onPress={() => setTab(i)}>
            <Text
              style={[
                styles.tab,
                { color: tab === i ? c.ink : c.muted, borderBottomColor: tab === i ? c.accent : 'transparent' },
              ]}
            >
              {t}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 6 }}>
      <FlatList
        data={data}
        keyExtractor={(item) => kind + '-' + (item.number)}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingBottom: 160 }}
        renderItem={({ item }) =>
          kind === 'surah' ? (
            <SurahRow c={c} surah={item} />
          ) : (
            <IndexRow c={c} kind={kind} item={item} />
          )
        }
      />
    </View>
  );
}

function SurahRow({ c, surah }) {
  return (
    <Pressable style={[styles.srow, { borderBottomColor: c.line }]} onPress={() => router.push('/reader/' + surah.number)}>
      <View style={styles.numWrap}>
        <Ionicons name="star" size={38} color={c.accentSoft} style={{ position: 'absolute' }} />
        <Text style={[styles.num, { color: c.accent }]}>{toArabicDigits(surah.number)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sName, { color: c.ink }]}>{surah.name}</Text>
        <Text style={[styles.sMeta, { color: c.muted }]}>
          {surah.place || (surah.revelationType === 'Meccan' ? 'مەککی' : 'مەدەنی')} · {toArabicDigits(surah.numberOfAyahs)} ئایە
        </Text>
      </View>
      <Text style={[styles.sAr, { color: c.accent }]}>{surah.suraNameFormatted || surah.name}</Text>
    </Pressable>
  );
}

function IndexRow({ c, kind, item }) {
  const label = kind === 'juz' ? 'جوزء' : kind === 'hizb' ? 'حزب' : 'پەڕە';
  const surah = getSurah(item.surah);
  return (
    <Pressable style={[styles.srow, { borderBottomColor: c.line }]} onPress={() => router.push('/reader/' + item.surah)}>
      <View style={styles.numWrap}>
        <Ionicons name="ellipse" size={38} color={c.accentSoft} style={{ position: 'absolute' }} />
        <Text style={[styles.num, { color: c.accent }]}>{toArabicDigits(item.number)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sName, { color: c.ink }]}>{label} {toArabicDigits(item.number)}</Text>
        <Text style={[styles.sMeta, { color: c.muted }]}>دەستپێک: {surah?.name}</Text>
      </View>
      <Text style={[styles.sAr, { color: c.accent }]}>{surah?.suraNameFormatted || surah?.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  h1: { fontSize: 26, fontWeight: '800' },
  searchBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  tabs: { flexDirection: 'row-reverse', gap: 22, paddingHorizontal: 22, borderBottomWidth: 1 },
  tab: { paddingBottom: 9, fontSize: 13, fontWeight: '600', borderBottomWidth: 2 },
  srow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  numWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 12, fontWeight: '800' },
  sName: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  sMeta: { fontSize: 10, marginTop: 2, textAlign: 'right' },
  sAr: { fontSize: 20, fontFamily: 'UthmanicHafs' },
});
