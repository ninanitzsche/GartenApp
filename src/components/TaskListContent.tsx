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
import { RootStackParamList } from '../types/navigation';
import { TaskListItem } from '../types/task';
import Colors from '../theme/colors';
import { fetchTasks, toggleTaskCompletion, sortTasks, getSortLabel } from '../services/taskService';
import EmptyState from '../components/EmptyState';
import TaskListItemComp from '../components/TaskListItem';

interface TaskListContentProps {
  navigation?: any;
  onAddTask?: () => void;
  showHeader?: boolean;
  embedded?: boolean;
}

export default function TaskListContent({ 
  navigation, 
  onAddTask,
  showHeader = true,
  embedded = false 
}: TaskListContentProps) {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [sortedTasks, setSortedTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const sorted = sortTasks(tasks, sortBy);
    setSortedTasks(sorted);
  }, [tasks, sortBy]);

  useEffect(() => {
    if (!navigation) return;
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
    if (onAddTask) {
      onAddTask();
    } else if (navigation) {
      navigation.navigate('AddTask');
    }
  };

  const handleTaskPress = (task: TaskListItem) => {
    if (navigation) {
      navigation.navigate('TaskDetail', { taskId: task.id });
    }
  };

  const handleToggleCompletion = useCallback(async (taskId: string) => {
    try {
      setCompletingTaskId(taskId);
      await toggleTaskCompletion(taskId);

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
      <TaskListItemComp
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
    [handleAddTask]
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
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      {showHeader && (
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
              accessibilityLabel="Neue Aufgabe erstellen"
              accessibilityRole="button"
            >
              <MaterialIcons name="add" size={28} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={sortedTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={
          <View style={styles.sortHeader}>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortMenu(!showSortMenu)}
              accessibilityLabel="Sortieren"
              accessibilityRole="button"
            >
              <MaterialIcons name="sort" size={20} color={Colors.primary} />
              <Text style={styles.sortButtonText}>{getSortLabel(sortBy)}</Text>
              <MaterialIcons
                name={showSortMenu ? 'expand-less' : 'expand-more'}
                size={20}
                color={Colors.primary}
              />
            </TouchableOpacity>

            {showSortMenu && (
              <View style={styles.sortMenu} accessibilityLabel="Sortieroptionen">
                {['priority', 'created_at', 'category', 'title'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortOption,
                      sortBy === option && styles.sortOptionActive,
                    ]}
                    onPress={() => {
                      setSortBy(option);
                      setShowSortMenu(false);
                    }}
                    accessibilityLabel={`Sortieren nach ${getSortLabel(option)}`}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        sortBy === option && styles.sortOptionTextActive,
                      ]}
                    >
                      {getSortLabel(option)}
                    </Text>
                    {sortBy === option && (
                      <MaterialIcons name="check" size={18} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        }
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
  containerEmbedded: {
    paddingTop: 0,
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
    flexGrow: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  sortHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },
  sortMenu: {
    marginTop: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortOptionActive: {
    backgroundColor: '#f0f0f0',
  },
  sortOptionText: {
    fontSize: 14,
    color: Colors.text,
  },
  sortOptionTextActive: {
    fontWeight: '600',
    color: Colors.primary,
  },
});
