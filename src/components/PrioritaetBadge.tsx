import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../theme/colors';

interface PrioritaetBadgeProps {
  prioritaet: 'hoch' | 'mittel' | 'niedrig';
  size?: 'small' | 'medium';
}

export default function PrioritaetBadge({ prioritaet, size = 'small' }: PrioritaetBadgeProps) {
  const colors = {
    hoch: Colors.priorityHigh,
    mittel: Colors.priorityMedium,
    niedrig: Colors.textLight,
  };

  const labels = {
    hoch: 'HOCH',
    mittel: 'MITTEL',
    niedrig: 'NIEDRIG',
  };

  return (
    <View style={[styles.badge, { backgroundColor: colors[prioritaet] }]}>
      <Text style={[styles.text, size === 'medium' && styles.medium]}>
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
