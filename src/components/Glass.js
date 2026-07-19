import React from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../store/SettingsContext';

// Frosted-glass surface. On gradient themes it renders a real BlurView (frosted
// glass over the app gradient); on solid themes it falls back to a plain card View.
// The caller's style keeps its translucent backgroundColor + border, which layers
// over the blur to produce the glass tint.
export default function Glass({ style, intensity, tint, children, ...rest }) {
  const theme = useTheme();
  if (!theme.gradient) {
    return (
      <View style={[{ backgroundColor: theme.colors.card }, style]} {...rest}>
        {children}
      </View>
    );
  }
  return (
    <BlurView
      intensity={intensity ?? theme.glassIntensity ?? 25}
      tint={tint ?? theme.glassTint ?? 'light'}
      style={[{ overflow: 'hidden' }, style]}
      {...rest}
    >
      {children}
    </BlurView>
  );
}
