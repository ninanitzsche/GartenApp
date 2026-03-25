/**
 * BedCard Component - 2026 Glassmorphism
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Sprout, ChevronRight } from 'lucide-react-native';
import { Bed } from '../types/bed';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';

interface BedCardProps {
  bed: Bed;
  plantCount: number;
  onPress: () => void;
}

export default function BedCard({
  bed,
  plantCount,
  onPress,
}: BedCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.colorIndicator}>
          <View
            style={[
              styles.colorDot,
              { backgroundColor: bed.color || '#4CAF50', shadowColor: bed.color || '#4CAF50' },
            ]}
          />
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.bedName}>{bed.name}</Text>
          {bed.notes && <Text style={styles.notes} numberOfLines={1}>{bed.notes}</Text>}
        </View>
        <ChevronRight size={20} color={Colors2026.textMuted} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailText}>
            {bed.width.toFixed(0)}% × {bed.height.toFixed(0)}%
          </Text>
        </View>
        {plantCount > 0 && (
          <View style={styles.detailRow}>
            <Sprout size={14} color={Colors2026.status.success} />
            <Text style={[styles.detailText, { color: Colors2026.status.success }]}>
              {plantCount} {plantCount === 1 ? 'Pflanze' : 'Pflanzen'}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.sm,
    borderWidth: 1,
    borderColor: Colors2026.border,
    ...Shadows2026.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing2026.md,
  },
  colorIndicator: {
    marginRight: Spacing2026.md,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3,
  },
  titleContainer: {
    flex: 1,
  },
  bedName: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  notes: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    marginTop: 2,
  },
  details: {
    flexDirection: 'row',
    gap: Spacing2026.lg,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.xs,
  },
  detailText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
  },
});
