/**
 * Add Bed Screen
 * Form to create a new bed with positioning
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlassCard from '../components/ui/GlassCard';
import GlassInput from '../components/ui/GlassInput';
import AnimatedButton from '../components/ui/AnimatedButton';
import { BedFormData, BED_SHAPES, BED_COLORS } from '../types/bed';
import { createBed } from '../services/bedService';
import { fetchGarden } from '../services/gardenService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddBed'>;

export default function AddBedScreen({ navigation }: Props) {
  const [formData, setFormData] = useState<BedFormData>({
    name: '',
    position_x: 50,
    position_y: 50,
    width: 20,
    height: 15,
    color: '#4CAF50',
    shape: 'rectangle',
    notes: '',
    garden_id: undefined,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name ist erforderlich';
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
      // Get current garden
      const garden = await fetchGarden();
      console.log('Fetched garden:', garden);

      if (!garden?.id) {
        Alert.alert('Fehler', 'Garten konnte nicht geladen werden.');
        setSaving(false);
        return;
      }

      const cleanData: BedFormData = {
        ...formData,
        garden_id: garden.id,
      };

      console.log('Creating bed with data:', cleanData);
      await createBed(cleanData);
      Alert.alert('Erfolg', 'Beet erstellt.');
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating bed:', error);
      const errorMessage = error?.message || 'Beet konnte nicht erstellt werden.';
      Alert.alert('Fehler', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="z.B. Hochbeet 1"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          editable={!saving}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Position X */}
      <View style={styles.section}>
        <Text style={styles.label}>Position X: {formData.position_x.toFixed(0)}%</Text>
        <Slider
          style={styles.slider}
          value={formData.position_x}
          onValueChange={(val) => setFormData({ ...formData, position_x: val })}
          minimumValue={0}
          maximumValue={100}
          step={1}
          disabled={saving}
        />
      </View>

      {/* Position Y */}
      <View style={styles.section}>
        <Text style={styles.label}>Position Y: {formData.position_y.toFixed(0)}%</Text>
        <Slider
          style={styles.slider}
          value={formData.position_y}
          onValueChange={(val) => setFormData({ ...formData, position_y: val })}
          minimumValue={0}
          maximumValue={100}
          step={1}
          disabled={saving}
        />
      </View>

      {/* Width */}
      <View style={styles.section}>
        <Text style={styles.label}>Breite: {formData.width.toFixed(0)}%</Text>
        <Slider
          style={styles.slider}
          value={formData.width}
          onValueChange={(val) => setFormData({ ...formData, width: val })}
          minimumValue={5}
          maximumValue={80}
          step={1}
          disabled={saving}
        />
      </View>

      {/* Height */}
      <View style={styles.section}>
        <Text style={styles.label}>Höhe: {formData.height.toFixed(0)}%</Text>
        <Slider
          style={styles.slider}
          value={formData.height}
          onValueChange={(val) => setFormData({ ...formData, height: val })}
          minimumValue={5}
          maximumValue={80}
          step={1}
          disabled={saving}
        />
      </View>

      {/* Color */}
      <View style={styles.section}>
        <Text style={styles.label}>Farbe</Text>
        <View style={styles.chipContainer}>
          {BED_COLORS.map((color) => (
            <TouchableOpacity
              key={color.value}
              style={[
                styles.chip,
                formData.color === color.value && styles.chipSelected,
              ]}
              onPress={() => setFormData({ ...formData, color: color.value })}
              disabled={saving}
            >
              <View
                style={[
                  styles.colorDot,
                  { backgroundColor: color.value },
                ]}
              />
              <Text
                style={[
                  styles.chipText,
                  formData.color === color.value && styles.chipTextSelected,
                ]}
              >
                {color.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Shape */}
      <View style={styles.section}>
        <Text style={styles.label}>Form</Text>
        <View style={styles.chipContainer}>
          {BED_SHAPES.map((shape) => (
            <TouchableOpacity
              key={shape.value}
              style={[
                styles.chip,
                formData.shape === shape.value && styles.chipSelected,
              ]}
              onPress={() => setFormData({ ...formData, shape: shape.value })}
              disabled={saving}
            >
              <Text
                style={[
                  styles.chipText,
                  formData.shape === shape.value && styles.chipTextSelected,
                ]}
              >
                {shape.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.label}>Notizen</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="z.B. In der Sonne"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          editable={!saving}
        />
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="add" size={20} color="#fff" />
              <Text style={styles.buttonText}>Beet erstellen</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
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
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors2026.text,
  },
  inputError: {
    borderColor: Colors2026.status.error,
  },
  errorText: {
    color: Colors2026.status.error,
    fontSize: 12,
    marginTop: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  textArea: {
    minHeight: 80,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors2026.surface,
    borderWidth: 1,
    borderColor: Colors2026.border,
    alignItems: 'center',
    gap: 6,
  },
  chipSelected: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors2026.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: Colors2026.primary,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
