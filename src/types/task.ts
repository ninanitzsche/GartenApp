/**
 * Task type definitions matching Supabase schema
 */

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: 'Aussaat' | 'Pflanzen' | 'Gartenarbeiten' | 'Beobachten' | 'Ernten';
  priority: 'niedrig' | 'mittel' | 'hoch';
  location?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
  linked_plants?: Plant[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  category: string;
  priority: string;
  location?: string;
  plant_ids?: string[];
}

export interface TaskListItem extends Task {
  plant_names: string[];
}

export interface PlantTask {
  task_id: string;
  plant_id: string;
}

// Import Plant type for plant_tasks
import { Plant } from './plant';
