import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSettings, useTheme } from '../src/store/SettingsContext';
import { usePlayer } from '../src/store/PlayerContext';
import { RECITERS } from '../src/lib/reciters';
import { formatTime } from '../src/lib/format';

export default function Player() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { reciterId, update } = useSettings();
  const {
    current,
    currentSurah,
    currentReciter,
    isPlaying,
    isLoading,
    position,
    duration,
    error,
    toggle,
    seek,
    seekBy,
    playSurah,
  } = usePlayer();

  const [barWidth, setBarWidth] = useState(1);
  const progress = duration ? Math.min(1, position / duration) : 0;

  const changeSurah = (delta) => {
    if (!current) return;
    const next = Math.max(1, Math.min(114, current.surah + delta));
    playSurah(next, current.reciterId);
  };

  const pickReciter = (id) => {
    update({ reciterId: id });
    if (current) playSurah(current.surah, id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      {/* Top bar */}
      <View style={styles.topbar}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={c.ink} />
        </Pressable>
        <Text style={{ color: c.muted, fontSize: 12, fontWeight: '600' }}>ئێستا لێدەدرێت</Text>
        <MaterialCommunityIcons name="dots-horizontal" size={24} color={c.ink} />
      </View>

      {/* Artwork */}
      <View style={styles.artWrap}>
        <LinearGradient colors={[c.photo1, c.photo2]} style={styles.art}>
          <Text style={styles.arabicMark}>۩</Text>
          <View style={styles.artMeta}>
            <Text style={{ color: '#fff', opacity: 0.85, fontSize: 12 }}>
              {currentSurah ? `${currentSurah.number} · ${currentSurah.englishName}` : ''}
            </Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 }}>
              {currentReciter?.name || 'هیچ سوورەتێک هەڵنەبژێردراوە'}
            </Text>
            <Text style={styles.artArabic}>{currentSurah?.suraNameFormatted || ''}</Text>
          </View>
        </LinearGradient>
      </View>

      {error ? <Text style={[styles.err, { color: '#c0392b' }]}>{error}</Text> : null}

      {/* Progress */}
      <View style={styles.progressWrap}>
        <Pressable
          onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          onPress={(e) => {
            const x = e.nativeEvent.locationX;
            if (duration) seek((x / barWidth) * duration);
          }}
          style={[styles.bar, { backgroundColor: c.line }]}
        >
          <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: c.accent, borderRadius: 10 }} />
        </Pressable>
        <View style={styles.times}>
          <Text style={{ color: c.muted, fontSize: 11 }}>{formatTime(position)}</Text>
          <Text style={{ color: c.muted, fontSize: 11 }}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable hitSlop={10} onPress={() => changeSurah(1)}>
          <Ionicons name="play-skip-back" size={26} color={c.ink} />
        </Pressable>
        <Pressable hitSlop={10} onPress={() => seekBy(-10000)}>
          <MaterialCommunityIcons name="rewind-10" size={30} color={c.muted} />
        </Pressable>
        <Pressable
          onPress={toggle}
          disabled={!current}
          style={[styles.mainBtn, { backgroundColor: c.accent, opacity: current ? 1 : 0.5 }]}
        >
          {isLoading ? (
            <ActivityIndicator color={c.onAccent} />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color={c.onAccent} />
          )}
        </Pressable>
        <Pressable hitSlop={10} onPress={() => seekBy(10000)}>
          <MaterialCommunityIcons name="fast-forward-10" size={30} color={c.muted} />
        </Pressable>
        <Pressable hitSlop={10} onPress={() => changeSurah(-1)}>
          <Ionicons name="play-skip-forward" size={26} color={c.ink} />
        </Pressable>
      </View>

      {/* Reciter picker */}
      <Text style={[styles.pickLabel, { color: c.muted }]}>قورئان‌خوێن</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.reciterRow}
      >
        {RECITERS.map((r) => {
          const sel = r.id === (current?.reciterId || reciterId);
          return (
            <Pressable
              key={r.id}
              onPress={() => pickReciter(r.id)}
              style={[
                styles.reciterChip,
                { backgroundColor: sel ? c.accent : c.card, borderColor: sel ? c.accent : c.line },
              ]}
            >
              <Text style={{ color: sel ? c.onAccent : c.ink, fontSize: 12, fontWeight: '600' }}>{r.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 8 },
  artWrap: { paddingHorizontal: 24, marginTop: 6 },
  art: { height: 300, borderRadius: 28, overflow: 'hidden', justifyContent: 'flex-end' },
  arabicMark: { position: 'absolute', top: 16, left: 20, fontSize: 54, color: 'rgba(255,255,255,0.14)', fontFamily: 'UthmanicHafs' },
  artMeta: { padding: 20 },
  artArabic: { fontFamily: 'UthmanicHafs', fontSize: 24, color: '#f2dcb0', marginTop: 6 },
  err: { textAlign: 'center', marginTop: 12, fontSize: 13, paddingHorizontal: 24 },
  progressWrap: { paddingHorizontal: 28, marginTop: 26 },
  bar: { height: 6, borderRadius: 10, overflow: 'hidden' },
  times: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 8 },
  controls: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 26, marginTop: 26 },
  mainBtn: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  pickLabel: { textAlign: 'right', paddingHorizontal: 28, marginTop: 30, marginBottom: 10, fontSize: 12, fontWeight: '700' },
  reciterRow: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 24, paddingBottom: 30 },
  reciterChip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, borderWidth: 1 },
});
