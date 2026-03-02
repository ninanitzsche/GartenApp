import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { PlantFormData, PLANT_STATUSES, PLANT_TYPES } from '../types/plant';
import { fetchPlant, updatePlant, deletePlant } from '../services/plantService';

interface EditPlantScreenProps {
  navigation: any;
  route: any;
}

export default function EditPlantScreen({ navigation, route }: EditPlantScreenProps) {
  const { plantId } = route.params;
  const [formData, setFormData] = useState<PlantFormData>({
    name: '',
    latin_name: '',
    location: '',
    type: '',
    status: 'geplant',
    winterhart: false,
    essbar: false,
    quantity: undefined,
    planted_date: '',
    harvest_date: '',
    notes: '',
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadPlant();
  }, [plantId]);

  const loadPlant = async () => {
    try {
      const plant = await fetchPlant(plantId);
      if (plant) {
        setFormData({
          name: plant.name || '',
          latin_name: plant.latin_name || '',
          location: plant.location || '',
          type: plant.type || '',
          status: plant.status || 'geplant',
          winterhart: plant.winterhart || false,
          essbar: plant.essbar || false,
          quantity: plant.quantity,
          planted_date: plant.planted_date || '',
          harvest_date: plant.harvest_date || '',
          notes: plant.notes || '',
          tags: plant.tags || [],
        });
      }
    } catch (error) {
      console.error('Error loading plant:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
    }

    if (!formData.status) {
      newErrors.status = 'Status ist erforderlich';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Fehler', 'Bitte füllen Sie alle erforderlichen Felder aus.');
      return;
    }

    setSaving(true);
    try {
      // Clean up form data - remove empty strings
      const cleanData: any = { ...formData };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '') {
          cleanData[key] = undefined;
        }
      });

      await updatePlant(plantId, cleanData);
      Alert.alert('Erfolg', 'Pflanze wurde aktualisiert.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error updating plant:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht aktualisiert werden.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    console.log('🔴 DELETE BUTTON PRESSED - NEW CODE RUNNING!');
    Alert.alert(
      'Pflanze löschen',
      'Möchten Sie diese Pflanze wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            console.log('🔴 DELETE CONFIRMED, deleting plant:', plantId);
            try {
              await deletePlant(plantId);
              console.log('🔴 DELETE SUCCESS, navigating to PlantList');
              // Navigate back to plant list (2 screens back: Edit -> Detail -> List)
              navigation.navigate('PlantList');
              Alert.alert('Erfolg', 'Pflanze wurde gelöscht.');
            } catch (error) {
              console.error('🔴 DELETE ERROR:', error);
              Alert.alert('Fehler', 'Pflanze konnte nicht gelöscht werden.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Lade Pflanze...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          {/* Name - Required */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="z.B. Tomate"
              placeholderTextColor={Colors.textDisabled}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Latin Name */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Lateinischer Name</Text>
            <TextInput
              style={styles.input}
              value={formData.latin_name}
              onChangeText={(text) => setFormData({ ...formData, latin_name: text })}
              placeholder="z.B. Solanum lycopersicum"
              placeholderTextColor={Colors.textDisabled}
            />
          </View>

          {/* Location */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Standort</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="z.B. Hauptbeet, Gewächshaus"
              placeholderTextColor={Colors.textDisabled}
            />
          </View>

          {/* Type */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Typ</Text>
            <View style={styles.pickerContainer}>
              {PLANT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.chip,
                    formData.type === type.value && styles.chipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, type: type.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.type === type.value && styles.chipTextSelected,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status - Required */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Status <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              {PLANT_STATUSES.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.chip,
                    formData.status === status.value && styles.chipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, status: status.value })}
                >
                  <Text
                    style={[
                      styles.chipText,
                      formData.status === status.value && styles.chipTextSelected,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.status && <Text style={styles.errorText}>{errors.status}</Text>}
          </View>

          {/* Quantity */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Anzahl</Text>
            <TextInput
              style={styles.input}
              value={formData.quantity?.toString() || ''}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                setFormData({ ...formData, quantity: isNaN(num) ? undefined : num });
              }}
              placeholder="z.B. 5"
              placeholderTextColor={Colors.textDisabled}
              keyboardType="number-pad"
            />
          </View>

          {/* Boolean Switches */}
          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Winterhart</Text>
              <Switch
                value={formData.winterhart}
                onValueChange={(value) => setFormData({ ...formData, winterhart: value })}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={formData.winterhart ? Colors.primary : Colors.textDisabled}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Essbar</Text>
              <Switch
                value={formData.essbar}
                onValueChange={(value) => setFormData({ ...formData, essbar: value })}
                trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                thumbColor={formData.essbar ? Colors.primary : Colors.textDisabled}
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Notizen</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              placeholder="Zusätzliche Informationen..."
              placeholderTextColor={Colors.textDisabled}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Speichern</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <MaterialIcons name="delete" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Löschen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.textDisabled,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
