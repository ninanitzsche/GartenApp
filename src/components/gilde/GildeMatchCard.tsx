import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { GildeMatch } from '../../types/gilde';
import { MaterialIcons } from '@expo/vector-icons';

interface GildeMatchCardProps {
  match: GildeMatch;
  onSelect: (gilde: GildeMatch) => void;
  onPreview?: (gilde: GildeMatch) => void;
  compact?: boolean;
}

export default function GildeMatchCard({ 
  match, 
  onSelect, 
  onPreview,
  compact = false,
}: GildeMatchCardProps) {
  const { gilde, matchScore, matchingPlants, missingPlants } = match;
  
  const getScoreColor = () => {
    if (matchScore >= 70) return Colors2026.status.success;
    if (matchScore >= 40) return Colors2026.status.warning;
    return Colors2026.status.error;
  };
  
  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactCard}
        onPress={() => onSelect(match)}
      >
        <View style={[styles.scoreBadge, { backgroundColor: getScoreColor() }]}>
          <Text style={styles.scoreText}>{matchScore}%</Text>
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactName}>{gilde.name}</Text>
          <Text style={styles.compactPlants}>
            {gilde.plants?.slice(0, 3).map(p => p.name).join(' • ')}
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors2026.textMuted} />
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.scoreBadgeLarge, { backgroundColor: getScoreColor() }]}>
          <Text style={styles.scoreTextLarge}>{matchScore}%</Text>
        </View>
        <Text style={styles.matchLabel}>Match</Text>
      </View>
      
      <Text style={styles.name}>{gilde.name}</Text>
      {gilde.concept && <Text style={styles.concept}>{gilde.concept}</Text>}
      
      <View style={styles.plantSection}>
        <View style={styles.plantRow}>
          <Text style={styles.plantLabel}>✓ Im Beet:</Text>
          <Text style={styles.plantNames}>{matchingPlants.join(', ')}</Text>
        </View>
        <View style={styles.plantRow}>
          <Text style={styles.plantLabel}>✗ Fehlt:</Text>
          <Text style={styles.plantNamesMissing}>{missingPlants.join(', ')}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={() => onSelect(match)}
        >
          <Text style={styles.selectButtonText}>Auswählen</Text>
        </TouchableOpacity>
        {onPreview && (
          <TouchableOpacity 
            style={styles.previewButton}
            onPress={() => onPreview(match)}
          >
            <Text style={styles.previewButtonText}>Vorschau</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    marginBottom: Spacing2026.sm,
  },
  compactContent: {
    flex: 1,
    marginLeft: Spacing2026.sm,
  },
  compactName: {
    ...Typography2026.body,
    color: Colors2026.text,
    fontWeight: '600',
  },
  compactPlants: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
  },
  scoreBadge: {
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  scoreText: {
    ...Typography2026.small,
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    marginBottom: Spacing2026.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing2026.sm,
  },
  scoreBadgeLarge: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
    marginRight: Spacing2026.sm,
  },
  scoreTextLarge: {
    ...Typography2026.headline,
    color: '#fff',
    fontWeight: '700',
  },
  matchLabel: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
  },
  name: {
    ...Typography2026.title,
    color: Colors2026.text,
  },
  concept: {
    ...Typography2026.body,
    color: Colors2026.textMuted,
    marginTop: Spacing2026.xs,
  },
  plantSection: {
    marginTop: Spacing2026.md,
    paddingTop: Spacing2026.sm,
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
  },
  plantRow: {
    flexDirection: 'row',
    marginBottom: Spacing2026.xs,
  },
  plantLabel: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
    width: 60,
  },
  plantNames: {
    ...Typography2026.caption,
    color: Colors2026.status.success,
    flex: 1,
  },
  plantNamesMissing: {
    ...Typography2026.caption,
    color: Colors2026.status.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing2026.md,
    gap: Spacing2026.sm,
  },
  selectButton: {
    flex: 1,
    backgroundColor: Colors2026.primary,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.md,
    alignItems: 'center',
  },
  selectButtonText: {
    ...Typography2026.body,
    color: '#fff',
    fontWeight: '600',
  },
  previewButton: {
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.primary,
  },
  previewButtonText: {
    ...Typography2026.body,
    color: Colors2026.primary,
  },
});