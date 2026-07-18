import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../../src/store/SettingsContext';
import { DHIKR_CATEGORIES, dhikrCount } from '../../src/lib/religious';
import { toArabicDigits } from '../../src/lib/format';

export default function Azkar() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');

  const data = useMemo(() => {
    const list = DHIKR_CATEGORIES.filter((cat) => dhikrCount(cat.id) > 0);
    if (!q.trim()) return list;
    return list.filter((cat) => cat.name.includes(q.trim()));
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      <Text style={[styles.title, { color: c.ink }]}>ئەزکار و ویردەکان</Text>
      <View style={[styles.search, { backgroundColor: c.card, borderColor: c.line }]}>
        <Ionicons name="search" size={18} color={c.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="گەڕان بەناوی زیکر..."
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.ink }]}
          textAlign="right"
        />
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { backgroundColor: c.card, borderColor: c.line }]}
            onPress={() => router.push('/azkar/' + item.id)}
          >
            <View style={[styles.iconBox, { backgroundColor: c.accentSoft }]}>
              <MaterialCommunityIcons name="hands-pray" size={20} color={c.accent} />
            </View>
            <Text style={{ flex: 1, color: c.ink, fontSize: 14, fontWeight: '600', textAlign: 'right' }}>{item.name}</Text>
            <View style={[styles.badge, { backgroundColor: c.accentSoft }]}>
              <Text style={{ color: c.accent, fontSize: 11, fontWeight: '700' }}>{toArabicDigits(dhikrCount(item.id))}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', paddingHorizontal: 20, textAlign: 'right' },
  search: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 10 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badge: { minWidth: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
});
