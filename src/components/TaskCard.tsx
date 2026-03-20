import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Task } from '../types/task';
import { Zeitraum } from '../types/zeitraum';
import { getZeitraumShortLabel, getZeitraumIcon } from '../utils/zeitraumUtils';
import Colors from '../theme/colors';
import PrioritaetBadge from './PrioritaetBadge';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}

function getTaskZeitraum(task: Task): Zeitraum | undefined {
  if (!task.zeitraum) return undefined;
  return task.zeitraum as Zeitraum;
}

export default function TaskCard({ task, onToggle, onPress }: TaskCardProps) {
  const isCompleted = !!task.completed_at;
  const zeitraum = getTaskZeitraum(task);
  const zeitraumIcon = zeitraum ? getZeitraumIcon(zeitraum) : '';
  const zeitraumLabel = zeitraum ? getZeitraumShortLabel(zeitraum) : '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
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
          {zeitraumLabel && (
            <Text style={styles.zeitraum}>
              {zeitraumIcon} {zeitraumLabel}
            </Text>
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
    marginRight: 12,
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
  zeitraum: {
    fontSize: 12,
    color: Colors.primary,
  },
});
