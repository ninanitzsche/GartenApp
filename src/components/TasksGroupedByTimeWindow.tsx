import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SectionList,
} from 'react-native';

interface Task {
  id: string;
  title: string;
  category: 'planting' | 'pruning' | 'watering' | 'mulching' | 'harvesting' | 'maintenance';
  priority: 'hoch' | 'mittel';
  scheduled_date: string;
}

const CATEGORY_ICONS = {
  planting: '🌻',
  pruning: '✂️',
  watering: '💧',
  mulching: '🛡️',
  harvesting: '🌾',
  maintenance: '🔧',
};

const TIME_WINDOWS = {
  winter: { label: 'Winter (Jan-Feb)', icon: '❄️', months: [1, 2] },
  spring: { label: 'Frühjahr (März-April)', icon: '🌱', months: [3, 4] },
  'spring-late': { label: 'Mai - Frühsommer', icon: '🌻', months: [5] },
  'summer-early': { label: 'Sommer (Juni)', icon: '☀️', months: [6] },
  'summer-late': { label: 'Hochsommer (Juli)', icon: '🌞', months: [7] },
  autumn: { label: 'Herbst (Aug-Okt)', icon: '🍂', months: [8, 9, 10] },
};

function getTimeWindow(dateString: string): keyof typeof TIME_WINDOWS {
  const month = parseInt(dateString.split('-')[1]);

  if ([1, 2].includes(month)) return 'winter';
  if ([3, 4].includes(month)) return 'spring';
  if ([5].includes(month)) return 'spring-late';
  if ([6].includes(month)) return 'summer-early';
  if ([7].includes(month)) return 'summer-late';
  return 'autumn';
}

interface Props {
  tasks: Task[];
  selectedCategories?: Set<string>;
  onTaskPress?: (task: Task) => void;
  onCategoryToggle?: (category: string) => void;
}

export const TasksGroupedByTimeWindow: React.FC<Props> = ({
  tasks,
  selectedCategories = new Set(Object.keys(CATEGORY_ICONS)),
  onTaskPress,
  onCategoryToggle,
}) => {
  // Group tasks by time window
  const groupedTasks = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};

    Object.keys(TIME_WINDOWS).forEach(tw => {
      grouped[tw] = [];
    });

    tasks
      .filter(t => selectedCategories.has(t.category))
      .forEach(task => {
        const tw = getTimeWindow(task.scheduled_date);
        grouped[tw].push(task);
      });

    return grouped;
  }, [tasks, selectedCategories]);

  // Convert to section list format
  const sections = Object.entries(TIME_WINDOWS)
    .map(([key, window]) => ({
      title: `${window.icon} ${window.label}`,
      data: groupedTasks[key] || [],
      timeWindowKey: key,
    }))
    .filter(s => s.data.length > 0);

  const renderTask = ({ item: task }: { item: Task }) => {
    const icon = CATEGORY_ICONS[task.category];
    const isHighPriority = task.priority === 'hoch';

    return (
      <TouchableOpacity
        style={[
          styles.taskCard,
          isHighPriority && styles.taskCardHighPriority,
        ]}
        onPress={() => onTaskPress?.(task)}
        activeOpacity={0.7}
      >
        <View style={styles.taskContent}>
          <Text style={styles.taskIcon}>{icon}</Text>
          <View style={styles.taskText}>
            <Text style={styles.taskTitle} numberOfLines={2}>
              {task.title}
            </Text>
            <Text style={styles.taskPriority}>
              {isHighPriority ? '🔴 HOCH' : '🟡 Mittel'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter:</Text>
        <View style={styles.filterButtons}>
          {Object.entries(CATEGORY_ICONS).map(([cat, icon]) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterBtn,
                !selectedCategories.has(cat) && styles.filterBtnInactive,
              ]}
              onPress={() => onCategoryToggle?.(cat)}
            >
              <Text style={styles.filterBtnIcon}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Tasks by Time Window */}
      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
          scrollEnabled={false}
          style={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Keine Tasks in dieser Kategorie</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  // Filter
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  filterBtnInactive: {
    opacity: 0.4,
  },
  filterBtnIcon: {
    fontSize: 20,
  },

  // List
  list: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Task Card
  taskCard: {
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#fbc02d',
  },
  taskCardHighPriority: {
    borderLeftColor: '#f44336',
    backgroundColor: '#fff5f5',
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 2,
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  taskPriority: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
});

export default TasksGroupedByTimeWindow;
