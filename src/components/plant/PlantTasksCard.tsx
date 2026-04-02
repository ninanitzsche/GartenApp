import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { StyleSheet } from 'react-native';
import { CheckCircle, Circle, Calendar, ChevronRight } from 'lucide-react-native';
import { TaskListItem } from '../../types/task';
import { toggleTaskCompletion } from '../../services/taskService';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import GlassCard from '../ui/GlassCard';
import SectionHeader from '../ui/SectionHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

interface Props {
  tasks: TaskListItem[];
  onTaskUpdate?: () => void;
  delay?: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PlantTasksCard({ tasks, onTaskUpdate, delay = 120 }: Props) {
  const navigation = useNavigation<NavigationProp>();

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
      onTaskUpdate?.();
    } catch (err: any) {
      console.error('Error toggling task:', err);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'hoch': return Colors2026.status.error;
      case 'mittel': return Colors2026.status.warning;
      case 'niedrig': return Colors2026.status.info;
      default: return Colors2026.textMuted;
    }
  };

  if (tasks.length === 0) {
    return null;
  }

  const completedTasks = tasks.filter(t => t.completed_at);
  const pendingTasks = tasks.filter(t => !t.completed_at);

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Aufgaben"
        subtitle={`${pendingTasks.length} offen, ${completedTasks.length} erledigt`}
        icon={<CheckCircle size={20} color={Colors2026.primary} />}
        animated={true}
        delay={delay}
      />
      <GlassCard variant="light">
        {pendingTasks.length > 0 && (
          <>
            <Text style={styles.groupLabel}>Offen</Text>
            {pendingTasks.map((task) => (
              <Pressable
                key={task.id}
                style={styles.taskRow}
                onPress={() => handleToggleTask(task.id)}
              >
                <Circle size={20} color={getPriorityColor(task.priority)} />
                <View style={styles.taskContent}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                  {task.zeitraum && (
                    <View style={styles.zeitraumChip}>
                      <Calendar size={12} color={Colors2026.textMuted} />
                      <Text style={styles.zeitraumText}>{task.zeitraum}</Text>
                    </View>
                  )}
                </View>
                {task.due_date && (
                  <Text style={styles.dueDate}>{formatDate(task.due_date)}</Text>
                )}
              </Pressable>
            ))}
          </>
        )}

        {completedTasks.length > 0 && (
          <>
            <Text style={[styles.groupLabel, { marginTop: pendingTasks.length > 0 ? 16 : 0 }]}>
              Erledigt
            </Text>
            {completedTasks.map((task) => (
              <Pressable
                key={task.id}
                style={[styles.taskRow, styles.completedTask]}
                onPress={() => handleToggleTask(task.id)}
              >
                <CheckCircle size={20} color={Colors2026.status.success} />
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, styles.completedTitle]}>{task.title}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        <Pressable
          style={styles.viewAllButton}
          onPress={() => navigation.navigate('TaskList')}
        >
          <Text style={styles.viewAllText}>Alle Aufgaben anzeigen</Text>
          <ChevronRight size={16} color={Colors2026.primary} />
        </Pressable>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  groupLabel: {
    fontSize: 12,
    color: Colors2026.textSecondary,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.glass.light,
  },
  completedTask: {
    opacity: 0.6,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    color: Colors2026.text,
    fontWeight: '500',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: Colors2026.textMuted,
  },
  zeitraumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  zeitraumText: {
    fontSize: 12,
    color: Colors2026.textMuted,
  },
  dueDate: {
    fontSize: 12,
    color: Colors2026.textMuted,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors2026.primary,
    fontWeight: '500',
  },
});
