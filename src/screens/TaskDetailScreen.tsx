import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { TaskListItem } from '../types/task';
import Colors from '../theme/colors';
import { fetchTask, deleteTask, toggleTaskCompletion, getCategoryColor, getPriorityColor } from '../services/taskService';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'TaskDetail'>;

export default function TaskDetailScreen({ navigation }: Props) {
  const route = useRoute<RouteProps>();
  const { taskId } = route.params;

  const [task, setTask] = useState<TaskListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [completingTask, setCompletingTask] = useState(false);

  // Load task on mount
  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = useCallback(async () => {
    try {
      setLoading(true);
      const taskData = await fetchTask(taskId);
      if (taskData) {
        setTask(taskData);
      } else {
        Alert.alert('Fehler', 'Aufgabe nicht gefunden');
        navigation.goBack();
      }
    } catch (error: any) {
      Alert.alert('Fehler', `Aufgabe konnte nicht geladen werden: ${error.message}`);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [taskId, navigation]);

  const handleEdit = () => {
    navigation.navigate('AddTask', { taskId });
  };

  const handleToggleCompletion = async () => {
    if (!task) return;

    try {
      setCompletingTask(true);
      await toggleTaskCompletion(task.id);

      // Update local state
      setTask({
        ...task,
        completed_at: task.completed_at ? null : new Date().toISOString(),
      });

      // Show feedback
      const message = task.completed_at
        ? 'Aufgabe wieder geöffnet'
        : 'Aufgabe als erledigt markiert';
      Alert.alert('Erfolg', message);
    } catch (error: any) {
      Alert.alert('Fehler', `${error.message}`);
    } finally {
      setCompletingTask(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Aufgabe löschen',
      'Diese Aufgabe wird permanent gelöscht. Fortfahren?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteTask(taskId);
              Alert.alert('Erfolg', 'Aufgabe wurde gelöscht');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Fehler', `${error.message}`);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!task) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFoundText}>Aufgabe nicht gefunden</Text>
      </View>
    );
  }

  const categoryColor = getCategoryColor(task.category);
  const priorityColor = getPriorityColor(task.priority);

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      'hoch': 'Hoch',
      'mittel': 'Mittel',
      'niedrig': 'Niedrig',
    };
    return labels[priority] || priority;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aufgabe</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Priority Bar */}
        <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

        {/* Title with Completion Status */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, task.completed_at && styles.titleCompleted]}>
            {task.title}
          </Text>
          {task.completed_at && (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={styles.completedBadgeText}>Erledigt</Text>
            </View>
          )}
        </View>

        {/* Meta Info */}
        <View style={styles.metaSection}>
          {/* Category */}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Kategorie</Text>
            <View style={[styles.badge, { backgroundColor: categoryColor }]}>
              <Text style={styles.badgeText}>{task.category}</Text>
            </View>
          </View>

          {/* Priority */}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Priorität</Text>
            <Text style={[styles.metaValue, { color: priorityColor }]}>
              {getPriorityLabel(task.priority)}
            </Text>
          </View>

          {/* Date */}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Erstellt am</Text>
            <Text style={styles.metaValue}>{formatDate(task.created_at)}</Text>
          </View>
        </View>

        {/* Description */}
        {task.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beschreibung</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{task.description}</Text>
            </View>
          </View>
        )}

        {/* Location */}
        {task.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Standort</Text>
            <View style={styles.infoBox}>
              <MaterialIcons name="location-on" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>{task.location}</Text>
            </View>
          </View>
        )}

        {/* Linked Plants */}
        {task.plant_names && task.plant_names.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verknüpfte Pflanzen</Text>
            <View style={styles.plantsList}>
              {task.plant_names.map((plant, index) => (
                <View key={`${plant}-${index}`} style={styles.plantTag}>
                  <MaterialIcons name="local-florist" size={16} color={Colors.primary} />
                  <Text style={styles.plantTagText}>{plant}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            task.completed_at ? styles.reopenButton : styles.completeButton,
          ]}
          onPress={handleToggleCompletion}
          disabled={deleting || completingTask}
        >
          {completingTask ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <MaterialIcons
                name={task.completed_at ? 'refresh' : 'check-circle'}
                size={20}
                color={task.completed_at ? Colors.primary : '#fff'}
              />
              <Text
                style={
                  task.completed_at
                    ? styles.reopenButtonText
                    : styles.completeButtonText
                }
              >
                {task.completed_at ? 'Wieder öffnen' : 'Erledigt'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={handleEdit}
          disabled={deleting || completingTask}
        >
          <MaterialIcons name="edit" size={20} color={Colors.primary} />
          <Text style={styles.editButtonText}>Bearbeiten</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
          disabled={deleting || completingTask}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={Colors.error} />
          ) : (
            <>
              <MaterialIcons name="delete" size={20} color={Colors.error} />
              <Text style={styles.deleteButtonText}>Löschen</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  headerSpacer: {
    width: 28,
  },
  content: {
    flex: 1,
  },
  priorityBar: {
    height: 4,
  },
  titleSection: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  titleCompleted: {
    color: Colors.textLight,
    textDecorationLine: 'line-through',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  metaSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  metaItem: {
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textLight,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  infoText: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  plantsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  plantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  plantTagText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reopenButton: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  reopenButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  notFoundText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 50,
  },
});
