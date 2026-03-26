import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';

interface PrioritaetBadgeProps {
  prioritaet: 'hoch' | 'mittel' | 'niedrig';
  size?: 'small' | 'medium';
}

export default function PrioritaetBadge({ prioritaet, size = 'small' }: PrioritaetBadgeProps) {
  const colors = {
    hoch: Colors2026.priority.hoch,
    mittel: Colors2026.priority.mittel,
    niedrig: '#757575',
  };

  const labels = {
    hoch: 'HOCH',
    mittel: 'MITTEL',
    niedrig: 'NIEDRIG',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[prioritaet] }]} testID="badge">
      <Text style={[styles.text, size === 'medium' && styles.medium]} testID="text">
        {labels[prioritaet]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  medium: {
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
