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
  CheckCircle2,
} from 'lucide-react-native';
import {
  Colors2026,
  Spacing2026,
  Radius2026,
  Typography2026,
  Shadows2026,
} from '../../theme/designSystemV2';
import { SpringConfig } from '../../theme/animations';
import type { GardenGrowthData, PlantTaskProgress } from '../../services/dashboardService';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface GardenGrowthSectionProps {
  data: GardenGrowthData;
  onPlantPress?: (plantId: string) => void;
}

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
}: GardenGrowthSectionProps) {
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
    marginBottom: Spacing2026.sm,
  },
  gridCell: {
    flex: 1,
  },
  plantCard: {
    flex: 1,
    borderRadius: Radius2026.lg,
    borderWidth: 1,
    borderColor: Colors2026.glass.border,
    backgroundColor: Colors2026.glass.light,
    overflow: 'hidden',
    ...Shadows2026.glass,
  },
  plantCardBlur: {
    padding: Spacing2026.sm,
    alignItems: 'center',
    height: 170,
    justifyContent: 'space-between',
  },
  emojiContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  emoji: {
    fontSize: 28,
  },
  trophyBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(198,123,74,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(198,123,74,0.3)',
  },
  plantName: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    textAlign: 'center',
    marginBottom: Spacing2026.xs,
  },
  growthBarContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing2026.xs,
  },
  growthBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors2026.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  growthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  stageLabel: {
    fontSize: Typography2026.small.fontSize,
    fontWeight: '600',
  },
  taskProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    marginTop: 'auto',
  },
  taskProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors2026.border,
    borderRadius: 3,
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
});
