/**
 * Dashboard Service
 * Aggregates metrics from multiple data sources for dashboard display
 */

import { fetchTasks } from './taskService';
import { getRecentHarvests } from './harvestService';
import { supabase } from './supabase';

export interface HarvestMetrics {
  totalHarvests: number;
  totalByPlant: Array<{ plantName: string; quantity: number; unit: string }>;
}

export interface TaskMetrics {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  avgTimeSpent: number;
  totalTimeSpent: number;
}

export interface PlantStatusDistribution {
  status: string;
  count: number;
}

export interface RecentActivity {
  type: 'harvest' | 'task';
  title: string;
  date: string;
  detail?: string;
}

/**
 * Get harvest metrics for dashboard
 */
export async function getHarvestMetrics(): Promise<HarvestMetrics> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('harvests')
      .select('plant_id, quantity, unit, plants(name)')
      .eq('user_id', user.id);

    if (error) throw error;

    const harvests = (data || []) as any[];
    const totalHarvests = harvests.length;

    // Group by plant name
    const byPlant: Record<string, { quantity: number; unit: string }> = {};
    harvests.forEach((h) => {
      const plantName = h.plants?.name || 'Unknown';
      if (!byPlant[plantName]) {
        byPlant[plantName] = { quantity: 0, unit: h.unit };
      }
      byPlant[plantName].quantity += h.quantity;
    });

    const totalByPlant = Object.entries(byPlant)
      .map(([plantName, data]) => ({
        plantName,
        quantity: parseFloat(data.quantity.toFixed(2)),
        unit: data.unit,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    return { totalHarvests, totalByPlant };
  } catch (error: any) {
    console.error('Error getting harvest metrics:', error);
    return { totalHarvests: 0, totalByPlant: [] };
  }
}

/**
 * Get task metrics for dashboard
 */
export async function getTaskMetrics(): Promise<TaskMetrics> {
  try {
    const tasks = await fetchTasks();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed_at).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate average time spent on completed tasks
    const tasksWithTime = tasks.filter((t) => t.time_spent_minutes && t.time_spent_minutes > 0);
    const totalTimeSpent = tasksWithTime.reduce((sum, t) => sum + (t.time_spent_minutes || 0), 0);
    const avgTimeSpent = tasksWithTime.length > 0 ? totalTimeSpent / tasksWithTime.length : 0;

    return {
      totalTasks,
      completedTasks,
      completionRate: parseFloat(completionRate.toFixed(1)),
      avgTimeSpent: parseFloat(avgTimeSpent.toFixed(0)),
      totalTimeSpent,
    };
  } catch (error: any) {
    console.error('Error getting task metrics:', error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      avgTimeSpent: 0,
      totalTimeSpent: 0,
    };
  }
}

/**
 * Get plant status distribution
 */
export async function getPlantStatusDistribution(): Promise<PlantStatusDistribution[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plants')
      .select('status')
      .eq('user_id', user.id);

    if (error) throw error;

    const plants = (data || []) as any[];
    const distribution: Record<string, number> = {};

    plants.forEach((p) => {
      const status = p.status || 'unbekannt';
      distribution[status] = (distribution[status] || 0) + 1;
    });

    return Object.entries(distribution)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  } catch (error: any) {
    console.error('Error getting plant status distribution:', error);
    return [];
  }
}

/**
 * Get recent activity (harvests + completed tasks)
 */
export async function getRecentActivity(limit: number = 5): Promise<RecentActivity[]> {
  try {
    const activities: RecentActivity[] = [];

    // Get recent harvests
    const harvests = await getRecentHarvests(limit);
    harvests.forEach((h) => {
      activities.push({
        type: 'harvest',
        title: `${h.quantity} ${h.unit} von ${h.plant_name} geerntet`,
        date: h.harvest_date,
        detail: h.notes,
      });
    });

    // Get completed tasks
    const tasks = await fetchTasks();
    const completedTasks = tasks
      .filter((t) => t.completed_at)
      .sort((a, b) => {
        const dateA = new Date(a.completed_at || '').getTime();
        const dateB = new Date(b.completed_at || '').getTime();
        return dateB - dateA;
      })
      .slice(0, limit);

    completedTasks.forEach((t) => {
      activities.push({
        type: 'task',
        title: `Aufgabe abgeschlossen: ${t.title}`,
        date: t.completed_at || new Date().toISOString(),
        detail: t.description,
      });
    });

    // Sort by date descending and return top N
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  } catch (error: any) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

/**
 * Get all dashboard data in one call
 */
export async function getDashboardData() {
  try {
    const [harvests, tasks, statusDistribution, recentActivity] = await Promise.all([
      getHarvestMetrics(),
      getTaskMetrics(),
      getPlantStatusDistribution(),
      getRecentActivity(5),
    ]);

    return {
      harvests,
      tasks,
      statusDistribution,
      recentActivity,
    };
  } catch (error: any) {
    console.error('Error getting dashboard data:', error);
    return {
      harvests: { totalHarvests: 0, totalByPlant: [] },
      tasks: { totalTasks: 0, completedTasks: 0, completionRate: 0, avgTimeSpent: 0, totalTimeSpent: 0 },
      statusDistribution: [],
      recentActivity: [],
    };
  }
}
