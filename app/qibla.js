import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Magnetometer } from 'expo-sensors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useTheme } from '../src/store/SettingsContext';
import { useLocation } from '../src/lib/useLocation';
import { qiblaDirection } from '../src/lib/prayer';
import { toArabicDigits } from '../src/lib/format';

export default function Qibla() {
  const theme = useTheme();
  const c = theme.colors;
  const insets = useSafeAreaInsets();
  const { location } = useLocation();
  const [heading, setHeading] = useState(0);
  const [available, setAvailable] = useState(true);

  const qibla = useMemo(() => qiblaDirection(location.lat, location.lng), [location]);

  useEffect(() => {
    let sub;
    (async () => {
      const ok = await Magnetometer.isAvailableAsync().catch(() => false);
      if (!ok) {
        setAvailable(false);
        return;
      }
      Magnetometer.setUpdateInterval(100);
      sub = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setHeading(angle);
      });
    })();
    return () => sub && sub.remove();
  }, []);

  // Rotation so the Kaaba marker points toward qibla relative to where the phone faces.
  const needleRotation = qibla - heading;
  const roseRotation = -heading;
  const aligned = Math.abs(((needleRotation % 360) + 360) % 360) < 6 || Math.abs(((needleRotation % 360) + 360) % 360) > 354;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12 }}>
      <View style={styles.head}>
        <Pressable hitSlop={12} onPress={() => router.back()}>
          <Ionicons name="chevron-forward" size={26} color={c.ink} />
        </Pressable>
        <Text style={[styles.title, { color: c.ink }]}>ئاراستەی قیبلە</Text>
        <View style={styles.loc}>
          <Ionicons name="location-outline" size={15} color={c.muted} />
          <Text style={{ color: c.muted, fontSize: 13 }}>{location.name}</Text>
        </View>
      </View>

      <View style={styles.center}>
        {/* Compass rose */}
        <View style={[styles.compass, { borderColor: c.line, backgroundColor: c.card }]}>
          <View style={[styles.rose, { transform: [{ rotate: `${roseRotation}deg` }] }]}>
            <Text style={[styles.card_n, { color: c.accent }]}>N</Text>
            <Text style={[styles.card_s, { color: c.muted }]}>S</Text>
            <Text style={[styles.card_e, { color: c.muted }]}>E</Text>
            <Text style={[styles.card_w, { color: c.muted }]}>W</Text>
          </View>
          {/* Qibla needle */}
          <View style={[styles.needleWrap, { transform: [{ rotate: `${needleRotation}deg` }] }]}>
            <View style={[styles.kaaba, { backgroundColor: aligned ? c.accent : c.photo2 }]}>
              <MaterialCommunityIcons name="mosque" size={26} color="#f2dcb0" />
            </View>
            <View style={[styles.needleLine, { backgroundColor: aligned ? c.accent : c.muted }]} />
          </View>
          <View style={[styles.hub, { backgroundColor: c.accent }]} />
        </View>

        <Text style={[styles.deg, { color: c.ink }]}>{toArabicDigits(Math.round(qibla))}°</Text>
        <Text style={{ color: aligned ? c.accent : c.muted, fontSize: 14, fontWeight: '700', marginTop: 4 }}>
          {aligned ? '✓ ڕووت لە قیبلەیە' : 'مۆبایل بسووڕێنە بۆ دۆزینەوەی قیبلە'}
        </Text>

        {!available && (
          <Text style={[styles.notice, { color: c.muted, backgroundColor: c.card, borderColor: c.line }]}>
            پێوەری مقناتیسی (compass) لەم ئامێرەدا بەردەست نییە. ئاراستەی قیبلە {toArabicDigits(Math.round(qibla))}° لە باکوورەوەیە.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 24, fontWeight: '800' },
  loc: { flexDirection: 'row-reverse', alignItems: 'center', gap: 5 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  compass: { width: 280, height: 280, borderRadius: 140, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  rose: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  card_n: { position: 'absolute', top: 12, fontSize: 18, fontWeight: '800' },
  card_s: { position: 'absolute', bottom: 12, fontSize: 16, fontWeight: '700' },
  card_e: { position: 'absolute', right: 14, fontSize: 16, fontWeight: '700' },
  card_w: { position: 'absolute', left: 14, fontSize: 16, fontWeight: '700' },
  needleWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 20 },
  kaaba: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  needleLine: { width: 3, height: 90, marginTop: 2, borderRadius: 2 },
  hub: { position: 'absolute', width: 14, height: 14, borderRadius: 7 },
  deg: { fontSize: 40, fontWeight: '800', marginTop: 30, fontVariant: ['tabular-nums'] },
  notice: { marginTop: 20, marginHorizontal: 30, padding: 12, borderRadius: 12, borderWidth: 1, fontSize: 12, textAlign: 'center', lineHeight: 20 },
});
