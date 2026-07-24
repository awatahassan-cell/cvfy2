import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { useSettings, useTheme } from '../../src/store/SettingsContext';
import { usePlayer } from '../../src/store/PlayerContext';
import { getSurah, getSurahAyahs } from '../../src/lib/quran';
import { getTafsirForSurah, getTafsirOption } from '../../src/lib/tafsir';
import { toArabicDigits } from '../../src/lib/format';
import MiniPlayer from '../../src/components/MiniPlayer';
import Glass from '../../src/components/Glass';
import TajweedText from '../../src/components/TajweedText';
import TajweedWebView from '../../src/components/TajweedWebView';
import { useDownloads } from '../../src/store/DownloadsContext';

// On native, colored tajweed runs break Arabic shaping in RN's text engine, so
// we render the whole surah through a WebView (browser engine shapes correctly).
// react-native-web already renders the spans correctly, so keep the RN path there.
const WEBVIEW_TAJWEED = Platform.OS !== 'web';

const BASMALA = 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ';

export default function Reader() {
  const { id } = useLocalSearchParams();
  const surahNumber = Math.max(1, Math.min(114, parseInt(id, 10) || 1));
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { readMode, showTafsir, tafsirId, reciterId, tajweed, fontScale, themeId, isBookmarked, toggleBookmark, setLastRead, update } = useSettings();
  const scale = fontScale || 1;
  const { playSurah, playAyah: playAyahAudio, current, currentAyah, mode, position, duration, isPlaying } = usePlayer();
  const { isDownloaded, download, remove, progressFor } = useDownloads();
  const [showSheet, setShowSheet] = useState(false);

  // Simple dark/light switch: flip to a matching preset without losing the mode.
  const toggleDark = () => update({ themeId: theme.dark ? 'aurora' : 'midnight' });
  const changeScale = (delta) => update({ fontScale: Math.min(1.8, Math.max(0.7, Math.round((scale + delta) * 10) / 10)) });

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

  const isThisSurahPlaying = current && current.surah === surahNumber;
  const activeAyah = useMemo(() => {
    if (!isThisSurahPlaying) return null;
    // Per-ayah mode reports the exact ayah; whole-surah mode estimates by length.
    if (mode === 'ayah' && currentAyah != null) return currentAyah;
    if (duration > 0) {
      const frac = position / duration;
      const idx = cumFractions.findIndex((f) => frac <= f);
      return ayahs[idx === -1 ? ayahs.length - 1 : idx]?.ayah ?? null;
    }
    return null;
  }, [isThisSurahPlaying, mode, currentAyah, position, duration, cumFractions, ayahs]);

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

  // Tap an ayah → recite that exact ayah (per-ayah audio), then auto-advance.
  const playAyah = (index) => {
    const ayahNumber = ayahs[index]?.ayah ?? index + 1;
    playAyahAudio(surahNumber, ayahNumber, reciterId, ayahs.length);
  };
  const playAyahByNumber = (ayahNumber) => playAyahAudio(surahNumber, ayahNumber, reciterId, ayahs.length);

  const showStandaloneBasmala = surahNumber !== 1 && surahNumber !== 9;
  const useWebTajweed = tajweed && WEBVIEW_TAJWEED;

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
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: isThisSurahPlaying ? c.accent : c.accentSoft }]}
            onPress={listen}
          >
            <Ionicons name="headset" size={17} color={isThisSurahPlaying ? c.onAccent : c.accent} />
          </Pressable>
          <Pressable
            style={[styles.iconBtn, { backgroundColor: c.accentSoft }]}
            onPress={() => setShowSheet(true)}
          >
            <Ionicons name="options-outline" size={19} color={c.accent} />
          </Pressable>
        </View>
      </View>

      <ReaderSettingsSheet
        visible={showSheet}
        onClose={() => setShowSheet(false)}
        c={c}
        insets={insets}
        tajweed={tajweed}
        showTafsir={showTafsir}
        isDark={theme.dark}
        scale={scale}
        downloaded={isDownloaded(reciterId, surahNumber)}
        downloadProgress={progressFor(reciterId, surahNumber)}
        onToggleTajweed={() => update({ tajweed: !tajweed })}
        onToggleTafsir={() => update({ showTafsir: !showTafsir })}
        onToggleDark={toggleDark}
        onScale={changeScale}
        onDownload={() => download(reciterId, surahNumber)}
        onRemoveDownload={() => remove(reciterId, surahNumber)}
      />

      {useWebTajweed ? (
        <TajweedWebView
          surah={surahNumber}
          ayahs={ayahs}
          colors={c}
          scale={scale}
          bannerText={surah?.suraNameFormatted || surah?.name}
          basmala={showStandaloneBasmala ? BASMALA : ''}
          showTafsir={showTafsir}
          tafsirMap={tafsirMap}
          tafsirName={tafsirName}
          tafsirLtr={tafsirOpt.dir === 'ltr'}
          activeAyah={activeAyah}
          playing={isPlaying}
          onPlayAyah={playAyahByNumber}
        />
      ) : (
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 180 }}>
        {/* Surah banner */}
        <View style={[styles.banner, { borderColor: c.accent, backgroundColor: c.card }]}>
          <Text style={[styles.bannerText, { color: c.accent }]}>{surah?.suraNameFormatted || surah?.name}</Text>
        </View>
        {showStandaloneBasmala && <Text style={[styles.basmala, { color: c.ink, fontSize: 22 * scale }]}>{BASMALA}</Text>}

        {readMode === 'page' ? (
          <PageMode c={c} ayahs={ayahs} activeAyah={activeAyah} onPlayAyah={playAyah} scale={scale} />
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
                surah={surahNumber}
                tajweed={tajweed}
                scale={scale}
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
      )}

      {/* Small audio bar — stays on this page, no navigation */}
      <MiniPlayer bottom={insets.bottom + 10} />
    </View>
  );
}

// Bottom-sheet with the reading options (replaces the crowded header buttons).
function ReaderSettingsSheet({
  visible, onClose, c, insets,
  tajweed, showTafsir, isDark, scale,
  downloaded, downloadProgress,
  onToggleTajweed, onToggleTafsir, onToggleDark, onScale, onDownload, onRemoveDownload,
}) {
  const downloading = downloadProgress != null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: c.bg, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.sheetGrip, { backgroundColor: c.line }]} />
        <Text style={[styles.sheetTitle, { color: c.ink }]}>ڕێکخستنی خوێندنەوە</Text>

        <ToggleRow c={c} icon="color-palette-outline" label="تەجوید (ڕەنگکردنی ئەحکام)" value={tajweed} onToggle={onToggleTajweed} />
        <ToggleRow c={c} icon="document-text-outline" label="پیشاندانی تەفسیر" value={showTafsir} onToggle={onToggleTafsir} />
        <ToggleRow c={c} icon={isDark ? 'moon' : 'sunny-outline'} label="دۆخی تاریک" value={isDark} onToggle={onToggleDark} />

        {/* Font size */}
        <View style={[styles.sheetRow, { borderColor: c.line }]}>
          <View style={styles.sheetRowLeft}>
            <Ionicons name="text-outline" size={20} color={c.accent} />
            <Text style={[styles.sheetLabel, { color: c.ink }]}>قەبارەی نووسین</Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 14 }}>
            <Pressable hitSlop={8} onPress={() => onScale(-0.1)} style={[styles.stepBtn, { backgroundColor: c.accentSoft }]}>
              <Ionicons name="remove" size={18} color={c.accent} />
            </Pressable>
            <Text style={{ color: c.ink, fontSize: 13, fontWeight: '700', minWidth: 40, textAlign: 'center' }}>
              {Math.round(scale * 100)}٪
            </Text>
            <Pressable hitSlop={8} onPress={() => onScale(0.1)} style={[styles.stepBtn, { backgroundColor: c.accentSoft }]}>
              <Ionicons name="add" size={18} color={c.accent} />
            </Pressable>
          </View>
        </View>

        {/* Offline download */}
        <Pressable
          style={[styles.sheetRow, { borderColor: c.line }]}
          onPress={() => (downloaded ? onRemoveDownload() : downloading ? null : onDownload())}
        >
          <View style={styles.sheetRowLeft}>
            <Ionicons name={downloaded ? 'checkmark-circle' : 'download-outline'} size={20} color={c.accent} />
            <Text style={[styles.sheetLabel, { color: c.ink }]}>
              {downloaded ? 'داگیراوە بۆ بێ ئینتەرنێت' : 'داگرتن بۆ بێ ئینتەرنێت'}
            </Text>
          </View>
          {downloading ? (
            <Text style={{ color: c.accent, fontSize: 12, fontWeight: '800' }}>{Math.round(downloadProgress * 100)}٪</Text>
          ) : (
            <Ionicons name={downloaded ? 'trash-outline' : 'chevron-back'} size={18} color={c.muted} />
          )}
        </Pressable>
      </View>
    </Modal>
  );
}

function ToggleRow({ c, icon, label, value, onToggle }) {
  return (
    <Pressable style={[styles.sheetRow, { borderColor: c.line }]} onPress={onToggle}>
      <View style={styles.sheetRowLeft}>
        <Ionicons name={icon} size={20} color={c.accent} />
        <Text style={[styles.sheetLabel, { color: c.ink }]}>{label}</Text>
      </View>
      <View style={[styles.switch, { backgroundColor: value ? c.accent : c.line }]}>
        <View style={[styles.knob, { transform: [{ translateX: value ? -18 : 0 }] }]} />
      </View>
    </Pressable>
  );
}

function AyahCard({ c, ayah, surah, tajweed, scale = 1, active, playing, tafsir, tafsirName, tafsirDir, bookmarked, onBookmark, onPlay }) {
  const isLtr = tafsirDir === 'ltr';
  return (
    <Glass
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
        {tajweed ? (
          <TajweedText surah={surah} ayah={ayah.ayah} fontSize={26 * scale} color={c.ink} fallbackText={ayah.text} />
        ) : (
          <Text style={[styles.arLine, { color: c.ink, fontSize: 26 * scale, lineHeight: 52 * scale }]}>{ayah.text}</Text>
        )}
      </Pressable>
      {tafsir ? (
        <View style={[styles.tafBox, { borderTopColor: c.line }]}>
          <Text style={{ color: c.accent, fontWeight: '700', fontSize: 11, marginBottom: 4, textAlign: isLtr ? 'left' : 'right' }}>{tafsirName}</Text>
          <Text
            style={[
              styles.tafText,
              { color: c.muted, fontSize: 14 * scale, lineHeight: 26 * scale, textAlign: isLtr ? 'left' : 'right', writingDirection: isLtr ? 'ltr' : 'rtl' },
            ]}
          >
            {tafsir}
          </Text>
        </View>
      ) : null}
    </Glass>
  );
}

function PageMode({ c, ayahs, activeAyah, onPlayAyah, scale = 1 }) {
  // Note: onPress must not sit on the nested ayah <Text> spans — react-native-web
  // crashes on nested pressable Text. The whole page is tappable instead.
  return (
    <Pressable onPress={() => onPlayAyah(0)}>
      <Glass style={[styles.pageFrame, { borderColor: c.accent, backgroundColor: c.card }]}>
        <Text style={[styles.flow, { color: c.ink, fontSize: 24 * scale, lineHeight: 58 * scale }]}>
          {ayahs.map((a) => (
            <Text
              key={a.ayah}
              style={activeAyah === a.ayah ? { color: c.accent, backgroundColor: c.accentSoft } : null}
            >
              {a.text}{' '}
              <Text style={{ color: c.accent }}>{`۝${toArabicDigits(a.ayah)}`} </Text>
            </Text>
          ))}
        </Text>
      </Glass>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  iconBtn: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
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
  // Reader settings bottom-sheet
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingHorizontal: 18, paddingTop: 10 },
  sheetGrip: { width: 42, height: 5, borderRadius: 3, alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  sheetRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: 1 },
  sheetRowLeft: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  sheetLabel: { fontSize: 14, fontWeight: '600' },
  switch: { width: 44, height: 26, borderRadius: 100, padding: 3, flexDirection: 'row', justifyContent: 'flex-end' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  stepBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
