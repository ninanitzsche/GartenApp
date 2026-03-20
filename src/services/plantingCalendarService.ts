/**
 * Planting Calendar Service
 * 
 * Provides planting calendar data and calculations
 * Data is static (client-side) for performance
 */

import {
  PLANTING_CALENDAR_DATA,
  PlantingCalendarEntry
} from '../data/plantingCalendarData';

export interface PlantablePlant {
  plant: PlantingCalendarEntry;
  action: 'pre_cultivate' | 'direct_sow' | 'transplant';
  urgency: 'now' | 'soon' | 'later';
  weeksUntilOptimal: number;
}

export interface PlantCalendarByCategory {
  category: string;
  plants: PlantingCalendarEntry[];
}

export interface MonthInfo {
  month: number;
  name: string;
  shortName: string;
  isCurrentMonth: boolean;
  plantableNow: PlantablePlant[];
  plantableSoon: PlantablePlant[];
}

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'
];

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

export function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 604800000;
  return Math.ceil(diff / oneWeek);
}

export function isInMonthRange(
  currentMonth: number,
  startMonth: number | null,
  endMonth: number | null
): boolean {
  if (startMonth === null || endMonth === null) return false;
  
  // Handle year wrap-around (e.g., Nov-Feb)
  if (startMonth > endMonth) {
    return currentMonth >= startMonth || currentMonth <= endMonth;
  }
  
  return currentMonth >= startMonth && currentMonth <= endMonth;
}

export function isNowOrSoon(
  currentMonth: number,
  startMonth: number | null,
  endMonth: number | null,
  weeksAhead: number = 4
): { isPlantable: boolean; weeksUntilOptimal: number } {
  if (startMonth === null || endMonth === null) {
    return { isPlantable: false, weeksUntilOptimal: -1 };
  }
  
  const currentWeek = getWeekOfYear();
  const currentMonthWeek = (currentMonth - 1) * 4 + Math.floor(new Date().getDate() / 7);
  
  // Calculate weeks until optimal planting window
  let weeksUntilOptimal = 0;
  
  if (currentMonth < startMonth) {
    // Future window
    weeksUntilOptimal = (startMonth - currentMonth) * 4 - (4 - currentMonthWeek % 4);
  } else if (currentMonth > endMonth) {
    // Past window (might wrap around)
    weeksUntilOptimal = ((12 - currentMonth) + startMonth) * 4;
  } else {
    // In window
    weeksUntilOptimal = 0;
  }
  
  const isPlantable = isInMonthRange(currentMonth, startMonth, endMonth) ||
                      (weeksUntilOptimal > 0 && weeksUntilOptimal <= weeksAhead);
  
  return { isPlantable, weeksUntilOptimal };
}

export function getPlantableNow(): PlantablePlant[] {
  const currentMonth = getCurrentMonth();
  const results: PlantablePlant[] = [];
  
  PLANTING_CALENDAR_DATA.forEach(plant => {
    // Check pre-cultivation
    if (isInMonthRange(currentMonth, plant.pre_cultivation_month_start, plant.pre_cultivation_month_end)) {
      results.push({
        plant,
        action: 'pre_cultivate',
        urgency: 'now',
        weeksUntilOptimal: 0
      });
    }
    
    // Check direct sowing
    if (isInMonthRange(currentMonth, plant.direct_sowing_month_start, plant.direct_sowing_month_end)) {
      results.push({
        plant,
        action: 'direct_sow',
        urgency: 'now',
        weeksUntilOptimal: 0
      });
    }
    
    // Check transplant
    if (isInMonthRange(currentMonth, plant.transplant_month_start, plant.transplant_month_end)) {
      results.push({
        plant,
        action: 'transplant',
        urgency: 'now',
        weeksUntilOptimal: 0
      });
    }
  });
  
  return results;
}

export function getPlantableSoon(weeksAhead: number = 4): PlantablePlant[] {
  const currentMonth = getCurrentMonth();
  const results: PlantablePlant[] = [];
  
  PLANTING_CALENDAR_DATA.forEach(plant => {
    // Check all planting actions
    const actions: Array<{
      action: 'pre_cultivate' | 'direct_sow' | 'transplant';
      start: number | null;
      end: number | null;
    }> = [
      { action: 'pre_cultivate', start: plant.pre_cultivation_month_start, end: plant.pre_cultivation_month_end },
      { action: 'direct_sow', start: plant.direct_sowing_month_start, end: plant.direct_sowing_month_end },
      { action: 'transplant', start: plant.transplant_month_start, end: plant.transplant_month_end },
    ];
    
    actions.forEach(({ action, start, end }) => {
      if (start === null || end === null) return;
      
      // Skip if already plantable now
      if (isInMonthRange(currentMonth, start, end)) return;
      
      const { isPlantable, weeksUntilOptimal } = isNowOrSoon(currentMonth, start, end, weeksAhead);
      
      if (isPlantable) {
        results.push({
          plant,
          action,
          urgency: weeksUntilOptimal <= 2 ? 'now' : weeksUntilOptimal <= 4 ? 'soon' : 'later',
          weeksUntilOptimal
        });
      }
    });
  });
  
  // Sort by urgency (closest first)
  results.sort((a, b) => a.weeksUntilOptimal - b.weeksUntilOptimal);
  
  return results;
}

export function getPlantsByCategory(): PlantCalendarByCategory[] {
  const categories = ['gemüse', 'kräuter', 'salat', 'obst'];
  const results: PlantCalendarByCategory[] = [];
  
  categories.forEach(category => {
    const plants = PLANTING_CALENDAR_DATA.filter(p => p.category === category);
    if (plants.length > 0) {
      results.push({ category, plants });
    }
  });
  
  return results;
}

export function getPlantById(id: string): PlantingCalendarEntry | undefined {
  return PLANTING_CALENDAR_DATA.find(p => p.id === id);
}

export function getPlantByName(name: string): PlantingCalendarEntry | undefined {
  const normalizedName = name.toLowerCase().trim();
  return PLANTING_CALENDAR_DATA.find(p => 
    p.plant_name.toLowerCase() === normalizedName ||
    p.plant_name.toLowerCase().includes(normalizedName) ||
    (p.latin_name && p.latin_name.toLowerCase() === normalizedName)
  );
}

export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] || '';
}

export function getMonthShortName(month: number): string {
  return MONTH_NAMES_SHORT[month - 1] || '';
}

export function getPlantingCalendarForPlant(plantName: string): {
  preCultivation: { start: number | null; end: number | null } | null;
  directSowing: { start: number | null; end: number | null } | null;
  transplant: { start: number | null; end: number | null } | null;
  harvest: { start: number; end: number };
} | null {
  const plant = getPlantByName(plantName);
  if (!plant) return null;
  
  return {
    preCultivation: plant.pre_cultivation_month_start !== null
      ? { start: plant.pre_cultivation_month_start, end: plant.pre_cultivation_month_end }
      : null,
    directSowing: plant.direct_sowing_month_start !== null
      ? { start: plant.direct_sowing_month_start, end: plant.direct_sowing_month_end }
      : null,
    transplant: plant.transplant_month_start !== null
      ? { start: plant.transplant_month_start, end: plant.transplant_month_end }
      : null,
    harvest: { start: plant.harvest_month_start, end: plant.harvest_month_end }
  };
}

export function getSeasonStatus(): {
  currentMonth: number;
  monthName: string;
  plantableNowCount: number;
  plantableSoonCount: number;
  nextSeason: string;
  seasonPhase: 'spring' | 'summer' | 'autumn' | 'winter';
} {
  const currentMonth = getCurrentMonth();
  const plantableNow = getPlantableNow();
  const plantableSoon = getPlantableSoon();
  
  let seasonPhase: 'spring' | 'summer' | 'autumn' | 'winter';
  if (currentMonth >= 3 && currentMonth <= 5) seasonPhase = 'spring';
  else if (currentMonth >= 6 && currentMonth <= 8) seasonPhase = 'summer';
  else if (currentMonth >= 9 && currentMonth <= 11) seasonPhase = 'autumn';
  else seasonPhase = 'winter';
  
  let nextSeason = '';
  switch (seasonPhase) {
    case 'winter': nextSeason = 'Frühling'; break;
    case 'spring': nextSeason = 'Sommer'; break;
    case 'summer': nextSeason = 'Herbst'; break;
    case 'autumn': nextSeason = 'Winter'; break;
  }
  
  return {
    currentMonth,
    monthName: getMonthName(currentMonth),
    plantableNowCount: plantableNow.length,
    plantableSoonCount: plantableSoon.length,
    nextSeason,
    seasonPhase
  };
}

export function searchPlants(query: string): PlantingCalendarEntry[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];
  
  return PLANTING_CALENDAR_DATA.filter(plant =>
    plant.plant_name.toLowerCase().includes(normalizedQuery) ||
    (plant.latin_name && plant.latin_name.toLowerCase().includes(normalizedQuery)) ||
    plant.category.toLowerCase().includes(normalizedQuery)
  );
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy': return '#4CAF50';
    case 'medium': return '#FFC107';
    case 'hard': return '#F44336';
    default: return '#9E9E9E';
  }
}

export function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy': return 'Einfach';
    case 'medium': return 'Mittel';
    case 'hard': return 'Schwer';
    default: return '';
  }
}

export function getActionLabel(action: 'pre_cultivate' | 'direct_sow' | 'transplant'): string {
  switch (action) {
    case 'pre_cultivate': return 'Vorkultur';
    case 'direct_sow': return 'Direktsaat';
    case 'transplant': return 'Auspflanzen';
    default: return '';
  }
}

export function getSunlightLabel(sunlight: 'full' | 'partial' | 'shade'): string {
  switch (sunlight) {
    case 'full': return 'Vollsonne';
    case 'partial': return 'Halbschatten';
    case 'shade': return 'Schatten';
    default: return '';
  }
}

export default {
  getCurrentMonth,
  getPlantableNow,
  getPlantableSoon,
  getPlantsByCategory,
  getPlantById,
  getPlantByName,
  getMonthName,
  getMonthShortName,
  getPlantingCalendarForPlant,
  getSeasonStatus,
  searchPlants,
  getDifficultyColor,
  getDifficultyLabel,
  getActionLabel,
  getSunlightLabel,
};
