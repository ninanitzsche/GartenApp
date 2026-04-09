/**
 * Companion Planting Service
 * Provides companion planting suggestions based on plant knowledge
 */

import { PLANT_KNOWLEDGE_MAP } from '../data/plant-knowledge-map';

export interface CompanionSuggestions {
  plant: string;
  good: string[];
  bad: string[];
}

export function getCompanionSuggestions(plantName: string): CompanionSuggestions {
  const knowledge = PLANT_KNOWLEDGE_MAP.find(
    entry => entry.plantName.toLowerCase() === plantName.toLowerCase()
  );

  if (!knowledge || !knowledge.extractedInfo.companions) {
    return { plant: plantName, good: [], bad: [] };
  }

  const good = knowledge.extractedInfo.companions
    .filter(c => c.type === 'good')
    .map(c => c.plant);

  const bad = knowledge.extractedInfo.companions
    .filter(c => c.type === 'avoid')
    .map(c => c.plant);

  return { plant: plantName, good, bad };
}

export function getBadCompanions(plantName: string): string[] {
  return getCompanionSuggestions(plantName).bad;
}

export function isGoodCompanion(plantName: string, companion: string): boolean {
  const knowledge = PLANT_KNOWLEDGE_MAP.find(
    entry => entry.plantName.toLowerCase() === plantName.toLowerCase()
  );

  if (!knowledge || !knowledge.extractedInfo.companions) {
    return false;
  }

  return knowledge.extractedInfo.companions.some(
    c => c.plant.toLowerCase() === companion.toLowerCase() && c.type === 'good'
  );
}

export function isBadCompanion(plantName: string, companion: string): boolean {
  const knowledge = PLANT_KNOWLEDGE_MAP.find(
    entry => entry.plantName.toLowerCase() === plantName.toLowerCase()
  );

  if (!knowledge || !knowledge.extractedInfo.companions) {
    return false;
  }

  return knowledge.extractedInfo.companions.some(
    c => c.plant.toLowerCase() === companion.toLowerCase() && c.type === 'avoid'
  );
}
