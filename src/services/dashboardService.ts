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

export interface PlantTaskProgress {
  plantId: string;
  plantName: string;
  plantStatus: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  allDone: boolean;
}

export interface GardenGrowthData {
  plants: PlantTaskProgress[];
  totalTasks: number;
  completedTasks: number;
  overallProgress: number;
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
        detail: h.notes ?? undefined,
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
      const plantName = t.linked_plants?.[0]?.name;
      activities.push({
        type: 'task',
        title: `Aufgabe abgeschlossen: ${t.title}`,
        date: t.completed_at || new Date().toISOString(),
        detail: plantName ? `${plantName}${t.description ? ` - ${t.description}` : ''}` : t.description,
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
 * Get plant task progress for garden growth visualization
 */
export async function getPlantTaskProgress(): Promise<GardenGrowthData> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Fetch plants with their linked tasks in one query
    const { data, error } = await supabase
      .from('plants')
      .select(`
        id,
        name,
        status,
        plant_tasks(
          tasks(
            id,
            completed_at
          )
        )
      `)
      .eq('user_id', user.id)
      .neq('status', 'entfernt')
      .order('name', { ascending: true });

    if (error) throw error;

    const plants: PlantTaskProgress[] = (data || [])
      .map((plant: any) => {
        const taskLinks = plant.plant_tasks || [];
        const totalTasks = taskLinks.length;
        const completedTasks = taskLinks.filter(
          (pt: any) => pt.tasks?.completed_at
        ).length;
        const completionRate = totalTasks > 0
          ? Math.round((completedTasks / totalTasks) * 100)
          : 0;

        return {
          plantId: plant.id,
          plantName: plant.name,
          plantStatus: plant.status || 'unklar',
          totalTasks,
          completedTasks,
          completionRate,
          allDone: totalTasks > 0 && completedTasks === totalTasks,
        };
      })
      // Only show plants that have tasks
      .filter((p) => p.totalTasks > 0)
      // Sort: incomplete first, then by completion rate descending
      .sort((a, b) => {
        if (a.allDone !== b.allDone) return a.allDone ? 1 : -1;
        return b.completionRate - a.completionRate;
      });

    const totalTasks = plants.reduce((sum, p) => sum + p.totalTasks, 0);
    const completedTasks = plants.reduce((sum, p) => sum + p.completedTasks, 0);
    const overallProgress = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    return { plants, totalTasks, completedTasks, overallProgress };
  } catch (error: any) {
    console.error('Error getting plant task progress:', error);
    return { plants: [], totalTasks: 0, completedTasks: 0, overallProgress: 0 };
  }
}

/**
 * Get all dashboard data in one call
 */
export async function getDashboardData() {
  try {
    const [harvests, tasks, statusDistribution, recentActivity, gardenGrowth] = await Promise.all([
      getHarvestMetrics(),
      getTaskMetrics(),
      getPlantStatusDistribution(),
      getRecentActivity(5),
      getPlantTaskProgress(),
    ]);

    return {
      harvests,
      tasks,
      statusDistribution,
      recentActivity,
      gardenGrowth,
    };
  } catch (error: any) {
    console.error('Error getting dashboard data:', error);
    return {
      harvests: { totalHarvests: 0, totalByPlant: [] },
      tasks: { totalTasks: 0, completedTasks: 0, completionRate: 0, avgTimeSpent: 0, totalTimeSpent: 0 },
      statusDistribution: [],
      recentActivity: [],
      gardenGrowth: { plants: [], totalTasks: 0, completedTasks: 0, overallProgress: 0 },
    };
  }
}
