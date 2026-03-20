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
 * Get category color
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    'Aussaat': '#4CAF50',
    'Pflanzen': '#2196F3',
    'Gartenarbeiten': '#FF9800',
    'Beobachten': '#9C27B0',
    'Ernten': '#F44336',
  };
  return colors[category] || '#757575';
}

/**
 * Get priority color
 */
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'hoch':
      return '#F44336'; // Red
    case 'mittel':
      return '#FFC107'; // Yellow
    case 'niedrig':
      return '#9E9E9E'; // Gray
    default:
      return '#757575';
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
  };
  return labels[sortBy] || 'Sortierung';
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
