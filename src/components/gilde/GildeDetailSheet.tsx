/**
 * GildeDetailSheet - Bottom sheet showing full gilde details
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import { Gilde } from '../../types/gilde';

interface GildeDetailSheetProps {
  gilde: Gilde;
  onClose?: () => void;
  onEdit?: () => void;
}

export default function GildeDetailSheet({ gilde, onClose, onEdit }: GildeDetailSheetProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
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
        <View style={styles.headerRight}>
          {gilde.is_system && (
            <View style={styles.systemBadge}>
              <Text style={styles.systemText}>System</Text>
            </View>
          )}
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.editButton}>
              <Text style={styles.editText}>Bearbeiten</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {gilde.standort && (
        <View style={styles.standortContainer}>
          <Text style={styles.standortIcon}>📍</Text>
          <Text style={styles.standortText}>{gilde.standort}</Text>
        </View>
      )}

      <GlassCard style={styles.section}>
        <Text style={styles.sectionTitle}>Pflanzen ({gilde.plants.length})</Text>
        {gilde.plants.map((plant, index) => (
          <View key={index} style={styles.plantRow}>
            <View style={styles.plantInfo}>
              <Text style={styles.plantName}>{plant.name}</Text>
              <Text style={styles.plantRole}>{plant.role}</Text>
            </View>
            {plant.notes && (
              <Text style={styles.plantNotes}>{plant.notes}</Text>
            )}
          </View>
        ))}
      </GlassCard>

      {gilde.tips && gilde.tips.length > 0 && (
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Tipps</Text>
          {gilde.tips.map((tip, index) => (
            <View key={index} style={styles.tipRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </GlassCard>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
    paddingHorizontal: Spacing2026.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors2026.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing2026.sm,
    marginBottom: Spacing2026.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing2026.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: Spacing2026.xs,
  },
  numberBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors2026.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing2026.sm,
  },
  numberText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    ...Typography2026.headline,
    color: Colors2026.text,
  },
  concept: {
    ...Typography2026.body,
    color: Colors2026.textSecondary,
    marginTop: 2,
  },
  systemBadge: {
    backgroundColor: Colors2026.surface,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  systemText: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: Colors2026.primary + '15',
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  editText: {
    ...Typography2026.small,
    color: Colors2026.primary,
    fontWeight: '600',
  },
  standortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.md,
    marginBottom: Spacing2026.md,
    gap: Spacing2026.sm,
  },
  standortIcon: {
    fontSize: 16,
  },
  standortText: {
    ...Typography2026.body,
    color: Colors2026.text,
    flex: 1,
  },
  section: {
    marginBottom: Spacing2026.md,
  },
  sectionTitle: {
    ...Typography2026.title,
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    ...Typography2026.body,
    color: Colors2026.text,
    fontWeight: '600',
  },
  plantRole: {
    ...Typography2026.caption,
    color: Colors2026.primary,
    marginTop: 2,
  },
  plantNotes: {
    ...Typography2026.small,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
    maxWidth: '40%',
    textAlign: 'right',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing2026.xs,
    gap: Spacing2026.sm,
  },
  tipBullet: {
    ...Typography2026.body,
    color: Colors2026.primary,
  },
  tipText: {
    ...Typography2026.body,
    color: Colors2026.text,
    flex: 1,
  },
  bottomSpacer: {
    height: 50,
  },
});
