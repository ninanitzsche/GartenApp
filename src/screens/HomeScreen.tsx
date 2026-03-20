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
import { learningService } from '../services/learningService';
import { getAktuelleSaison, getJahreszeitLabel, getJahreszeit } from '../utils/zeitraumUtils';
import LearningCard from '../components/LearningCard';

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
  
  // PERFORMANCE FIX: Dashboard data cache
  const cacheRef = useRef<DashboardCache | null>(null);

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
      const data = await learningService.getLearningsForSeason([], currentZeitraum);
      setLearnings(data);
    } catch (error) {
      console.error('Error loading learnings:', error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTaskCompletion(taskId);
      await loadPrioritizedTasks();
    } catch (error: any) {
      console.error('Error toggling task:', error);
    }
  };

  const handleRateLearning = async (id: string, helpful: boolean) => {
    try {
      await learningService.rateLearning(id, helpful ? 'helpful' : 'not_helpful');
      await loadLearnings();
    } catch (error) {
      console.error('Error rating learning:', error);
    }
  };

  const handleDismissLearning = async (id: string) => {
    try {
      await learningService.dismissLearning(id);
      await loadLearnings();
    } catch (error) {
      console.error('Error dismissing learning:', error);
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

      {/* Prioritized Tasks */}
      {prioritizedTasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Priorisierte Aufgaben</Text>

          {prioritizedTasks.filter(t => t.priority === 'hoch').length > 0 && (
            <View style={styles.priorityGroup}>
              <Text style={styles.priorityLabel}>
                <MaterialIcons name="circle" size={10} color={Colors.priorityHigh} /> Hohe Priorität
              </Text>
              {prioritizedTasks
                .filter(t => t.priority === 'hoch')
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                    onPress={() => {}}
                  />
                ))}
            </View>
          )}

          {prioritizedTasks.filter(t => t.priority === 'mittel').length > 0 && (
            <View style={styles.priorityGroup}>
              <Text style={styles.priorityLabel}>
                <MaterialIcons name="circle" size={10} color={Colors.priorityMedium} /> Mittlere Priorität
              </Text>
              {prioritizedTasks
                .filter(t => t.priority === 'mittel')
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                    onPress={() => {}}
                  />
                ))}
            </View>
          )}

          {prioritizedTasks.filter(t => t.priority === 'niedrig').length > 0 && (
            <View style={styles.priorityGroup}>
              <Text style={styles.priorityLabel}>
                <MaterialIcons name="circle" size={10} color={Colors.textLight} /> Niedrige Priorität
              </Text>
              {prioritizedTasks
                .filter(t => t.priority === 'niedrig')
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                    onPress={() => {}}
                  />
                ))}
            </View>
          )}
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
          <Text style={styles.sectionTitle}>Pflanzen-Status</Text>

          <View style={styles.statusDistribution}>
            {statusDistribution.map((item, index) => (
              <View key={index} style={styles.statusItem}>
                <View
                  style={[
                    styles.statusBar,
                    { backgroundColor: getStatusColor(item.status) + '20' },
                  ]}
                >
                  <View
                    style={[
                      styles.statusBarFill,
                      {
                        backgroundColor: getStatusColor(item.status),
                        // Calculate width based on total plants
                        width: `${Math.round((item.count / statusDistribution.reduce((sum, s) => sum + s.count, 0)) * 100)}%`
                      },
                    ]}
                  />
                </View>
                <Text style={styles.statusLabel}>
                  {getStatusLabel(item.status)} ({item.count})
                </Text>
              </View>
            ))}
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
    gap: 10,
  },
  statusItem: {
    gap: 6,
  },
  statusBar: {
    height: 24,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusBarFill: {
    height: '100%',
  },
  statusLabel: {
    fontSize: 11,
    color: Colors.textLight,
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
});
