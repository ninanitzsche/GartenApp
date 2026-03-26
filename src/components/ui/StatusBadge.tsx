/**
 * StatusBadge Component
 * 2026 Plant Status with Gradient
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors2026, Radius2026, Spacing2026, Typography2026 } from '../../theme/designSystemV2';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export default function StatusBadge({
  status,
  label,
  size = 'md',
  animated = true,
  testID,
  accessibilityLabel,
}: StatusBadgeProps) {
  const color = Colors2026.plantStatus[status as keyof typeof Colors2026.plantStatus] || Colors2026.textMuted;
  const displayLabel = label || status;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: Spacing2026.xs,
          fontSize: Typography2026.small.fontSize,
          dotSize: 6,
        };
      case 'md':
        return {
          padding: Spacing2026.sm,
          fontSize: Typography2026.caption.fontSize,
          dotSize: 8,
        };
      case 'lg':
        return {
          padding: Spacing2026.md,
          fontSize: Typography2026.body.fontSize,
          dotSize: 10,
        };
      default:
        return {
          padding: Spacing2026.sm,
          fontSize: Typography2026.caption.fontSize,
          dotSize: 8,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: `${color}15`,
          borderColor: `${color}30`,
          padding: sizeStyles.padding,
        },
      ]}
      entering={animated ? FadeIn.duration(300) : undefined}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `Status: ${displayLabel}`}
      accessibilityRole="text"
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: color,
            width: sizeStyles.dotSize,
            height: sizeStyles.dotSize,
            borderRadius: sizeStyles.dotSize / 2,
          },
        ]}
      />
      <Text style={[styles.label, { fontSize: sizeStyles.fontSize, color }]}>
        {displayLabel}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius2026.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: Spacing2026.xs,
  },
  label: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
