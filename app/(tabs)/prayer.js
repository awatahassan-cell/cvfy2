import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings, useTheme } from '../../src/store/SettingsContext';
import { useLocation } from '../../src/lib/useLocation';
import { getPrayerTimes, getNextPrayer, PRAYERS } from '../../src/lib/prayer';
import { toArabicDigits } from '../../src/lib/format';
import { formatHijri } from '../../src/lib/hijri';
import { requestNotificationPermission, schedulePrayerNotifications, cancelPrayerNotifications } from '../../src/lib/notifications';

function fmtClock(date) {
  if (!date) return '--:--';
  let h = date.getHours();
  const m = date.getMinutes();
  const suffix = h < 12 ? 'ب.ن' : 'د.ن';
  const mm = m < 10 ? '0' + m : String(m);
  return `${toArabicDigits(h)}:${toArabicDigits(mm)} ${suffix}`;
}

function fmtCountdown(ms) {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const p = (n) => toArabicDigits(n < 10 ? '0' + n : n);
  return `${p(h)}:${p(m)}:${p(s)}`;
}

export default function Prayer() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { calcMethod, madhab, notifyPrayer, update } = useSettings();
  const { location, status } = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Keep scheduled notifications in sync with location / method when enabled.
  useEffect(() => {
    if (notifyPrayer) {
      schedulePrayerNotifications(location, calcMethod, madhab).catch(() => {});
    }
  }, [notifyPrayer, location, calcMethod, madhab]);

  const toggleNotify = async () => {
    if (!notifyPrayer) {
      const ok = await requestNotificationPermission();
      if (!ok) return;
      await schedulePrayerNotifications(location, calcMethod, madhab).catch(() => {});
      update({ notifyPrayer: true });
    } else {
      await cancelPrayerNotifications().catch(() => {});
      update({ notifyPrayer: false });
    }
  };

  const times = useMemo(
    () => getPrayerTimes(location.lat, location.lng, new Date(), calcMethod, madhab),
    [location, calcMethod, madhab]
  );
  const next = useMemo(() => getNextPrayer(times, now), [times, now]);
  const nextMeta = PRAYERS.find((p) => p.key === next.key);
  const countdown = next.time ? next.time - now : 0;

  const dateStr = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 160 }}
    >
      <View style={styles.head}>
        <Text style={[styles.title, { color: c.ink }]}>کاتی نوێژ</Text>
        <View style={styles.loc}>
          <Ionicons name="location-outline" size={15} color={c.muted} />
          <Text style={{ color: c.muted, fontSize: 13 }}>{location.name}</Text>
        </View>
      </View>
      <View style={styles.dateRow}>
        <Text style={{ color: c.accent, fontSize: 14, fontWeight: '700' }}>{formatHijri(now)}</Text>
        <Text style={{ color: c.muted, fontSize: 13 }}>{dateStr}</Text>
      </View>

      {/* Notification toggle */}
      <Pressable onPress={toggleNotify} style={[styles.notifyRow, { backgroundColor: c.card, borderColor: notifyPrayer ? c.accent : c.line }]}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
          <Ionicons name={notifyPrayer ? 'notifications' : 'notifications-outline'} size={20} color={c.accent} />
          <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600' }}>ئاگادارکردنەوەی کاتی نوێژ</Text>
        </View>
        <View style={[styles.switch, { backgroundColor: notifyPrayer ? c.accent : c.line }]}>
          <View style={[styles.knob, { transform: [{ translateX: notifyPrayer ? -18 : 0 }] }]} />
        </View>
      </Pressable>

      {/* Next prayer hero */}
      <LinearGradient colors={[c.photo1, c.photo2]} style={styles.hero}>
        <MaterialCommunityIcons name={nextMeta?.icon || 'weather-sunny'} size={30} color="#f2dcb0" />
        <Text style={styles.heroLabel}>نوێژی داهاتوو {next.tomorrow ? '(سبەینێ)' : ''}</Text>
        <Text style={styles.heroName}>{nextMeta?.name}</Text>
        <Text style={styles.heroTime}>{fmtClock(next.time)}</Text>
        <View style={styles.countPill}>
          <Ionicons name="time-outline" size={14} color="#fff" />
          <Text style={styles.countText}>ماوە: {fmtCountdown(countdown)}</Text>
        </View>
      </LinearGradient>

      {status === 'denied' && (
        <Text style={[styles.notice, { color: c.muted, backgroundColor: c.card, borderColor: c.line }]}>
          ڕێگە بە شوێن نەدرا — کاتەکان بۆ {location.name} پیشان دەدرێن. لە ڕێکخستنی مۆبایل ڕێگە بدە.
        </Text>
      )}

      {/* Prayer list */}
      <View style={{ marginTop: 18, gap: 10 }}>
        {PRAYERS.map((p) => {
          const isNext = p.key === next.key && !next.tomorrow;
          return (
            <View
              key={p.key}
              style={[
                styles.row,
                { backgroundColor: isNext ? c.accentSoft : c.card, borderColor: isNext ? c.accent : c.line },
              ]}
            >
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 12 }}>
                <MaterialCommunityIcons name={p.icon} size={22} color={c.accent} />
                <Text style={{ color: c.ink, fontSize: 15, fontWeight: isNext ? '800' : '600' }}>{p.name}</Text>
              </View>
              <Text style={{ color: isNext ? c.accent : c.muted, fontSize: 15, fontWeight: '700' }}>
                {fmtClock(times[p.key])}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800' },
  loc: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  dateRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, marginBottom: 14 },
  notifyRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  switch: { width: 44, height: 26, borderRadius: 100, padding: 3, flexDirection: 'row', justifyContent: 'flex-end' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  hero: { borderRadius: 24, padding: 22, alignItems: 'center', gap: 4 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 6 },
  heroName: { color: '#fff', fontSize: 26, fontWeight: '800' },
  heroTime: { color: '#f2dcb0', fontSize: 20, fontWeight: '700', marginTop: 2 },
  countPill: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, marginTop: 10 },
  countText: { color: '#fff', fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  notice: { marginTop: 14, padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 12, textAlign: 'right', lineHeight: 20 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
});
