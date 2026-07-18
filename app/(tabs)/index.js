import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSettings, useTheme } from '../../src/store/SettingsContext';
import { usePlayer } from '../../src/store/PlayerContext';
import { getSurahs, getSurah } from '../../src/lib/quran';
import { RECITERS } from '../../src/lib/reciters';
import { toArabicDigits } from '../../src/lib/format';
import { formatHijri } from '../../src/lib/hijri';

const SURAHS = getSurahs();
const TABS = ['سوورە', 'جوزء', 'حزب', 'پەڕە'];

export default function Home() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { reciterId, update, lastRead } = useSettings();
  const { playSurah } = usePlayer();
  const [tab, setTab] = useState(0);

  const lastSurah = getSurah(lastRead.surah);

  const Header = (
    <View>
      <View style={styles.head}>
        <View>
          <Text style={[styles.h1, { color: c.ink }]}>سەرەکی</Text>
          <Text style={{ color: c.muted, fontSize: 12, marginTop: 2 }}>{formatHijri(new Date())}</Text>
        </View>
        <View style={[styles.pill, { backgroundColor: c.accent }]}>
          <Text style={{ color: c.onAccent, fontSize: 12, fontWeight: '700' }}>بەشداری</Text>
        </View>
      </View>

      {/* Reciters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.reciters}
      >
        {RECITERS.map((r) => {
          const sel = r.id === reciterId;
          return (
            <Pressable key={r.id} style={styles.rec} onPress={() => update({ reciterId: r.id })}>
              <View
                style={[
                  styles.av,
                  { backgroundColor: c.accentSoft, borderColor: sel ? c.accent : c.card },
                ]}
              >
                <MaterialCommunityIcons name="account-voice" size={26} color={c.accent} />
              </View>
              <Text numberOfLines={1} style={[styles.recName, { color: sel ? c.accent : c.muted }]}>
                {r.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Quick actions */}
      <View style={styles.actions}>
        <Action c={c} icon="sparkles-outline" label="بۆ تۆ" onPress={() => {}} />
        <Action c={c} icon="shuffle-outline" label="تێکەڵ" onPress={() => router.push('/reader/' + (Math.floor(Math.random() * 114) + 1))} />
        <Action c={c} icon="search-outline" label="گەڕان" onPress={() => router.push('/search')} />
      </View>

      {/* Last read */}
      <Pressable
        style={[styles.lastCard, { backgroundColor: c.accentSoft, borderColor: c.line }]}
        onPress={() => router.push('/reader/' + lastRead.surah)}
      >
        <Text style={{ color: c.accent, fontWeight: '700', fontSize: 11 }}>دواجار بینراو</Text>
        <Text style={{ color: c.ink, fontSize: 16, fontWeight: '700', marginTop: 4, textAlign: 'right' }}>
          {lastSurah?.name} · ئایە {toArabicDigits(lastRead.ayah)}
        </Text>
        <View style={styles.lastRow}>
          <View style={[styles.bar, { backgroundColor: c.line }]}>
            <View style={{ width: '8%', height: '100%', backgroundColor: c.accent }} />
          </View>
          <Pressable
            style={[styles.playPill, { backgroundColor: c.accent }]}
            onPress={() => playSurah(lastRead.surah, reciterId)}
          >
            <Ionicons name="play" size={13} color={c.onAccent} />
            <Text style={{ color: c.onAccent, fontSize: 12, fontWeight: '700' }}>لێدان</Text>
          </Pressable>
        </View>
      </Pressable>

      {/* Tabs */}
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
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <FlatList
        data={SURAHS}
        keyExtractor={(s) => String(s.number)}
        ListHeaderComponent={Header}
        contentContainerStyle={{ paddingBottom: 160 }}
        renderItem={({ item }) => <SurahRow c={c} surah={item} />}
      />
    </View>
  );
}

function Action({ c, icon, label, onPress }) {
  return (
    <Pressable style={[styles.act, { backgroundColor: c.card, borderColor: c.line }]} onPress={onPress}>
      <Ionicons name={icon} size={19} color={c.accent} />
      <Text style={{ color: c.muted, fontSize: 11, marginTop: 4 }}>{label}</Text>
    </Pressable>
  );
}

function SurahRow({ c, surah }) {
  return (
    <Pressable
      style={[styles.srow, { borderBottomColor: c.line }]}
      onPress={() => router.push('/reader/' + surah.number)}
    >
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

const styles = StyleSheet.create({
  head: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  h1: { fontSize: 26, fontWeight: '800' },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100 },
  reciters: { flexDirection: 'row-reverse', gap: 16, paddingHorizontal: 20, paddingVertical: 14 },
  rec: { alignItems: 'center', width: 62 },
  av: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginBottom: 5, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  recName: { fontSize: 10, textAlign: 'center' },
  actions: { flexDirection: 'row-reverse', gap: 11, paddingHorizontal: 20, marginBottom: 12 },
  act: { flex: 1, borderRadius: 18, borderWidth: 1, paddingVertical: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  lastCard: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  lastRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginTop: 12 },
  bar: { flex: 1, height: 5, borderRadius: 10, overflow: 'hidden' },
  playPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5, paddingHorizontal: 15, paddingVertical: 7, borderRadius: 100 },
  tabs: { flexDirection: 'row-reverse', gap: 22, paddingHorizontal: 22, borderBottomWidth: 1, marginBottom: 4 },
  tab: { paddingBottom: 9, fontSize: 13, fontWeight: '600', borderBottomWidth: 2 },
  srow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
  numWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  num: { fontSize: 12, fontWeight: '800' },
  sName: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  sMeta: { fontSize: 10, marginTop: 2, textAlign: 'right' },
  sAr: { fontSize: 20, fontFamily: 'UthmanicHafs' },
});
