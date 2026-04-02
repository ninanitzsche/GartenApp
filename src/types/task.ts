/**
 * Task type definitions matching Supabase schema
 */

// Import Plant type for plant_tasks
import { Plant } from './plant';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'Aussaat' | 'Pflanzen' | 'Gartenarbeiten' | 'Beobachten' | 'Ernten';
  priority: 'niedrig' | 'mittel' | 'hoch';
  location?: string;
  time_spent_minutes?: number;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
  linked_plants?: Plant[];
  
  // Neue Felder für Zeitraum-System (Approach B)
  zeitraum?: string;
  due_date?: string | null;
  scheduled_date?: string | null;
}

export interface TaskFormData {
  title: string;
  description?: string;
  category: string;
  priority: string;
  location?: string;
  time_spent_minutes?: number;
  plant_ids?: string[];
  
  // Neue Felder für Zeitraum-System (Approach B)
  zeitraum?: string;
  due_date?: string | null;
  scheduled_date?: string | null;
}

export interface TaskListItem extends Task {
  plant_names: string[];
}

export interface PlantTask {
  task_id: string;
  plant_id: string;
}

// Sort options for task list
export type TaskSortOption = 'priority' | 'created_at' | 'category' | 'title' | 'zeitraum';

export interface TaskSortPreference {
  sortBy: TaskSortOption;
  ascending: boolean;
}
