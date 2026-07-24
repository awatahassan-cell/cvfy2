import React from 'react';
import { Text, Platform } from 'react-native';
import { getAyahSegments, resolveColor } from 'react-native-quran-tajweed';
import { TAJWEED_COLORS } from '../lib/tajweedColors';

// The tajweed data splits an ayah into colored runs that often cut *inside* a
// word (e.g. "ٱ" | "للَّهِ").
//
// On native (iOS/Android) React Native renders nested <Text> as one attributed
// string, so the OS shapes the whole ayah together and the letters stay joined
// on their own — no joiner is needed, and adding one makes the Uthmanic font
// draw a visible kashida (ـ) between every word.
//
// On react-native-web each nested <Text> becomes an isolated <span>, which
// breaks Arabic shaping at run boundaries. There a Zero-Width Joiner (U+200D,
// invisible in browser fonts) on both sides of each intra-word boundary makes
// the runs shape as if the word were continuous.
const ZWJ = '‍';
const USE_ZWJ = Platform.OS === 'web';

function buildRuns(segments) {
  if (!USE_ZWJ) return segments;
  const texts = segments.map((s) => s.text);
  // An intra-word boundary is one where neither side is whitespace.
  const joinAt = texts.map((t, i) =>
    i < texts.length - 1 && !/\s$/.test(t) && !/^\s/.test(texts[i + 1])
  );
  return segments.map((seg, i) => {
    let t = seg.text;
    if (i > 0 && joinAt[i - 1]) t = ZWJ + t; // connect back to previous run
    if (joinAt[i]) t = t + ZWJ; // connect forward to next run
    return { text: t, rules: seg.rules };
  });
}

// Render one ayah with tajweed coloring, using only the package's *data*
// helpers (getAyahSegments/resolveColor) — not its components — so we fully
// control the Text nesting, font and letter-joining.
export default function TajweedText({ surah, ayah, fontSize = 26, color, style, fallbackText, endMark, endColor }) {
  let segments = null;
  try {
    segments = getAyahSegments(surah, ayah);
  } catch (e) {
    segments = null;
  }

  const base = [
    { fontFamily: 'UthmanicHafs', fontSize, lineHeight: fontSize * 2, color, textAlign: 'right', writingDirection: 'rtl' },
    style,
  ];

  // Ayah number rendered as the Uthmani font's ornate circular rosette.
  const mark = endMark ? (
    <Text style={{ color: endColor || color, fontSize: fontSize }}>{`  ${endMark}`}</Text>
  ) : null;

  if (!segments || segments.length === 0) {
    // Fall back to plain text so the ayah is never blank.
    return <Text style={base}>{fallbackText || ''}{mark}</Text>;
  }

  const runs = buildRuns(segments);

  return (
    <Text style={base}>
      {runs.map((seg, i) => {
        const col = resolveColor(seg.rules, TAJWEED_COLORS);
        return (
          <Text key={i} style={col ? { color: col } : null}>
            {seg.text}
          </Text>
        );
      })}
      {mark}
    </Text>
  );
}
