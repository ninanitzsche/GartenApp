import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

// Type definitions
interface Task {
  id: string;
  title: string;
  category: 'planting' | 'pruning' | 'watering' | 'mulching' | 'harvesting' | 'maintenance';
  priority: 'hoch' | 'mittel';
  scheduled_date: string;
}

interface TimeWindow {
  label: string;
  months: number[];
  icon: string;
  color: string;
}

// Category configuration with icons and colors
const CATEGORIES = {
  planting: {
    label: 'Aussaat',
    icon: '🌻',
    color: '#4CAF50', // Green
    lightBg: '#E8F5E9',
  },
  pruning: {
    label: 'Schnitt',
    icon: '✂️',
    color: '#FF9800', // Orange
    lightBg: '#FFF3E0',
  },
  watering: {
    label: 'Gießen',
    icon: '💧',
    color: '#2196F3', // Blue
    lightBg: '#E3F2FD',
  },
  mulching: {
    label: 'Mulchen',
    icon: '🛡️',
    color: '#795548', // Brown
    lightBg: '#EFEBE9',
  },
  harvesting: {
    label: 'Ernte',
    icon: '🌾',
    color: '#FFC107', // Gold
    lightBg: '#FFFDE7',
  },
  maintenance: {
    label: 'Wartung',
    icon: '🔧',
    color: '#9E9E9E', // Gray
    lightBg: '#F5F5F5',
  },
};

// Time windows (seasons)
const TIME_WINDOWS: TimeWindow[] = [
  {
    label: 'Winter',
    months: [1, 2],
    icon: '❄️',
    color: '#E3F2FD',
  },
  {
    label: 'Frühjahr',
    months: [3, 4],
    icon: '🌱',
    color: '#E8F5E9',
  },
  {
    label: 'Mai - Frühsommer',
    months: [5],
    icon: '🌻',
    color: '#FFF9C4',
  },
  {
    label: 'Sommer',
    months: [6, 7],
    icon: '☀️',
    color: '#FFF8E1',
  },
  {
    label: 'Herbst',
    months: [8, 9, 10],
    icon: '🍂',
    color: '#FFE0B2',
  },
];

interface TaskTimelineViewProps {
  tasks: Task[];
  onTaskPress?: (task: Task) => void;
}

export const TaskTimelineView: React.FC<TaskTimelineViewProps> = ({
  tasks,
  onTaskPress,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(Object.keys(CATEGORIES))
  );

  // Filter tasks by selected categories and group by time window
  const groupedTasks = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};

    TIME_WINDOWS.forEach(window => {
      grouped[window.label] = [];
    });

    tasks.forEach(task => {
      if (!selectedCategories.has(task.category)) return;

      const month = parseInt(task.scheduled_date.split('-')[1]);
      const window = TIME_WINDOWS.find(w => w.months.includes(month));

      if (window) {
        grouped[window.label].push(task);
      }
    });

    return grouped;
  }, [tasks, selectedCategories]);

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const getPriorityStyle = (priority: string) => {
    if (priority === 'hoch') {
      return {
        backgroundColor: '#FFEBEE',
        borderLeftColor: '#F44336',
      };
    }
    return {
      backgroundColor: '#FFFDE7',
      borderLeftColor: '#FBC02D',
    };
  };

  return (
    <ScrollView style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>📂 Kategorien filtern:</Text>
        <View style={styles.filterButtons}>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.filterButton,
                selectedCategories.has(key) && styles.filterButtonActive,
              ]}
              onPress={() => toggleCategory(key)}
            >
              <Text style={styles.filterButtonText}>
                {cat.icon} {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timeline Section */}
      <View style={styles.timelineSection}>
        {TIME_WINDOWS.map((window, idx) => {
          const windowTasks = groupedTasks[window.label] || [];
          if (windowTasks.length === 0) return null;

          return (
            <View key={window.label} style={styles.timeWindow}>
              {/* Time Window Header */}
              <View style={[styles.timeWindowHeader, { backgroundColor: window.color }]}>
                <Text style={styles.timeWindowIcon}>{window.icon}</Text>
                <Text style={styles.timeWindowLabel}>{window.label}</Text>
                <Text style={styles.taskCount}>{windowTasks.length}</Text>
              </View>

              {/* Tasks in this window */}
              <View style={styles.tasksInWindow}>
                {windowTasks.map(task => {
                  const categoryConfig = CATEGORIES[task.category];
                  return (
                    <TouchableOpacity
                      key={task.id}
                      style={[
                        styles.taskCard,
                        getPriorityStyle(task.priority),
                      ]}
                      onPress={() => onTaskPress?.(task)}
                      activeOpacity={0.7}
                    >
                      {/* Priority indicator */}
                      <View style={styles.taskCardTop}>
                        <Text style={styles.taskIcon}>{categoryConfig.icon}</Text>
                        <View style={styles.taskInfo}>
                          <Text style={styles.taskTitle}>{task.title}</Text>
                          <View style={styles.taskMeta}>
                            <Text style={styles.taskCategory}>
                              {categoryConfig.label}
                            </Text>
                            <Text
                              style={[
                                styles.taskPriority,
                                task.priority === 'hoch' && styles.taskPriorityHigh,
                              ]}
                            >
                              {task.priority === 'hoch' ? '🔴 HOCH' : '🟡 Mittel'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>📖 Legende:</Text>
        <View style={styles.legendItem}>
          <Text style={styles.legendBullet}>🔴</Text>
          <Text style={styles.legendText}>HOCH - Zeitkritisch!</Text>
        </View>
        <View style={styles.legendItem}>
          <Text style={styles.legendBullet}>🟡</Text>
          <Text style={styles.legendText}>MITTEL - Nach Plan</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },

  // Filter Section
  filterSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  // Timeline Section
  timelineSection: {
    marginBottom: 24,
  },

  // Time Window
  timeWindow: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeWindowHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeWindowIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  timeWindowLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  // Tasks in Window
  tasksInWindow: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
  },

  // Task Card
  taskCard: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    backgroundColor: '#fafafa',
  },
  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  taskIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  taskPriority: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F57C00',
  },
  taskPriorityHigh: {
    color: '#D32F2F',
  },

  // Legend
  legend: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendBullet: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  legendText: {
    fontSize: 13,
    color: '#666',
  },
});

export default TaskTimelineView;
