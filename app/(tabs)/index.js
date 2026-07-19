import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSettings, useTheme } from '../../src/store/SettingsContext';
import { usePlayer } from '../../src/store/PlayerContext';
import { getSurah } from '../../src/lib/quran';
import { toArabicDigits } from '../../src/lib/format';
import { formatHijri } from '../../src/lib/hijri';
import { useLocation } from '../../src/lib/useLocation';
import { getPrayerTimes, getNextPrayer, PRAYERS } from '../../src/lib/prayer';
import Glass from '../../src/components/Glass';

const SECTIONS = [
  { route: '/quran', icon: 'book-open-page-variant', label: 'قورئان', sub: '١١٤ سوورە', grad: ['#F0904F', '#E06565'] },
  { route: '/azkar', icon: 'hands-pray', label: 'ئەزکار', sub: 'ویرد و نزا', grad: ['#9169D6', '#B563C4'] },
  { route: '/prayer', icon: 'clock-time-four', label: 'کاتی بانگ', sub: 'کاتی نوێژ', grad: ['#F0A63F', '#E5763E'] },
  { route: '/qibla', icon: 'compass', label: 'قیبلە', sub: 'ئاراستەی کەعبە', grad: ['#33A99C', '#4B7ED8'] },
  { route: '/hadiths', icon: 'book-open-variant', label: 'فەرموودە', sub: '٢٤٠ حەدیس', grad: ['#DE5D8C', '#A758C8'] },
  { route: '/calendar', icon: 'calendar-month', label: 'تەقویم', sub: 'ڕۆژژمێری کۆچی', grad: ['#4C74DE', '#8560CE'] },
  { route: '/names', icon: 'star-four-points', label: '٩٩ ناوی خودا', sub: 'ئەسماء الحسنیٰ', grad: ['#EC6E44', '#DE517F' ] },
  { route: '/seerah', icon: 'timeline-text', label: 'سیرەت', sub: 'ژیانی پێغەمبەر ﷺ', grad: ['#5FB44B', '#309C8A'] },
  { route: '/companions', icon: 'account-group', label: 'هاوەڵان', sub: 'صەحابەکان', grad: ['#A860D2', '#6E5AC8'] },
];

function clockLabel(date) {
  if (!date) return '--:--';
  const h = date.getHours();
  const m = date.getMinutes();
  const mm = m < 10 ? '0' + m : String(m);
  return `${toArabicDigits(h)}:${toArabicDigits(mm)}`;
}

export default function Home() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { lastRead, reciterId, calcMethod, madhab } = useSettings();
  const { playSurah } = usePlayer();
  const { location } = useLocation();

  const lastSurah = getSurah(lastRead.surah);
  const times = useMemo(
    () => getPrayerTimes(location.lat, location.lng, new Date(), calcMethod, madhab),
    [location, calcMethod, madhab]
  );
  const next = useMemo(() => getNextPrayer(times, new Date()), [times]);
  const nextMeta = PRAYERS.find((p) => p.key === next.key);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 160 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.head}>
        <View>
          <Text style={{ color: c.muted, fontSize: 13 }}>السلام علیکم</Text>
          <Text style={[styles.title, { color: c.ink }]}>ئیمانی کورد</Text>
        </View>
        <Pressable onPress={() => router.push('/settings')} style={[styles.iconBtn, { backgroundColor: c.card, borderColor: c.line }]}>
          <Ionicons name="settings-outline" size={20} color={c.ink} />
        </Pressable>
      </View>

      {/* Next prayer + hijri strip */}
      <Pressable onPress={() => router.push('/prayer')} style={styles.stripWrap}>
        <LinearGradient colors={[c.photo1, c.photo2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.strip}>
          <View>
            <Text style={styles.stripLabel}>نوێژی داهاتوو</Text>
            <Text style={styles.stripPrayer}>{nextMeta?.name}</Text>
            <Text style={styles.stripHijri}>{formatHijri(new Date())}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name={nextMeta?.icon || 'weather-sunny'} size={30} color="#f2dcb0" />
            <Text style={styles.stripTime}>{clockLabel(next.time)}</Text>
          </View>
        </LinearGradient>
      </Pressable>

      {/* Continue reading */}
      <Pressable
        onPress={() => router.push('/reader/' + lastRead.surah)}
        style={[styles.continueCard, { backgroundColor: c.accentSoft, borderColor: c.line }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ color: c.accent, fontWeight: '700', fontSize: 11 }}>درێژەی خوێندنەوە</Text>
          <Text style={{ color: c.ink, fontSize: 17, fontWeight: '800', marginTop: 3, textAlign: 'right' }}>{lastSurah?.name}</Text>
          <Text style={{ color: c.muted, fontSize: 12, marginTop: 2, textAlign: 'right' }}>ئایە {toArabicDigits(lastRead.ayah)}</Text>
        </View>
        <Pressable
          onPress={() => playSurah(lastRead.surah, reciterId)}
          style={[styles.playBtn, { backgroundColor: c.accent }]}
        >
          <Ionicons name="play" size={22} color={c.onAccent} />
        </Pressable>
      </Pressable>

      {/* Sections grid */}
      <Text style={[styles.sectionTitle, { color: c.muted }]}>بەشەکان</Text>
      <View style={styles.grid}>
        {SECTIONS.map((s) => (
          <Pressable key={s.route} onPress={() => router.push(s.route)} style={styles.cardWrap}>
            {theme.gradient ? (
              <LinearGradient colors={s.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.30)' }]}>
                  <MaterialCommunityIcons name={s.icon} size={24} color="#fff" />
                </View>
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800', textAlign: 'right' }}>{s.label}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 11, textAlign: 'right', marginTop: 2 }}>{s.sub}</Text>
              </LinearGradient>
            ) : (
              <Glass style={[styles.card, { backgroundColor: c.card, borderColor: c.line, borderWidth: 1 }]}>
                <View style={[styles.cardIcon, { backgroundColor: c.accentSoft }]}>
                  <MaterialCommunityIcons name={s.icon} size={24} color={c.accent} />
                </View>
                <Text style={{ color: c.ink, fontSize: 14, fontWeight: '700', textAlign: 'right' }}>{s.label}</Text>
                <Text style={{ color: c.muted, fontSize: 11, textAlign: 'right', marginTop: 2 }}>{s.sub}</Text>
              </Glass>
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  iconBtn: { width: 42, height: 42, borderRadius: 13, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stripWrap: { paddingHorizontal: 20, marginBottom: 14 },
  strip: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderRadius: 22, padding: 18 },
  stripLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  stripPrayer: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  stripHijri: { color: '#f2dcb0', fontSize: 12, marginTop: 4 },
  stripTime: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 6 },
  continueCard: { flexDirection: 'row-reverse', alignItems: 'center', marginHorizontal: 20, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 22, gap: 12 },
  playBtn: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 13, fontWeight: '700', textAlign: 'right', paddingHorizontal: 20, marginBottom: 12 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', paddingHorizontal: 14, gap: 12, justifyContent: 'center' },
  cardWrap: { width: '30%', minWidth: 100, flexGrow: 1, marginHorizontal: 2, borderRadius: 22, overflow: 'hidden',
    shadowColor: '#6a4a8f', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 3 },
  card: { flex: 1, borderRadius: 22, padding: 15, minHeight: 116 },
  cardIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
});
