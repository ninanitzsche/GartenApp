/**
 * Garden Overview Screen
 * Main screen showing garden beds map and statistics
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Text,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { Garden } from '../types/garden';
import { Bed } from '../types/bed';
import { supabase } from '../services/supabase';
import { fetchGarden } from '../services/gardenService';
import {
  fetchBeds,
  createBed,
  linkBedToPlant,
  fetchBedPlants,
} from '../services/bedService';
import { fetchPlants } from '../services/plantService';
import BedMapView from '../components/BedMapView';
import BedCard from '../components/BedCard';
import GardenStatsCard from '../components/GardenStatsCard';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'GardenOverview'>;

interface BedWithPlantCount extends Bed {
  plantCount: number;
}

export default function GardenOverviewScreen({ navigation }: Props) {
  const [garden, setGarden] = useState<Garden | null>(null);
  const [beds, setBeds] = useState<BedWithPlantCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const gardenData = await fetchGarden();

      if (!gardenData?.id) {
        Alert.alert('Fehler', 'Garten konnte nicht geladen werden');
        return;
      }

      setGarden(gardenData);

      let bedsData = await fetchBeds(gardenData.id);

      // Auto-create beds from plant locations if no beds exist
      if (bedsData.length === 0) {
        await autoCreateBedsFromLocations(gardenData.id);
        bedsData = await fetchBeds(gardenData.id);
      }

      // Get plant counts by fetching all bed_plants and counting
      const { data: allBedPlants } = await supabase
        .from('bed_plants')
        .select('bed_id');

      const countMap = new Map();
      bedsData.forEach(bed => {
        const count = (allBedPlants || []).filter(bp => bp.bed_id === bed.id).length;
        countMap.set(bed.id, count);
      });

      const bedsWithCount = bedsData.map(bed => ({
        ...bed,
        plantCount: countMap.get(bed.id) || 0,
      }));

      setBeds(bedsWithCount);
    } catch (error) {
      Alert.alert('Fehler', 'Gartendaten konnten nicht geladen werden');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const autoCreateBedsFromLocations = async (gardenId?: string) => {
    try {
      // Fetch all plants to get unique locations
      const plants = await fetchPlants();

      const locations = new Set(
        plants
          .map((p) => p.location)
          .filter((loc) => loc && loc.trim())
      );

      if (locations.size === 0) {
        return;
      }

      // Create a bed for each location
      const colors = ['#4CAF50', '#8D6E63', '#2196F3', '#FF9800', '#9C27B0'];
      let colorIndex = 0;

      for (const location of locations) {
        if (!location) continue;

        const bedData = {
          name: location,
          position_x: 20 + colorIndex * 15,
          position_y: 30 + Math.random() * 20,
          width: 20,
          height: 15,
          color: colors[colorIndex % colors.length],
          shape: 'rectangle' as const,
          notes: `Auto-erstellt aus Standort "${location}"`,
          garden_id: gardenId,
        };

        try {
          const createdBed = await createBed(bedData);

          // Link plants with this location to the bed (case-insensitive!)
          const plantsForLocation = plants.filter(
            (p) => p.location?.toLowerCase() === location.toLowerCase()
          );

          for (const plant of plantsForLocation) {
            try {
              await linkBedToPlant(createdBed.id, plant.id);
            } catch (error) {
              // Ignore errors - plant may already be linked
            }
          }

          colorIndex++;
        } catch (error) {
          // Silently fail
        }
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleBedPress = (bedId: string) => {
    navigation.navigate('BedDetail', { bedId });
  };

  const handleAddBed = () => {
    navigation.navigate('AddBed');
  };

  const handleSettings = () => {
    navigation.navigate('GardenSettings');
  };

  const handlePhotos = () => {
    navigation.navigate('PhotoGallery', {});
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const totalPlants = beds.reduce((sum, bed) => sum + bed.plantCount, 0);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{garden?.name || 'Mein Garten'}</Text>
          {garden?.location && (
            <Text style={styles.subtitle}>{garden.location}</Text>
          )}
        </View>
        <View style={styles.headerIcons}>
          <MaterialIcons
            name="photo-library"
            size={24}
            color={Colors.primary}
            onPress={handlePhotos}
            style={styles.headerIcon}
          />
          <MaterialIcons
            name="settings"
            size={24}
            color={Colors.primary}
            onPress={handleSettings}
            style={styles.headerIcon}
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <GardenStatsCard bedCount={beds.length} plantCount={totalPlants} />
      </View>

      {beds.length === 0 ? (
        /* Empty State */
        <View style={styles.section}>
          <EmptyState
            icon="dashboard"
            title="Noch keine Beete"
            message="Erstellen Sie Ihre ersten Beete, um Ihren Garten zu planen."
            actionLabel="Beet hinzufügen"
            onAction={handleAddBed}
          />
        </View>
      ) : (
        <>
          {/* Bed Map */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beetplan</Text>
            <BedMapView
              beds={beds}
              onBedPress={handleBedPress}
              onAddBedPress={handleAddBed}
            />
          </View>

          {/* Beds List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beete ({beds.length})</Text>
            {beds.map((bed) => (
              <BedCard
                key={bed.id}
                bed={bed}
                plantCount={bed.plantCount}
                onPress={() => handleBedPress(bed.id)}
              />
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
});
