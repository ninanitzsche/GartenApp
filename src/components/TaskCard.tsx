import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  FadeInUp,
} from 'react-native-reanimated';
import { Circle, CheckCircle2 } from 'lucide-react-native';
import { Task, TaskListItem } from '../types/task';
import { Zeitraum } from '../types/zeitraum';
import { getZeitraumShortLabel, getZeitraumIconComponent } from '../utils/zeitraumUtils';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import PrioritaetBadge from './PrioritaetBadge';
import { useReduceMotion } from '../utils/accessibility';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TaskCardProps {
  task: Task | TaskListItem;
  onToggle: () => void;
  onPress: () => void;
  loading?: boolean;
  showPlantName?: boolean;
}

function getTaskZeitraum(task: Task): Zeitraum | undefined {
  if (!task.zeitraum) return undefined;
  return task.zeitraum as Zeitraum;
}

function SkeletonCard() {
  return (
    <View style={styles.container}>
      <View style={styles.checkbox}>
        <ActivityIndicator size="small" color={Colors2026.textLight} />
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

export default function TaskCard({ task, onToggle, onPress, loading = false, showPlantName = true }: TaskCardProps) {
  if (loading) {
    return <SkeletonCard />;
  }

  const reduceMotion = useReduceMotion();
  const isCompleted = !!task.completed_at;
  const zeitraum = getTaskZeitraum(task);
  const zeitraumLabel = zeitraum ? getZeitraumShortLabel(zeitraum) : '';
  
  const linkedPlants = (task as any).linked_plants || [];
  const plantNameText = linkedPlants.length > 0 ? linkedPlants[0].name : null;

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkScale = useSharedValue(1);
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const CardWrapper = reduceMotion ? View : Animated.View;
  const enteringProp = reduceMotion ? undefined : FadeInUp.duration(300);

  return (
    <CardWrapper entering={enteringProp}>
      <AnimatedPressable
        style={[styles.container, animatedStyle]}
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 10, stiffness: 200 }); }}
      >
        <Pressable
          style={styles.checkbox}
          onPress={() => {
            if (!reduceMotion) {
              checkScale.value = withSequence(withSpring(1.3, { damping: 10 }), withSpring(1, { damping: 15 }));
            }
            onToggle();
          }}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={isCompleted ? `${task.title} erledigt` : `${task.title} nicht erledigt`}
        >
          <Animated.View style={checkAnimatedStyle}>
            {isCompleted ? (
              <CheckCircle2 size={24} color={Colors2026.status.success} />
            ) : (
              <Circle size={24} color={Colors2026.textLight} />
            )}
          </Animated.View>
        </Pressable>
        <View style={styles.content}>
          <Text style={[styles.title, isCompleted && styles.completed]}>
            {task.title}
          </Text>
          <View style={styles.meta}>
            {plantNameText && showPlantName && (
              <Text style={styles.plantNameText}>{plantNameText}</Text>
            )}
            {task.location && <Text style={styles.location}>{task.location}</Text>}
            {zeitraumLabel && zeitraum && (
              <View style={styles.zeitraumRow}>
                {getZeitraumIconComponent(zeitraum, 14, Colors2026.primary)}
                <Text style={styles.zeitraumText}>{zeitraumLabel}</Text>
              </View>
            )}
          </View>
        </View>
        <PrioritaetBadge prioritaet={task.priority} />
      </AnimatedPressable>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing2026.md,
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.lg,
    marginBottom: Spacing2026.sm,
    ...Shadows2026.md,
  },
  checkbox: {
    marginRight: Spacing2026.sm,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography2026.caption,
    color: Colors2026.text,
    fontWeight: '600',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: Colors2026.textLight,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.xs,
  },
  location: {
    ...Typography2026.small,
    color: Colors2026.textSecondary,
  },
  plantNameText: {
    ...Typography2026.small,
    fontWeight: '700',
    color: Colors2026.primary,
  },
  zeitraumRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zeitraumText: {
    ...Typography2026.small,
    color: Colors2026.primary,
  },
  skeletonTitle: {
    height: 14,
    width: '70%',
    backgroundColor: Colors2026.border,
    borderRadius: Radius2026.sm,
  },
  skeletonMeta: {
    height: 10,
    width: 60,
    backgroundColor: Colors2026.border,
    borderRadius: Radius2026.sm,
    marginTop: Spacing2026.xs,
  },
  skeletonBadge: {
    width: 50,
    height: 18,
    backgroundColor: Colors2026.border,
    borderRadius: Radius2026.sm,
  },
});
