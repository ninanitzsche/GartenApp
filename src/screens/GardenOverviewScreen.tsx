/**
 * Garden Overview Screen - 2026 Glassmorphism
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
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { Camera, Settings, Plus } from 'lucide-react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
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
import EmptyState from '../components/ui/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'GardenOverview'>;

interface BedWithPlantCount extends Bed {
  plantCount: number;
}

export default function GardenOverviewScreen({ navigation }: Props) {
  const [garden, setGarden] = useState<Garden | null>(null);
  const [beds, setBeds] = useState<BedWithPlantCount[]>([]);
  const [taskCount, setTaskCount] = useState(0);
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

      if (bedsData.length === 0) {
        await autoCreateBedsFromLocations(gardenData.id);
        bedsData = await fetchBeds(gardenData.id);
      }

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

      const { data: openTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('completed', false);
      setTaskCount(openTasks?.length || 0);
    } catch (error) {
      Alert.alert('Fehler', 'Gartendaten konnten nicht geladen werden');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const autoCreateBedsFromLocations = async (gardenId?: string) => {
    try {
      const plants = await fetchPlants();

      const locations = new Set(
        plants
          .map((p) => p.location)
          .filter((loc) => loc && loc.trim())
      );

      if (locations.size === 0) {
        return;
      }

      const colors = ['#4CAF50', '#8D6E63', '#2196F3', '#FF9800', '#9C27B0'];
      let colorIndex = 0;

      for (const location of locations) {
        if (!location) continue;

        const bedData = {
          name: location,
          width: 20,
          height: 15,
          color: colors[colorIndex % colors.length],
          shape: 'rectangle' as const,
          notes: `Auto-erstellt aus Standort "${location}"`,
          garden_id: gardenId,
        };

        try {
          const createdBed = await createBed(bedData);

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
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  const totalPlants = beds.reduce((sum, bed) => sum + bed.plantCount, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors2026.primary} />
      }
    >
      {/* Glass Header */}
      <BlurView intensity={60} style={styles.glassHeader}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{garden?.name || 'Mein Garten'}</Text>
            {garden?.location && (
              <Text style={styles.headerSubtitle}>{garden.location}</Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={handlePhotos} style={styles.headerIcon}>
              <Camera size={20} color={Colors2026.primary} />
            </Pressable>
            <Pressable onPress={handleSettings} style={styles.headerIcon}>
              <Settings size={20} color={Colors2026.primary} />
            </Pressable>
          </View>
        </View>
      </BlurView>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <GardenStatsCard bedCount={beds.length} plantCount={totalPlants} taskCount={taskCount} />
      </View>

      {beds.length === 0 ? (
        <View style={styles.section}>
          <EmptyState
            icon={<MaterialIcons name="dashboard" size={40} color={Colors2026.primary} />}
            title="Noch keine Beete"
            subtitle="Erstellen Sie Ihre ersten Beete, um Ihren Garten zu planen."
            action={
              <TouchableOpacity onPress={handleAddBed} style={styles.emptyAction}>
                <Text style={styles.emptyActionText}>Beet hinzufügen</Text>
              </TouchableOpacity>
            }
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
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Beete ({beds.length})</Text>
              <Pressable onPress={handleAddBed} style={styles.addButton}>
                <Plus size={18} color={Colors2026.primary} />
              </Pressable>
            </View>
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

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  content: {
    paddingBottom: Spacing2026.xxxl * 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
  },
  glassHeader: {
    paddingTop: 60,
    paddingBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -0.8,
  },
  headerSubtitle: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    marginTop: Spacing2026.xs,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: Spacing2026.xl,
    marginTop: Spacing2026.lg,
  },
  section: {
    paddingHorizontal: Spacing2026.xl,
    marginBottom: Spacing2026.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing2026.md,
  },
  sectionTitle: {
    fontSize: Typography2026.title.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
    letterSpacing: -0.3,
    marginBottom: Spacing2026.md,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing2026.md,
  },
  emptyAction: {
    backgroundColor: Colors2026.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: Spacing2026.xl,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: Spacing2026.xl,
  },
});
