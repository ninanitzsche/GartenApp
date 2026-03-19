/**
 * Garden Settings Screen
 * Edit garden metadata (name, size, location, description)
 */
import React, { useState, useEffect } from 'react';
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { GardenFormData } from '../types/garden';
import { fetchGarden, updateGarden } from '../services/gardenService';

type Props = NativeStackScreenProps<RootStackParamList, 'GardenSettings'>;

export default function GardenSettingsScreen({ navigation }: Props) {
  const [formData, setFormData] = useState<GardenFormData>({
    name: '',
    description: '',
    size: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [gardenId, setGardenId] = useState<string | null>(null);

  useEffect(() => {
    loadGarden();
  }, []);

  const loadGarden = async () => {
    try {
      const garden = await fetchGarden();
      if (garden) {
        setGardenId(garden.id);
        setFormData({
          name: garden.name || '',
          description: garden.description || '',
          size: garden.size || '',
          location: garden.location || '',
        });
      }
    } catch (error) {
      console.error('Error loading garden:', error);
      Alert.alert('Fehler', 'Garten konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  };

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

    if (!gardenId) {
      Alert.alert('Fehler', 'Garten-ID nicht gefunden.');
      return;
    }

    setSaving(true);
    try {
      // Clean up form data - remove empty strings
      const cleanData: any = { ...formData };
      Object.keys(cleanData).forEach((key) => {
        if (cleanData[key] === '') {
          cleanData[key] = null;
        }
      });

      await updateGarden(gardenId, cleanData);
      Alert.alert('Erfolg', 'Garten aktualisiert.');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving garden:', error);
      Alert.alert('Fehler', 'Garten konnte nicht aktualisiert werden.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Name */}
      <View style={styles.section}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          placeholder="z.B. Mein Garten"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          editable={!saving}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.label}>Standort</Text>
        <TextInput
          style={styles.input}
          placeholder="z.B. Hinterm Haus"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
          editable={!saving}
        />
      </View>

      {/* Size */}
      <View style={styles.section}>
        <Text style={styles.label}>Größe</Text>
        <TextInput
          style={styles.input}
          placeholder="z.B. 50 m²"
          value={formData.size}
          onChangeText={(text) => setFormData({ ...formData, size: text })}
          editable={!saving}
        />
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>Beschreibung</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notizen zum Garten..."
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
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
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.buttonText}>Speichern</Text>
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
    backgroundColor: Colors.background,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: Colors.primary,
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
