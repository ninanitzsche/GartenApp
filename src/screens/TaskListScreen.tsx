import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { TaskListItem } from '../types/task';
import Colors from '../theme/colors';
import { fetchTasks, toggleTaskCompletion, getCategoryColor, getPriorityColor } from '../services/taskService';
import EmptyState from '../components/EmptyState';
import TaskListItem as TaskListItemComponent from '../components/TaskListItem';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskList'>;

export default function TaskListScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Listen for navigation events to reload tasks when coming back
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTasks();
    });

    return unsubscribe;
  }, [navigation]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const taskList = await fetchTasks();
      setTasks(taskList);
    } catch (error: any) {
      Alert.alert('Fehler', `Aufgaben konnten nicht geladen werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadTasks();
    } catch (error: any) {
      Alert.alert('Fehler', `Aufgaben konnten nicht aktualisiert werden: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  }, [loadTasks]);

  const handleAddTask = () => {
    navigation.navigate('AddTask');
  };

  const handleTaskPress = (task: TaskListItem) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const handleToggleCompletion = useCallback(async (taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      await toggleTaskCompletion(taskId);

      // Update task in list
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, completed_at: task.completed_at ? null : new Date().toISOString() }
            : task
        )
      );
    } catch (error: any) {
      Alert.alert('Fehler', `Aufgabe konnte nicht aktualisiert werden: ${error.message}`);
    } finally {
      setCompletingTaskId(null);
    }
  }, []);

  const renderTaskItem = useCallback(
    ({ item }: { item: TaskListItem }) => (
      <TaskListItemComponent
        task={item}
        onPress={() => handleTaskPress(item)}
        onToggleCompletion={handleToggleCompletion}
        isCompletionLoading={completingTaskId === item.id}
      />
    ),
    [handleToggleCompletion, completingTaskId]
  );

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="assignment"
        title="Keine Aufgaben"
        message="Planen Sie Ihre Gartenpflege mit Aufgaben"
        action={{
          label: 'Aufgabe erstellen',
          onPress: handleAddTask,
        }}
        containerStyle={styles.emptyStateContainer}
      />
    ),
    []
  );

  if (loading && tasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Lade Aufgaben...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Aufgaben</Text>
          <Text style={styles.headerSubtitle}>
            {tasks.length === 1 ? '1 Aufgabe' : `${tasks.length} Aufgaben`}
          </Text>
        </View>
        {tasks.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddTask}
          >
            <MaterialIcons name="add" size={28} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        scrollEnabled={true}
      />
    </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
