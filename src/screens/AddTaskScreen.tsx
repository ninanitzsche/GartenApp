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
import { Task, TaskFormData } from '../types/task';
import { Plant } from '../types/plant';
import Colors from '../theme/colors';
import {
  createTask,
  updateTask,
  fetchTask,
  fetchPlantsForSelection,
  getTaskPlants,
} from '../services/taskService';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;
type RouteProps = RouteProp<RootStackParamList, 'AddTask'>;

const CATEGORIES = ['Aussaat', 'Pflanzen', 'Gartenarbeiten', 'Beobachten', 'Ernten'];
const PRIORITIES = ['niedrig', 'mittel', 'hoch'];

export default function AddTaskScreen({ navigation }: Props) {
  const route = useRoute<RouteProps>();
  const taskIdToEdit = route.params?.taskId;
  const isEditing = !!taskIdToEdit;

  // State
  const [task, setTask] = useState<Task | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gartenarbeiten');
  const [priority, setPriority] = useState('mittel');
  const [location, setLocation] = useState('');

  // Load task and plants on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Load available plants
      const plantList = await fetchPlantsForSelection();
      setPlants(plantList);

      // Load task if editing
      if (isEditing && taskIdToEdit) {
        const taskData = await fetchTask(taskIdToEdit);
        if (taskData) {
          setTask(taskData);
          setTitle(taskData.title);
          setDescription(taskData.description || '');
          setCategory(taskData.category);
          setPriority(taskData.priority);
          setLocation(taskData.location || '');

          // Load linked plants
          const linkedPlants = await getTaskPlants(taskIdToEdit);
          setSelectedPlants(new Set(linkedPlants.map((p) => p.id)));
        }
      }
    } catch (error: any) {
      Alert.alert('Fehler', `Daten konnten nicht geladen werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [isEditing, taskIdToEdit]);

  const togglePlant = (plantId: string) => {
    const newSet = new Set(selectedPlants);
    if (newSet.has(plantId)) {
      newSet.delete(plantId);
    } else {
      newSet.add(plantId);
    }
    setSelectedPlants(newSet);
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Fehler', 'Der Aufgabentitel ist erforderlich');
      return false;
    }
    if (title.trim().length < 3) {
      Alert.alert('Fehler', 'Der Aufgabentitel muss mindestens 3 Zeichen lang sein');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const formData: TaskFormData = {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        priority,
        location: location.trim() || undefined,
        plant_ids: Array.from(selectedPlants),
      };

      if (isEditing && taskIdToEdit) {
        await updateTask(taskIdToEdit, formData);
        Alert.alert('Erfolg', 'Aufgabe wurde aktualisiert');
      } else {
        await createTask(formData);
        Alert.alert('Erfolg', 'Aufgabe wurde erstellt');
      }

      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Fehler', error.message);
    } finally {
      setSubmitting(false);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Aufgabentitel *</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. Tomaten aussäen"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.label}>Beschreibung</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Optionale Notizen"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Kategorie *</Text>
            <View style={styles.buttonGroup}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.label}>Priorität *</Text>
            <View style={styles.priorityGroup}>
              {PRIORITIES.map((prio) => (
                <TouchableOpacity
                  key={prio}
                  style={styles.priorityItem}
                  onPress={() => setPriority(prio)}
                >
                  <View
                    style={[
                      styles.radioButton,
                      priority === prio && styles.radioButtonChecked,
                    ]}
                  >
                    {priority === prio && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.priorityLabel}>
                    {prio === 'hoch' && 'Hoch'}
                    {prio === 'mittel' && 'Mittel'}
                    {prio === 'niedrig' && 'Niedrig'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.label}>Standort</Text>
            <TextInput
              style={styles.input}
              placeholder="z.B. Hauptbeet"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={Colors.textLight}
            />
          </View>

          {/* Linked Plants */}
          {plants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Verknüpfte Pflanzen</Text>
              <View style={styles.plantsList}>
                {plants.map((plant) => (
                  <TouchableOpacity
                    key={plant.id}
                    style={styles.plantItem}
                    onPress={() => togglePlant(plant.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedPlants.has(plant.id) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedPlants.has(plant.id) && (
                        <MaterialIcons name="check" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.plantName}>{plant.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
          disabled={submitting}
        >
          <Text style={styles.cancelButtonText}>Abbrechen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? 'Aktualisieren' : 'Erstellen'}
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
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  textarea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryButtonText: {
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  priorityGroup: {
    gap: 12,
  },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonChecked: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  priorityLabel: {
    fontSize: 14,
    color: Colors.text,
  },
  plantsList: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  plantName: {
    fontSize: 14,
    color: Colors.text,
  },
  spacer: {
    height: 100,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
