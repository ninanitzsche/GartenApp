/**
 * LoadingState Component
 * Displays loading state with accessibility support
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors2026, Spacing2026, Typography2026 } from '../../theme/designSystemV2';

interface LoadingStateProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
  accessibilityLabel?: string;
}

export default function LoadingState({
  message = 'Laden...',
  size = 'large',
  fullScreen = false,
  accessibilityLabel,
}: LoadingStateProps) {
  return (
    <View 
      style={[styles.container, fullScreen && styles.fullScreen]}
      accessibilityLabel={accessibilityLabel || message}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
    >
      <ActivityIndicator size={size} color={Colors2026.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing2026.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  message: {
    marginTop: Spacing2026.md,
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },
});
