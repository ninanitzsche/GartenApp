import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import { Gilde } from '../../types/gilde';

interface GildeCardProps {
  gilde: Gilde;
  onPress?: () => void;
}

export default function GildeCard({ gilde, onPress }: GildeCardProps) {
  return (
    <GlassCard style={styles.container}>
      <View style={styles.header}>
        {gilde.number && (
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{gilde.number}</Text>
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{gilde.name}</Text>
          <Text style={styles.concept}>{gilde.concept}</Text>
        </View>
      </View>
      
      <View style={styles.plantCount}>
        <Text style={styles.plantCountText}>
          {gilde.plants.length} Pflanzen
        </Text>
        {gilde.is_system && (
          <View style={styles.systemBadge}>
            <Text style={styles.systemText}>System</Text>
          </View>
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing2026.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  numberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors2026.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing2026.sm,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  concept: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
    marginTop: 2,
  },
  plantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing2026.sm,
    gap: Spacing2026.sm,
  },
  plantCountText: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
  },
  systemBadge: {
    backgroundColor: Colors2026.surface,
    paddingHorizontal: Spacing2026.xs,
    paddingVertical: 2,
    borderRadius: Radius2026.sm,
  },
  systemText: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
  },
});