import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { TabParamList } from '../types/navigation';
import Colors from '../theme/colors';
import MetricCard from '../components/MetricCard';
import ProgressBar from '../components/ProgressBar';
import {
  getDashboardData,
  HarvestMetrics,
  TaskMetrics,
  PlantStatusDistribution,
  RecentActivity,
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

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

interface DashboardCache {
  harvests: HarvestMetrics;
  tasks: TaskMetrics;
  statusDistribution: PlantStatusDistribution[];
  recentActivity: RecentActivity[];
  timestamp: number;
}

const CACHE_TTL_MS = 60000; // 60 seconds

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [prioritizedTasks, setPrioritizedTasks] = useState<Task[]>([]);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' | 'info' }>({
    visible: false,
    message: '',
    type: 'success',
  });
  
  // PERFORMANCE FIX: Dashboard data cache
  const cacheRef = useRef<DashboardCache | null>(null);
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    // PERFORMANCE FIX: Return cached data if valid
    if (!forceRefresh && cacheRef.current && 
        Date.now() - cacheRef.current.timestamp < CACHE_TTL_MS) {
      setHarvests(cacheRef.current.harvests);
      setTasks(cacheRef.current.tasks);
      setStatusDistribution(cacheRef.current.statusDistribution);
      setRecentActivity(cacheRef.current.recentActivity);
      setLoading(false);
      return;
    }

    try {
      if (!forceRefresh) setLoading(true);
      const data = await getDashboardData();
      
      // Update state
      setHarvests(data.harvests);
      setTasks(data.tasks);
      setStatusDistribution(data.statusDistribution);
      setRecentActivity(data.recentActivity);
      
      // Update cache
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

  // Load dashboard data on focus - only refresh if cache is stale
  useFocusEffect(
    useCallback(() => {
      loadDashboard();
      loadPrioritizedTasks();
      loadLearnings();
    }, [loadDashboard])
  );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      // Force refresh to bypass cache
      await loadDashboard(true);
      await loadPrioritizedTasks();
      await loadLearnings();
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
      await loadPrioritizedTasks();
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

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      geplant: Colors.statusGeplant,
      bestellt: Colors.statusBestellt,
      ausgesät: Colors.statusAusgesaet,
      pikiert: Colors.statusPikiert,
      ausgepflanzt: Colors.statusAusgepflanzt,
      etabliert: Colors.statusEtabliert,
      geerntet: Colors.statusGeerntet,
      unklar: Colors.statusUnklar,
    };
    return colors[status.toLowerCase()] || Colors.textLight;
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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gartenplaner</Text>
        <Text style={styles.subtitle}>Dashboard</Text>
      </View>

      {/* Harvest Summary Card */}
      {(harvests.totalHarvests > 0 || harvests.totalByPlant.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ernte-Übersicht</Text>

          <View style={styles.metricsGrid}>
            <MetricCard
              title="Gesamte Ernten"
              value={harvests.totalHarvests}
              icon="agriculture"
              color="#F44336"
              style={styles.metricCard}
            />
          </View>

          {harvests.totalByPlant.length > 0 && (
            <View style={styles.topPlantsContainer}>
              <Text style={styles.topPlantsTitle}>Top Pflanzen nach Ertrag</Text>
              {harvests.totalByPlant.map((plant, index) => (
                <View key={index} style={styles.plantYield}>
                  <Text style={styles.plantYieldName}>{plant.plantName}</Text>
                  <Text style={styles.plantYieldValue}>
                    {plant.quantity.toFixed(1)} {plant.unit}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Task Completion Card */}
      {tasks.totalTasks > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aufgaben-Status</Text>

          <View style={styles.metricsGrid}>
            <MetricCard
              title="Abgeschlossen"
              value={`${tasks.completedTasks}/${tasks.totalTasks}`}
              icon="check-circle"
              color={Colors.success}
              style={styles.metricCard}
            />
            {tasks.avgTimeSpent > 0 && (
              <MetricCard
                title="Durchschn. Zeit"
                value={`${Math.round(tasks.avgTimeSpent)}m`}
                subtitle={`${formatTimeSpent(tasks.totalTimeSpent)} gesamt`}
                icon="timer"
                color={Colors.info}
                style={styles.metricCard}
              />
            )}
          </View>

          <ProgressBar
            percentage={tasks.completionRate}
            label="Abschlussquote"
            color={Colors.success}
            style={styles.progressBar}
          />
        </View>
      )}

      {/* Nächste Aufgaben - Organized by Zeitraum */}
      {prioritizedTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nächste Aufgaben</Text>
          
          {(() => {
            const aktuellerZeitraum = getAktuelleSaison();
            
            const getTaskZeitraum = (task: Task): Zeitraum => {
              if (task.zeitraum) return task.zeitraum as Zeitraum;
              return Zeitraum.FLEXIBEL;
            };
            
            const groupedByZeitraum = prioritizedTasks.reduce((acc, task) => {
              const z = getTaskZeitraum(task);
              if (!acc[z]) acc[z] = [];
              acc[z].push(task);
              return acc;
            }, {} as Record<Zeitraum, Task[]>);
            
            const sortedZeitraeume = sortZeitraeume(Object.keys(groupedByZeitraum) as Zeitraum[]);
            const priorityOrder = { hoch: 0, mittel: 1, niedrig: 2 };
            
            return sortedZeitraeume.map(zeitraum => {
              const tasksInZeitraum = groupedByZeitraum[zeitraum]
                .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
              
              const isCurrent = zeitraum === aktuellerZeitraum;
              
              return (
                <View key={zeitraum} style={styles.priorityGroup}>
                  <View style={styles.zeitraumGroupHeader}>
                    <Text style={[styles.priorityLabel, isCurrent && styles.currentZeitraumLabel]}>
                      <MaterialIcons 
                        name="circle" 
                        size={10} 
                        color={isCurrent ? Colors.primary : Colors.textLight} 
                      /> 
                      {isCurrent ? 'Jetzt: ' : ''}{getZeitraumShortLabel(zeitraum)}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.currentBadge}>Aktiv</Text>
                    )}
                  </View>
                  {tasksInZeitraum.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => handleToggleTask(task.id)}
                      onPress={() => {}}
                    />
                  ))}
                </View>
              );
            });
          })()}
        </View>
      )}

      {/* Learnings Section */}
      {learnings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Tipps für {getJahreszeitLabel(getJahreszeit(getAktuelleSaison()))}
          </Text>
          {learnings.map(learning => (
            <LearningCard
              key={learning.id}
              learning={learning}
              onRate={(helpful) => handleRateLearning(learning.id, helpful)}
              onDismiss={() => handleDismissLearning(learning.id)}
            />
          ))}
        </View>
      )}

      {/* Plant Status Distribution */}
      {statusDistribution.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Pflanzen-Status</Text>

          <View style={styles.statusDistribution} accessibilityRole="list" aria-label="Pflanzen nach Status">
            {statusDistribution.map((item, index) => {
              const total = statusDistribution.reduce((sum, s) => sum + s.count, 0);
              const percentage = Math.round((item.count / total) * 100);
              return (
                <View key={index} style={styles.statusItem} accessibilityRole="listitem">
                  <View style={styles.statusHeader}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                    <Text style={styles.statusLabel}>{getStatusLabel(item.status)}</Text>
                    <Text style={styles.statusCount}>{item.count}</Text>
                    <Text style={styles.statusPercentage}>{percentage}%</Text>
                  </View>
                  <View style={styles.statusBarContainer}>
                    <View
                      style={[
                        styles.statusBarTrack,
                        { backgroundColor: getStatusColor(item.status) + '15' },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusBarFill,
                          {
                            backgroundColor: getStatusColor(item.status),
                            width: `${percentage}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Letzte Aktivitäten</Text>

          {recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MaterialIcons
                  name={activity.type === 'harvest' ? 'agriculture' : 'check-circle'}
                  size={18}
                  color={
                    activity.type === 'harvest' ? '#F44336' : Colors.success
                  }
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                {activity.detail && (
                  <Text style={styles.activityDetail} numberOfLines={2}>
                    {activity.detail}
                  </Text>
                )}
              </View>
              <Text style={styles.activityDate}>{formatDate(activity.date)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Empty State */}
      {harvests.totalHarvests === 0 && tasks.totalTasks === 0 && (
        <View style={styles.emptyState} accessibilityLabel="Keine Daten vorhanden. Fügen Sie Pflanzen, Aufgaben oder Ernten hinzu.">
          <MaterialIcons
            name="dashboard"
            size={48}
            color={Colors.textLight}
          />
          <Text style={styles.emptyStateText}>Keine Daten vorhanden</Text>
          <Text style={styles.emptyStateSubtext}>
            Starten Sie mit dem Hinzufügen von Pflanzen, Aufgaben oder Ernten
          </Text>
        </View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />
    </ScrollView>

    <Toast
      visible={toast.visible}
      message={toast.message}
      type={toast.type}
      onHide={() => setToast(prev => ({ ...prev, visible: false }))}
    />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
  },
  topPlantsContainer: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topPlantsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 10,
  },
  plantYield: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  plantYieldName: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  plantYieldValue: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  progressBar: {
    marginTop: 12,
  },
  statusDistribution: {
    gap: 12,
  },
  statusItem: {
    marginBottom: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusLabel: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginRight: 8,
    minWidth: 24,
    textAlign: 'right',
  },
  statusPercentage: {
    fontSize: 12,
    color: Colors.textLight,
    minWidth: 40,
    textAlign: 'right',
  },
  statusBarContainer: {
    marginLeft: 18,
  },
  statusBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  statusBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  activityDetail: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  activityDate: {
    fontSize: 11,
    color: Colors.textLight,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 200,
  },
  spacer: {
    height: 20,
  },
  priorityGroup: {
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zeitraumGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  currentZeitraumLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
  currentBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primaryLight + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
});
