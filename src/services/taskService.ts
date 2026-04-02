/**
 * Task CRUD Service
 * Handles all database operations for tasks
 * Follows Service Layer Pattern from plantService.ts
 */
import { supabase } from './supabase';
import { Task, TaskFormData, TaskListItem } from '../types/task';
import { Plant } from '../types/plant';

/**
 * Fetch all tasks for current user
 * Sorted by priority (hoch → mittel → niedrig), then created_at
 * OPTIMIZED: Uses JOIN to avoid N+1 queries
 */
export async function fetchTasks(): Promise<TaskListItem[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Fetch tasks with linked plant names in a single query using JOIN
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        plant_tasks(
          plants(
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Transform data to include plant_names (single query, no N+1)
    return (data || []).map((task: any): TaskListItem => {
      const linkedPlants = task.plant_tasks || [];
      const plant_names = linkedPlants
        .map((pt: any) => pt.plants?.name)
        .filter(Boolean)
        .sort();
      
      const linked_plants = linkedPlants
        .map((pt: any) => pt.plants)
        .filter(Boolean);

      return {
        ...task,
        plant_names,
        linked_plants,
      };
    });
  } catch (error: any) {
    throw new Error(`Error fetching tasks: ${error.message}`);
  }
}

/**
 * Fetch single task by ID with linked plants
 * OPTIMIZED: Uses JOIN to avoid N+1 queries
 */
export async function fetchTask(taskId: string): Promise<TaskListItem | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        plant_tasks(
          plants(
            id,
            name
          )
        )
      `)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const task: any = data;
    const linkedPlants = task.plant_tasks || [];
    const plant_names = linkedPlants
      .map((pt: any) => pt.plants?.name)
      .filter(Boolean)
      .sort();
    const linked_plants = linkedPlants
      .map((pt: any) => pt.plants)
      .filter(Boolean);

    return {
      ...task,
      plant_names,
      linked_plants,
    };
  } catch (error: any) {
    throw new Error(`Error fetching task: ${error.message}`);
  }
}

/**
 * Create new task
 */
export async function createTask(formData: TaskFormData): Promise<Task> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Validate required fields
    if (!formData.title || formData.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    if (formData.title.length < 3) {
      throw new Error('Task title must be at least 3 characters');
    }

    // Insert task
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category: formData.category,
        priority: formData.priority,
        location: formData.location || null,
        time_spent_minutes: formData.time_spent_minutes || null,
        zeitraum: formData.zeitraum || null,
        source: 'ai',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to create task');

    const task = data[0] as Task;

    // Link plants if provided
    if (formData.plant_ids && formData.plant_ids.length > 0) {
      await linkPlantsToTask(task.id, formData.plant_ids);
    }

    return task;
  } catch (error: any) {
    throw new Error(`Error creating task: ${error.message}`);
  }
}

/**
 * Update existing task
 */
export async function updateTask(taskId: string, formData: TaskFormData): Promise<Task> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Validate required fields
    if (!formData.title || formData.title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    // Update task
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        category: formData.category,
        priority: formData.priority,
        location: formData.location || null,
        time_spent_minutes: formData.time_spent_minutes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to update task');

    const task = data[0] as Task;

    // Update plant links
    // First remove all existing links
    await supabase
      .from('plant_tasks')
      .delete()
      .eq('task_id', taskId);

    // Then add new links
    if (formData.plant_ids && formData.plant_ids.length > 0) {
      await linkPlantsToTask(taskId, formData.plant_ids);
    }

    return task;
  } catch (error: any) {
    throw new Error(`Error updating task: ${error.message}`);
  }
}

/**
 * Delete task and its plant links
 */
export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Delete plant links first
    const { error: linkError } = await supabase
      .from('plant_tasks')
      .delete()
      .eq('task_id', taskId);

    if (linkError) throw linkError;

    // Delete task
    const { error: taskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (taskError) throw taskError;
  } catch (error: any) {
    throw new Error(`Error deleting task: ${error.message}`);
  }
}

/**
 * Link plants to task
 */
export async function linkPlantsToTask(taskId: string, plantIds: string[]): Promise<void> {
  try {
    if (plantIds.length === 0) return;

    const links = plantIds.map((plantId) => ({
      task_id: taskId,
      plant_id: plantId,
    }));

    const { error } = await supabase
      .from('plant_tasks')
      .insert(links);

    if (error) throw error;
  } catch (error: any) {
    throw new Error(`Error linking plants to task: ${error.message}`);
  }
}

/**
 * Unlink all plants from task
 */
export async function unlinkPlantsFromTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('plant_tasks')
      .delete()
      .eq('task_id', taskId);

    if (error) throw error;
  } catch (error: any) {
    throw new Error(`Error unlinking plants from task: ${error.message}`);
  }
}

/**
 * Fetch plants for task linking
 */
export async function fetchPlantsForSelection(): Promise<Plant[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []) as Plant[];
  } catch (error: any) {
    throw new Error(`Error fetching plants: ${error.message}`);
  }
}

/**
 * Fetch tasks for a specific bed (via linked plants)
 */
export async function fetchTasksByBed(bedId: string): Promise<TaskListItem[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // First get plant IDs for this bed
    const { data: bedPlants, error: bedError } = await supabase
      .from('bed_plants')
      .select('plant_id')
      .eq('bed_id', bedId);

    if (bedError) throw bedError;
    if (!bedPlants || bedPlants.length === 0) return [];

    const plantIds = bedPlants.map(bp => bp.plant_id);

    // Then get tasks linked to those plants
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        plant_tasks!inner(
          plant_id,
          plants(
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .in('plant_tasks.plant_id', plantIds)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Deduplicate tasks (same task might be linked to multiple plants in the bed)
    const uniqueTasks = new Map<string, TaskListItem>();
    
    for (const task of data || []) {
      if (!uniqueTasks.has(task.id)) {
        const linkedPlants = task.plant_tasks || [];
        const plant_names = linkedPlants
          .map((pt: any) => pt.plants?.name)
          .filter(Boolean)
          .sort();
        
        const linked_plants = linkedPlants
          .map((pt: any) => pt.plants)
          .filter(Boolean);

        uniqueTasks.set(task.id, {
          ...task,
          plant_names,
          linked_plants,
        });
      }
    }

    return Array.from(uniqueTasks.values());
  } catch (error: any) {
    throw new Error(`Error fetching tasks by bed: ${error.message}`);
  }
}

/**
 * Fetch tasks for a specific plant
 */
export async function fetchTasksByPlant(plantId: string): Promise<TaskListItem[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        plant_tasks!inner(
          plant_id,
          plants(
            id,
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('plant_tasks.plant_id', plantId)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map((task: any): TaskListItem => {
      const linkedPlants = task.plant_tasks || [];
      const plant_names = linkedPlants
        .map((pt: any) => pt.plants?.name)
        .filter(Boolean)
        .sort();
      
      const linked_plants = linkedPlants
        .map((pt: any) => pt.plants)
        .filter(Boolean);

      return {
        ...task,
        plant_names,
        linked_plants,
      };
    });
  } catch (error: any) {
    throw new Error(`Error fetching tasks by plant: ${error.message}`);
  }
}

/**
 * Get linked plants for a task
 */
export async function getTaskPlants(taskId: string): Promise<Plant[]> {
  try {
    const { data, error } = await supabase
      .from('plant_tasks')
      .select('plant_id, plants(*)')
      .eq('task_id', taskId);

    if (error) throw error;

    return (data || [])
      .filter((link: any) => link.plants)
      .map((link: any) => link.plants as Plant);
  } catch (error: any) {
    throw new Error(`Error fetching task plants: ${error.message}`);
  }
}

/**
 * Enrich task with plant names
 */
async function enrichTaskWithPlantNames(task: Task): Promise<TaskListItem> {
  try {
    const plants = await getTaskPlants(task.id);
    const plant_names = plants.map((p) => p.name).sort();

    return {
      ...task,
      plant_names,
      linked_plants: plants,
    };
  } catch (error) {
    // Return task with empty plant names on error
    return {
      ...task,
      plant_names: [],
      linked_plants: [],
    };
  }
}

/**
 * Toggle task completion status
 */
export async function toggleTaskCompletion(taskId: string): Promise<Task> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    // Fetch current task to check completion status
    const { data: currentTask, error: fetchError } = await supabase
      .from('tasks')
      .select('completed_at')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;
    if (!currentTask) throw new Error('Task not found');

    // Toggle: if completed, mark incomplete (null), else mark complete (now)
    const newCompletedAt = currentTask.completed_at === null
      ? new Date().toISOString()
      : null;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        completed_at: newCompletedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to update task');

    return data[0] as Task;
  } catch (error: any) {
    throw new Error(`Error toggling task completion: ${error.message}`);
  }
}

/**
 * Mark task as complete
 */
export async function markTaskComplete(taskId: string): Promise<Task> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .update({
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to complete task');

    return data[0] as Task;
  } catch (error: any) {
    throw new Error(`Error completing task: ${error.message}`);
  }
}

/**
 * Mark task as incomplete
 */
export async function markTaskIncomplete(taskId: string): Promise<Task> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .update({
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) throw new Error('Failed to reopen task');

    return data[0] as Task;
  } catch (error: any) {
    throw new Error(`Error reopening task: ${error.message}`);
  }
}

/**
 * Get category color - 2026 Style
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Aussaat': '#2D4739',      // Waldgrün
    'Pflanzen': '#4A6FA5',    // Blau
    'Gartenarbeiten': '#8D5B3E', // Terracotta
    'Beobachten': '#006064',   // Teal
    'Ernten': '#8D5B3E',       // Terracotta (wärmer)
  };
  return colors[category] || '#8A8A8A';
}

/**
 * Get priority color - 2026 Style, klar unterscheidbar
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'hoch':
      return '#D32F2F'; // Kräftiges Rot - sofort sichtbar
    case 'mittel':
      return '#F57C00'; // Kräftiges Orange - mittlere Dringlichkeit
    case 'niedrig':
      return '#5A7A7A'; // Blau-Grau - klar niedrig
    default:
      return '#8A8A8A';
  }
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    'hoch': 'Hoch',
    'mittel': 'Mittel',
    'niedrig': 'Niedrig',
  };
  return labels[priority] || 'Unbekannt';
}

/**
 * Get priority numeric value for sorting
 */
export function getPriorityValue(priority: string): number {
  const values: Record<string, number> = {
    'hoch': 3,
    'mittel': 2,
    'niedrig': 1,
  };
  return values[priority] || 0;
}

/**
 * Get sort label for display
 */
export function getSortLabel(sortBy: string): string {
  const labels: Record<string, string> = {
    'priority': 'Nach Priorität',
    'created_at': 'Nach Erstellungsdatum',
    'category': 'Nach Kategorie',
    'title': 'Nach Titel',
    'month': 'Nach Monat',
  };
  return labels[sortBy] || 'Sortierung';
}

/**
 * Get current season based on month
 */
export function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'Frühling';
  if (month >= 6 && month <= 8) return 'Sommer';
  if (month >= 9 && month <= 11) return 'Herbst';
  return 'Winter';
}

/**
 * Get season from scheduled_date
 */
export function getSeasonFromDate(dateStr: string | null): string {
  if (!dateStr) return 'Unbekannt';
  const month = new Date(dateStr).getMonth() + 1;
  if (month >= 3 && month <= 5) return 'Frühling';
  if (month >= 6 && month <= 8) return 'Sommer';
  if (month >= 9 && month <= 11) return 'Herbst';
  return 'Winter';
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(scheduledDate: string | null): boolean {
  if (!scheduledDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(scheduledDate);
  return scheduled < today;
}

/**
 * Check if task is due this week
 */
export function isTaskDueThisWeek(scheduledDate: string | null): boolean {
  if (!scheduledDate) return false;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  const scheduled = new Date(scheduledDate);
  return scheduled >= monday && scheduled <= sunday;
}

/**
 * Check if task is due next week
 */
export function isTaskDueNextWeek(scheduledDate: string | null): boolean {
  if (!scheduledDate) return false;
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  
  const followingSunday = new Date(nextMonday);
  followingSunday.setDate(nextMonday.getDate() + 6);
  
  const scheduled = new Date(scheduledDate);
  return scheduled >= nextMonday && scheduled <= followingSunday;
}

/**
 * Check if task is due within the next 30 days
 */
export function isTaskDueThisMonth(scheduledDate: string | null): boolean {
  if (!scheduledDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);
  
  const scheduled = new Date(scheduledDate);
  return scheduled >= today && scheduled <= in30Days;
}

/**
 * Filter tasks by season
 */
export function filterTasksBySeason(tasks: any[], season: string): any[] {
  if (season === 'Alle' || !season) return tasks;
  return tasks.filter(task => getSeasonFromDate(task.scheduled_date || task.due_date || null) === season);
}

/**
 * Sort tasks by month
 */
export function sortTasksByMonth(tasks: any[]): any[] {
  return [...tasks].sort((a, b) => {
    const dateA = a.scheduled_date || a.due_date || '';
    const dateB = b.scheduled_date || b.due_date || '';
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });
}

/**
 * Sort tasks based on selected option
 */
export function sortTasks(
  tasks: TaskListItem[],
  sortBy: string = 'priority'
): TaskListItem[] {
  const sorted = [...tasks];

  switch (sortBy) {
    case 'priority':
      // Sort: high→medium→low priority, then by created_at
      sorted.sort((a, b) => {
        const aPriority = getPriorityValue(a.priority);
        const bPriority = getPriorityValue(b.priority);
        if (aPriority !== bPriority) {
          return bPriority - aPriority; // Descending
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      break;

    case 'created_at':
      // Sort: newest first
      sorted.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      break;

    case 'category':
      // Sort: by category A-Z
      sorted.sort((a, b) => a.category.localeCompare(b.category));
      break;

    case 'title':
      // Sort: by title A-Z
      sorted.sort((a, b) => a.title.localeCompare(b.title));
      break;

    default:
      // Default: priority sort
      sorted.sort((a, b) => {
        const aPriority = getPriorityValue(a.priority);
        const bPriority = getPriorityValue(b.priority);
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
  }

  return sorted;
}

/**
 * Format time spent in minutes to human-readable format
 * Examples: 45 → "45m", 90 → "1h 30m", 150 → "2h 30m"
 */
export function formatTimeSpent(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}
