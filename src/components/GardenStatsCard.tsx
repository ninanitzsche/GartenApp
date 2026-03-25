/**
 * GardenStatsCard Component - 2026 Glassmorphism
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LayoutGrid, Sprout } from 'lucide-react-native';
import GlassCard from './ui/GlassCard';
import { Colors2026, Spacing2026, Typography2026 } from '../theme/designSystemV2';

interface GardenStatsCardProps {
  bedCount: number;
  plantCount: number;
}

export default function GardenStatsCard({
  bedCount,
  plantCount,
}: GardenStatsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gartenübersicht</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View style={styles.statItem}>
          <GlassCard variant="tint" animated={false}>
            <View style={styles.statContent}>
              <LayoutGrid size={20} color={Colors2026.primary} />
              <Text style={styles.statValue}>{bedCount}</Text>
              <Text style={styles.statLabel}>Beete</Text>
            </View>
          </GlassCard>
        </View>
        <View style={styles.statItem}>
          <GlassCard variant="tint" animated={false}>
            <View style={styles.statContent}>
              <Sprout size={20} color={Colors2026.primary} />
              <Text style={styles.statValue}>{plantCount}</Text>
              <Text style={styles.statLabel}>Pflanzen</Text>
            </View>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing2026.xl,
  },
  title: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.3,
    marginBottom: Spacing2026.md,
  },
  statItem: {
    width: 140,
    marginRight: Spacing2026.sm,
  },
  statContent: {
    alignItems: 'center',
    gap: Spacing2026.xs,
  },
  statValue: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
  },
});
