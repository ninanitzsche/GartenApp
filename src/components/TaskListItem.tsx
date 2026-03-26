import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TaskListItem as Task } from '../types/task';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { getCategoryColor, getPriorityColor } from '../services/taskService';

interface Props {
  task: Task;
  onPress: () => void;
  onToggleCompletion?: (taskId: string) => Promise<void>;
  isCompletionLoading?: boolean;
}

export default function TaskListItem({ task, onPress, onToggleCompletion, isCompletionLoading }: Props) {
  const priorityColor = getPriorityColor(task.priority);
  const categoryColor = getCategoryColor(task.category);
  const isCompleted = !!task.completed_at;

  const handleToggleCompletion = () => {
    if (onToggleCompletion) {
      onToggleCompletion(task.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, isCompleted && styles.containerCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={`Aufgabe: ${task.title}. ${isCompleted ? 'Erledigt' : 'Unerledigt'}. Kategorie: ${task.category}`}
      accessibilityRole="button"
    >
      {/* Completion checkbox - 44x44px touch target */}
      <TouchableOpacity
        style={styles.completionButton}
        onPress={handleToggleCompletion}
        disabled={isCompletionLoading}
        accessibilityLabel={isCompleted ? 'Als unerledigt markieren' : 'Als erledigt markieren'}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
      >
        <View style={[styles.checkbox, isCompleted && styles.checkboxChecked, { borderColor: priorityColor }]}>
          {isCompleted && (
            <MaterialIcons name="check" size={16} color="#fff" />
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {/* Title and date row */}
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          <Text style={styles.date}>{formatDate(task.created_at)}</Text>
        </View>

        {/* Category and plants row */}
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: categoryColor + '20', borderColor: categoryColor }]}>
            <Text style={[styles.badgeText, { color: categoryColor }]}>{task.category}</Text>
          </View>
          
          {/* Priority indicator */}
          <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          <Text style={[styles.priorityLabel, { color: priorityColor }]}>
            {task.priority === 'hoch' ? '!' : task.priority === 'mittel' ? '·' : ''}
          </Text>

          {task.plant_names && task.plant_names.length > 0 && (
            <Text style={styles.plants} numberOfLines={1}>
              {task.plant_names.join(', ')}
            </Text>
          )}
        </View>

        {/* Description if exists */}
        {task.description && (
          <Text style={styles.description} numberOfLines={1}>
            {task.description}
          </Text>
        )}
      </View>

      {/* Arrow indicator */}
      <View style={styles.arrow}>
        <MaterialIcons name="chevron-right" size={24} color={Colors2026.textSecondary} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.surface,
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors2026.divider,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerCompleted: {
    opacity: 0.6,
    backgroundColor: Colors2026.bgSecondary,
  },
  completionButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors2026.primary,
    borderColor: Colors2026.primary,
  },
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    flex: 1,
  },
  titleCompleted: {
    color: Colors2026.textMuted,
    textDecorationLine: 'line-through',
  },
  date: {
    fontSize: 12,
    color: Colors2026.textMuted,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  plants: {
    fontSize: 12,
    color: Colors2026.textMuted,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: Colors2026.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  arrow: {
    paddingHorizontal: 8,
  },
});
