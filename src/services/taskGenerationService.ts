/**
 * Task Generation Service
 * Generates tasks for all plants based on the current season
 */
import { supabase } from './supabase';
import { Plant } from '../types/plant';
import { TaskFormData } from '../types/task';
import { createTask } from './taskService';
import { getSuggestionsForPlant } from './taskSuggestionService';
import { getCurrentSeason, Season } from '../types/taskSuggestion';
import { fetchPlants } from './plantService';

/**
 * Generate tasks for all plants based on the current season
 * @param options Options for task generation
 * @returns Result of the generation
 */
export async function generateTasksForAllPlants(options: {
  maxTasksPerPlant?: number;
  forceRegenerate?: boolean;
}): Promise<{
  success: boolean;
  generatedCount: number;
  skippedCount: number;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to generate tasks');
    }

    const maxTasksPerPlant = options?.maxTasksPerPlant ?? 3;
    const forceRegenerate = options?.forceRegenerate ?? false;

    // Get all plants for the user
    const plants = await fetchPlants();
    if (!plants || plants.length === 0) {
      return {
        success: false,
        generatedCount: 0,
        skippedCount: 0,
        error: 'No plants found. Please add some plants first.',
      };
    }

    const currentSeason = getCurrentSeason();
    let generatedCount = 0;
    let skippedCount = 0;

    for (const plant of plants) {
      // Get task suggestions for this plant
      const suggestions = getSuggestionsForPlant(undefined, currentSeason, maxTasksPerPlant);

      for (const suggestion of suggestions) {
        // Check if we should skip this task (if not forcing regeneration)
        if (!forceRegenerate) {
          // Check if a similar task already exists for this plant today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const { data: existingTasks, error: checkError } = await supabase
            .from('tasks')
            .select('id, title, created_at')
            .eq('user_id', user.id)
            .ilike('title', suggestion.title)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())
            .eq('plant_id', plant.id); // Note: tasks don't have plant_id directly, they link via plant_tasks

          if (checkError) {
            console.error('Error checking existing tasks:', checkError);
            // Continue anyway
          }

          // If we found existing tasks for this plant and title, skip
          if (existingTasks && existingTasks.length > 0) {
            // We need to check if any of these tasks are linked to this plant
            // For simplicity, we'll skip if there's any existing task with this title today
            // A more accurate check would require joining with plant_tasks
            skippedCount++;
            continue;
          }
        }

        // Create the task
        const taskData: TaskFormData = {
          title: suggestion.title,
          description: suggestion.reason || `Aufgabe für ${plant.name}`,
          category: suggestion.category,
          priority: suggestion.priority,
          // We don't set plant_id directly; we'll link it after creation
        };

        try {
          const createdTask = await createTask(taskData);

          // Link the task to the plant
          if (createdTask.id && plant.id) {
            await linkPlantsToTask(createdTask.id, [plant.id]);
          }

          generatedCount++;
        } catch (taskError) {
          console.error(`Error creating task for plant ${plant.name}:`, taskError);
          // Continue with next task
        }
      }
    }

    return {
      success: true,
      generatedCount,
      skippedCount,
    };
  } catch (error: any) {
    console.error('Error in generateTasksForAllPlants:', error);
    return {
      success: false,
      generatedCount: 0,
      skippedCount: 0,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Link plants to a task via the plant_tasks junction table
 */
async function linkPlantsToTask(taskId: string, plantIds: string[]): Promise<void> {
  if (!plantIds || plantIds.length === 0) return;

  // First, remove any existing links (to avoid duplicates if we're regenerating)
  await supabase
    .from('plant_tasks')
    .delete()
    .eq('task_id', taskId);

  // Then create new links
  const links = plantIds.map((plantId) => ({
    task_id: taskId,
    plant_id: plantId,
  }));

  const { error } = await supabase.from('plant_tasks').insert(links);
  if (error) {
    throw error;
  }
}

/**
 * Generate tasks for a single plant
 */
export async function generateTasksForPlant(
  plantId: string,
  options: { maxTasks?: number; forceRegenerate?: boolean } = {}
): Promise<{
  success: boolean;
  generatedCount: number;
  skippedCount: number;
  error?: string;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to generate tasks');
    }

    const maxTasks = options?.maxTasks ?? 3;
    const forceRegenerate = options?.forceRegenerate ?? false;

    // Get the specific plant
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .eq('user_id', user.id)
      .single();

    if (plantError || !plant) {
      throw new Error('Plant not found or access denied');
    }

    // Convert to Plant type
    const typedPlant: Plant = {
      id: plant.id,
      user_id: plant.user_id,
      name: plant.name,
      latin_name: plant.latin_name,
      location: plant.location,
      type: plant.type,
      status: plant.status,
      winterhart: plant.winterhart,
      essbar: plant.essbar,
      quantity: plant.quantity,
      planted_date: plant.planted_date,
      harvest_date: plant.harvest_date,
      notes: plant.notes,
      tags: plant.tags,
      identification_source: plant.identification_source,
      created_at: plant.created_at,
      updated_at: plant.updated_at,
    };

    const currentSeason = getCurrentSeason();
    const suggestions = getSuggestionsForPlant(undefined, currentSeason, maxTasks);

    let generatedCount = 0;
    let skippedCount = 0;

    for (const suggestion of suggestions) {
      if (!forceRegenerate) {
        // Check for existing task today for this plant
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const { data: existingTasks, error: checkError } = await supabase
          .from('tasks')
          .select('id, title')
          .eq('user_id', user.id)
          .ilike('title', suggestion.title)
          .gte('created_at', today.toISOString())
          .lt('created_at', tomorrow.toISOString());

        if (checkError) {
          console.error('Error checking existing tasks:', checkError);
        }

        if (existingTasks && existingTasks.length > 0) {
          skippedCount++;
          continue;
        }
      }

      const taskData: TaskFormData = {
        title: suggestion.title,
        description: suggestion.reason || `Aufgabe für ${plant.name}`,
        category: suggestion.category,
        priority: suggestion.priority,
      };

      try {
        const createdTask = await createTask(taskData);
        if (createdTask.id && plant.id) {
          await linkPlantsToTask(createdTask.id, [plant.id]);
        }
        generatedCount++;
      } catch (taskError) {
        console.error(`Error creating task:`, taskError);
        // Continue
      }
    }

    return {
      success: true,
      generatedCount,
      skippedCount,
    };
  } catch (error: any) {
    console.error('Error in generateTasksForPlant:', error);
    return {
      success: false,
      generatedCount: 0,
      skippedCount: 0,
      error: error.message || 'Unknown error',
    };
  }
}