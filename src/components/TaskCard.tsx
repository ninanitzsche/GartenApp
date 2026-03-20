import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../types/task';
import { Zeitraum } from '../types/zeitraum';
import { getZeitraumShortLabel, getZeitraumIconComponent } from '../utils/zeitraumUtils';
import Colors from '../theme/colors';
import PrioritaetBadge from './PrioritaetBadge';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
  loading?: boolean;
}

function getTaskZeitraum(task: Task): Zeitraum | undefined {
  if (!task.zeitraum) return undefined;
  return task.zeitraum as Zeitraum;
}

function SkeletonCard() {
  return (
    <View style={styles.container}>
      <View style={styles.checkbox}>
        <ActivityIndicator size="small" color={Colors.textLight} />
      </View>
      <View style={styles.content}>
        <View style={styles.skeletonTitle} />
        <View style={styles.meta}>
          <View style={styles.skeletonMeta} />
          <View style={styles.skeletonMeta} />
        </View>
      </View>
      <View style={[styles.skeletonBadge]} />
    </View>
  );
}

export default function TaskCard({ task, onToggle, onPress, loading = false }: TaskCardProps) {
  if (loading) {
    return <SkeletonCard />;
  }

  const isCompleted = !!task.completed_at;
  const zeitraum = getTaskZeitraum(task);
  const zeitraumLabel = zeitraum ? getZeitraumShortLabel(zeitraum) : '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <TouchableOpacity 
        style={styles.checkbox} 
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={isCompleted ? `${task.title} erledigt` : `${task.title} nicht erledigt`}
      >
        <MaterialIcons
          name={isCompleted ? 'check-circle' : 'radio-button-unchecked'}
          size={24}
          color={isCompleted ? Colors.success : Colors.textLight}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={[styles.title, isCompleted && styles.completed]}>
          {task.title}
        </Text>
        <View style={styles.meta}>
          {task.location && <Text style={styles.location}>{task.location}</Text>}
          {zeitraumLabel && zeitraum && (
            <View style={styles.zeitraumRow}>
              {getZeitraumIconComponent(zeitraum, 14, Colors.primary)}
              <Text style={styles.zeitraumText}>{zeitraumLabel}</Text>
            </View>
          )}
        </View>
      </View>
      <PrioritaetBadge prioritaet={task.priority} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkbox: {
    marginRight: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: Colors.textLight,
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: Colors.textLight,
  },
  zeitraumRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zeitraumText: {
    fontSize: 12,
    color: Colors.primary,
  },
  skeletonTitle: {
    height: 14,
    width: '70%',
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
  skeletonMeta: {
    height: 10,
    width: 60,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginTop: 6,
  },
  skeletonBadge: {
    width: 50,
    height: 18,
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
});
