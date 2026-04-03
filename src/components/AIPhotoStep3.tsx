import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { Plant } from '../types/plant';
import { Bed } from '../types/bed';

interface AIPhotoStep3Props {
  plantName: string;
  scientificName: string;
  confidence: number;
  family?: string;
  commonNames?: string[];
  healthStatus: 'gesund' | 'krank' | 'unsicher';
  matchingPlants: Plant[];
  plantStatusAnalysis?: {
    zustand: string;
    zustandBeschreibung: string;
    klassifikation: 'unkraut' | 'helfer' | 'nutzpflanze';
    klassifikationBegrundung: string;
  };
  onSelectPlant: (plant: Plant) => void;
  onCreateNewPlant: (correctedName?: string, classification?: 'unkraut' | 'helfer' | 'nutzpflanze') => void;
  onReidentify?: (correctedName: string, classification: 'unkraut' | 'helfer' | 'nutzpflanze') => void;
  onRetry: () => void;
  isLoading?: boolean;
  beds?: Bed[];
  selectedBedId?: string | null;
  onSelectBed?: (bedId: string | null) => void;
}

export default function AIPhotoStep3({
  plantName,
  scientificName,
  confidence,
  family,
  commonNames,
  healthStatus,
  matchingPlants,
  plantStatusAnalysis,
  onSelectPlant,
  onCreateNewPlant,
  onReidentify,
  onRetry,
  isLoading = false,
  beds = [],
  selectedBedId,
  onSelectBed,
}: AIPhotoStep3Props) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctedName, setCorrectedName] = useState('');
  const [classification, setClassification] = useState<'unkraut' | 'helfer' | 'nutzpflanze' | null>(null);
  const getConfidenceColor = () => {
    if (confidence >= 0.8) return Colors2026.status.success;
    if (confidence >= 0.5) return Colors2026.status.warning;
    return Colors2026.status.error;
  };

  const handleConfirmWithCorrection = () => {
    if (showCorrection && correctedName.trim()) {
      // User entered a corrected name - create plant directly with that name
      onCreateNewPlant(correctedName.trim(), classification || 'nutzpflanze');
    } else if (showCorrection && classification) {
      // User just selected classification (weed/helper) - no re-identification needed
      onCreateNewPlant(undefined, classification);
    } else {
      // No correction - proceed with original identification
      onCreateNewPlant();
    }
  };

  const handleReidentify = () => {
    if (correctedName.trim() && onReidentify) {
      onReidentify(correctedName.trim(), classification || 'nutzpflanze');
    }
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

      {plantStatusAnalysis && (
        <View style={styles.statusAnalysisCard}>
          <View style={styles.statusAnalysisHeader}>
            <MaterialIcons name="eco" size={24} color={Colors2026.primary} />
            <Text style={styles.statusAnalysisTitle}>KI-Analyse</Text>
          </View>
          
          <View style={styles.statusAnalysisRow}>
            <Text style={styles.statusAnalysisLabel}>Zustand:</Text>
            <Text style={styles.statusAnalysisValue}>
              {plantStatusAnalysis.zustand === 'jungpflanze' && '🌱 Jungpflanze'}
              {plantStatusAnalysis.zustand === 'wachstum' && '🌿 Wachstum'}
              {plantStatusAnalysis.zustand === 'bluete' && '🌸 Blüte'}
              {plantStatusAnalysis.zustand === 'fruchtbildung' && '🍎 Fruchtbildung'}
              {plantStatusAnalysis.zustand === 'trockene_blatter' && '🍂 Trockene Blätter'}
              {plantStatusAnalysis.zustand === 'gesund' && '✅ Gesund'}
              {plantStatusAnalysis.zustand === 'unklar' && '❓ Unklar'}
            </Text>
          </View>
          {plantStatusAnalysis.zustandBeschreibung && (
            <Text style={styles.statusAnalysisDesc}>{plantStatusAnalysis.zustandBeschreibung}</Text>
          )}
          
          <View style={styles.statusAnalysisRow}>
            <Text style={styles.statusAnalysisLabel}>Empfehlung:</Text>
            <Text style={styles.statusAnalysisValue}>
              {plantStatusAnalysis.klassifikation === 'unkraut' && '🌾 Unkraut'}
              {plantStatusAnalysis.klassifikation === 'helfer' && '🐝 Helfer'}
              {plantStatusAnalysis.klassifikation === 'nutzpflanze' && '🌻 Nutzpflanze'}
            </Text>
          </View>
          {plantStatusAnalysis.klassifikationBegrundung && (
            <Text style={styles.statusAnalysisDesc}>{plantStatusAnalysis.klassifikationBegrundung}</Text>
          )}
        </View>
      )}

      {matchingPlants.length > 0 && (
        <View style={styles.matchingSection}>
          <Text style={styles.sectionTitle}>Passende Pflanzen in deinem Garten</Text>
          {matchingPlants.map((plant) => (
            <TouchableOpacity
              key={plant.id}
              style={styles.matchingItem}
              onPress={() => onSelectPlant(plant)}
              accessibilityLabel={`Pflanze ${plant.name} auswählen`}
              accessibilityRole="button"
              disabled={isLoading}
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
          <Text style={styles.orText}>Oder</Text>
        )}
        
        {beds.length > 0 && (
          <View style={styles.bedSelector}>
            <Text style={styles.bedLabel}>Beet auswählen (optional)</Text>
            <View style={styles.bedOptions}>
              <TouchableOpacity
                style={[styles.bedOption, !selectedBedId && styles.bedOptionSelected]}
                onPress={() => onSelectBed?.(null)}
              >
                <Text style={[styles.bedOptionText, !selectedBedId && styles.bedOptionTextSelected]}>
                  Keins
                </Text>
              </TouchableOpacity>
              {beds.map((bed) => (
                <TouchableOpacity
                  key={bed.id}
                  style={[styles.bedOption, selectedBedId === bed.id && styles.bedOptionSelected]}
                  onPress={() => onSelectBed?.(bed.id)}
                >
                  <Text style={[styles.bedOptionText, selectedBedId === bed.id && styles.bedOptionTextSelected]}>
                    {bed.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {showCorrection && (
          <View style={styles.correctionCard}>
            <Text style={styles.correctionTitle}>Identifikation korrigieren</Text>
            
            <Text style={styles.correctionLabel}>Richtiger Name</Text>
            <TextInput
              style={styles.correctionInput}
              placeholder="z.B. Aprikose Compacta"
              placeholderTextColor={Colors2026.textSecondary}
              value={correctedName}
              onChangeText={setCorrectedName}
            />
            
            <Text style={styles.correctionLabel}>Klassifikation</Text>
            <View style={styles.classificationRow}>
              <TouchableOpacity
                style={[styles.classButton, classification === 'unkraut' && styles.classButtonSelected]}
                onPress={() => setClassification('unkraut')}
              >
                <Text style={[styles.classButtonText, classification === 'unkraut' && styles.classButtonTextSelected]}>
                  Unkraut
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.classButton, classification === 'helfer' && styles.classButtonSelected]}
                onPress={() => setClassification('helfer')}
              >
                <Text style={[styles.classButtonText, classification === 'helfer' && styles.classButtonTextSelected]}>
                  Helfer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.classButton, classification === 'nutzpflanze' && styles.classButtonSelected]}
                onPress={() => setClassification('nutzpflanze')}
              >
                <Text style={[styles.classButtonText, classification === 'nutzpflanze' && styles.classButtonTextSelected]}>
                  Nutzpflanze
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.correctionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setShowCorrection(false);
                  setCorrectedName('');
                  setClassification(null);
                }}
              >
                <Text style={styles.secondaryButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              
              {correctedName.trim() && (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={handleReidentify}
                >
                  <MaterialIcons name="search" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Neu identifizieren</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {!showCorrection && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
            onPress={() => setShowCorrection(true)}
            disabled={isLoading}
            accessibilityLabel="Identifikation korrigieren"
            accessibilityRole="button"
          >
            <MaterialIcons name="edit" size={20} color={Colors2026.text} />
            <Text style={styles.secondaryButtonText}>Identifikation korrigieren</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleConfirmWithCorrection}
          disabled={isLoading}
          accessibilityLabel="Neue Pflanze anlegen"
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {showCorrection && correctedName.trim() 
                  ? 'Erneut identifizieren' 
                  : showCorrection 
                    ? 'Mit Korrektur anlegen' 
                    : 'Neue Pflanze anlegen'}
              </Text>
            </>
          )}
        </TouchableOpacity>
        
        {matchingPlants.length > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
            onPress={onRetry}
            disabled={isLoading}
            accessibilityLabel="Erneut versuchen"
            accessibilityRole="button"
          >
            <MaterialIcons name="refresh" size={20} color={Colors2026.text} />
            <Text style={styles.secondaryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        )}
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
  statusAnalysisCard: {
    backgroundColor: Colors2026.background,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors2026.primary,
    ...Shadows2026.sm,
  },
  statusAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    marginBottom: Spacing2026.sm,
  },
  statusAnalysisTitle: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  statusAnalysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.sm,
  },
  statusAnalysisLabel: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
  },
  statusAnalysisValue: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  statusAnalysisDesc: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
    marginTop: Spacing2026.xs,
    fontStyle: 'italic',
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
  orText: {
    textAlign: 'center',
    color: Colors2026.textSecondary,
    fontSize: Typography2026.body.fontSize,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing2026.sm,
    paddingVertical: 14,
    borderRadius: Radius2026.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButton: {
    backgroundColor: Colors2026.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
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
  bedSelector: {
    marginBottom: Spacing2026.md,
  },
  bedLabel: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: Spacing2026.sm,
  },
  bedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.sm,
  },
  bedOption: {
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.background,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  bedOptionSelected: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  bedOptionText: {
    color: Colors2026.text,
    fontSize: Typography2026.caption.fontSize,
  },
  bedOptionTextSelected: {
    color: '#fff',
  },
  correctionCard: {
    backgroundColor: Colors2026.background,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.md,
    ...Shadows2026.sm,
  },
  correctionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.md,
  },
  correctionTitle: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
  },
  correctionLabel: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  correctionInput: {
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.border,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
  },
  classificationRow: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
    marginBottom: Spacing2026.md,
  },
  classButton: {
    flex: 1,
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.xs,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.border,
    alignItems: 'center',
  },
  classButtonSelected: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  classButtonText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.text,
    fontWeight: '500',
  },
  classButtonTextSelected: {
    color: '#fff',
  },
});