/**
 * Plant Care Task Service
 * Generates tasks from plant knowledge care tips
 */

import { PLANT_KNOWLEDGE_MAP } from '../data/plant-knowledge-map';

export interface CareTask {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  frequency?: string;
}

const CATEGORY_MAP: Record<string, string> = {
  gießen: 'watering',
  wasser: 'watering',
  düngen: 'fertilizing',
  dünger: 'fertilizing',
  schneiden: 'pruning',
  schnitt: 'pruning',
  ausgeizen: 'pruning',
  mulchen: 'soil',
  boden: 'soil',
  kontrollieren: 'monitoring',
  schädlings: 'pest_control',
  krankheit: 'disease',
};

const PRIORITY_MAP: Record<string, 'low' | 'medium' | 'high'> = {
  gießen: 'high',
  wasser: 'high',
  düngen: 'medium',
  schneiden: 'medium',
  ausgeizen: 'medium',
  mulchen: 'low',
  kontrollieren: 'low',
};

function detectCategory(text: string): string {
  const lower = text.toLowerCase();
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) {
      return category;
    }
  }
  return 'care';
}

function detectPriority(text: string): 'low' | 'medium' | 'high' {
  const lower = text.toLowerCase();
  for (const [keyword, priority] of Object.entries(PRIORITY_MAP)) {
    if (lower.includes(keyword)) {
      return priority;
    }
  }
  return 'medium';
}

export function generateCareTasksFromKnowledge(plantName: string): CareTask[] {
  const knowledge = PLANT_KNOWLEDGE_MAP.find(
    entry => entry.plantName.toLowerCase() === plantName.toLowerCase()
  );

  if (!knowledge || !knowledge.extractedInfo.careTips) {
    return [];
  }

  return knowledge.extractedInfo.careTips.map(tip => ({
    title: tip.substring(0, 50) + (tip.length > 50 ? '...' : ''),
    description: tip,
    category: detectCategory(tip),
    priority: detectPriority(tip),
    frequency: detectFrequency(tip),
  }));
}

function detectFrequency(text: string): string | undefined {
  const lower = text.toLowerCase();
  
  if (lower.includes('täglich') || lower.includes('jeden tag')) {
    return 'daily';
  }
  if (lower.includes('wöchentlich') || lower.includes('jede woche')) {
    return 'weekly';
  }
  if (lower.includes('monatlich') || lower.includes('jeden monat')) {
    return 'monthly';
  }
  if (lower.includes('2-3 wochen') || lower.includes('alle 2-3 wochen')) {
    return 'biweekly';
  }
  
  return undefined;
}
