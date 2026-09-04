/**
 * PlantKnowledgeCard
 * Shows plant knowledge: diseases, pests, care tips, companions
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import { PlantKnowledgeEntry } from '../../data/plant-knowledge-map';

interface PlantKnowledgeCardProps {
  knowledge: PlantKnowledgeEntry;
}

export default function PlantKnowledgeCard({ knowledge }: PlantKnowledgeCardProps) {
  const { extractedInfo } = knowledge;

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.title}>{knowledge.plantName}</Text>

      {extractedInfo.diseases && extractedInfo.diseases.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Krankheiten</Text>
          <View style={styles.tagContainer}>
            {extractedInfo.diseases.map((disease, index) => (
              <View key={index} style={[styles.tag, styles.diseaseTag]}>
                <Text style={styles.tagText}>{disease}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {extractedInfo.pests && extractedInfo.pests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schädlinge</Text>
          <View style={styles.tagContainer}>
            {extractedInfo.pests.map((pest, index) => (
              <View key={index} style={[styles.tag, styles.pestTag]}>
                <Text style={styles.tagText}>{pest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {extractedInfo.careTips && extractedInfo.careTips.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pflegetipps</Text>
          {extractedInfo.careTips.map((tip, index) => (
            <Text key={index} style={styles.tipText}>• {tip}</Text>
          ))}
        </View>
      )}

      {extractedInfo.companions && extractedInfo.companions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mischkultur</Text>
          <View style={styles.companionContainer}>
            {extractedInfo.companions.map((companion, index) => (
              <View 
                key={index} 
                style={[
                  styles.companionTag, 
                  companion.type === 'good' ? styles.goodCompanion : styles.badCompanion
                ]}
              >
                <Text style={styles.companionText}>
                  {companion.plant} {companion.type === 'good' ? '✓' : '✗'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.timesContainer}>
        {extractedInfo.sowingTime && (
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Aussaat</Text>
            <Text style={styles.timeValue}>{extractedInfo.sowingTime}</Text>
          </View>
        )}
        {extractedInfo.harvestTime && (
          <View style={styles.timeBox}>
            <Text style={styles.timeLabel}>Ernte</Text>
            <Text style={styles.timeValue}>{extractedInfo.harvestTime}</Text>
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
  title: {
    ...Typography2026.title,
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
  },
  section: {
    marginBottom: Spacing2026.md,
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
  diseaseTag: {
    backgroundColor: '#FFE4E4',
  },
  pestTag: {
    backgroundColor: '#FFE4CC',
  },
  tagText: {
    ...Typography2026.small,
    color: Colors2026.text,
  },
  tipText: {
    ...Typography2026.body,
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  companionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.xs,
  },
  companionTag: {
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  goodCompanion: {
    backgroundColor: '#E4FFE4',
  },
  badCompanion: {
    backgroundColor: '#FFE4E4',
  },
  companionText: {
    ...Typography2026.small,
    color: Colors2026.text,
  },
  timesContainer: {
    flexDirection: 'row',
    gap: Spacing2026.md,
    marginTop: Spacing2026.sm,
  },
  timeBox: {
    flex: 1,
    backgroundColor: Colors2026.surface,
    padding: Spacing2026.sm,
    borderRadius: Radius2026.md,
  },
  timeLabel: {
    ...Typography2026.label,
    color: Colors2026.textSecondary,
  },
  timeValue: {
    ...Typography2026.body,
    color: Colors2026.text,
  },
});
