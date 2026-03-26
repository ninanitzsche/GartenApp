import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { RootStackParamList } from '../types/navigation';
import { Task, TaskFormData } from '../types/task';
import { Plant } from '../types/plant';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../theme/designSystemV2';
import {
  createTask,
  updateTask,
  fetchTask,
  fetchPlantsForSelection,
  getTaskPlants,
  formatTimeSpent,
} from '../services/taskService';
import GlassInput from '../components/ui/GlassInput';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';

type Props = NativeStackScreenProps<RootStackParamList, 'AddTask'>;
type RouteProps = RouteProp<RootStackParamList, 'AddTask'>;

const CATEGORIES = [
  { value: 'Aussaat', icon: 'grass' },
  { value: 'Pflanzen', icon: 'yard' },
  { value: 'Gartenarbeiten', icon: 'build' },
  { value: 'Beobachten', icon: 'visibility' },
  { value: 'Ernten', icon: 'agriculture' },
];

const PRIORITIES = [
  { value: 'niedrig', color: Colors2026.priority.niedrig },
  { value: 'mittel', color: Colors2026.priority.mittel },
  { value: 'hoch', color: Colors2026.priority.hoch },
];

function formatTimeDisplayPreview(minutes: number): string {
  const formatted = formatTimeSpent(minutes);
  return formatted ? `= ${formatted}` : '';
}

export default function AddTaskScreen({ navigation }: Props) {
  const route = useRoute<RouteProps>();
  const taskIdToEdit = route.params?.taskId;
  const isEditing = !!taskIdToEdit;

  const [task, setTask] = useState<Task | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gartenarbeiten');
  const [priority, setPriority] = useState('mittel');
  const [location, setLocation] = useState('');
  const [timeSpentMinutes, setTimeSpentMinutes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const plantList = await fetchPlantsForSelection();
      setPlants(plantList);

      if (isEditing && taskIdToEdit) {
        const taskData = await fetchTask(taskIdToEdit);
        if (taskData) {
          setTask(taskData);
          setTitle(taskData.title);
          setDescription(taskData.description || '');
          setCategory(taskData.category);
          setPriority(taskData.priority);
          setLocation(taskData.location || '');
          setTimeSpentMinutes(taskData.time_spent_minutes ? String(taskData.time_spent_minutes) : '');

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
        time_spent_minutes: timeSpentMinutes ? parseInt(timeSpentMinutes, 10) : undefined,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View style={styles.header} entering={FadeInDown.duration(400).delay(100)}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isEditing ? 'Ändere die Aufgabendetails' : 'Plane deine nächste Gartenaufgabe'}
          </Text>
        </Animated.View>

        <GlassCard style={styles.formCard}>
          <Animated.View entering={FadeInDown.duration(400).delay(200)}>
            <GlassInput
              label="Aufgabentitel *"
              value={title}
              onChangeText={setTitle}
              placeholder="z.B. Tomaten aussäen"
              icon={<MaterialIcons name="task" size={22} color={Colors2026.primary} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(250)}>
            <GlassInput
              label="Beschreibung"
              value={description}
              onChangeText={setDescription}
              placeholder="Optionale Notizen..."
              multiline
              numberOfLines={3}
              icon={<MaterialIcons name="notes" size={22} color={Colors2026.primary} />}
            />
          </Animated.View>

          <Animated.View style={styles.divider} entering={FadeInDown.duration(400).delay(300)} />

          <Animated.View entering={FadeInDown.duration(400).delay(350)}>
            <Text style={styles.sectionLabel}>Kategorie</Text>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    category === cat.value && styles.categoryChipSelected,
                  ]}
                  onPress={() => setCategory(cat.value)}
                >
                  <MaterialIcons
                    name={cat.icon as any}
                    size={18}
                    color={category === cat.value ? '#fff' : Colors2026.primary}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      category === cat.value && styles.categoryTextSelected,
                    ]}
                  >
                    {cat.value}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(400)}>
            <Text style={styles.sectionLabel}>Priorität</Text>
            <View style={styles.priorityContainer}>
              {PRIORITIES.map((prio) => (
                <Pressable
                  key={prio.value}
                  style={[
                    styles.priorityChip,
                    priority === prio.value && { 
                      backgroundColor: prio.color,
                      borderColor: prio.color,
                    },
                  ]}
                  onPress={() => setPriority(prio.value)}
                >
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: prio.color },
                      priority === prio.value && { backgroundColor: '#fff' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      priority === prio.value && styles.priorityTextSelected,
                    ]}
                  >
                    {prio.value.charAt(0).toUpperCase() + prio.value.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(450)}>
            <GlassInput
              label="Standort"
              value={location}
              onChangeText={setLocation}
              placeholder="z.B. Hauptbeet"
              icon={<MaterialIcons name="place" size={22} color={Colors2026.primary} />}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(400).delay(500)}>
            <GlassInput
              label="Zeit aufgewendet"
              value={timeSpentMinutes}
              onChangeText={setTimeSpentMinutes}
              placeholder="Minuten"
              keyboardType="numeric"
              icon={<MaterialIcons name="timer" size={22} color={Colors2026.primary} />}
            />
            {timeSpentMinutes && parseInt(timeSpentMinutes, 10) > 0 && (
              <Text style={styles.timePreview}>
                {formatTimeDisplayPreview(parseInt(timeSpentMinutes, 10))}
              </Text>
            )}
          </Animated.View>
        </GlassCard>

        {plants.length > 0 && (
          <Animated.View entering={FadeInDown.duration(400).delay(550)}>
            <GlassCard style={styles.plantsCard}>
              <Text style={styles.plantsTitle}>
                <MaterialIcons name="eco" size={18} color={Colors2026.primary} /> Verknüpfte Pflanzen
              </Text>
              <View style={styles.plantsList}>
                {plants.map((plant) => (
                  <Pressable
                    key={plant.id}
                    style={[
                      styles.plantItem,
                      selectedPlants.has(plant.id) && styles.plantItemSelected,
                    ]}
                    onPress={() => togglePlant(plant.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedPlants.has(plant.id) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedPlants.has(plant.id) && (
                        <MaterialIcons name="check" size={14} color="#fff" />
                      )}
                    </View>
                    <Text style={[
                      styles.plantName,
                      selectedPlants.has(plant.id) && styles.plantNameSelected,
                    ]}>
                      {plant.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedButton
          title="Abbrechen"
          onPress={() => navigation.goBack()}
          variant="secondary"
          size="md"
          disabled={submitting}
        />
        <AnimatedButton
          title={isEditing ? 'Aktualisieren' : 'Erstellen'}
          onPress={handleSubmit}
          variant="primary"
          size="md"
          disabled={submitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing2026.xl,
    paddingTop: Spacing2026.xl,
    paddingBottom: Spacing2026.lg,
  },
  headerTitle: {
    ...Typography2026.headline,
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
  },
  headerSubtitle: {
    ...Typography2026.body,
    color: Colors2026.textSecondary,
  },
  formCard: {
    marginHorizontal: Spacing2026.lg,
    padding: Spacing2026.lg,
  },
  divider: {
    height: 1,
    backgroundColor: Colors2026.divider,
    marginVertical: Spacing2026.lg,
  },
  sectionLabel: {
    ...Typography2026.caption,
    fontWeight: '600',
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.sm,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing2026.sm,
    marginBottom: Spacing2026.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.glass.medium,
    borderWidth: 1,
    borderColor: Colors2026.border,
    gap: Spacing2026.xs,
  },
  categoryChipSelected: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  categoryText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '500',
    color: Colors2026.text,
  },
  categoryTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
    marginBottom: Spacing2026.lg,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing2026.md,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.glass.medium,
    borderWidth: 1,
    borderColor: Colors2026.border,
    gap: Spacing2026.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '500',
    color: Colors2026.text,
  },
  priorityTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timePreview: {
    ...Typography2026.caption,
    color: Colors2026.textSecondary,
    marginTop: -Spacing2026.sm,
    marginLeft: Spacing2026.xs,
  },
  plantsCard: {
    marginHorizontal: Spacing2026.lg,
    marginTop: Spacing2026.lg,
    padding: Spacing2026.lg,
  },
  plantsTitle: {
    ...Typography2026.body,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: Spacing2026.md,
  },
  plantsList: {
    gap: Spacing2026.xs,
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.md,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.glass.light,
    gap: Spacing2026.sm,
  },
  plantItemSelected: {
    backgroundColor: `${Colors2026.primary}15`,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors2026.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  plantName: {
    ...Typography2026.body,
    color: Colors2026.text,
  },
  plantNameSelected: {
    fontWeight: '600',
    color: Colors2026.primary,
  },
  bottomSpacer: {
    height: Spacing2026.xxxl,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing2026.md,
    paddingHorizontal: Spacing2026.lg,
    paddingVertical: Spacing2026.md,
    paddingBottom: Spacing2026.xl,
    backgroundColor: Colors2026.background,
    borderTopWidth: 1,
    borderTopColor: Colors2026.divider,
  },
});
