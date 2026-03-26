import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Harvest, HarvestFormData, HARVEST_UNITS } from '../types/harvest';
import { Plant } from '../types/plant';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import AnimatedButton from '../components/ui/AnimatedButton';
import {
  createHarvest,
  updateHarvest,
  fetchHarvest,
} from '../services/harvestService';
import {
  fetchPlantsForSelection,
} from '../services/taskService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHarvest'>;
type RouteProps = RouteProp<RootStackParamList, 'AddHarvest'>;

export default function AddHarvestScreen({ navigation }: Props) {
  const route = useRoute<RouteProps>();
  const harvestIdToEdit = route.params?.harvestId;
  const prefilledPlantId = route.params?.plantId;
  const isEditing = !!harvestIdToEdit;

  // State
  const [harvest, setHarvest] = useState<Harvest | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [showPlantPicker, setShowPlantPicker] = useState(false);

  // Form state
  const [plantId, setPlantId] = useState(prefilledPlantId || '');
  const [selectedPlantName, setSelectedPlantName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<any>('kg');
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  // Load plants and harvest if editing
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load available plants
      const plantList = await fetchPlantsForSelection();
      setPlants(plantList);

      // Load harvest if editing
      if (isEditing && harvestIdToEdit) {
        const harvestData = await fetchHarvest(harvestIdToEdit);
        if (harvestData) {
          setHarvest(harvestData);
          setPlantId(harvestData.plant_id);
          setSelectedPlantName(harvestData.plant_name);
          setQuantity(harvestData.quantity.toString());
          setUnit(harvestData.unit);
          setHarvestDate(harvestData.harvest_date);
          setNotes(harvestData.notes || '');
        }
      } else if (prefilledPlantId) {
        // If plantId is prefilled, find its name
        const plant = plantList.find((p) => p.id === prefilledPlantId);
        if (plant) {
          setSelectedPlantName(plant.name);
        }
      }
    } catch (error: any) {
      Alert.alert('Fehler', `Daten konnten nicht geladen werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [isEditing, harvestIdToEdit, prefilledPlantId]);

  const validateForm = () => {
    if (!plantId) {
      Alert.alert('Fehler', 'Bitte wählen Sie eine Pflanze aus');
      return false;
    }
    if (!quantity || parseFloat(quantity) <= 0) {
      Alert.alert('Fehler', 'Die Menge muss größer als 0 sein');
      return false;
    }
    if (!unit) {
      Alert.alert('Fehler', 'Bitte wählen Sie eine Einheit');
      return false;
    }
    if (!harvestDate) {
      Alert.alert('Fehler', 'Bitte wählen Sie ein Erntedatum');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const formData: HarvestFormData = {
        plant_id: plantId,
        quantity: parseFloat(quantity),
        unit: unit as any,
        harvest_date: harvestDate,
        notes: notes.trim() || undefined,
      };

      if (isEditing && harvestIdToEdit) {
        await updateHarvest(harvestIdToEdit, formData);
        Alert.alert('Erfolg', 'Ernte wurde aktualisiert');
      } else {
        await createHarvest(formData);
        Alert.alert('Erfolg', 'Ernte wurde dokumentiert');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Fehler', `Ernte konnte nicht gespeichert werden: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectPlant = (plant: Plant) => {
    setPlantId(plant.id);
    setSelectedPlantName(plant.name);
    setShowPlantPicker(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Plant Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Pflanze *</Text>
            <TouchableOpacity
              style={styles.pickButton}
              onPress={() => setShowPlantPicker(!showPlantPicker)}
            >
              <MaterialIcons name="local-florist" size={20} color={Colors2026.primary} />
              <Text style={styles.pickButtonText}>
                {selectedPlantName || 'Pflanze auswählen'}
              </Text>
            </TouchableOpacity>

            {showPlantPicker && (
              <View style={styles.pickerContainer}>
                {plants.map((plant) => (
                  <TouchableOpacity
                    key={plant.id}
                    style={[
                      styles.pickerItem,
                      plantId === plant.id && styles.pickerItemSelected,
                    ]}
                    onPress={() => selectPlant(plant)}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        plantId === plant.id && styles.pickerItemTextSelected,
                      ]}
                    >
                      {plant.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Quantity */}
          <View style={styles.section}>
            <Text style={styles.label}>Menge *</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. 5.5"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              placeholderTextColor={Colors2026.textLight}
            />
          </View>

          {/* Unit */}
          <View style={styles.section}>
            <Text style={styles.label}>Einheit *</Text>
            <View style={styles.unitsContainer}>
              {HARVEST_UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitChip, unit === u && styles.unitChipSelected]}
                  onPress={() => setUnit(u)}
                >
                  <Text
                    style={[
                      styles.unitChipText,
                      unit === u && styles.unitChipTextSelected,
                    ]}
                  >
                    {u}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Harvest Date */}
          <View style={styles.section}>
            <Text style={styles.label}>Erntedatum *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={harvestDate}
              onChangeText={setHarvestDate}
              placeholderTextColor={Colors2026.textLight}
            />
            <Text style={styles.helper}>Format: YYYY-MM-DD (z.B. 2026-03-04)</Text>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notizen (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="z.B. Größe, Qualität, Beobachtungen..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors2026.textLight}
            />
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />
        </View>
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>Abbrechen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEditing ? 'Aktualisieren' : 'Dokumentieren'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors2026.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors2026.text,
    backgroundColor: Colors2026.surface,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helper: {
    fontSize: 12,
    color: Colors2026.textLight,
    marginTop: 4,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors2026.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors2026.surface,
  },
  pickButtonText: {
    fontSize: 14,
    color: Colors2026.text,
    marginLeft: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors2026.border,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: Colors2026.surface,
    maxHeight: 300,
  },
  pickerItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  pickerItemSelected: {
    backgroundColor: Colors2026.primaryLight,
  },
  pickerItemText: {
    fontSize: 14,
    color: Colors2026.text,
  },
  pickerItemTextSelected: {
    color: Colors2026.primary,
    fontWeight: '600',
  },
  unitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors2026.border,
    backgroundColor: Colors2026.surface,
  },
  unitChipSelected: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  unitChipText: {
    fontSize: 13,
    color: Colors2026.text,
  },
  unitChipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  spacer: {
    height: 20,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: Colors2026.background,
    borderTopWidth: 1,
    borderTopColor: Colors2026.border,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors2026.border,
  },
  submitButton: {
    backgroundColor: Colors2026.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
