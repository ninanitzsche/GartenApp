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

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [plantData, photosData, harvestsData, tasksData, healthData] = await Promise.all([
        fetchPlant(plantId).catch(() => null),
        supabase.from('photos').select('*').eq('plant_id', plantId).order('created_at', { ascending: false }).then(r => r.data || []),
        getHarvestsByPlant(plantId).catch(() => []),
        fetchTasksByPlant(plantId).catch(() => []),
        fetchHealthChecks(plantId).catch(() => []),
      ]);

      setPlant(plantData);

      if (photosData) {
        const enrichedPhotos = await Promise.all(photosData.map((p: any) => enrichPhotoWithUrl(p)));
        setPhotos(enrichedPhotos as Photo[]);
      }

      setHarvests(harvestsData);

      if (harvestsData.length > 0) {
        const totals = await getTotalHarvestByPlant(plantId).catch(() => []);
        setHarvestTotals(totals);
      }

      setTasks(tasksData);
      setHealthChecks(healthData);
    } catch (error) {
      console.error('Error loading plant detail:', error);
    } finally {
      setLoading(false);
    }
  }, [plantId]);

  useFocusEffect(useCallback(() => { loadInitialData(); }, [loadInitialData]));

  const refetch = useCallback(async () => {
    try {
      const [plantData, photosData, harvestsData, tasksData, healthData] = await Promise.all([
        fetchPlant(plantId).catch(() => null),
        supabase.from('photos').select('*').eq('plant_id', plantId).order('created_at', { ascending: false }).then(r => r.data || []),
        getHarvestsByPlant(plantId).catch(() => []),
        fetchTasksByPlant(plantId).catch(() => []),
        fetchHealthChecks(plantId).catch(() => []),
      ]);

      setPlant(plantData);

      if (photosData) {
        const enrichedPhotos = await Promise.all(photosData.map((p: any) => enrichPhotoWithUrl(p)));
        setPhotos(enrichedPhotos as Photo[]);
      }

      setHarvests(harvestsData);
      setTasks(tasksData);
      setHealthChecks(healthData);

      if (harvestsData.length > 0) {
        const totals = await getTotalHarvestByPlant(plantId).catch(() => []);
        setHarvestTotals(totals);
      }
    } catch (error) {
      console.error('Error refetching:', error);
    }
  }, [plantId]);

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
