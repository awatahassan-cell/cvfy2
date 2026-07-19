import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { useSettings, useTheme } from '../../src/store/SettingsContext';
import { usePlayer } from '../../src/store/PlayerContext';
import { getSurah, getSurahAyahs } from '../../src/lib/quran';
import { getTafsirForSurah, getTafsirOption } from '../../src/lib/tafsir';
import { toArabicDigits } from '../../src/lib/format';
import MiniPlayer from '../../src/components/MiniPlayer';

const BASMALA = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';

export default function Reader() {
  const { id } = useLocalSearchParams();
  const surahNumber = Math.max(1, Math.min(114, parseInt(id, 10) || 1));
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { readMode, showTafsir, tafsirId, reciterId, isBookmarked, toggleBookmark, setLastRead, update } = useSettings();
  const { playSurah, playAyahAt, current, position, duration, isPlaying } = usePlayer();

  const surah = getSurah(surahNumber);
  const ayahs = useMemo(() => getSurahAyahs(surahNumber), [surahNumber]);
  const tafsirMap = useMemo(
    () => (showTafsir ? getTafsirForSurah(tafsirId, surahNumber) : {}),
    [showTafsir, tafsirId, surahNumber]
  );
  const tafsirOpt = getTafsirOption(tafsirId);
  const tafsirName = tafsirOpt.name;

  // Cumulative "position fraction" per ayah, weighted by verse length — used to
  // estimate which ayah is being recited while the whole-surah audio plays.
  const cumFractions = useMemo(() => {
    const lens = ayahs.map((a) => Math.max(1, a.text.length));
    const total = lens.reduce((s, x) => s + x, 0);
    let acc = 0;
    return lens.map((l) => (acc += l) / total);
  }, [ayahs]);

  const isThisSurahPlaying = current && current.surah === surahNumber && duration > 0;
  const activeAyah = useMemo(() => {
    if (!isThisSurahPlaying) return null;
    const frac = position / duration;
    const idx = cumFractions.findIndex((f) => frac <= f);
    return ayahs[idx === -1 ? ayahs.length - 1 : idx]?.ayah ?? null;
  }, [isThisSurahPlaying, position, duration, cumFractions, ayahs]);

  // Auto-scroll to the active ayah while playing.
  const scrollRef = useRef(null);
  const yPositions = useRef({});
  useEffect(() => {
    if (activeAyah != null && isPlaying) {
      const y = yPositions.current[activeAyah];
      if (typeof y === 'number' && scrollRef.current) {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 120), animated: true });
      }
    }
  }, [activeAyah, isPlaying]);

  useEffect(() => {
    setLastRead(surahNumber, 1);
  }, [surahNumber]);

  // Start playback in place — the mini-player bar handles the rest (no navigation).
  const listen = () => playSurah(surahNumber, reciterId);

  // Tap an ayah → play from that ayah (estimated position within the surah audio).
  const playAyah = (index) => {
    const startFraction = index <= 0 ? 0 : cumFractions[index - 1];
    playAyahAt(surahNumber, reciterId, startFraction);
  };

  const showStandaloneBasmala = surahNumber !== 1 && surahNumber !== 9;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.hTitle, { color: c.ink }]}>{surah?.name}</Text>
          <Text style={{ color: c.muted, fontSize: 11 }}>
            {surah?.place} · {toArabicDigits(surah?.numberOfAyahs)} ئایە
          </Text>
        </View>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: showTafsir ? c.accent : c.accentSoft }]}
            onPress={() => update({ showTafsir: !showTafsir })}
          >
            <Ionicons name={showTafsir ? 'document-text' : 'document-text-outline'} size={18} color={showTafsir ? c.onAccent : c.accent} />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: isThisSurahPlaying ? c.accent : c.accentSoft }]}
            onPress={listen}
          >
            <Ionicons name="headset" size={17} color={isThisSurahPlaying ? c.onAccent : c.accent} />
          </Pressable>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 180 }}>
        {/* Surah banner */}
        <View style={[styles.banner, { borderColor: c.accent, backgroundColor: c.card }]}>
          <Text style={[styles.bannerText, { color: c.accent }]}>{surah?.suraNameFormatted || surah?.name}</Text>
        </View>
        {showStandaloneBasmala && <Text style={[styles.basmala, { color: c.ink }]}>{BASMALA}</Text>}

        {readMode === 'page' ? (
          <PageMode c={c} ayahs={ayahs} activeAyah={activeAyah} onPlayAyah={playAyah} />
        ) : (
          ayahs.map((a, idx) => (
            <View
              key={a.ayah}
              onLayout={(e) => {
                yPositions.current[a.ayah] = e.nativeEvent.layout.y;
              }}
            >
              <AyahCard
                c={c}
                ayah={a}
                active={activeAyah === a.ayah}
                playing={activeAyah === a.ayah && isPlaying}
                tafsir={tafsirMap[a.ayah]}
                tafsirName={tafsirName}
                tafsirDir={tafsirOpt.dir}
                bookmarked={isBookmarked(surahNumber, a.ayah)}
                onBookmark={() => toggleBookmark(surahNumber, a.ayah)}
                onPlay={() => playAyah(idx)}
              />
            </View>
          ))
        )}

        {readMode === 'page' && (
          <View style={styles.pageFoot}>
            <Text style={{ color: c.muted, fontFamily: 'UthmanicHafs', fontSize: 13 }}>
              صَفْحَة {toArabicDigits(surah?.startPage || 1)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Small audio bar — stays on this page, no navigation */}
      <MiniPlayer bottom={insets.bottom + 10} />
    </View>
  );
}

function AyahCard({ c, ayah, active, playing, tafsir, tafsirName, tafsirDir, bookmarked, onBookmark, onPlay }) {
  const isLtr = tafsirDir === 'ltr';
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: active ? c.accentSoft : c.card, borderColor: active ? c.accent : c.line },
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.mini, { backgroundColor: active ? c.accent : c.accentSoft }]}>
          <Text style={{ color: active ? c.onAccent : c.accent, fontSize: 11, fontWeight: '700' }}>
            {toArabicDigits(ayah.ayah)}
          </Text>
        </View>
        <View style={{ flexDirection: 'row-reverse', gap: 16, alignItems: 'center' }}>
          <Pressable hitSlop={8} onPress={onPlay}>
            <Ionicons name={playing ? 'pause-circle' : 'play-circle'} size={24} color={active ? c.accent : c.muted} />
          </Pressable>
          <Pressable hitSlop={8} onPress={onBookmark}>
            <Ionicons name={bookmarked ? 'bookmark' : 'bookmark-outline'} size={20} color={bookmarked ? c.accent : c.muted} />
          </Pressable>
        </View>
      </View>
      <Pressable onPress={onPlay}>
        <Text style={[styles.arLine, { color: c.ink }]}>{ayah.text}</Text>
      </Pressable>
      {tafsir ? (
        <View style={[styles.tafBox, { borderTopColor: c.line }]}>
          <Text style={{ color: c.accent, fontWeight: '700', fontSize: 11, marginBottom: 4, textAlign: isLtr ? 'left' : 'right' }}>{tafsirName}</Text>
          <Text
            style={[
              styles.tafText,
              { color: c.muted, textAlign: isLtr ? 'left' : 'right', writingDirection: isLtr ? 'ltr' : 'rtl' },
            ]}
          >
            {tafsir}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PageMode({ c, ayahs, activeAyah, onPlayAyah }) {
  return (
    <View style={[styles.pageFrame, { borderColor: c.accent, backgroundColor: c.card }]}>
      <Text style={[styles.flow, { color: c.ink }]}>
        {ayahs.map((a, idx) => (
          <Text
            key={a.ayah}
            onPress={() => onPlayAyah(idx)}
            style={activeAyah === a.ayah ? { color: c.accent, backgroundColor: c.accentSoft } : null}
          >
            {a.text}{' '}
            <Text style={{ color: c.accent }}>{`۝${toArabicDigits(a.ayah)}`} </Text>
          </Text>
        ))}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  iconBtn: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  banner: { borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  bannerText: { fontFamily: 'UthmanicHafs', fontSize: 26 },
  basmala: { fontFamily: 'UthmanicHafs', fontSize: 22, textAlign: 'center', marginBottom: 14 },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mini: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  arLine: { fontFamily: 'UthmanicHafs', fontSize: 26, lineHeight: 52, textAlign: 'right', writingDirection: 'rtl' },
  tafBox: { marginTop: 12, paddingTop: 10, borderTopWidth: 1 },
  tafText: { fontSize: 14, lineHeight: 26, textAlign: 'right', writingDirection: 'rtl' },
  pageFrame: { borderWidth: 2, borderRadius: 12, padding: 16, minHeight: 400 },
  flow: { fontFamily: 'UthmanicHafs', fontSize: 24, lineHeight: 58, textAlign: 'justify', writingDirection: 'rtl' },
  pageFoot: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 10, paddingHorizontal: 6 },
});
