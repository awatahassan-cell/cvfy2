import React from 'react';
import { Text } from 'react-native';
import { getAyahSegments, resolveColor, DEFAULT_TAJWEED_COLORS } from 'react-native-quran-tajweed';

// Render one ayah with tajweed coloring, using only the package's *data*
// helpers (getAyahSegments/resolveColor) — not its components — so we fully
// control the Text nesting and font.
export default function TajweedText({ surah, ayah, fontSize = 26, color, style, fallbackText }) {
  let segments = null;
  try {
    segments = getAyahSegments(surah, ayah);
  } catch (e) {
    segments = null;
  }

  if (!segments || segments.length === 0) {
    // Fall back to plain text so the ayah is never blank.
    return (
      <Text
        style={[
          { fontFamily: 'UthmanicHafs', fontSize, lineHeight: fontSize * 2, color, textAlign: 'right', writingDirection: 'rtl' },
          style,
        ]}
      >
        {fallbackText || ''}
      </Text>
    );
  }

  return (
    <Text
      style={[
        { fontFamily: 'UthmanicHafs', fontSize, lineHeight: fontSize * 2, color, textAlign: 'right', writingDirection: 'rtl' },
        style,
      ]}
    >
      {segments.map((seg, i) => {
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
