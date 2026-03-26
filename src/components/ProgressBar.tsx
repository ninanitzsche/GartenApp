import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';

export interface ProgressBarProps {
  percentage: number;
  color?: string;
  label?: string;
  height?: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export default function ProgressBar({
  percentage,
  color = Colors2026.primary,
  label,
  height = 8,
  showLabel = true,
  style,
}: ProgressBarProps) {
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={[styles.container, style]}>
      {showLabel && label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <Text style={[styles.percentage, { color }]}>{normalizedPercentage.toFixed(1)}%</Text>
        </View>
      )}

      <View style={[styles.barBackground, { height }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${normalizedPercentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors2026.text,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
  },
  barBackground: {
    backgroundColor: Colors2026.background,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  barFill: {
    borderRadius: 4,
  },
});
