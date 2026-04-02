import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { Plant } from '../types/plant';

interface AIPhotoStep4Props {
  bestMatch: Plant | null;
  hasMultipleMatches: boolean;
  onConfirm: () => void;
  onCreateNew: () => void;
  onSelectDifferent: () => void;
  onBack: () => void;
}

export default function AIPhotoStep4({
  bestMatch,
  hasMultipleMatches,
  onConfirm,
  onCreateNew,
  onSelectDifferent,
  onBack,
}: AIPhotoStep4Props) {
  const [showNewPlantForm, setShowNewPlantForm] = React.useState(false);
  const [newPlantName, setNewPlantName] = React.useState('');

  const handleCreateNew = () => {
    if (showNewPlantForm && newPlantName.trim()) {
      onCreateNew();
    } else {
      setShowNewPlantForm(true);
    }
  };

  const handleConfirmNewPlant = () => {
    if (newPlantName.trim()) {
      onCreateNew();
    }
  };

  if (!bestMatch) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Keine Übereinstimmung</Text>
        <Text style={styles.subtitle}>
          Es wurde keine passende Pflanze in deinem Garten gefunden.
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={onCreateNew}
          >
            <MaterialIcons name="add" size={20} color={Colors2026.surface} />
            <Text style={styles.primaryButtonText}>Neue Pflanze anlegen</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onBack}
          >
            <MaterialIcons name="arrow-back" size={20} color={Colors2026.text} />
            <Text style={styles.secondaryButtonText}>Zurück</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={Colors2026.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Pflanze zuordnen</Text>
      </View>

      <Text style={styles.subtitle}>
        Wir haben eine passende Pflanze in deinem Garten gefunden
      </Text>

      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <MaterialIcons name="yard" size={32} color={Colors2026.primary} />
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>Beste Übereinstimmung</Text>
          </View>
        </View>

        <Text style={styles.plantName}>{bestMatch.name}</Text>
        
        {bestMatch.location && (
          <View style={styles.locationRow}>
            <MaterialIcons name="location-on" size={16} color={Colors2026.textSecondary} />
            <Text style={styles.locationText}>{bestMatch.location}</Text>
          </View>
        )}

        {bestMatch.type && (
          <Text style={styles.plantTypeText}>{bestMatch.type}</Text>
        )}
      </View>

      {showNewPlantForm && (
        <View style={styles.newPlantForm}>
          <Text style={styles.formLabel}>Name der neuen Pflanze</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Pflanzenname eingeben"
            placeholderTextColor={Colors2026.textSecondary}
            value={newPlantName}
            onChangeText={setNewPlantName}
          />
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onConfirm}
        >
          <MaterialIcons name="check" size={20} color={Colors2026.surface} />
          <Text style={styles.primaryButtonText}>
            {showNewPlantForm ? 'Anlegen' : 'Zuordnung bestätigen'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleCreateNew}
        >
          <MaterialIcons name="add" size={20} color={Colors2026.text} />
          <Text style={styles.secondaryButtonText}>
            {showNewPlantForm ? 'Mit Namen anlegen' : 'Neue Pflanze anlegen'}
          </Text>
        </TouchableOpacity>

        {hasMultipleMatches && !showNewPlantForm && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={onSelectDifferent}
          >
            <MaterialIcons name="swap-horiz" size={20} color={Colors2026.text} />
            <Text style={styles.secondaryButtonText}>Andere Pflanze auswählen</Text>
          </TouchableOpacity>
        )}

        {showNewPlantForm && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              setShowNewPlantForm(false);
              setNewPlantName('');
            }}
          >
            <MaterialIcons name="close" size={20} color={Colors2026.text} />
            <Text style={styles.secondaryButtonText}>Abbrechen</Text>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing2026.sm,
  },
  backButton: {
    marginRight: Spacing2026.sm,
    padding: Spacing2026.xs,
  },
  title: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  subtitle: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.lg,
  },
  matchCard: {
    backgroundColor: Colors2026.background,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.lg,
    marginBottom: Spacing2026.lg,
    ...Shadows2026.md,
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing2026.md,
  },
  matchBadge: {
    backgroundColor: Colors2026.primaryLight || Colors2026.primary + '20',
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.sm,
  },
  matchBadgeText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.primary,
    fontWeight: '600',
  },
  plantName: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: 'bold',
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.xs,
    marginBottom: Spacing2026.xs,
  },
  locationText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textSecondary,
  },
  plantTypeText: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textSecondary,
  },
  newPlantForm: {
    marginBottom: Spacing2026.lg,
  },
  formLabel: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: Spacing2026.sm,
  },
  textInput: {
    backgroundColor: Colors2026.background,
    borderWidth: 1,
    borderColor: Colors2026.border,
    borderRadius: Radius2026.md,
    padding: Spacing2026.md,
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.text,
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
  primaryButton: {
    backgroundColor: Colors2026.primary,
  },
  primaryButtonText: {
    color: Colors2026.surface,
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
});
