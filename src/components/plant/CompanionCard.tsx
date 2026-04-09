/**
 * CompanionCard
 * Shows good and bad companion plants
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';

interface CompanionCardProps {
  plantName: string;
  goodCompanions: string[];
  badCompanions: string[];
}

export default function CompanionCard({ plantName, goodCompanions, badCompanions }: CompanionCardProps) {
  const hasCompanions = goodCompanions.length > 0 || badCompanions.length > 0;

  if (!hasCompanions) {
    return null;
  }

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.title}>Mischkultur für {plantName}</Text>

      {goodCompanions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gute Nachbarn ✓</Text>
          <View style={styles.tagContainer}>
            {goodCompanions.map((companion, index) => (
              <View key={index} style={[styles.tag, styles.goodTag]}>
                <Text style={styles.tagText}>{companion} ✓</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {badCompanions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schlechte Nachbarn ✗</Text>
          <View style={styles.tagContainer}>
            {badCompanions.map((companion, index) => (
              <View key={index} style={[styles.tag, styles.badTag]}>
                <Text style={styles.tagText}>{companion} X</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing2026.md,
  },
  title: {
    ...Typography2026.h4,
    color: Colors2026.text,
    marginBottom: Spacing2026.sm,
  },
  section: {
    marginTop: Spacing2026.sm,
  },
  sectionTitle: {
    ...Typography2026.label,
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.xs,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.xs,
  },
  tag: {
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  goodTag: {
    backgroundColor: '#E4FFE4',
  },
  badTag: {
    backgroundColor: '#FFE4E4',
  },
  tagText: {
    ...Typography2026.small,
    color: Colors2026.text,
  },
});
