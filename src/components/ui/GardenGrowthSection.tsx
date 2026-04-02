/**
 * GardenGrowthSection Component
 * Gamified garden progress visualization
 * Shows plants growing based on task completion
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
  FadeInRight,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import {
  Sprout,
  TreeDeciduous,
  Flower2,
  Leaf,
  Trophy,
  Sparkles,
  ChevronRight,
} from 'lucide-react-native';
import {
  Colors2026,
  Spacing2026,
  Radius2026,
  Typography2026,
  Shadows2026,
} from '../../theme/designSystemV2';
import { SpringConfig } from '../../theme/animations';
import GlassCard from './GlassCard';
import type { GardenGrowthData, PlantTaskProgress } from '../../services/dashboardService';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GardenGrowthSectionProps {
  data: GardenGrowthData;
  onPlantPress?: (plantId: string) => void;
  todayCompletedCount?: number;
}

const MAX_VISIBLE = 4;

const GROWTH_STAGE_ICONS: Record<string, { icon: string; label: string }> = {
  geplant: { icon: '🌱', label: 'Geplant' },
  bestellt: { icon: '📦', label: 'Bestellt' },
  ausgesät: { icon: '🌱', label: 'Ausgesät' },
  pikiert: { icon: '🌿', label: 'Pikiert' },
  ausgepflanzt: { icon: '🪴', label: 'Ausgepflanzt' },
  etabliert: { icon: '🌳', label: 'Etabliert' },
  geerntet: { icon: '🌾', label: 'Geerntet' },
  unklar: { icon: '❓', label: 'Unklar' },
};

const STATUS_STAGE_ORDER = [
  'geplant', 'bestellt', 'ausgesät', 'pikiert', 'ausgepflanzt', 'etabliert', 'geerntet',
];

function getGrowthStage(status: string): number {
  const idx = STATUS_STAGE_ORDER.indexOf(status.toLowerCase());
  return idx >= 0 ? idx : 0;
}

function PlantCard({
  plant,
  index,
  onPress,
}: {
  plant: PlantTaskProgress;
  index: number;
  onPress?: () => void;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(index * 80, withTiming(1, { duration: 300 }));
    scale.value = withDelay(
      index * 80,
      withSpring(1, SpringConfig.bouncy)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, SpringConfig.snappy);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SpringConfig.bouncy);
  };

  const stageInfo = GROWTH_STAGE_ICONS[plant.plantStatus] || GROWTH_STAGE_ICONS.unklar;
  const growthStage = getGrowthStage(plant.plantStatus);
  const growthProgress = (growthStage / (STATUS_STAGE_ORDER.length - 1)) * 100;
  const statusColor =
    Colors2026.plantStatus[plant.plantStatus as keyof typeof Colors2026.plantStatus] ||
    Colors2026.textMuted;

  return (
    <Animated.View style={[animatedStyle, { flex: 1 }]}>
      <AnimatedPressable
        style={styles.plantCard}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={`${plant.plantName}: ${plant.completedTasks} von ${plant.totalTasks} Aufgaben erledigt`}
      >
        <BlurView intensity={50} style={styles.plantCardBlur}>
          {/* Growth Stage Emoji */}
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{stageInfo.icon}</Text>
            {plant.allDone && (
              <View style={styles.trophyBadge}>
                <Trophy size={12} color="#C67B4A" />
              </View>
            )}
          </View>

          {/* Plant Name */}
          <Text style={styles.plantName} numberOfLines={1}>
            {plant.plantName}
          </Text>

          {/* Growth Progress Bar */}
          <View style={styles.growthBarContainer}>
            <View style={styles.growthBar}>
              <Animated.View
                style={[
                  styles.growthBarFill,
                  {
                    width: `${growthProgress}%`,
                    backgroundColor: statusColor,
                  },
                ]}
              />
            </View>
            <Text style={[styles.stageLabel, { color: statusColor }]}>
              {stageInfo.label}
            </Text>
          </View>

          {/* Task Progress Bar */}
          <View style={styles.taskProgressRow}>
            <View style={styles.taskProgressBar}>
              <View
                style={[
                  styles.taskProgressFill,
                  { width: `${plant.totalTasks > 0 ? (plant.completedTasks / plant.totalTasks) * 100 : 0}%` },
                ]}
              />
            </View>
            <Text style={styles.taskCount}>
              {plant.completedTasks}/{plant.totalTasks}
            </Text>
          </View>
        </BlurView>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function GardenGrowthSection({
  data,
  onPlantPress,
  todayCompletedCount = 0,
}: GardenGrowthSectionProps) {
  const [expanded, setExpanded] = React.useState(false);
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withDelay(
      400,
      withSpring(data.overallProgress, SpringConfig.gentle)
    );
  }, [data.overallProgress]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  if (data.plants.length === 0) {
    return null;
  }

  const hasMore = data.plants.length > MAX_VISIBLE;
  const visiblePlants = expanded ? data.plants : data.plants.slice(0, MAX_VISIBLE);

  return (
    <View style={styles.section}>
      {/* Section Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <View style={styles.headerLeft}>
          <Leaf size={20} color={Colors2026.primary} />
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Garten-Wachstum</Text>
            <Text style={styles.headerSubtitle}>
              {data.plants.length} Pflanzen · {data.completedTasks}/{data.totalTasks} Aufgaben
            </Text>
          </View>
        </View>
        {data.overallProgress === 100 && (
          <View style={styles.completeBadge}>
            <Sparkles size={16} color="#C67B4A" />
          </View>
        )}
      </Animated.View>

      {/* Plant Cards Container */}
      <View style={styles.cardContainer}>
        {/* Header with expand/collapse */}
        <Pressable
          style={styles.gardenHeader}
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Einklappen' : 'Ausklappen'}
        >
          <Text style={styles.gardenHeaderText}>
            {data.plants.length} Pflanzen · {data.completedTasks}/{data.totalTasks} Aufgaben
          </Text>
          <ChevronRight
            size={18}
            color={Colors2026.primary}
            style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
          />
        </Pressable>

        {/* Expanded content */}
        {expanded ? (
          <View style={styles.expandedContent}>
            {/* Plant Cards Grid */}
            {(() => {
              const rows: PlantTaskProgress[][] = [];
              for (let i = 0; i < data.plants.length; i += 2) {
                rows.push(data.plants.slice(i, i + 2));
              }
              return rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.gridRow}>
                  {row.map((plant, colIndex) => (
                    <View key={plant.plantId} style={styles.gridCell}>
                      <PlantCard
                        plant={plant}
                        index={rowIndex * 2 + colIndex}
                        onPress={() => onPlantPress?.(plant.plantId)}
                      />
                    </View>
                  ))}
                  {row.length === 1 && <View style={styles.gridCell} />}
                </View>
              ));
            })()}
          </View>
        ) : (
          /* Collapsed preview */
          data.plants.length > 0 && (
            <Pressable style={styles.collapsedPreview} onPress={() => setExpanded(true)}>
              {todayCompletedCount > 0 && (
                <View style={styles.todayBadge}>
                  <Text style={styles.todayCount}>{todayCompletedCount}</Text>
                  <Text style={styles.todayLabel}>heute</Text>
                </View>
              )}
              <Text style={styles.collapsedText} numberOfLines={1}>
                🌱 {data.plants[0].plantName} & {data.plants.length - 1} mehr
              </Text>
              <ChevronRight size={16} color={Colors2026.primary} style={{ transform: [{ rotate: '90deg' }] }} />
            </Pressable>
          )
        )}
      </View>

      {/* Overall Progress Bar */}
      <Animated.View entering={FadeIn.delay(600).duration(400)} style={styles.overallProgress}>
        <View style={styles.overallProgressBar}>
          <Animated.View style={[styles.overallProgressFill, progressBarStyle]} />
        </View>
        <Text style={styles.overallProgressText}>
          Gesamt-Fortschritt {data.overallProgress}%
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  cardContainer: {
    backgroundColor: Colors2026.glass.light,
    borderRadius: Radius2026.lg,
    borderWidth: 1,
    borderColor: Colors2026.glass.border,
    padding: Spacing2026.lg,
    ...Shadows2026.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing2026.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: Spacing2026.sm,
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    marginTop: 2,
  },
  completeBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(198,123,74,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
  },
  gridCell: {
    flex: 1,
  },
  expandedContent: {
    paddingTop: Spacing2026.sm,
  },
  plantCard: {
    flex: 1,
    borderRadius: Radius2026.lg,
    borderWidth: 1,
    borderColor: Colors2026.glass.border,
    backgroundColor: Colors2026.glass.light,
    overflow: 'hidden',
    ...Shadows2026.sm,
  },
  plantCardBlur: {
    padding: Spacing2026.sm,
    alignItems: 'center',
    height: 120,
    justifyContent: 'space-between',
  },
  emojiContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  emoji: {
    fontSize: 22,
  },
  trophyBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(198,123,74,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(198,123,74,0.3)',
  },
  plantName: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    textAlign: 'center',
  },
  growthBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  growthBar: {
    width: '100%',
    height: 3,
    backgroundColor: Colors2026.border,
    borderRadius: 1.5,
    overflow: 'hidden',
    marginBottom: 2,
  },
  growthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  taskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: '100%',
    marginTop: 'auto',
  },
  taskProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors2026.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  taskProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: Colors2026.primary,
  },
  taskCount: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'right',
  },
  overallProgress: {
    marginTop: Spacing2026.md,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: Colors2026.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing2026.xs,
  },
  overallProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors2026.primary,
  },
  overallProgressText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
    fontWeight: '500',
    textAlign: 'right',
  },
  showAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing2026.sm,
    gap: 4,
  },
  showAllText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  gardenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
    marginBottom: Spacing2026.sm,
  },
  gardenHeaderText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.textMuted,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing2026.sm,
  },
  previewItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    backgroundColor: Colors2026.bg,
    borderRadius: Radius2026.md,
  },
  previewEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  previewName: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors2026.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  previewBar: {
    width: '80%',
    height: 3,
    backgroundColor: Colors2026.border,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  previewBarFill: {
    height: '100%',
    backgroundColor: Colors2026.primary,
    borderRadius: 1.5,
  },
  collapsedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    paddingVertical: Spacing2026.sm,
    paddingHorizontal: Spacing2026.sm,
    backgroundColor: Colors2026.bg,
    borderRadius: Radius2026.md,
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
  collapsedText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
});
