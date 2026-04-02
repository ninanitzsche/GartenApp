import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { fetchPlant } from '../services/plantService';
import { enrichPhotoWithUrl } from '../services/photoService';
import { refreshPlantData } from '../services/plantInfoService';
import { getHarvestsByPlant, getTotalHarvestByPlant } from '../services/harvestService';
import { fetchTasksByPlant } from '../services/taskService';
import { fetchHealthChecks } from '../services/healthCheckService';
import { Plant } from '../types/plant';
import { Photo } from '../types/photo';
import { Harvest, HarvestTotal } from '../types/harvest';
import { TaskListItem } from '../types/task';
import { HealthCheck } from '../types/healthCheck';

export interface UsePlantDetailReturn {
  plant: Plant | null;
  photos: Photo[];
  harvests: Harvest[];
  harvestTotals: HarvestTotal[];
  tasks: TaskListItem[];
  healthChecks: HealthCheck[];
  loading: boolean;
  refreshing: boolean;
  refreshingRef: React.MutableRefObject<boolean>;
  handleRefresh: () => Promise<{ success: boolean; sources: string[] }>;
  refetch: () => Promise<void>;
}

export function usePlantDetail(plantId: string): UsePlantDetailReturn {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [harvestTotals, setHarvestTotals] = useState<HarvestTotal[]>([]);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      const [plantData, photoDataResult, harvestData, totals, tasksData, healthChecksData] = await Promise.all([
        fetchPlant(plantId),
        supabase.from('photo_plants').select('photos(*)').eq('plant_id', plantId),
        getHarvestsByPlant(plantId).catch(() => []),
        getTotalHarvestByPlant(plantId).catch(() => []),
        fetchTasksByPlant(plantId).catch(() => []),
        fetchHealthChecks(plantId).catch(() => []),
      ]);

      setPlant(plantData);

      if (!photoDataResult.error && photoDataResult.data) {
        const photoList = photoDataResult.data
          .map((pp: any) => pp.photos)
          .filter((p: Photo | null) => p !== null)
          .map((p: Photo) => enrichPhotoWithUrl(p))
          .filter((p: Photo) => !!p.photo_url) as Photo[];
        setPhotos(photoList);
      }

      setHarvests(harvestData);
      setHarvestTotals(totals);
      setTasks(tasksData);
      setHealthChecks(healthChecksData);
    } catch (error) {
      console.error('Error fetching plant details:', error);
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useFocusEffect(useCallback(() => { refetch(); }, [refetch]));

  const handleRefresh = useCallback(async () => {
    if (!plant) return { success: false, sources: [] };
    setRefreshing(true);
    try {
      const searchName = plant.latin_name || plant.name;
      const result = await refreshPlantData(plant.id, searchName);
      if (result.success) {
        await refetch();
      }
      return result;
    } catch (error) {
      return { success: false, sources: [] };
    } finally {
      setRefreshing(false);
    }
  }, [plant, refetch]);

  return {
    plant,
    photos,
    harvests,
    harvestTotals,
    tasks,
    healthChecks,
    loading,
    refreshing,
    refreshingRef: { current: refreshing } as React.MutableRefObject<boolean>,
    handleRefresh,
    refetch,
  };
}
