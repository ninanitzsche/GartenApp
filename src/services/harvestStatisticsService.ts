/**
 * HarvestStatisticsService - Ernte-Statistiken
 * Story 056: Ernte-Statistiken
 */

import { Harvest, HarvestTotal } from '../types/harvest';

export interface MonthlyHarvest {
  month: string;
  total: number;
  byPlant: { plant: string; quantity: number }[];
}

export interface PlantHarvestStats {
  plant: string;
  totalQuantity: number;
  unit: string;
  harvestCount: number;
  averagePerHarvest: number;
  firstHarvest: string;
  lastHarvest: string;
}

export interface HarvestStatistics {
  totalHarvests: number;
  totalQuantity: number;
  uniquePlants: number;
  monthlyData: MonthlyHarvest[];
  plantStats: PlantHarvestStats[];
  topPlants: { plant: string; quantity: number; percentage: number }[];
}

export function calculateHarvestStatistics(
  harvests: Harvest[],
  totals: HarvestTotal[]
): HarvestStatistics {
  const totalHarvests = harvests.length;
  const totalQuantity = totals.reduce((sum, t) => sum + t.quantity, 0);
  const uniquePlants = new Set(harvests.map(h => h.plant_id)).size;

  // Monthly data
  const monthlyMap = new Map<string, MonthlyHarvest>();
  harvests.forEach(harvest => {
    const date = new Date(harvest.harvest_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { month: monthLabel, total: 0, byPlant: [] });
    }

    const monthData = monthlyMap.get(monthKey)!;
    monthData.total += harvest.quantity;

    const existingPlant = monthData.byPlant.find(p => p.plant === (harvest.plant_name || 'Unbekannt'));
    if (existingPlant) {
      existingPlant.quantity += harvest.quantity;
    } else {
      monthData.byPlant.push({ plant: harvest.plant_name || 'Unbekannt', quantity: harvest.quantity });
    }
  });

  const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Plant stats
  const plantMap = new Map<string, PlantHarvestStats>();
  harvests.forEach(harvest => {
    const plantName = harvest.plant_name || 'Unbekannt';
    if (!plantMap.has(plantName)) {
      plantMap.set(plantName, {
        plant: plantName,
        totalQuantity: 0,
        unit: harvest.unit || 'Stück',
        harvestCount: 0,
        averagePerHarvest: 0,
        firstHarvest: harvest.harvest_date,
        lastHarvest: harvest.harvest_date,
      });
    }

    const plantStat = plantMap.get(plantName)!;
    plantStat.totalQuantity += harvest.quantity;
    plantStat.harvestCount += 1;

    if (new Date(harvest.harvest_date) < new Date(plantStat.firstHarvest)) {
      plantStat.firstHarvest = harvest.harvest_date;
    }
    if (new Date(harvest.harvest_date) > new Date(plantStat.lastHarvest)) {
      plantStat.lastHarvest = harvest.harvest_date;
    }
  });

  const plantStats = Array.from(plantMap.values()).map(p => ({
    ...p,
    averagePerHarvest: p.totalQuantity / p.harvestCount,
  })).sort((a, b) => b.totalQuantity - a.totalQuantity);

  // Top plants with percentages
  const topPlants = plantStats.slice(0, 5).map(p => ({
    plant: p.plant,
    quantity: p.totalQuantity,
    percentage: totalQuantity > 0 ? Math.round((p.totalQuantity / totalQuantity) * 100) : 0,
  }));

  return {
    totalHarvests,
    totalQuantity,
    uniquePlants,
    monthlyData,
    plantStats,
    topPlants,
  };
}

export function getHarvestTrend(
  monthlyData: MonthlyHarvest[],
  months: number = 6
): 'increasing' | 'decreasing' | 'stable' {
  if (monthlyData.length < 2) return 'stable';

  const recent = monthlyData.slice(-months);
  if (recent.length < 2) return 'stable';

  const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
  const secondHalf = recent.slice(Math.floor(recent.length / 2));

  const firstAvg = firstHalf.reduce((sum, m) => sum + m.total, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, m) => sum + m.total, 0) / secondHalf.length;

  const difference = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (difference > 10) return 'increasing';
  if (difference < -10) return 'decreasing';
  return 'stable';
}
