import React from 'react';
import { Text } from 'react-native';
import { getAyahSegments, resolveColor, DEFAULT_TAJWEED_COLORS } from 'react-native-quran-tajweed';

// Zero-Width Joiner. The tajweed data splits an ayah into colored runs that
// often cut *inside* a word (e.g. "ٱ" | "للَّهِ"). Rendering each run as its own
// <Text> makes the boundary letters shape in isolated form, so the word visually
// falls apart. Inserting a ZWJ on both sides of every intra-word boundary makes
// each run shape as if the word were continuous, preserving the connection while
// still letting each run carry its own color.
const ZWJ = '‍';

function buildRuns(segments) {
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
export default function TajweedText({ surah, ayah, fontSize = 26, color, style, fallbackText }) {
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

  if (!segments || segments.length === 0) {
    // Fall back to plain text so the ayah is never blank.
    return <Text style={base}>{fallbackText || ''}</Text>;
  }

  const runs = buildRuns(segments);

  return (
    <Text style={base}>
      {runs.map((seg, i) => {
        const col = resolveColor(seg.rules, DEFAULT_TAJWEED_COLORS);
        return (
          <Text key={i} style={col ? { color: col } : null}>
            {seg.text}
          </Text>
        );
      })}
    </Text>
  );
}
