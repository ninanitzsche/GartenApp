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
 */
export async function fetchTasks(): Promise<TaskListItem[]> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Enrich with plant names
    const tasks = (data || []) as Task[];
    return await Promise.all(tasks.map(enrichTaskWithPlantNames));
  } catch (error: any) {
    throw new Error(`Error fetching tasks: ${error.message}`);
  }
}

/**
 * Fetch single task by ID with linked plants
 */
export async function fetchTask(taskId: string): Promise<TaskListItem | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user || userError) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return enrichTaskWithPlantNames(data as Task);
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
