import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../src/store/SettingsContext';
import { COMPANIONS } from '../src/lib/religious';

export default function Companions() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  const data = useMemo(() => {
    if (!q.trim()) return COMPANIONS;
    const s = q.trim();
    return COMPANIONS.filter((x) => (x.name || '').includes(s) || (x.description || '').includes(s));
  }, [q]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <View style={[styles.header, { borderBottomColor: c.line }]}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.hTitle, { color: c.ink }]}>هاوەڵان</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={[styles.search, { backgroundColor: c.card, borderColor: c.line }]}>
        <Ionicons name="search" size={18} color={c.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="گەڕان بەناوی هاوەڵ..."
          placeholderTextColor={c.muted}
          style={[styles.input, { color: c.ink }]}
          textAlign="right"
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={(x) => String(x.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        renderItem={({ item }) => {
          const open = openId === item.id;
          return (
            <Pressable
              onPress={() => setOpenId(open ? null : item.id)}
              style={[styles.card, { backgroundColor: c.card, borderColor: open ? c.accent : c.line }]}
            >
              <View style={styles.cardTop}>
                <View style={[styles.avatar, { backgroundColor: c.accentSoft }]}>
                  <MaterialCommunityIcons name="account" size={22} color={c.accent} />
                </View>
                <Text style={{ flex: 1, color: c.ink, fontSize: 14, fontWeight: '700', textAlign: 'right' }}>{item.name}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={c.muted} />
              </View>
              {open && item.description ? (
                <Text style={[styles.desc, { color: c.muted }]}>{item.description}</Text>
              ) : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  hTitle: { fontSize: 16, fontWeight: '800' },
  search: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 14, borderWidth: 1 },
  input: { flex: 1, fontSize: 14, padding: 0 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  desc: { fontSize: 13, lineHeight: 25, textAlign: 'right', marginTop: 12, writingDirection: 'rtl' },
});
