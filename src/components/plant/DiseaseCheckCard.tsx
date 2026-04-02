import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, ShieldAlert, ShieldCheck } from 'lucide-react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../ui/SectionHeader';

interface DiseaseResult {
  label: string;
  score: number;
  description?: string;
}

interface Props {
  diseaseData: { results?: DiseaseResult[] } | null;
  lastHealthCheck?: string;
  delay?: number;
}

export default function DiseaseCheckCard({ diseaseData, lastHealthCheck, delay = 150 }: Props) {
  if (!diseaseData) return null;

  const results = diseaseData.results || [];
  const hasIssues = results.length > 0;

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Gesundheit"
        subtitle={lastHealthCheck ? new Date(lastHealthCheck).toLocaleDateString('de-DE') : ''}
        icon={hasIssues ? <ShieldAlert size={20} color={Colors2026.status.warning} /> : <ShieldCheck size={20} color={Colors2026.status.success} />}
        animated={true}
        delay={delay}
      />
      <GlassCard variant="light">
        {hasIssues ? (
          results.slice(0, 3).map((disease, index) => (
            <View style={styles.row} key={index}>
              <View style={styles.barContainer}>
                <View style={[styles.bar, { width: `${Math.round(disease.score * 100)}%`, backgroundColor: getScoreColor(disease.score) }]} />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.label}>{disease.label}</Text>
                <Text style={styles.score}>{Math.round(disease.score * 100)}%</Text>
              </View>
              {disease.description && (
                <Text style={styles.description}>{disease.description}</Text>
              )}
            </View>
          ))
        ) : (
          <View style={styles.healthyRow}>
            <ShieldCheck size={18} color={Colors2026.status.success} />
            <Text style={styles.healthyText}>Keine Krankheiten identifiziert</Text>
          </View>
        )}
      </GlassCard>
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score >= 0.7) return Colors2026.status.error;
  if (score >= 0.4) return Colors2026.status.warning;
  return Colors2026.status.success;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  row: {
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  rowContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  label: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    flex: 1,
  },
  score: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
  },
  description: {
    fontSize: 12,
    color: Colors2026.textMuted,
    marginTop: 4,
  },
  barContainer: {
    height: 4,
    backgroundColor: Colors2026.bg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
  healthyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthyText: {
    fontSize: 14,
    color: Colors2026.status.success,
    fontWeight: '500',
  },
});
