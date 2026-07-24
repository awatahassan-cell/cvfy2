import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { useTheme } from '../../src/store/SettingsContext';
import { getDhikrCategory, getDhikrByCategory } from '../../src/lib/religious';
import { azkarAudioUrl } from '../../src/lib/azkarAudio';
import { toArabicDigits } from '../../src/lib/format';

// Only one dhikr may play at a time — a new tap stops whatever is playing.
let stopActive = null;

export default function AzkarDetail() {
  const { id } = useLocalSearchParams();
  const catId = parseInt(id, 10);
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  const category = getDhikrCategory(catId);
  const items = useMemo(() => getDhikrByCategory(catId), [catId]);

  // Allow audio to play even when the device is on silent (iOS).
  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false }).catch(() => {});
    return () => { if (stopActive) stopActive(); };
  }, []);

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
          <Animated.View key={item.id} entering={FadeInDown.delay(i * 40).springify().damping(16)}>
            <DhikrCard c={c} item={item} index={i + 1} />
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

function DhikrCard({ c, item, index }) {
  const target = item.count || 1;
  const [done, setDone] = useState(0);
  const [state, setState] = useState('idle'); // idle | loading | playing
  const complete = done >= target;

  const soundRef = useRef(null);
  const audioUrl = azkarAudioUrl(item.id);

  const cleanup = async () => {
    if (soundRef.current) {
      const s = soundRef.current;
      soundRef.current = null;
      await s.unloadAsync().catch(() => {});
    }
  };

  useEffect(() => () => { cleanup(); Speech.stop(); }, []);

  const stopThis = async () => {
    await cleanup();
    Speech.stop();
    setState('idle');
    if (stopActive === stopThis) stopActive = null;
  };

  const play = async () => {
    if (state !== 'idle') { stopThis(); return; }

    // Stop any other dhikr currently playing.
    if (stopActive && stopActive !== stopThis) { try { await stopActive(); } catch (e) {} }
    stopActive = stopThis;

    // Prefer the real recorded recitation; fall back to device TTS.
    if (audioUrl) {
      setState('loading');
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true },
          (s) => {
            if (!s.isLoaded) return;
            if (s.didJustFinish) stopThis();
          }
        );
        soundRef.current = sound;
        setState('playing');
      } catch (e) {
        // Network/host issue → fall back to TTS.
        speak();
      }
    } else {
      speak();
    }
  };

  const speak = () => {
    setState('playing');
    Speech.speak(item.arabic, {
      language: 'ar',
      rate: 0.8,
      onDone: () => stopThis(),
      onStopped: () => setState('idle'),
      onError: () => setState('idle'),
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: complete ? c.accent : c.line }]}>
      <View style={styles.cardTop}>
        <View style={[styles.idx, { backgroundColor: c.accentSoft }]}>
          <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700' }}>{toArabicDigits(index)}</Text>
        </View>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
          {target > 1 && <Text style={{ color: c.muted, fontSize: 12 }}>جار: {toArabicDigits(target)}</Text>}
          <Pressable hitSlop={8} onPress={play} style={[styles.playBtn, { backgroundColor: c.accentSoft }]}>
            {state === 'loading' ? (
              <ActivityIndicator size="small" color={c.accent} />
            ) : (
              <Ionicons name={state === 'playing' ? 'stop' : 'play'} size={16} color={c.accent} />
            )}
          </Pressable>
        </View>
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
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  arabic: { fontFamily: 'UthmanicHafs', fontSize: 24, lineHeight: 50, textAlign: 'right', writingDirection: 'rtl' },
  kurdish: { fontSize: 14, lineHeight: 26, textAlign: 'right', marginTop: 10, writingDirection: 'rtl' },
  counter: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12, marginTop: 14 },
});
