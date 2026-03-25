/**
 * TaskListContent - Enhanced with Search & Filter
 * Story 049: Task Suche & Filter
 */

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { TaskListItem } from '../types/task';
import Colors from '../theme/colors';
import { Colors2026 } from '../theme/designSystemV2';
import { fetchTasks, toggleTaskCompletion, sortTasks, getSortLabel } from '../services/taskService';
import EmptyState from './ui/EmptyState';
import TaskListItemComp from '../components/TaskListItem';

interface TaskListContentProps {
  navigation?: any;
  onAddTask?: () => void;
  showHeader?: boolean;
  embedded?: boolean;
}

const PRIORITIES = ['hoch', 'mittel', 'niedrig'];
const CATEGORIES = ['pflege', 'ernte', 'garten', 'sonstiges'];

export default function TaskListContent({ 
  navigation, 
  onAddTask,
  showHeader = true,
  embedded = false 
}: TaskListContentProps) {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('priority');
  const [showSortMenu, setShowSortMenu] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterPriorities, setFilterPriorities] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const searchDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    loadTasks();
  }, []);

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

  // Filter & Sort Tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.category?.toLowerCase().includes(query)
      );
    }

    // Priority filter
    if (filterPriorities.length > 0) {
      result = result.filter(task => filterPriorities.includes(task.priority));
    }

    // Category filter
    if (filterCategories.length > 0) {
      result = result.filter(task => filterCategories.includes(task.category));
    }

    // Sort
    return sortTasks(result, sortBy);
  }, [tasks, searchQuery, filterPriorities, filterCategories, sortBy]);

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

  const togglePriorityFilter = (priority: string) => {
    setFilterPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const toggleCategoryFilter = (category: string) => {
    setFilterCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterPriorities([]);
    setFilterCategories([]);
  };

  const hasActiveFilters = searchQuery || filterPriorities.length > 0 || filterCategories.length > 0;

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
        icon={<MaterialIcons name="assignment" size={40} color={Colors2026.primary} />}
        title={hasActiveFilters ? 'Keine Aufgaben gefunden' : 'Keine Aufgaben'}
        subtitle={hasActiveFilters 
          ? 'Passen Sie Ihre Filter an, um weitere Aufgaben zu finden'
          : 'Planen Sie Ihre Gartenpflege mit Aufgaben'
        }
        action={
          <TouchableOpacity
            onPress={hasActiveFilters ? clearFilters : handleAddTask}
            style={styles.emptyAction}
          >
            <Text style={styles.emptyActionText}>
              {hasActiveFilters ? 'Filter zurücksetzen' : 'Aufgabe erstellen'}
            </Text>
          </TouchableOpacity>
        }
        containerStyle={styles.emptyStateContainer}
      />
    ),
    [handleAddTask, hasActiveFilters]
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
              {filteredAndSortedTasks.length === 1 
                ? '1 Aufgabe' 
                : `${filteredAndSortedTasks.length} Aufgaben`}
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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Aufgabe suchen..."
            placeholderTextColor={Colors.textDisabled}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterChipsContainer}
        contentContainerStyle={styles.filterChipsContent}
      >
        {/* Filter Toggle */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            showFilters && styles.filterChipActive,
          ]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialIcons 
            name="filter-list" 
            size={16} 
            color={showFilters ? '#fff' : Colors.primary} 
          />
          <Text style={[
            styles.filterChipText,
            showFilters && styles.filterChipTextActive,
          ]}>
            Filter
          </Text>
        </TouchableOpacity>

        {/* Sort Button */}
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() => setShowSortMenu(!showSortMenu)}
        >
          <MaterialIcons name="sort" size={16} color={Colors.primary} />
          <Text style={styles.filterChipText}>{getSortLabel(sortBy)}</Text>
        </TouchableOpacity>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <TouchableOpacity
            style={styles.clearFilterChip}
            onPress={clearFilters}
          >
            <MaterialIcons name="close" size={14} color={Colors.error} />
            <Text style={styles.clearFilterText}>Zurücksetzen</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Expanded Filters */}
      {showFilters && (
        <View style={styles.expandedFilters}>
          {/* Priority Filters */}
          <Text style={styles.filterLabel}>Priorität</Text>
          <View style={styles.filterRow}>
            {PRIORITIES.map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityChip,
                  filterPriorities.includes(priority) && styles.priorityChipActive,
                ]}
                onPress={() => togglePriorityFilter(priority)}
              >
                <Text style={[
                  styles.priorityChipText,
                  filterPriorities.includes(priority) && styles.priorityChipTextActive,
                ]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Category Filters */}
          <Text style={styles.filterLabel}>Kategorie</Text>
          <View style={styles.filterRow}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  filterCategories.includes(category) && styles.categoryChipActive,
                ]}
                onPress={() => toggleCategoryFilter(category)}
              >
                <Text style={[
                  styles.categoryChipText,
                  filterCategories.includes(category) && styles.categoryChipTextActive,
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Sort Menu */}
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
              <Text style={[
                styles.sortOptionText,
                sortBy === option && styles.sortOptionTextActive,
              ]}>
                {getSortLabel(option)}
              </Text>
              {sortBy === option && (
                <MaterialIcons name="check" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={filteredAndSortedTasks}
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
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  filterChipsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterChipsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },
  expandedFilters: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 8,
    marginTop: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  priorityChipText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  priorityChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sortMenu: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  emptyAction: {
    backgroundColor: Colors2026.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
