import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSettings, useTheme } from '../src/store/SettingsContext';
import { THEME_LIST } from '../src/theme/themes';
import { TAFSIR_OPTIONS, TAFSIR_LANGS } from '../src/lib/tafsir';
import { RECITERS } from '../src/lib/reciters';
import { CALC_METHODS } from '../src/lib/prayer';

const LANGS = [
  { id: 'ku', label: 'کوردی' },
  { id: 'ar', label: 'عربي' },
  { id: 'en', label: 'English' },
];

export default function Settings() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { themeId, readMode, tafsirId, showTafsir, reciterId, language, calcMethod, madhab, update } = useSettings();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 160 }}
    >
      <Text style={[styles.title, { color: c.ink }]}>ڕێکخستنەکان</Text>

      {/* Reading mode */}
      <Section c={c} label="شێوازی خوێندنەوە">
        <Segmented
          c={c}
          value={readMode}
          options={[
            { id: 'continuous', label: 'بەردەوام (Uthmanic)' },
            { id: 'page', label: 'پەڕە بە پەڕە (QCF)' },
          ]}
          onChange={(v) => update({ readMode: v })}
        />
      </Section>

      {/* Theme */}
      <Section c={c} label="ڕەنگی ڕووکار">
        <View style={styles.themes}>
          {THEME_LIST.map((t) => {
            const sel = t.id === themeId;
            return (
              <Pressable key={t.id} style={styles.themeChip} onPress={() => update({ themeId: t.id })}>
                <View style={[styles.swatch, { borderColor: sel ? c.accent : 'transparent' }]}>
                  <View style={{ flex: 1, backgroundColor: t.swatch[0] }} />
                  <View style={{ flex: 1, backgroundColor: t.swatch[1] }} />
                </View>
                <Text style={{ color: sel ? c.accent : c.muted, fontSize: 11, marginTop: 5 }}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Tafsir selection — grouped by language */}
      <Section c={c} label="تەفسیر (کوردی · عەرەبی · ئینگلیزی)">
        {TAFSIR_LANGS.map((lang) => (
          <View key={lang.id} style={{ marginBottom: 12 }}>
            <Text style={{ color: c.muted, fontSize: 11, marginBottom: 6, textAlign: 'right' }}>{lang.label}</Text>
            <View style={styles.chipWrap}>
              {TAFSIR_OPTIONS.filter((t) => t.lang === lang.id).map((t) => {
                const sel = t.id === tafsirId;
                return (
                  <Pressable
                    key={t.id}
                    onPress={() => update({ tafsirId: t.id })}
                    style={[styles.chip, { backgroundColor: sel ? c.accent : c.card, borderColor: sel ? c.accent : c.line }]}
                  >
                    <Text style={{ color: sel ? c.onAccent : c.ink, fontSize: 13, fontWeight: sel ? '700' : '500' }}>{t.name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <ToggleRow
          c={c}
          label="پیشاندانی تەفسیر لەژێر ئایەت"
          value={showTafsir}
          onToggle={() => update({ showTafsir: !showTafsir })}
        />
      </Section>

      {/* Default reciter */}
      <Section c={c} label="قورئان‌خوێنی بنەڕەت">
        <View style={{ gap: 8 }}>
          {RECITERS.map((r) => {
            const sel = r.id === reciterId;
            return (
              <Pressable
                key={r.id}
                onPress={() => update({ reciterId: r.id })}
                style={[styles.listRow, { backgroundColor: c.card, borderColor: sel ? c.accent : c.line }]}
              >
                <Text style={{ color: c.ink, fontSize: 14 }}>{r.name}</Text>
                {sel && <Ionicons name="checkmark-circle" size={20} color={c.accent} />}
              </Pressable>
            );
          })}
        </View>
      </Section>

      {/* Prayer calculation */}
      <Section c={c} label="شێوازی حیسابی کاتی نوێژ">
        <Segmented
          c={c}
          value={calcMethod}
          options={CALC_METHODS.map((m) => ({ id: m.id, label: m.name }))}
          onChange={(v) => update({ calcMethod: v })}
        />
      </Section>

      {/* Madhab (Asr) */}
      <Section c={c} label="مەزهەب (کاتی عەسر)">
        <Segmented
          c={c}
          value={madhab}
          options={[
            { id: 'shafi', label: 'شافیعی/گشتی' },
            { id: 'hanafi', label: 'حەنەفی' },
          ]}
          onChange={(v) => update({ madhab: v })}
        />
      </Section>

      {/* Language */}
      <Section c={c} label="زمانی ڕووکار">
        <Segmented c={c} value={language} options={LANGS} onChange={(v) => update({ language: v })} />
      </Section>

      <Text style={{ color: c.muted, fontSize: 11, textAlign: 'center', marginTop: 10 }}>
        داتا: imanikurd-quran · فۆنت: KFGQPC Uthmanic Hafs
      </Text>
    </ScrollView>
  );
}

function Section({ c, label, children }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '700', marginBottom: 10, textAlign: 'right' }}>{label}</Text>
      {children}
    </View>
  );
}

function Segmented({ c, value, options, onChange }) {
  return (
    <View style={[styles.seg, { backgroundColor: c.card, borderColor: c.line }]}>
      {options.map((o) => {
        const sel = o.id === value;
        return (
          <Pressable key={o.id} style={[styles.segBtn, sel && { backgroundColor: c.accent }]} onPress={() => onChange(o.id)}>
            <Text style={{ color: sel ? c.onAccent : c.muted, fontSize: 12, fontWeight: sel ? '700' : '500' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ToggleRow({ c, label, value, onToggle }) {
  return (
    <Pressable onPress={onToggle} style={[styles.toggleRow, { backgroundColor: c.card, borderColor: c.line }]}>
      <Text style={{ color: c.ink, fontSize: 13 }}>{label}</Text>
      <View style={[styles.switch, { backgroundColor: value ? c.accent : c.line }]}>
        <View style={[styles.knob, { transform: [{ translateX: value ? -18 : 0 }] }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', marginBottom: 18, textAlign: 'right' },
  themes: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12 },
  themeChip: { alignItems: 'center', width: 56 },
  swatch: { width: 46, height: 46, borderRadius: 14, flexDirection: 'row', overflow: 'hidden', borderWidth: 2 },
  seg: { flexDirection: 'row-reverse', borderRadius: 14, borderWidth: 1, padding: 4, gap: 4, flexWrap: 'wrap' },
  chipWrap: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 100, borderWidth: 1 },
  segBtn: { flexGrow: 1, paddingVertical: 9, paddingHorizontal: 8, borderRadius: 10, alignItems: 'center' },
  listRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1 },
  toggleRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginTop: 10 },
  switch: { width: 44, height: 26, borderRadius: 100, padding: 3, flexDirection: 'row', justifyContent: 'flex-end' },
  knob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
});
