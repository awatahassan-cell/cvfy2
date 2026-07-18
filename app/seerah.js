import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../src/store/SettingsContext';
import { SEERAH } from '../src/lib/religious';

export default function Seerah() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.ink }]}>سیرەتی پێغەمبەر ﷺ</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {SEERAH.map((period) => (
          <View key={period.id} style={{ marginBottom: 18 }}>
            <View style={styles.periodHead}>
              <View style={[styles.dot, { backgroundColor: c.accent }]} />
              <Text style={{ color: c.ink, fontSize: 16, fontWeight: '800', textAlign: 'right' }}>{period.period}</Text>
            </View>
            {(period.events || []).map((ev) => (
              <View key={ev.id} style={[styles.event, { backgroundColor: c.card, borderColor: c.line }]}>
                <View style={styles.evTop}>
                  <Text style={{ color: c.accent, fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'right' }}>{ev.title}</Text>
                  {ev.date ? (
                    <View style={[styles.dateBadge, { backgroundColor: c.accentSoft }]}>
                      <Text style={{ color: c.accent, fontSize: 10, fontWeight: '700' }}>{ev.date}</Text>
                    </View>
                  ) : null}
                </View>
                {ev.description ? <Text style={[styles.desc, { color: c.muted }]}>{ev.description}</Text> : null}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  periodHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  event: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, marginRight: 4 },
  evTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 },
  dateBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  desc: { fontSize: 13, lineHeight: 24, textAlign: 'right', writingDirection: 'rtl' },
});
