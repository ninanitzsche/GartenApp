/**
 * EmptyState Component
 * 2026 Beautiful Empty States
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors2026, Spacing2026, Typography2026, Radius2026 } from '../../theme/designSystemV2';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  message?: string;
  action?: React.ReactNode;
  containerStyle?: ViewStyle;
  animated?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  message,
  action,
  containerStyle,
  animated = true,
  testID,
  accessibilityLabel,
}: EmptyStateProps) {
  const displaySubtitle = subtitle || message;

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      entering={animated ? FadeInUp.springify().damping(15).duration(500) : undefined}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${title}. ${displaySubtitle || ''}`}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      {displaySubtitle && <Text style={styles.subtitle}>{displaySubtitle}</Text>}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing2026.xxxl * 2,
    paddingHorizontal: Spacing2026.xxl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: Radius2026.xl,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing2026.lg,
  },
  title: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: Spacing2026.sm,
  },
  subtitle: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
    textAlign: 'center',
    maxWidth: 250,
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: Spacing2026.xl,
  },
});
