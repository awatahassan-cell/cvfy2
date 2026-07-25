import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Circular reciter portrait. Uses the reciter's `photo` when present (and it
// loads); otherwise shows a clean icon avatar. Never breaks on a bad URL.
export default function ReciterAvatar({ reciter, size = 52, c, selected }) {
  const [failed, setFailed] = useState(false);
  const border = selected ? c.accent : c.line;
  const common = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2,
    borderColor: border,
  };

  if (reciter?.photo && !failed) {
    return (
      <Image
        source={{ uri: reciter.photo }}
        onError={() => setFailed(true)}
        style={common}
      />
    );
  }

  return (
    <View style={[common, styles.fallback, { backgroundColor: selected ? c.accent : c.accentSoft }]}>
      <MaterialCommunityIcons name="account-voice" size={size * 0.5} color={selected ? c.onAccent : c.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
