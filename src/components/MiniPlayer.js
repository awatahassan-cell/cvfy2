import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../store/SettingsContext';
import { usePlayer } from '../store/PlayerContext';

export default function MiniPlayer({ bottom = 0 }) {
  const theme = useTheme();
  const { current, currentSurah, currentReciter, isPlaying, isLoading, toggle, position, duration } = usePlayer();
  if (!current) return null;
  const c = theme.colors;
  const progress = duration ? Math.min(1, position / duration) : 0;

  return (
    <Pressable
      onPress={() => router.push('/player')}
      style={[styles.wrap, { bottom, backgroundColor: c.card, borderColor: c.line }]}
    >
      <View style={[styles.progress, { backgroundColor: c.line }]}>
        <View style={{ width: `${progress * 100}%`, height: '100%', backgroundColor: c.accent }} />
      </View>
      <View style={styles.row}>
        <View style={[styles.thumb, { backgroundColor: c.accentSoft }]}>
          <Ionicons name="musical-notes" size={18} color={c.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={[styles.title, { color: c.ink }]}>
            {currentSurah?.name}
          </Text>
          <Text numberOfLines={1} style={[styles.sub, { color: c.muted }]}>
            {currentReciter?.name}
          </Text>
        </View>
        <Pressable hitSlop={10} onPress={toggle} style={[styles.btn, { backgroundColor: c.accent }]}>
          {isLoading ? (
            <ActivityIndicator size="small" color={c.onAccent} />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color={c.onAccent} />
          )}
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  progress: { height: 3, width: '100%' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', padding: 10, gap: 12 },
  thumb: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', textAlign: 'right' },
  sub: { fontSize: 11, textAlign: 'right', marginTop: 2 },
  btn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
