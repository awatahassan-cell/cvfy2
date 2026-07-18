import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../src/store/SettingsContext';
import { getHijri, formatHijri } from '../src/lib/hijri';
import { toArabicDigits } from '../src/lib/format';

const WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'هـ']; // Sat..Fri
const G_MONTHS = ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'];

export default function Calendar() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const grid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Week starts Saturday (index: JS getDay Sun=0..Sat=6 -> shift so Sat=0)
    const startOffset = (first.getDay() + 1) % 7;
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  }, [cursor]);

  const monthLabel = `${G_MONTHS[cursor.getMonth()]} ${toArabicDigits(cursor.getFullYear())}`;
  const isToday = (d) => d && d.toDateString() === today.toDateString();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.ink }]}>تەقویمی هیجری</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Today's hijri banner */}
      <View style={[styles.banner, { backgroundColor: c.accentSoft, borderColor: c.line }]}>
        <Text style={{ color: c.accent, fontSize: 12, fontWeight: '700' }}>ئەمڕۆ</Text>
        <Text style={{ color: c.ink, fontSize: 20, fontWeight: '800', marginTop: 4 }}>{formatHijri(today)}</Text>
      </View>

      {/* Month nav */}
      <View style={styles.monthNav}>
        <Pressable hitSlop={10} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
          <Ionicons name="chevron-forward" size={24} color={c.accent} />
        </Pressable>
        <Text style={{ color: c.ink, fontSize: 16, fontWeight: '800' }}>{monthLabel}</Text>
        <Pressable hitSlop={10} onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
          <Ionicons name="chevron-back" size={24} color={c.accent} />
        </Pressable>
      </View>

      {/* Weekday header */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((w, i) => (
          <Text key={i} style={{ flex: 1, textAlign: 'center', color: c.muted, fontSize: 12, fontWeight: '700' }}>{w}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {grid.map((d, i) => {
          const h = d ? getHijri(d) : null;
          const td = isToday(d);
          return (
            <View key={i} style={styles.cellWrap}>
              {d ? (
                <View style={[styles.cell, td && { backgroundColor: c.accent }]}>
                  <Text style={{ color: td ? c.onAccent : c.ink, fontSize: 15, fontWeight: '700' }}>{toArabicDigits(d.getDate())}</Text>
                  <Text style={{ color: td ? c.onAccent : c.muted, fontSize: 10 }}>{toArabicDigits(h.day)}</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </View>

      <Text style={{ color: c.muted, fontSize: 11, textAlign: 'center', marginTop: 16 }}>
        ژمارەی گەورە: زایینی · ژمارەی بچووک: کۆچی
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  banner: { margin: 16, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  monthNav: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 30, marginBottom: 14 },
  weekRow: { flexDirection: 'row-reverse', paddingHorizontal: 12, marginBottom: 6 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', paddingHorizontal: 8 },
  cellWrap: { width: `${100 / 7}%`, aspectRatio: 1, padding: 3 },
  cell: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
