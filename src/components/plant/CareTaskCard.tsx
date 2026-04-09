/**
 * CareTaskCard
 * Shows care tasks generated from plant knowledge
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import { CareTask } from '../../services/plantCareTaskService';

interface CareTaskCardProps {
  tasks: CareTask[];
  onAddTask?: (task: CareTask) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  watering: 'gießen',
  fertilizing: 'düngen',
  pruning: 'schneiden',
  soil: 'boden',
  monitoring: 'kontrolle',
  pest_control: 'schädlingsbekämpfung',
  disease: 'krankheit',
  care: 'pflege',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#FF4444',
  medium: '#FF8800',
  low: '#44AA44',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'wichtig',
  medium: 'mittel',
  low: 'gering',
};

export default function CareTaskCard({ tasks, onAddTask }: CareTaskCardProps) {
  if (tasks.length === 0) {
    return null;
  }

  return (
    <GlassCard style={styles.container}>
      <Text style={styles.title}>Pflegetipps</Text>

      {tasks.slice(0, 5).map((task, index) => (
        <View key={index} style={styles.taskRow}>
          <View style={styles.taskInfo}>
            <View style={styles.badges}>
              <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[task.priority] + '20' }]}>
                <Text style={[styles.badgeText, { color: PRIORITY_COLORS[task.priority] }]}>
                  {PRIORITY_LABELS[task.priority]}
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {CATEGORY_LABELS[task.category] || task.category}
                </Text>
              </View>
            </View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Text>
          </View>
          {onAddTask && (
            <View style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </View>
          )}
        </View>
      ))}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing2026.md,
  },
  title: {
    ...Typography2026.h4,
    color: Colors2026.text,
    marginBottom: Spacing2026.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  taskInfo: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing2026.xs,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: Spacing2026.xs,
    paddingVertical: 2,
    borderRadius: Radius2026.sm,
  },
  badgeText: {
    ...Typography2026.small,
    fontWeight: '600',
  },
  categoryBadge: {
    paddingHorizontal: Spacing2026.xs,
    paddingVertical: 2,
    borderRadius: Radius2026.sm,
    backgroundColor: Colors2026.surface,
  },
  categoryText: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
  },
  taskTitle: {
    ...Typography2026.body,
    color: Colors2026.text,
    fontWeight: '600',
  },
  taskDescription: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors2026.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing2026.sm,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
