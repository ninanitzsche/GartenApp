import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';

export type RecommendationState = 
  | 'in_beet_assigned'      // Im Beet + empfohlen + zugeordnet
  | 'in_beet_not_assigned'  // Im Beet + empfohlen + nicht zugeordnet
  | 'in_inventory'           // Im Inventar + empfohlen + nicht im Beet
  | 'not_in_inventory';     // Nicht im Inventar + empfohlen

interface GildeRecommendationRowProps {
  plantName: string;
  state: RecommendationState;
  gildeName?: string;
  onAddToGilde: () => void;
  onAddToBed: () => void;
  onCreateNew: () => void;
}

export default function GildeRecommendationRow({
  plantName,
  state,
  gildeName,
  onAddToGilde,
  onAddToBed,
  onCreateNew,
}: GildeRecommendationRowProps) {
  const getContent = () => {
    switch (state) {
      case 'in_beet_assigned':
        return {
          icon: <MaterialIcons name="check-circle" size={16} color={Colors2026.status.success} />,
          label: `Im Beet (${gildeName})`,
          buttons: null,
        };
      case 'in_beet_not_assigned':
        return {
          icon: <MaterialIcons name="add-circle-outline" size={16} color={Colors2026.primary} />,
          label: 'Im Beet',
          buttons: (
            <TouchableOpacity style={styles.button} onPress={onAddToGilde}>
              <Text style={styles.buttonText}>+ Gilde</Text>
            </TouchableOpacity>
          ),
        };
      case 'in_inventory':
        return {
          icon: <MaterialIcons name="add-circle-outline" size={16} color={Colors2026.status.warning} />,
          label: 'Im Inventar',
          buttons: (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.buttonSmall]} onPress={onAddToBed}>
                <Text style={styles.buttonText}>+ Beet</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={onAddToGilde}>
                <Text style={styles.buttonText}>+ Gilde</Text>
              </TouchableOpacity>
            </View>
          ),
        };
      case 'not_in_inventory':
        return {
          icon: <MaterialIcons name="add-circle-outline" size={16} color={Colors2026.textMuted} />,
          label: 'Nicht im Inventar',
          buttons: (
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onCreateNew}>
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>+ Neu anlegen</Text>
            </TouchableOpacity>
          ),
        };
    }
  };

  const content = getContent();

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {content.icon}
      </View>
      <View style={styles.content}>
        <Text style={styles.plantName}>{plantName}</Text>
        <Text style={styles.label}>{content.label}</Text>
      </View>
      {content.buttons && (
        <View style={styles.buttonsContainer}>
          {content.buttons}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.sm,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    marginBottom: Spacing2026.xs,
    borderWidth: 1,
    borderColor: Colors2026.divider,
  },
  iconContainer: {
    marginRight: Spacing2026.sm,
  },
  content: {
    flex: 1,
  },
  plantName: {
    ...Typography2026.body,
    color: Colors2026.text,
    fontWeight: '500',
  },
  label: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
    marginTop: 2,
  },
  buttonsContainer: {
    marginLeft: Spacing2026.sm,
  },
  button: {
    backgroundColor: Colors2026.primary,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  buttonSmall: {
    backgroundColor: Colors2026.status.warning,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors2026.textMuted,
  },
  buttonText: {
    ...Typography2026.small,
    color: '#fff',
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: Colors2026.textMuted,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing2026.xs,
  },
});