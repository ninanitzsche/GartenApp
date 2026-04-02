import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, Sprout } from 'lucide-react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';

interface Props {
  plantedDate?: string;
  harvestTime?: string;
  expectedYield?: string;
}

export default function HarvestPrediction({ plantedDate, harvestTime, expectedYield }: Props) {
  if (!plantedDate && !harvestTime) return null;

  const harvestDays = estimateHarvestDays(harvestTime);

  return (
    <View style={styles.container}>
      <GlassCard variant="light">
        <View style={styles.row}>
          <Sprout size={16} color={Colors2026.status.success} />
          <Text style={styles.title}>Ernte-Prognose</Text>
        </View>

        {harvestTime && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>🌾 Erntezeit:</Text>
            <Text style={styles.value}>{harvestTime}</Text>
          </View>
        )}

        {plantedDate && harvestDays > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>📅 Geschätzt:</Text>
            <Text style={styles.value}>{estimateHarvestDate(plantedDate, harvestDays)}</Text>
          </View>
        )}

        {expectedYield && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>📦 Ertrag:</Text>
            <Text style={styles.value}>{expectedYield}</Text>
          </View>
        )}
      </GlassCard>
    </View>
  );
}

function estimateHarvestDays(harvestTime?: string): number {
  if (!harvestTime) return 0;
  // Common garden vegetables estimates in days
  const estimates: Record<string, number> = {
    'tomate': 80, 'gurke': 55, 'paprika': 75, 'zucchini': 50,
    'kürbis': 90, 'bohne': 60, 'erbse': 60, 'karotte': 75,
    'radieschen': 30, 'salat': 45, 'spinat': 40, 'kartoffel': 90,
    'erdbeere': 30, 'himbeere': 60, 'johannisbeere': 60,
  };
  return 0; // Use planted_date + harvestTime string for now
}

function estimateHarvestDate(plantedDate: string, days: number): string {
  const date = new Date(plantedDate);
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing2026.md,
    paddingHorizontal: Spacing2026.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  title: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textSecondary,
  },
  value: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
});
