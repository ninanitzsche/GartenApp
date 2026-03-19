/**
 * Task Suggestion Service
 * Rule-based task generation based on plant family and season
 */

import {
  TaskSuggestion,
  PlantFamilyRule,
  PLANT_FAMILY_RULES,
  PEST_TREATMENT_TASKS,
  SEASONAL_TASKS,
  TASK_CATEGORY_MAP,
  getCurrentSeason,
  Season,
} from '../types/taskSuggestion';
import { createTask } from './taskService';
import { TaskFormData } from '../types/task';

export interface SuggestTaskOptions {
  plantFamily?: string;
  plantName?: string;
  pestType?: string;
  season?: Season;
  linkedPlantId?: string;
  maxSuggestions?: number;
}

function getCategoryForTask(taskTitle: string): 'Aussaat' | 'Pflanzen' | 'Gartenarbeiten' | 'Beobachten' | 'Ernten' {
  return TASK_CATEGORY_MAP[taskTitle] || 'Gartenarbeiten';
}

function getPriorityForTask(taskTitle: string): 'niedrig' | 'mittel' | 'hoch' {
  if (taskTitle.includes('Behandlung')) return 'hoch';
  if (taskTitle.includes('Ausgeizen') || taskTitle.includes('Düngen')) return 'mittel';
  if (taskTitle.includes('Ernten')) return 'mittel';
  return 'niedrig';
}

function findMatchingFamilyRule(plantFamily: string): PlantFamilyRule | null {
  if (!plantFamily) return null;
  
  const normalizedFamily = plantFamily.toLowerCase();
  
  for (const rule of PLANT_FAMILY_RULES) {
    if (normalizedFamily.includes(rule.familyPattern.toLowerCase()) ||
        rule.familyPattern.toLowerCase().includes(normalizedFamily)) {
      return rule;
    }
  }
  
  return null;
}

function generateSuggestionsFromFamily(
  familyRule: PlantFamilyRule,
  season: Season,
  maxSuggestions: number
): TaskSuggestion[] {
  const suggestions: TaskSuggestion[] = [];
  
  const familyTasks = familyRule.tasks;
  const seasonalTasks = SEASONAL_TASKS[season];
  
  const allTasks = Array.from(new Set([...seasonalTasks, ...familyTasks]));
  
  const seasonalPriority: Record<Season, string[]> = {
    spring: ['Aussaat', 'Pflanzen', 'Boden vorbereiten', 'Bodenpflege', 'Boden lockern', 'Gießen',
      'Ausgeizen', 'Düngen', 'Jäten', 'Rankhilfe geben', 'Schädlinge kontrollieren', 'Schnitt', 'Ernten'],
    summer: ['Gießen', 'Ausgeizen', 'Düngen', 'Jäten', 'Rankhilfe geben', 'Schädlinge kontrollieren', 
      'Gartenarbeiten', 'Schnitt', 'Ernten'],
    autumn: ['Ernten', 'Laub kompostieren', 'Wintervorbereitung', 'Pflanzzeit', 'Gießen',
      'Boden vorbereiten', 'Ausgeizen', 'Düngen', 'Jäten', 'Rankhilfe geben', 'Schädlinge kontrollieren', 'Schnitt'],
    winter: ['Planung', 'Samen bestellen', 'Werkzeug pflegen', 'Pflanzzeit', 'Ernten', 'Laub kompostieren', 'Wintervorbereitung'],
  };
  
  const currentSeasonPriority = seasonalPriority[season];
  
  const sortedTasks = allTasks.sort((a, b) => {
    const aIndex = currentSeasonPriority.findIndex(p => a.includes(p) || p.includes(a));
    const bIndex = currentSeasonPriority.findIndex(p => b.includes(p) || p.includes(b));
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });
  
  const selectedTasks = sortedTasks.slice(0, maxSuggestions);
  
  for (const taskTitle of selectedTasks) {
    suggestions.push({
      title: taskTitle,
      category: getCategoryForTask(taskTitle),
      priority: getPriorityForTask(taskTitle),
      reason: `Empfohlen für ${familyRule.familyPattern}`,
    });
  }
  
  return suggestions;
}

function generateDefaultSuggestions(
  season: Season,
  maxSuggestions: number
): TaskSuggestion[] {
  const suggestions: TaskSuggestion[] = [];
  
  const seasonalTasks = SEASONAL_TASKS[season];
  const selectedTasks = seasonalTasks.slice(0, maxSuggestions);
  
  for (const taskTitle of selectedTasks) {
    suggestions.push({
      title: taskTitle,
      category: getCategoryForTask(taskTitle),
      priority: getPriorityForTask(taskTitle),
      reason: `Saisonaufgabe für ${season === 'spring' ? 'Frühling' : season === 'summer' ? 'Sommer' : season === 'autumn' ? 'Herbst' : 'Winter'}`,
    });
  }
  
  return suggestions;
}

export function getSuggestionsForPlant(
  plantFamily?: string,
  season: Season = getCurrentSeason(),
  maxSuggestions: number = 3
): TaskSuggestion[] {
  if (!plantFamily) {
    return generateDefaultSuggestions(season, maxSuggestions);
  }
  
  const familyRule = findMatchingFamilyRule(plantFamily);
  
  if (familyRule) {
    return generateSuggestionsFromFamily(familyRule, season, maxSuggestions);
  }
  
  return generateDefaultSuggestions(season, maxSuggestions);
}

export function getSuggestionForPest(pestType?: string): TaskSuggestion | null {
  if (!pestType) return null;
  
  const normalizedPest = pestType.toLowerCase();
  
  for (const [key, task] of Object.entries(PEST_TREATMENT_TASKS)) {
    if (normalizedPest.includes(key.replace('_', ' ')) ||
        key.replace('_', ' ').includes(normalizedPest)) {
      return task;
    }
  }
  
  return PEST_TREATMENT_TASKS.default;
}

export async function acceptSuggestion(
  suggestion: TaskSuggestion,
  linkedPlantId?: string
): Promise<void> {
  const formData: TaskFormData = {
    title: suggestion.title,
    category: suggestion.category,
    priority: suggestion.priority,
    description: suggestion.reason,
    plant_ids: linkedPlantId ? [linkedPlantId] : undefined,
  };
  
  await createTask(formData);
}

export function getAllSuggestions(context: SuggestTaskOptions): TaskSuggestion[] {
  const { plantFamily, season = getCurrentSeason(), pestType, maxSuggestions = 3 } = context;
  
  const suggestions: TaskSuggestion[] = [];
  
  if (pestType) {
    const pestSuggestion = getSuggestionForPest(pestType);
    if (pestSuggestion) {
      suggestions.push(pestSuggestion);
    }
  }
  
  if (plantFamily) {
    const plantSuggestions = getSuggestionsForPlant(plantFamily, season, maxSuggestions);
    const filteredPlantSuggestions = plantSuggestions.filter(
      s => !suggestions.some(existing => existing.title === s.title)
    );
    suggestions.push(...filteredPlantSuggestions);
  }
  
  if (suggestions.length === 0) {
    const defaultSuggestions = generateDefaultSuggestions(season, maxSuggestions);
    suggestions.push(...defaultSuggestions);
  }
  
  return suggestions.slice(0, maxSuggestions);
}
