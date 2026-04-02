import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { Plant } from '../types/plant';

interface AIPhotoStep3Props {
  plantName: string;
  scientificName: string;
  confidence: number;
  family?: string;
  commonNames?: string[];
  healthStatus: 'gesund' | 'krank' | 'unsicher';
  matchingPlants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  onCreateNewPlant: () => void;
  onRetry: () => void;
}

export default function AIPhotoStep3({
  plantName,
  scientificName,
  confidence,
  family,
  commonNames,
  healthStatus,
  matchingPlants,
  onSelectPlant,
  onCreateNewPlant,
  onRetry,
}: AIPhotoStep3Props) {
  const getConfidenceColor = () => {
    if (confidence >= 0.8) return Colors2026.status.success;
    if (confidence >= 0.5) return Colors2026.status.warning;
    return Colors2026.status.error;
  };

  const getHealthIcon = () => {
    switch (healthStatus) {
      case 'gesund':
        return { name: 'check-circle' as const, color: Colors2026.status.success };
      case 'krank':
        return { name: 'warning' as const, color: Colors2026.status.error };
      case 'unsicher':
      default:
        return { name: 'help' as const, color: Colors2026.status.warning };
    }
  };

  const getHealthLabel = () => {
    switch (healthStatus) {
      case 'gesund':
        return 'Gesund';
      case 'krank':
        return 'Krankheitsanzeichen';
      case 'unsicher':
      default:
        return 'Ungewiss';
    }
  };

  const healthIcon = getHealthIcon();

  return (
    <View style={styles.container}>
      <View style={styles.plantInfoCard}>
        <Text style={styles.plantName}>{plantName}</Text>
        <Text style={styles.scientificName}>{scientificName}</Text>
        
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Konfidenz:</Text>
          <Text style={[styles.confidenceValue, { color: getConfidenceColor() }]}>
            {Math.round(confidence * 100)}%
          </Text>
        </View>

        {family && (
          <Text style={styles.familyText}>Familie: {family}</Text>
        )}

        {commonNames && commonNames.length > 0 && (
          <Text style={styles.commonNamesText}>
            Auch bekannt als: {commonNames.slice(0, 3).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <MaterialIcons name={healthIcon.name} size={24} color={healthIcon.color} />
          <Text style={styles.healthTitle}>Gesundheitsstatus</Text>
        </View>
        <Text style={[styles.healthStatus, { color: healthIcon.color }]}>
          {getHealthLabel()}
        </Text>
        <Text style={styles.healthDescription}>
          {healthStatus === 'gesund' && 'Keine Krankheitsanzeichen erkannt'}
          {healthStatus === 'krank' && 'Es wurden mögliche Krankheitsanzeichen erkannt'}
          {healthStatus === 'unsicher' && 'Die Gesundheit konnte nicht eindeutig bestimmt werden'}
        </Text>
      </View>

      {matchingPlants.length > 0 && (
        <View style={styles.matchingSection}>
          <Text style={styles.sectionTitle}>Passende Pflanzen in deinem Garten</Text>
          {matchingPlants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.matchingItem}
              onPress={() => onSelectPlant(plant)}
            >
              <MaterialIcons name="yard" size={20} color={Colors2026.primary} />
              <View style={styles.matchingInfo}>
                <Text style={styles.matchingName}>{plant.name}</Text>
                {plant.location && (
                  <Text style={styles.matchingLocation}>{plant.location}</Text>
                )}
              </View>
              <MaterialIcons name="chevron-right" size={20} color={Colors2026.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.actionsContainer}>
        {matchingPlants.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onCreateNewPlant}
          >
            <MaterialIcons name="add" size={20} color={Colors2026.text} />
            <Text style={styles.secondaryButtonText}>Neue Pflanze anlegen</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onRetry}
        >
          <MaterialIcons name="refresh" size={20} color={Colors2026.text} />
          <Text style={styles.secondaryButtonText}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.lg,
  },
  plantInfoCard: {
    backgroundColor: Colors2026.background,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.md,
    ...Shadows2026.sm,
  },
  plantName: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginBottom: 4,
  },
  scientificName: {
    fontSize: Typography2026.body.fontSize,
    fontStyle: 'italic',
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.md,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing2026.sm,
  },
  confidenceLabel: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
    marginRight: Spacing2026.sm,
  },
  confidenceValue: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: 'bold',
  },
  familyText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
    marginBottom: 4,
  },
  commonNamesText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
    fontStyle: 'italic',
  },
  healthCard: {
    backgroundColor: Colors2026.background,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.md,
    ...Shadows2026.sm,
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    marginBottom: Spacing2026.sm,
  },
  healthTitle: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  healthStatus: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: 'bold',
    marginBottom: Spacing2026.sm,
  },
  healthDescription: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
  },
  matchingSection: {
    marginBottom: Spacing2026.md,
  },
  sectionTitle: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
  },
  matchingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.background,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    marginBottom: Spacing2026.sm,
    ...Shadows2026.sm,
  },
  matchingInfo: {
    flex: 1,
    marginLeft: Spacing2026.md,
  },
  matchingName: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  matchingLocation: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
  },
  actionsContainer: {
    gap: Spacing2026.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing2026.sm,
    paddingVertical: 14,
    borderRadius: Radius2026.md,
  },
  secondaryButton: {
    backgroundColor: Colors2026.background,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  secondaryButtonText: {
    color: Colors2026.text,
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
  },
});