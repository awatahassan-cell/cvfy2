import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, ActivityIndicator, Modal } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings, useTheme } from '../../src/store/SettingsContext';
import { useLocation } from '../../src/lib/useLocation';
import { getPrayerTimes, getNextPrayer, getMonthPrayerTimes, CITIES } from '../../src/lib/prayer';
import { formatHijri } from '../../src/lib/hijri';
import { toArabicDigits } from '../../src/lib/format';
import { adhanUrl } from '../../src/lib/adhans';
import {
  requestNotificationPermission,
  schedulePrayerNotifications,
  cancelPrayerNotifications,
} from '../../src/lib/notifications';

// Order includes sunrise (گزنگ), which is a time marker, not a prayer with adhan.
const ROWS = [
  { key: 'fajr', name: 'بەیانی', icon: 'weather-sunset-up', adhan: true },
  { key: 'sunrise', name: 'گزنگ', icon: 'clock-outline', adhan: false },
  { key: 'dhuhr', name: 'نیوەڕۆ', icon: 'weather-sunny', adhan: true },
  { key: 'asr', name: 'عەسر', icon: 'weather-sunset-down', adhan: true },
  { key: 'maghrib', name: 'ئێوارە', icon: 'weather-night-partly-cloudy', adhan: true },
  { key: 'isha', name: 'خەوتنان', icon: 'weather-night', adhan: true },
];

export default function Prayer() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { calcMethod, madhab, notifyPrayer, muezzin, adhanOn, numberStyle, manualLocation, update } = useSettings();
  const { location: gpsLocation } = useLocation();
  // Manual city choice overrides GPS when set.
  const location = manualLocation || gpsLocation;
  const [now, setNow] = useState(new Date());
  const [showCities, setShowCities] = useState(false);
  const [showMonth, setShowMonth] = useState(false);

  const num = (v) => (numberStyle === 'en' ? String(v) : toArabicDigits(v));
  const clock = (d) => {
    if (!d) return '--:--';
    const h = d.getHours();
    const m = d.getMinutes();
    return `${num(h)}:${num(m < 10 ? '0' + m : m)}`;
  };

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const times = useMemo(
    () => getPrayerTimes(location.lat, location.lng, new Date(), calcMethod, madhab),
    [location, calcMethod, madhab]
  );
  const next = useMemo(() => getNextPrayer(times, now), [times, now]);
  const nextRow = ROWS.find((r) => r.key === next.key) || ROWS[0];

  useEffect(() => {
    if (notifyPrayer) schedulePrayerNotifications(location, calcMethod, madhab).catch(() => {});
  }, [notifyPrayer, location, calcMethod, madhab]);

  // ---- Adhan preview playback ----
  const soundRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => { if (soundRef.current) soundRef.current.unloadAsync().catch(() => {}); }, []);

  const toggleAdhanPreview = async () => {
    try {
      if (playing && soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        setPlaying(false);
        return;
      }
      if (soundRef.current) await soundRef.current.unloadAsync().catch(() => {});
      const { sound } = await Audio.Sound.createAsync({ uri: adhanUrl(muezzin) }, { shouldPlay: true }, (s) => {
        if (s.isLoaded && s.didJustFinish) setPlaying(false);
      });
      soundRef.current = sound;
      setPlaying(true);
    } catch (e) {
      setPlaying(false);
    }
  };

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

  const toggleAdhanFor = (key) => update({ adhanOn: { ...adhanOn, [key]: !(adhanOn?.[key] ?? true) } });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient colors={['#241A47', '#3D2A63', '#6E4C8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.kaaba}>
            <MaterialCommunityIcons name="mosque" size={22} color="#fff" />
          </View>
          <Pressable onPress={toggleAdhanPreview} style={styles.previewBtn}>
            {playing ? <Ionicons name="stop" size={18} color="#241A47" /> : <Ionicons name="volume-high" size={18} color="#241A47" />}
          </Pressable>
        </View>
        {/* Decorative arc */}
        <View style={styles.arcWrap} pointerEvents="none">
          <View style={styles.arc} />
          <View style={[styles.arcDot, { top: 6, left: '50%', marginLeft: -4 }]} />
          <View style={[styles.arcDot, { top: 48, right: 4 }]} />
          <View style={[styles.arcMarker, { bottom: 2, left: 2 }]} />
        </View>
        <Text style={styles.heroTime}>{clock(next.time)}</Text>
        <Text style={styles.heroLabel}>کاتی بانگی {nextRow.name}یە</Text>
      </LinearGradient>

      {/* Hijri divider */}
      <View style={styles.divider}>
        <View style={[styles.dLine, { backgroundColor: c.line }]} />
        <Text style={[styles.dText, { color: c.muted }]}>{formatHijri(now)}</Text>
        <View style={[styles.dLine, { backgroundColor: c.line }]} />
      </View>

      {/* Location + monthly schedule */}
      <View style={styles.locRow}>
        <Pressable onPress={() => setShowCities(true)} style={[styles.locBtn, { backgroundColor: c.card, borderColor: c.line }]}>
          <Ionicons name="location" size={17} color={c.accent} />
          <Text numberOfLines={1} style={{ color: c.ink, fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right' }}>{location.name || 'شوێن'}</Text>
          <Ionicons name="chevron-down" size={15} color={c.muted} />
        </Pressable>
        <Pressable onPress={() => setShowMonth(true)} style={[styles.monthBtn, { backgroundColor: c.accentSoft, borderColor: c.accent }]}>
          <MaterialCommunityIcons name="calendar-month" size={18} color={c.accent} />
          <Text style={{ color: c.accent, fontSize: 12, fontWeight: '800' }}>خشتەی مانگانە</Text>
        </Pressable>
      </View>

      {/* Notification master toggle */}
      <Pressable onPress={toggleNotify} style={[styles.notify, { backgroundColor: c.card, borderColor: notifyPrayer ? c.accent : c.line }]}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
          <Ionicons name={notifyPrayer ? 'notifications' : 'notifications-outline'} size={20} color={c.accent} />
          <Text style={{ color: c.ink, fontSize: 13, fontWeight: '600' }}>ئاگادارکردنەوەی کاتی نوێژ</Text>
        </View>
        <View style={[styles.switch, { backgroundColor: notifyPrayer ? c.accent : c.line }]}>
          <View style={[styles.knob, { transform: [{ translateX: notifyPrayer ? -18 : 0 }] }]} />
        </View>
      </Pressable>

      {/* Prayer rows */}
      <View style={{ gap: 10, marginTop: 4 }}>
        {ROWS.map((r) => {
          const isNext = r.key === next.key && !next.tomorrow;
          const on = adhanOn?.[r.key] ?? true;
          return (
            <View
              key={r.key}
              style={[styles.row, { backgroundColor: isNext ? c.accentSoft : c.card, borderColor: isNext ? c.accent : c.line }]}
            >
              {r.adhan ? (
                <Pressable onPress={() => toggleAdhanFor(r.key)} style={[styles.spk, { backgroundColor: on ? c.accentSoft : c.line }]}>
                  <MaterialCommunityIcons name={on ? 'volume-high' : 'volume-off'} size={20} color={on ? c.accent : c.muted} />
                </Pressable>
              ) : (
                <View style={[styles.spk, { backgroundColor: c.line }]}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={c.muted} />
                </View>
              )}
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: c.ink, fontSize: 15, fontWeight: isNext ? '800' : '600' }}>{r.name}</Text>
                <Text style={{ color: c.accent, fontSize: 15, fontWeight: '700', marginTop: 2 }}>{clock(times[r.key])}</Text>
              </View>
              <View style={[styles.pIcon, { backgroundColor: c.card, borderColor: c.line }]}>
                <MaterialCommunityIcons name={r.icon} size={22} color={c.accent} />
              </View>
            </View>
          );
        })}
      </View>

      <CityPickerModal
        visible={showCities}
        onClose={() => setShowCities(false)}
        c={c}
        current={manualLocation?.id}
        onUseGps={() => { update({ manualLocation: null }); setShowCities(false); }}
        onPick={(city) => { update({ manualLocation: { id: city.id, name: city.name, lat: city.lat, lng: city.lng } }); setShowCities(false); }}
      />
      <MonthModal
        visible={showMonth}
        onClose={() => setShowMonth(false)}
        c={c}
        location={location}
        calcMethod={calcMethod}
        madhab={madhab}
        num={num}
        clock={clock}
      />
    </ScrollView>
  );
}

// ---- City picker ----
function CityPickerModal({ visible, onClose, c, current, onUseGps, onPick }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.mWrap}>
        <Pressable style={styles.mBackdrop} onPress={onClose} />
        <View style={[styles.mSheet, { backgroundColor: c.bg, borderColor: c.line }]}>
          <View style={[styles.mHead, { borderBottomColor: c.line }]}>
            <Text style={[styles.mTitle, { color: c.ink }]}>هەڵبژاردنی شوێن</Text>
            <Pressable hitSlop={10} onPress={onClose}><Ionicons name="close" size={22} color={c.muted} /></Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 14 }}>
            <Pressable onPress={onUseGps} style={[styles.cityRow, { borderColor: !current ? c.accent : c.line, backgroundColor: !current ? c.accentSoft : c.card }]}>
              <Ionicons name="navigate" size={18} color={c.accent} />
              <Text style={{ color: c.ink, fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' }}>شوێنی ئێستام (GPS)</Text>
              {!current && <Ionicons name="checkmark-circle" size={20} color={c.accent} />}
            </Pressable>
            {CITIES.map((city) => {
              const sel = current === city.id;
              return (
                <Pressable key={city.id} onPress={() => onPick(city)} style={[styles.cityRow, { borderColor: sel ? c.accent : c.line, backgroundColor: sel ? c.accentSoft : c.card }]}>
                  <Ionicons name="location-outline" size={18} color={sel ? c.accent : c.muted} />
                  <Text style={{ color: c.ink, fontSize: 14, fontWeight: sel ? '700' : '500', flex: 1, textAlign: 'right' }}>{city.name}</Text>
                  {sel && <Ionicons name="checkmark-circle" size={20} color={c.accent} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ---- Monthly schedule ----
function MonthModal({ visible, onClose, c, location, calcMethod, madhab, num, clock }) {
  const today = new Date();
  const rows = useMemo(
    () => (visible ? getMonthPrayerTimes(location.lat, location.lng, today.getFullYear(), today.getMonth(), calcMethod, madhab) : []),
    [visible, location, calcMethod, madhab]
  );
  const MONTHS = ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'];
  const cols = [['fajr', 'بەیانی'], ['sunrise', 'گزنگ'], ['dhuhr', 'نیوەڕۆ'], ['asr', 'عەسر'], ['maghrib', 'ئێوارە'], ['isha', 'خەوتنان']];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.mWrap}>
        <Pressable style={styles.mBackdrop} onPress={onClose} />
        <View style={[styles.mSheet, { backgroundColor: c.bg, borderColor: c.line, height: '88%' }]}>
          <View style={[styles.mHead, { borderBottomColor: c.line }]}>
            <Text style={[styles.mTitle, { color: c.ink }]}>خشتەی {MONTHS[today.getMonth()]} — {location.name || ''}</Text>
            <Pressable hitSlop={10} onPress={onClose}><Ionicons name="close" size={22} color={c.muted} /></Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* header */}
              <View style={[styles.mTblRow, { backgroundColor: c.accentSoft, borderColor: c.line }]}>
                <Text style={[styles.mCellDay, { color: c.accent, fontWeight: '800' }]}>ڕۆژ</Text>
                {cols.map(([k, label]) => (
                  <Text key={k} style={[styles.mCell, { color: c.accent, fontWeight: '800' }]}>{label}</Text>
                ))}
              </View>
              <ScrollView style={{ maxHeight: 560 }} showsVerticalScrollIndicator={false}>
                {rows.map((r) => {
                  const isToday = r.day === today.getDate();
                  return (
                    <View key={r.day} style={[styles.mTblRow, { borderColor: c.line, backgroundColor: isToday ? c.accentSoft : c.card }]}>
                      <Text style={[styles.mCellDay, { color: isToday ? c.accent : c.ink, fontWeight: isToday ? '800' : '600' }]}>{num(r.day)}</Text>
                      {cols.map(([k]) => (
                        <Text key={k} style={[styles.mCell, { color: isToday ? c.accent : c.muted }]}>{clock(r[k])}</Text>
                      ))}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 24, padding: 18, height: 190, justifyContent: 'flex-end', overflow: 'hidden' },
  heroTop: { position: 'absolute', top: 14, left: 14, right: 14, flexDirection: 'row-reverse', justifyContent: 'space-between' },
  kaaba: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  previewBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#F6C744', alignItems: 'center', justifyContent: 'center' },
  arcWrap: { position: 'absolute', top: 20, left: 40, right: 40, height: 120 },
  arc: { position: 'absolute', left: 0, right: 0, top: 0, height: 220, borderRadius: 200, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.22)' },
  arcDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  arcMarker: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: '#F6C744' },
  heroTime: { color: '#fff', fontSize: 44, fontWeight: '800', textAlign: 'center', letterSpacing: 1 },
  heroLabel: { color: 'rgba(255,255,255,0.92)', fontSize: 17, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  divider: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginVertical: 16 },
  dLine: { flex: 1, height: 1 },
  dText: { fontSize: 14, fontWeight: '700' },
  notify: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  switch: { width: 44, height: 26, borderRadius: 100, padding: 3, flexDirection: 'row', justifyContent: 'flex-end' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', padding: 12, borderRadius: 18, borderWidth: 1 },
  spk: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pIcon: { width: 46, height: 46, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  // Location + monthly controls
  locRow: { flexDirection: 'row-reverse', gap: 10, marginBottom: 12 },
  locBtn: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  monthBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  // Modals
  mWrap: { flex: 1, justifyContent: 'flex-end' },
  mBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  mSheet: { height: '72%', borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, overflow: 'hidden' },
  mHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1 },
  mTitle: { fontSize: 16, fontWeight: '800', textAlign: 'right', flex: 1 },
  cityRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  mTblRow: { flexDirection: 'row-reverse', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 10 },
  mCellDay: { width: 52, textAlign: 'center', fontSize: 13 },
  mCell: { width: 74, textAlign: 'center', fontSize: 12.5 },
});
