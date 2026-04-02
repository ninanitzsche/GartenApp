/**
 * GamificationBar Component
 * Streak, motivation ticker, and achievement display for dashboard
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';
import { Flame, ChevronRight, Circle } from 'lucide-react-native';
import {
  Colors2026,
  Spacing2026,
  Radius2026,
  Typography2026,
} from '../../theme/designSystemV2';
import type { StreakData, Achievement } from '../../services/gamificationService';

interface TaskPreview {
  id: string;
  title: string;
  plantName: string;
}

interface GamificationBarProps {
  streak: StreakData;
  motivation: string;
  achievements: Achievement[];
  onAchievementsPress?: () => void;
  onMotivationPress?: () => void;
  pendingTasks?: TaskPreview[];
  onToggleTask?: (taskId: string) => void;
  todayCompletedCount?: number;
}

export default function GamificationBar({
  streak,
  motivation,
  achievements,
  onAchievementsPress,
  onMotivationPress,
  pendingTasks = [],
  onToggleTask,
  todayCompletedCount = 0,
}: GamificationBarProps) {
  const [expanded, setExpanded] = React.useState(false);
  const [showAchievements, setShowAchievements] = React.useState(false);
  const unlocked = achievements.filter(a => a.unlockedAt);

  return (
    <View style={styles.container}>
      {/* Streak - Prominent above */}
      {streak.currentStreak > 0 && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.streakRow}>
          <View style={styles.streakBadge}>
            <Flame size={16} color="#E87A3D" />
            <Text style={styles.streakCount}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>
              {streak.currentStreak === 1 ? 'Tag' : 'Tage'}
            </Text>
          </View>
          {streak.currentStreak >= 7 && (
            <Text style={styles.streakMilestone}>Wow, eine Woche!</Text>
          )}
        </Animated.View>
      )}

      {/* Motivation Ticker - Clear call to action */}
      <View>
        <Pressable
          style={styles.motivationRow}
          onPress={() => pendingTasks.length > 0 ? setExpanded(!expanded) : onMotivationPress?.()}
          disabled={!onMotivationPress && pendingTasks.length === 0}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Einklappen' : 'Aufgaben anzeigen'}
        >
          <Text style={styles.motivationText} numberOfLines={1}>
            {motivation}
          </Text>
          {pendingTasks.length > 0 && (
            <ChevronRight 
              size={16} 
              color={Colors2026.primary} 
              style={[styles.motivationArrow, expanded && { transform: [{ rotate: '90deg' }] }]} 
            />
          )}
        </Pressable>

        {/* Expanded: Show pending tasks with toggle */}
        {expanded && pendingTasks.length > 0 && (
          <View style={styles.tasksPreview}>
            {pendingTasks.slice(0, 5).map((task) => (
              <Pressable
                key={task.id}
                style={styles.taskPreviewItem}
                onPress={() => onToggleTask?.(task.id)}
              >
                <View style={styles.taskCheckbox}>
                  <Circle size={18} color={Colors2026.textLight} />
                </View>
                <View style={styles.taskPreviewContent}>
                  <Text style={styles.taskPreviewPlant}>{task.plantName}</Text>
                  <Text style={styles.taskPreviewTitle} numberOfLines={1}>{task.title}</Text>
                </View>
              </Pressable>
            ))}
            {pendingTasks.length > 5 && (
              <Pressable onPress={onMotivationPress}>
                <Text style={styles.moreTasksText}>+{pendingTasks.length - 5} weitere anzeigen</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Achievements - Subtle row at bottom */}
      {unlocked.length > 0 && (
        <View>
          <Pressable
            style={styles.achievementsRow}
            onPress={() => setShowAchievements(!showAchievements)}
            accessibilityRole="button"
            accessibilityLabel={showAchievements ? 'Einklappen' : `${unlocked.length} Abzeichen anzeigen`}
          >
            <View style={styles.achievementsLeft}>
              <Text style={styles.achievementsLabel}>🏆</Text>
              <Text style={styles.achievementsCount}>
                {unlocked.length} / {achievements.length} Abzeichen
              </Text>
            </View>
            <View style={styles.achievementIcons}>
              {unlocked.slice(0, 4).map((a, i) => (
                <View key={a.id} style={[styles.achievementIcon, i > 0 && { marginLeft: -6 }]}>
                  <Text style={styles.achievementEmoji}>{a.icon}</Text>
                </View>
              ))}
              {unlocked.length > 4 && (
                <Text style={styles.moreCount}>+{unlocked.length - 4}</Text>
              )}
            </View>
            <ChevronRight 
              size={14} 
              color={Colors2026.textMuted} 
              style={{ transform: [{ rotate: showAchievements ? '90deg' : '0deg' }] }} 
            />
          </Pressable>

          {/* Expanded: Show achievement details */}
          {showAchievements && (
            <View style={styles.achievementsDetail}>
              {unlocked.map((a) => (
                <View key={a.id} style={styles.achievementDetailItem}>
                  <Text style={styles.achievementDetailIcon}>{a.icon}</Text>
                  <View style={styles.achievementDetailText}>
                    <Text style={styles.achievementDetailTitle}>{a.title}</Text>
                    <Text style={styles.achievementDetailDesc}>{a.description}</Text>
                  </View>
                </View>
              ))}
              {/* Locked achievements */}
              {achievements.filter(a => !a.unlockedAt).map((a) => (
                <View key={a.id} style={[styles.achievementDetailItem, styles.achievementLocked]}>
                  <Text style={styles.achievementDetailIcon}>🔒</Text>
                  <View style={styles.achievementDetailText}>
                    <Text style={styles.achievementDetailTitle}>{a.title}</Text>
                    <Text style={styles.achievementDetailDesc}>{a.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing2026.md,
    paddingHorizontal: Spacing2026.xl,
    gap: Spacing2026.sm,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(232,122,61,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,122,61,0.25)',
    borderRadius: Radius2026.round,
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.xs,
  },
  streakCount: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: '800',
    color: '#E87A3D',
    letterSpacing: -0.5,
  },
  streakLabel: {
    fontSize: Typography2026.small.fontSize,
    color: '#E87A3D',
    fontWeight: '500',
  },
  streakMilestone: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '700',
    color: '#E87A3D',
  },
  motivationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(45,71,57,0.06)',
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: 'rgba(45,71,57,0.1)',
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing2026.sm,
  },
  todayEmojis: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  todayEmojiBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors2026.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors2026.glass.border,
  },
  todayEmoji: {
    fontSize: 14,
  },
  moreEmojis: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '700',
    color: Colors2026.primary,
    marginLeft: 4,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45,157,79,0.15)',
    borderRadius: Radius2026.round,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: 2,
    gap: 2,
  },
  todayCount: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '800',
    color: Colors2026.primary,
  },
  todayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  motivationText: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '500',
    color: Colors2026.text,
  },
  motivationArrow: {
    marginTop: 2,
  },
  achievementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors2026.glass.light,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.glass.border,
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
    gap: Spacing2026.sm,
  },
  achievementsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.xs,
  },
  achievementsLabel: {
    fontSize: 16,
  },
  achievementsCount: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.textMuted,
  },
  achievementIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors2026.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 12,
  },
  moreCount: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
    fontWeight: '600',
    marginLeft: 4,
  },
  achievementRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementCount: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.textMuted,
  },
  newAchievement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    backgroundColor: 'rgba(198,123,74,0.08)',
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: 'rgba(198,123,74,0.2)',
    paddingHorizontal: Spacing2026.md,
    paddingVertical: Spacing2026.sm,
  },
  newAchievementEmoji: {
    fontSize: 24,
  },
  newAchievementText: {
    flex: 1,
  },
  newAchievementTitle: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '700',
    color: '#C67B4A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  newAchievementName: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  tasksPreview: {
    backgroundColor: Colors2026.bg,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.border,
    marginTop: Spacing2026.sm,
    padding: Spacing2026.sm,
    gap: Spacing2026.xs,
  },
  taskPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskPreviewContent: {
    flex: 1,
  },
  taskPreviewPlant: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '700',
    color: Colors2026.primary,
    minWidth: 70,
  },
  taskPreviewTitle: {
    flex: 1,
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.text,
  },
  moreTasksText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing2026.xs,
  },
  achievementsDetail: {
    backgroundColor: Colors2026.bg,
    borderRadius: Radius2026.md,
    borderWidth: 1,
    borderColor: Colors2026.border,
    marginTop: Spacing2026.sm,
    padding: Spacing2026.sm,
    gap: Spacing2026.xs,
  },
  achievementDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementDetailIcon: {
    fontSize: 20,
  },
  achievementDetailText: {
    flex: 1,
  },
  achievementDetailTitle: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
  },
  achievementDetailDesc: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
  },
});
