import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useSettings, useTheme } from '../src/store/SettingsContext';
import { THEME_LIST } from '../src/theme/themes';
import { TAFSIR_OPTIONS } from '../src/lib/tafsir';
import { RECITERS } from '../src/lib/reciters';
import { CALC_METHODS } from '../src/lib/prayer';
import { FONT_OPTIONS } from '../src/lib/uiFont';
import { ADHANS } from '../src/lib/adhans';
import { toArabicDigits } from '../src/lib/format';

const LANGS = [
  { id: 'ku', label: 'کوردی' },
  { id: 'ar', label: 'عربي' },
  { id: 'en', label: 'English' },
];
const NUMBER_STYLES = [
  { id: 'ar', label: 'کوردی (١٢٣)' },
  { id: 'en', label: 'ئینگلیزی (123)' },
];
const READ_MODES = [
  { id: 'continuous', label: 'بەردەوام (Uthmanic)' },
  { id: 'page', label: 'پەڕە بە پەڕە (QCF)' },
];
const MADHABS = [
  { id: 'shafi', label: 'شافیعی / گشتی' },
  { id: 'hanafi', label: 'حەنەفی' },
];
const FONT_SIZES = [0.8, 0.9, 1, 1.1, 1.25, 1.4, 1.6, 1.8].map((v) => ({ id: v, label: `${toArabicDigits(Math.round(v * 100))}٪` }));

const labelOf = (opts, id, key = 'label') => opts.find((o) => o.id === id)?.[key] ?? '';

export default function Settings() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const s = useSettings();
  const { update } = s;
  const [picker, setPicker] = useState(null); // { title, options, value, onSelect }

  const openPicker = (cfg) => setPicker(cfg);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable hitSlop={12} onPress={() => router.back()}>
            <Ionicons name="chevron-forward" size={26} color={c.ink} />
          </Pressable>
          <Text style={[styles.title, { color: c.ink }]}>ڕێکخستنەکان</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* گشتی */}
        <SectionLabel c={c}>گشتی</SectionLabel>
        <Grid>
          <Card c={c} lib={Ionicons} icon="language" label="زمان" value={labelOf(LANGS, s.language)}
            onPress={() => openPicker({ title: 'زمان', options: LANGS, value: s.language, onSelect: (v) => update({ language: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="palette-outline" label="ڕووکەش" value={labelOf(THEME_LIST, s.themeId)}
            onPress={() => openPicker({ title: 'ڕەنگی ڕووکار', options: THEME_LIST, value: s.themeId, onSelect: (v) => update({ themeId: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="format-font" label="شێوەی فۆنت" value={labelOf(FONT_OPTIONS, s.fontId)}
            onPress={() => openPicker({ title: 'فۆنتی نووسین', options: FONT_OPTIONS, value: s.fontId, onSelect: (v) => update({ fontId: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="format-size" label="قەبارەی فۆنت" value={`${toArabicDigits(Math.round((s.fontScale || 1) * 100))}٪`}
            onPress={() => openPicker({ title: 'قەبارەی نووسین', options: FONT_SIZES, value: s.fontScale || 1, onSelect: (v) => update({ fontScale: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="numeric" label="شێوازی ژمارەکان" value={labelOf(NUMBER_STYLES, s.numberStyle)}
            onPress={() => openPicker({ title: 'شێوازی ژمارەکان', options: NUMBER_STYLES, value: s.numberStyle, onSelect: (v) => update({ numberStyle: v }) })} />
        </Grid>

        {/* قورئان */}
        <SectionLabel c={c}>قورئان</SectionLabel>
        <Grid>
          <Card c={c} lib={MaterialCommunityIcons} icon="book-open-page-variant" label="شێوازی خوێندنەوە" value={labelOf(READ_MODES, s.readMode)}
            onPress={() => openPicker({ title: 'شێوازی خوێندنەوە', options: READ_MODES, value: s.readMode, onSelect: (v) => update({ readMode: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="text-box-outline" label="تەفسیر" value={labelOf(TAFSIR_OPTIONS, s.tafsirId, 'name')}
            onPress={() => openPicker({ title: 'تەفسیر', options: TAFSIR_OPTIONS.map((t) => ({ id: t.id, label: t.name })), value: s.tafsirId, onSelect: (v) => update({ tafsirId: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="account-voice" label="قورئان‌خوێن" value={labelOf(RECITERS, s.reciterId, 'name')}
            onPress={() => openPicker({ title: 'قورئان‌خوێن', options: RECITERS.map((r) => ({ id: r.id, label: r.name })), value: s.reciterId, onSelect: (v) => update({ reciterId: v }) })} />
          <ToggleCard c={c} lib={MaterialCommunityIcons} icon="palette" label="ڕەنگی تەجوید" on={s.tajweed} onToggle={() => update({ tajweed: !s.tajweed })} />
        </Grid>

        {/* نوێژ */}
        <SectionLabel c={c}>ڕێکخستنی نوێژ</SectionLabel>
        <Grid>
          <Card c={c} lib={MaterialCommunityIcons} icon="account-tie-voice" label="بانگبێژ" value={labelOf(ADHANS, s.muezzin, 'name')}
            onPress={() => openPicker({ title: 'بانگبێژ', options: ADHANS.map((a) => ({ id: a.id, label: a.name })), value: s.muezzin, onSelect: (v) => update({ muezzin: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="calculator-variant-outline" label="شێوازی حیساب" value={labelOf(CALC_METHODS, s.calcMethod, 'name')}
            onPress={() => openPicker({ title: 'شێوازی حیسابی نوێژ', options: CALC_METHODS.map((m) => ({ id: m.id, label: m.name })), value: s.calcMethod, onSelect: (v) => update({ calcMethod: v }) })} />
          <Card c={c} lib={MaterialCommunityIcons} icon="mosque" label="مەزهەب" value={labelOf(MADHABS, s.madhab)}
            onPress={() => openPicker({ title: 'مەزهەب (کاتی عەسر)', options: MADHABS, value: s.madhab, onSelect: (v) => update({ madhab: v }) })} />
          <ToggleCard c={c} lib={Ionicons} icon="notifications" label="بیرخەرەوەکان" on={s.notifyPrayer} onToggle={() => update({ notifyPrayer: !s.notifyPrayer })} />
        </Grid>

        {/* زیاتر */}
        <SectionLabel c={c}>زیاتر</SectionLabel>
        <Grid>
          <Card c={c} lib={Ionicons} icon="cloud-download-outline" label="داگرتنەکان" value="بەڕێوەبردن" onPress={() => router.push('/downloads')} />
          <Card c={c} lib={Ionicons} icon="bookmark-outline" label="نیشانەکان" value="" onPress={() => router.push('/bookmarks')} />
        </Grid>

        <Text style={{ color: c.muted, fontSize: 11, textAlign: 'center', marginTop: 22 }}>
          ئیمانی کورد · وەشان ١.٠
        </Text>
      </ScrollView>

      {/* Picker overlay */}
      <Modal visible={!!picker} transparent animationType="fade" onRequestClose={() => setPicker(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPicker(null)}>
          <Pressable style={[styles.sheet, { backgroundColor: c.panel === 'transparent' ? '#241A47' : c.panel }]} onPress={() => {}}>
            <Text style={[styles.sheetTitle, { color: c.ink }]}>{picker?.title}</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {picker?.options.map((o) => {
                const sel = o.id === picker.value;
                return (
                  <Pressable
                    key={String(o.id)}
                    onPress={() => { picker.onSelect(o.id); setPicker(null); }}
                    style={[styles.opt, { backgroundColor: sel ? c.accentSoft : 'transparent' }]}
                  >
                    <Text style={{ color: sel ? c.accent : c.ink, fontSize: 15, fontWeight: sel ? '700' : '500' }}>{o.label}</Text>
                    {sel && <Ionicons name="checkmark-circle" size={20} color={c.accent} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function SectionLabel({ c, children }) {
  return <Text style={[styles.section, { color: c.muted }]}>{children}</Text>;
}

function Grid({ children }) {
  return <View style={styles.grid}>{children}</View>;
}

function Card({ c, lib: Lib, icon, label, value, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: c.card, borderColor: c.line }]}>
      <View style={[styles.cardIcon, { backgroundColor: c.accentSoft }]}>
        <Lib name={icon} size={22} color={c.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: c.ink, fontSize: 14, fontWeight: '700', textAlign: 'right' }}>{label}</Text>
        {value ? <Text numberOfLines={1} style={{ color: c.muted, fontSize: 11, textAlign: 'right', marginTop: 2 }}>{value}</Text> : null}
      </View>
    </Pressable>
  );
}

function ToggleCard({ c, lib: Lib, icon, label, on, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={[styles.card, { backgroundColor: c.card, borderColor: on ? c.accent : c.line }]}>
      <View style={[styles.cardIcon, { backgroundColor: on ? c.accent : c.accentSoft }]}>
        <Lib name={icon} size={22} color={on ? c.onAccent : c.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{ color: c.ink, fontSize: 14, fontWeight: '700', textAlign: 'right' }}>{label}</Text>
        <Text style={{ color: on ? c.accent : c.muted, fontSize: 11, textAlign: 'right', marginTop: 2 }}>{on ? 'چالاک' : 'ناچالاک'}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800' },
  section: { fontSize: 14, fontWeight: '800', textAlign: 'right', paddingHorizontal: 20, marginTop: 18, marginBottom: 10 },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
  card: { width: '47%', flexGrow: 1, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18, borderWidth: 1 },
  cardIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, paddingBottom: 40 },
  sheetTitle: { fontSize: 17, fontWeight: '800', textAlign: 'right', marginBottom: 14 },
  opt: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, marginBottom: 4 },
});
