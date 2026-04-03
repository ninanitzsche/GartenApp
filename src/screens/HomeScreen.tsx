/**
 * HomeScreen - Redesigned 2026
 * Glassmorphism + Bold Cards + Seasonal Colors
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Leaf, Sprout, Sun, Droplets, Flower2, Calendar, CheckCircle2, Clock, Sparkles, Camera } from 'lucide-react-native';
import AIPhotoPicker from '../components/AIPhotoPicker';
import { PlantIdentificationResult } from '../types/ai';
import EmptyTasksIllustration from '../components/illustrations/EmptyTasksIllustration';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { TabParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026, getSeasonalColor } from '../theme/designSystemV2';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import AnimatedButton from '../components/ui/AnimatedButton';
import {
  getDashboardData,
  HarvestMetrics,
  TaskMetrics,
  PlantStatusDistribution,
  RecentActivity,
  GardenGrowthData,
} from '../services/dashboardService';
import { formatTimeSpent, fetchTasks, toggleTaskCompletion } from '../services/taskService';
import { Task } from '../types/task';
import TaskCard from '../components/TaskCard';
import { Learning } from '../types/learning';
import { fetchLearningsForSeason, rateLearning, dismissLearning } from '../services/learningService';
import { getAktuelleSaison, getJahreszeitLabel, getJahreszeit, getZeitraumShortLabel, sortZeitraeume } from '../utils/zeitraumUtils';
import { Zeitraum } from '../types/zeitraum';
import LearningCard from '../components/LearningCard';
import Toast from '../components/Toast';
import GardenGrowthSection from '../components/ui/GardenGrowthSection';
import GamificationBar from '../components/ui/GamificationBar';
import ConfettiCelebration from '../components/ui/ConfettiCelebration';
import PlantQuickViewModal from '../components/ui/PlantQuickViewModal';
import {
  calculateStreak,
  checkAchievements,
  getMotivationMessage,
  getTodayCompletedCount,
  getPlantTaskCardData,
  StreakData,
  Achievement,
} from '../services/gamificationService';
import {
  extractPlantNameFromMotivation,
  filterTasksByMotivation,
} from '../utils/motivationTaskUtils';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

interface DashboardCache {
  harvests: HarvestMetrics;
  tasks: TaskMetrics;
  statusDistribution: PlantStatusDistribution[];
  recentActivity: RecentActivity[];
  gardenGrowth: GardenGrowthData;
  timestamp: number;
}

const CACHE_TTL_MS = 60000;

export default function HomeScreen({ navigation }: Props) {
  const [harvests, setHarvests] = useState<HarvestMetrics>({
    totalHarvests: 0,
    totalByPlant: [],
  });
  const [tasks, setTasks] = useState<TaskMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    avgTimeSpent: 0,
    totalTimeSpent: 0,
  });
  const [statusDistribution, setStatusDistribution] = useState<PlantStatusDistribution[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [gardenGrowth, setGardenGrowth] = useState<GardenGrowthData>({
    plants: [],
    totalTasks: 0,
    completedTasks: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prioritizedTasks, setPrioritizedTasks] = useState<Task[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, bestStreak: 0, lastActiveDate: null });
  const [motivation, setMotivation] = useState('');
  const [motivationPlantId, setMotivationPlantId] = useState<string | undefined>(undefined);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // NEW: Plant task card state
  const [plantTaskMessage, setPlantTaskMessage] = useState('');
  const [plantTaskPlantId, setPlantTaskPlantId] = useState<string | undefined>(undefined);
  const [aiPickerVisible, setAIPickerVisible] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const cacheRef = useRef<DashboardCache | null>(null);

  const saison = getAktuelleSaison();
  const jahreszeit = getJahreszeit(saison);
  const seasonalColor = jahreszeit ? getSeasonalColor(jahreszeit) : getSeasonalColor('spring');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && cacheRef.current &&
        Date.now() - cacheRef.current.timestamp < CACHE_TTL_MS) {
      setHarvests(cacheRef.current.harvests);
      setTasks(cacheRef.current.tasks);
      setStatusDistribution(cacheRef.current.statusDistribution);
      setRecentActivity(cacheRef.current.recentActivity);
      setGardenGrowth(cacheRef.current.gardenGrowth);
      setLoading(false);
      return;
    }

    try {
      if (!forceRefresh) setLoading(true);
      const data = await getDashboardData();

      setHarvests(data.harvests);
      setTasks(data.tasks);
      setStatusDistribution(data.statusDistribution);
      setRecentActivity(data.recentActivity);
      setGardenGrowth(data.gardenGrowth);

      cacheRef.current = {
        ...data,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGamification = useCallback(async () => {
    try {
      const allTasks = await fetchTasks();
      const todayCompletedCount = getTodayCompletedCount(allTasks);
      const streakData = await calculateStreak();
      setStreak(streakData);

      const result = getMotivationMessage(gardenGrowth.plants, todayCompletedCount);
      setMotivation(result.message);
      setMotivationPlantId(result.plantId);

      const allAchievements = await checkAchievements(streakData, gardenGrowth.plants);
      setAchievements(allAchievements);

      // NEW: Load plant task card data
      const plantTaskCardResult = await getPlantTaskCardData(gardenGrowth.plants);
      if (plantTaskCardResult) {
        setPlantTaskMessage(plantTaskCardResult.message);
        setPlantTaskPlantId(plantTaskCardResult.plantId);
      } else {
        setPlantTaskMessage('');
        setPlantTaskPlantId(undefined);
      }
    } catch (error) {
      console.error('Error loading gamification:', error);
    }
  }, [gardenGrowth.plants]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
      loadPrioritizedTasks();
      loadLearnings();
    }, [loadDashboard])
  );

  useEffect(() => {
    if (!loading && gardenGrowth.plants.length > 0) {
      loadGamification();
    }
  }, [loading, gardenGrowth.plants, loadGamification]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadDashboard(true);
      await loadPrioritizedTasks();
      await loadLearnings();
      await loadGamification();
    } finally {
      setRefreshing(false);
    }
  };

  const loadPrioritizedTasks = async () => {
    try {
      const tasks = await fetchTasks();
      const incompleteTasks = tasks.filter(t => !t.completed_at);
      const sortedTasks = incompleteTasks.sort((a, b) => {
        const priorityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      setPrioritizedTasks(sortedTasks.slice(0, 10));
    } catch (error: any) {
      console.error('Error loading prioritized tasks:', error);
    }
  };

  const loadLearnings = async () => {
    try {
      const currentZeitraum = getAktuelleSaison();
      const data = await fetchLearningsForSeason([], currentZeitraum);
      setLearnings(data);
    } catch (error) {
      console.error('Error loading learnings:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
      await loadDashboard(true);
      await loadPrioritizedTasks();
      const streakData = await calculateStreak();
      setStreak(streakData);
      setTimeout(async () => {
        const data = await getDashboardData();
        setGardenGrowth(data.gardenGrowth);
        const allTasks = await fetchTasks();
        const todayCount = getTodayCompletedCount(allTasks);
        const result = getMotivationMessage(data.gardenGrowth.plants, todayCount);
        setMotivation(result.message);
        setMotivationPlantId(result.plantId);
        const allAchievements = await checkAchievements(streakData, data.gardenGrowth.plants);
        setAchievements(allAchievements);
      }, 100);
      setShowConfetti(true);
      showToast('Aufgabe erledigt!', 'success');
    } catch (error: any) {
      console.error('Error toggling task:', error);
      showToast('Fehler beim Aktualisieren', 'error');
    }
  };

  const handleRateLearning = async (id: string, helpful: boolean) => {
    try {
      await rateLearning(id, helpful ? 'helpful' : 'not_helpful');
      await loadLearnings();
      showToast(helpful ? 'Als hilfreich markiert' : 'Als nicht hilfreich markiert', 'success');
    } catch (error) {
      console.error('Error rating learning:', error);
      showToast('Fehler beim Bewerten', 'error');
    }
  };

  const handleDismissLearning = async (id: string) => {
    try {
      await dismissLearning(id);
      await loadLearnings();
      showToast('Tipp verworfen', 'info');
    } catch (error) {
      console.error('Error dismissing learning:', error);
      showToast('Fehler beim Verwerfen', 'error');
    }
  };

  const handlePlantIdentified = (result: PlantIdentificationResult) => {
    showToast(`Pflanze erkannt: ${result.name}`, 'success');
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      geplant: Colors2026.plantStatus.geplant,
      bestellt: Colors2026.plantStatus.bestellt,
      ausgesät: Colors2026.plantStatus.ausgesät,
      pikiert: Colors2026.plantStatus.pikiert,
      ausgepflanzt: Colors2026.plantStatus.ausgepflanzt,
      etabliert: Colors2026.plantStatus.etabliert,
      geerntet: Colors2026.plantStatus.geerntet,
      unklar: Colors2026.plantStatus.unklar,
    };
    return colors[status.toLowerCase()] || Colors2026.textMuted;
  };

  const getStatusLabel = (statusValue: string): string => {
    const statusMap: Record<string, string> = {
      geplant: 'Geplant',
      bestellt: 'Bestellt',
      ausgesät: 'Ausgesät',
      pikiert: 'Pikiert',
      ausgepflanzt: 'Ausgepflanzt',
      etabliert: 'Etabliert',
      geerntet: 'Geerntet',
      unklar: 'Unklar',
    };
    return statusMap[statusValue.toLowerCase()] || statusValue;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'heute';
    if (date.toDateString() === yesterday.toDateString()) return 'gestern';

    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  const isEmpty = harvests.totalHarvests === 0 && tasks.totalTasks === 0;

  return (
    <>
      <ConfettiCelebration
        visible={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors2026.primary} />}
      >
        {/* Glass Header */}
        <BlurView intensity={60} style={[styles.glassHeader, { backgroundColor: seasonalColor.bg }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Guten Tag!</Text>
              <Text style={styles.title}>Dein Garten</Text>
              {jahreszeit && (
                <Text style={[styles.seasonLabel, { color: seasonalColor.accent }]}>
                  {getJahreszeitLabel(jahreszeit)}
                </Text>
              )}
            </View>
            <View style={styles.headerIcon}>
              <Leaf size={32} color={Colors2026.primary} />
            </View>
          </View>
        </BlurView>

        {/* Gamification Bar */}
        <GamificationBar
          streak={streak}
          motivation={motivation}
          achievements={achievements}
          onMotivationPress={() => navigation.navigate('Tasks')}
          pendingTasks={(() => {
            const displayTasks = filterTasksByMotivation(prioritizedTasks, motivation);
            
            console.log('[TASK_FILTER] Result:', {
              plantName: extractPlantNameFromMotivation(motivation),
              totalTasks: prioritizedTasks.length,
              displayCount: displayTasks.length,
            });
            
            return displayTasks.slice(0, 5).map(t => ({
              id: t.id,
              title: t.title,
              plantName: t.linked_plants?.[0]?.name || 'Alle Pflanzen',
              plantId: t.linked_plants?.[0]?.id,
            }));
          })()}
          onToggleTask={handleToggleTask}
          todayCompletedCount={tasks.completedTasks}
          onPlantPress={motivationPlantId ? () => setSelectedPlantId(motivationPlantId) : undefined}
          onTaskPlantPress={(plantId) => setSelectedPlantId(plantId)}
          // NEW: Plant task card props
          showPlantTaskCard={!!plantTaskMessage}
          plantTaskMessage={plantTaskMessage}
          plantTaskPlantId={plantTaskPlantId}
          onPlantTaskPress={(plantId) => setSelectedPlantId(plantId || null)}
        />

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <Pressable style={styles.statsCard} onPress={() => navigation.navigate('GardenOverview')}>
            <View style={styles.statItem}>
              <Sprout size={20} color={Colors2026.primary} />
              <Text style={styles.statValue}>{harvests.totalHarvests}</Text>
              <Text style={styles.statLabel}>Ernten</Text>
            </View>
          </Pressable>

          <Pressable style={styles.statsCard} onPress={() => navigation.navigate('Tasks')}>
            <View style={styles.statItem}>
              <CheckCircle2 size={20} color={Colors2026.primary} />
              <Text style={styles.statValue}>{tasks.completedTasks}/{tasks.totalTasks}</Text>
              <Text style={styles.statLabel}>Aufgaben</Text>
            </View>
          </Pressable>

          <Pressable style={styles.statsCard} onPress={() => navigation.navigate('Plants')}>
            <View style={styles.statItem}>
              <Sparkles size={20} color={Colors2026.primary} />
              <Text style={styles.statValue}>{statusDistribution.length}</Text>
              <Text style={styles.statLabel}>Status</Text>
            </View>
          </Pressable>
        </View>

        {/* Garden Growth */}
        {gardenGrowth.plants.length > 0 && (
          <GardenGrowthSection
            data={gardenGrowth}
            onPlantPress={(plantId) => (navigation as any).navigate('Plants', { screen: 'PlantDetail', params: { plantId } })}
            todayCompletedCount={tasks.completedTasks}
          />
        )}

        {/* Tasks Section - filtered by motivation plant */}
        {(() => {
          let displayTasks: typeof prioritizedTasks = [];
          
          if (motivationPlantId) {
            const plantTasks = prioritizedTasks.filter(t => {
              const taskPlantId = t.linked_plants?.[0]?.id;
              return taskPlantId === motivationPlantId;
            });
            if (plantTasks.length > 0) {
              displayTasks = plantTasks.slice(0, 3);
            }
          } else {
            displayTasks = prioritizedTasks.slice(0, 3);
          }
          
          if (displayTasks.length === 0) {
            return null;
          }
          
          return (
            <View style={styles.section}>
              <SectionHeader
                title="Nächste Aufgaben"
                subtitle={`${displayTasks.length} Aufgaben`}
                icon={<Calendar size={20} color={Colors2026.primary} />}
                animated={true}
              />
              {displayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggleTask(task.id)}
                  onPress={() => {}}
                />
              ))}
              {displayTasks.length > 3 && (
                <Pressable style={styles.viewAllButton} onPress={() => navigation.navigate('Tasks')}>
                  <Text style={styles.viewAllText}>
                    Alle {displayTasks.length} Aufgaben anzeigen
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })()}

        {/* Learnings Section */}
        {learnings.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Tipps für dich"
              subtitle={getJahreszeit(getAktuelleSaison()) ? getJahreszeitLabel(getJahreszeit(getAktuelleSaison())!) : undefined}
              icon={<Flower2 size={20} color={Colors2026.primary} />}
              animated={true}
              delay={100}
            />

            {learnings.slice(0, 2).map((learning, index) => (
              <LearningCard
                key={learning.id}
                learning={learning}
                onRate={(helpful) => handleRateLearning(learning.id, helpful)}
                onDismiss={() => handleDismissLearning(learning.id)}
              />
            ))}
          </View>
        )}

        {/* Status Distribution */}
        {statusDistribution.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Pflanzen-Status"
              icon={<Droplets size={20} color={Colors2026.primary} />}
              animated={true}
              delay={200}
            />

            <GlassCard variant="light">
              <View style={styles.statusList}>
                {statusDistribution.map((item, index) => {
                  const total = statusDistribution.reduce((sum, s) => sum + s.count, 0);
                  const percentage = Math.round((item.count / total) * 100);
                  const color = getStatusColor(item.status);

                  return (
                    <View key={index} style={styles.statusRow}>
                      <StatusBadge status={item.status} label={getStatusLabel(item.status)} size="sm" />
                      <View style={styles.statusBar}>
                        <View style={[styles.statusBarFill, { backgroundColor: color, width: `${percentage}%` }]} />
                      </View>
                      <Text style={styles.statusCount}>{item.count}</Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </View>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Letzte Aktivitäten"
              icon={<Clock size={20} color={Colors2026.primary} />}
              animated={true}
              delay={300}
            />

            {recentActivity.slice(0, 5).map((activity, index) => (
              <GlassCard key={index} variant="light">
                <View style={styles.activityRow}>
                  <View style={styles.activityIcon}>
                    {activity.type === 'harvest' ? (
                      <Sprout size={16} color={Colors2026.plantStatus.geerntet} />
                    ) : (
                      <CheckCircle2 size={16} color={Colors2026.status.success} />
                    )}
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title}</Text>
                    {activity.detail && (
                      <Text style={styles.activityDetail} numberOfLines={1}>
                        {activity.detail}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Empty State */}
        {isEmpty && (
          <EmptyState
            icon={<EmptyTasksIllustration />}
            title="Willkommen!"
            subtitle="Füge Pflanzen, Aufgaben oder Ernten hinzu, um loszulegen"
            action={
              <AnimatedButton
                title="Pflanze hinzufügen"
                onPress={() => navigation.navigate('Plants')}
                variant="primary"
              />
            }
          />
        )}

        <View style={styles.spacer} />
      </ScrollView>

      <Pressable style={styles.aiFab} onPress={() => setAIPickerVisible(true)}>
        <Camera size={24} color="#fff" />
      </Pressable>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={() => setToast(prev => ({ ...prev, visible: false }))}
      />

      <AIPhotoPicker
        visible={aiPickerVisible}
        onClose={() => setAIPickerVisible(false)}
        onPlantIdentified={handlePlantIdentified}
        onPlantCreated={(plantId) => {
          setAIPickerVisible(false);
          (navigation as any).navigate('Plants', { screen: 'PlantDetail', params: { plantId } });
        }}
      />

      <PlantQuickViewModal
        visible={!!selectedPlantId}
        plantId={selectedPlantId}
        onClose={() => setSelectedPlantId(null)}
        onViewDetails={(plantId) => {
          setSelectedPlantId(null);
          (navigation as any).navigate('Plants', { screen: 'PlantDetail', params: { plantId } });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
  },
  content: {
    paddingBottom: Spacing2026.xxxl * 2,
  },
  glassHeader: {
    paddingTop: 60,
    paddingBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    letterSpacing: -0.2,
    marginBottom: Spacing2026.xs,
  },
  title: {
    fontSize: Typography2026.display.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -1.5,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
    padding: Spacing2026.xl,
  },
  statsCard: {
    flex: 1,
    backgroundColor: Colors2026.glass.tint,
    borderRadius: Radius2026.lg,
    borderWidth: 1,
    borderColor: 'rgba(45,157,79,0.15)',
    paddingVertical: Spacing2026.md,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing2026.xs,
  },
  statValue: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
  },
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  viewAllButton: {
    paddingVertical: Spacing2026.md,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  statusList: {
    gap: Spacing2026.md,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  statusBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors2026.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusCount: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    minWidth: 24,
    textAlign: 'right',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors2026.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  activityDetail: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    marginTop: 2,
  },
  activityDate: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
  },
  spacer: {
    height: 20,
  },
  seasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  aiFab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors2026.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows2026.lg,
  },
});
