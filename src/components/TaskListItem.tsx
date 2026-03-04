import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { TaskListItem as Task } from '../types/task';
import Colors from '../theme/colors';
import { getCategoryColor, getPriorityColor } from '../services/taskService';

interface Props {
  task: Task;
  onPress: () => void;
}

export default function TaskListItem({ task, onPress }: Props) {
  const priorityColor = getPriorityColor(task.priority);
  const categoryColor = getCategoryColor(task.category);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Priority color bar */}
      <View style={[styles.priorityBar, { backgroundColor: priorityColor }]} />

      {/* Content */}
      <View style={styles.content}>
        {/* Title and date row */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
          <Text style={styles.date}>{formatDate(task.created_at)}</Text>
        </View>

        {/* Category and plants row */}
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: categoryColor }]}>
            <Text style={styles.badgeText}>{task.category}</Text>
          </View>

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
        <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginVertical: 6,
    marginHorizontal: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  priorityBar: {
    width: 4,
    height: '100%',
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
    color: Colors.text,
    flex: 1,
  },
  date: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  plants: {
    fontSize: 12,
    color: Colors.textLight,
    flex: 1,
  },
  description: {
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  arrow: {
    paddingHorizontal: 8,
  },
});
