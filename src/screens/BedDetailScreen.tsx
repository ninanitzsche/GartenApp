/**
 * BedDetailScreen - Redesigned for better readability
 * Clear visual hierarchy with hero header, plant cards with tasks
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../theme/designSystemV2';
import { Bed } from '../types/bed';
import { Plant } from '../types/plant';
import { TaskListItem } from '../types/task';
import { fetchBed, fetchBedPlants, unlinkBedFromPlant } from '../services/bedService';
import { uploadPhotoForBed, setBedCoverPhoto } from '../services/photoBedService';
import { fetchTasksByBed, toggleTaskCompletion } from '../services/taskService';
import { getCompanionSuggestions } from '../services/companionPlantingService';
import EmptyState from '../components/ui/EmptyState';
import GlassCard from '../components/ui/GlassCard';
import CompanionCard from '../components/plant/CompanionCard';
import GildeSelector from '../components/gilde/GildeSelector';
import GildeCard from '../components/gilde/GildeCard';
import GildeRating from '../components/gilde/GildeRating';
import { useGilden } from '../hooks/useGilden';
import { addGildeToBed, removeGildeFromBed, fetchBeetGilden, upsertRating, fetchRating } from '../services/gildeService';
import { calculateMatchScore } from '../services/gildeMatchService';
import { Gilde, GildeRating as GildeRatingType } from '../types/gilde';

type Props = NativeStackScreenProps<RootStackParamList, 'BedDetail'>;

export default function BedDetailScreen({ navigation, route }: Props) {
  const { bedId } = route.params;
  const [bed, setBed] = useState<Bed | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { gilden } = useGilden();
  const [showGildeSelector, setShowGildeSelector] = useState(false);
  const [beetGilden, setBeetGilden] = useState<Gilde[]>([]);
  const [gildeRatings, setGildeRatings] = useState<Record<string, GildeRatingType>>({});

  const loadBeetGilden = useCallback(async () => {
    try {
      const loaded = await fetchBeetGilden(bedId);
      setBeetGilden(loaded);

      const ratings: Record<string, GildeRatingType> = {};
      for (const gilde of loaded) {
        try {
          const rating = await fetchRating(bedId, gilde.id);
          if (rating) {
            ratings[gilde.id] = rating;
          }
        } catch (e) {
        }
      }
      setGildeRatings(ratings);
    } catch (e) {
      console.error('Error loading beet gilden:', e);
    }
  }, [bedId]);

  useEffect(() => {
    loadBeetGilden();
  }, [bedId, loadBeetGilden]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadBeetGilden();
    }, [bedId])
  );

  const loadData = async () => {
    try {
      const bedData = await fetchBed(bedId);
      setBed(bedData);

      if (bedData) {
        const [plantsData, tasksData] = await Promise.all([
          fetchBedPlants(bedId),
          fetchTasksByBed(bedId).catch(() => []),
        ]);
        setPlants(plantsData);
        setTasks(tasksData);
      }
    } catch (error) {
      console.error('Error loading bed data:', error);
      Alert.alert('Fehler', 'Beetdaten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleEdit = () => {
    navigation.navigate('EditBed', { bedId });
  };

  const handleCoverPhoto = async () => {
    if (uploading) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setUploading(true);
      const photoPath = await uploadPhotoForBed(bedId, result.assets[0].uri);
      const { data } = (await import('../services/supabase')).supabase.storage
        .from('plant-photos')
        .getPublicUrl(photoPath);

      await setBedCoverPhoto(bedId, data.publicUrl);
      setBed(prev => prev ? { ...prev, cover_photo_url: data.publicUrl } : null);
      Alert.alert('Erfolg', 'Titelbild gesetzt!');
    } catch (error: any) {
      console.error('Error setting cover photo:', error);
      Alert.alert('Fehler', error.message || 'Foto konnte nicht hochgeladen werden.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePlant = (plantId: string) => {
    Alert.alert(
      'Pflanze entfernen',
      'Möchten Sie diese Pflanze wirklich aus dem Beet entfernen?',
      [
        { text: 'Abbrechen', onPress: () => {}, style: 'cancel' },
        {
          text: 'Entfernen',
          onPress: async () => {
            try {
              await unlinkBedFromPlant(bedId, plantId);
              setPlants(plants.filter((p) => p.id !== plantId));
              Alert.alert('Erfolg', 'Pflanze entfernt.');
            } catch (error) {
              console.error('Error removing plant:', error);
              Alert.alert('Fehler', 'Pflanze konnte nicht entfernt werden.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddPlant = () => {
    Alert.alert('Info', 'Funktionalität zum Hinzufügen von Pflanzen wird noch implementiert.');
  };

  // Group tasks by plant ID
  const getTasksForPlant = (plantId: string) => {
    return tasks.filter(task => 
      task.linked_plants?.some(p => p.id === plantId)
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  if (!bed) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Beet nicht gefunden</Text>
      </View>
    );
  }

  const bedColor = bed.color || '#4CAF50';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <View style={[styles.hero, { backgroundColor: bedColor + '15' }]}>
        {bed.cover_photo_url ? (
          <View style={styles.heroImageContainer}>
            <Image source={{ uri: bed.cover_photo_url }} style={styles.heroImage} resizeMode="cover" />
            <View style={styles.heroOverlay} />
            <TouchableOpacity style={styles.heroCameraButton} onPress={handleCoverPhoto}>
              <MaterialIcons name="photo-camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.heroPlaceholder} onPress={handleCoverPhoto} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="small" color={bedColor} />
            ) : (
              <>
                <MaterialIcons name="add-a-photo" size={32} color={bedColor} />
                <Text style={[styles.heroPlaceholderText, { color: bedColor }]}>Foto hinzufügen</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.heroContent}>
          <View style={[styles.colorDot, { backgroundColor: bedColor }]} />
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>{bed.name}</Text>
            {bed.notes && <Text style={styles.heroNotes}>{bed.notes}</Text>}
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <MaterialIcons name="edit" size={22} color={Colors2026.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Gilden Section - FIRST */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gilden</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{beetGilden.length}</Text>
          </View>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('GildeTemplate', { bedId })}>
            <MaterialIcons name="add" size={20} color={Colors2026.primary} />
            <Text style={styles.addButtonText}>Neu</Text>
          </TouchableOpacity>
        </View>

        {beetGilden.length > 0 ? (
          <View style={styles.gildeGrid}>
            {beetGilden.map(gilde => {
              const score = plants.length > 0
                ? calculateMatchScore(plants.map(p => p.name), gilde)
                : 0;
              return (
                <GildeCard
                  key={gilde.id}
                  gilde={gilde}
                  matchScore={score}
                  onPress={() => navigation.navigate('GildeDetail', { gildeId: gilde.id })}
                  onRemove={() => {
                    Alert.alert('Gilde entfernen', ` "${gilde.name}" von Beet entfernen?`, [
                      { text: 'Abbrechen', style: 'cancel' },
                      { text: 'Entfernen', style: 'destructive', onPress: () => {
                        setBeetGilden(beetGilden.filter(g => g.id !== gilde.id));
                      }},
                    ]);
                  }}
                />
              );
            })}
          </View>
        ) : (
          <View style={styles.emptySection}>
            <MaterialIcons name="group-work" size={48} color={Colors2026.textMuted} />
            <Text style={styles.emptyTitle}>Keine Gilden</Text>
            <Text style={styles.emptySubtitle}>Füge eine Gilde hinzu, um Synergien zu nutzen.</Text>
          </View>
        )}
      </View>

      {/* Plants Section - SECOND */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pflanzen</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{plants.length}</Text>
          </View>
          <View style={styles.spacer} />
          <TouchableOpacity style={styles.addButton} onPress={handleAddPlant}>
            <MaterialIcons name="add" size={20} color={Colors2026.primary} />
            <Text style={styles.addButtonText}>Hinzufügen</Text>
          </TouchableOpacity>
        </View>

        {/* Companion Planting Info */}
        {plants.length > 0 && plants.length <= 5 && (
          <CompanionCard
            plantName={plants[0].name}
            goodCompanions={getCompanionSuggestions(plants[0].name).good}
            badCompanions={getCompanionSuggestions(plants[0].name).bad}
          />
        )}

        {plants.length > 0 ? (
          plants.map((plant) => {
            const plantTasks = getTasksForPlant(plant.id);
            const openTasks = plantTasks.filter(t => !t.completed_at);
            const completedTasks = plantTasks.filter(t => t.completed_at);

            return (
              <GlassCard key={plant.id} variant="light" style={styles.plantCard}>
                {/* Plant Header */}
                <TouchableOpacity
                  style={styles.plantHeader}
                  onPress={() => {
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                      parentNavigation.navigate('PlantDetail', { plantId: plant.id });
                    } else {
                      navigation.navigate('PlantDetail', { plantId: plant.id });
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.plantIconContainer}>
                    <Text style={styles.plantIcon}>🌱</Text>
                  </View>
                  <View style={styles.plantInfo}>
                    <Text style={styles.plantName}>{plant.name}</Text>
                    {plant.latin_name && (
                      <Text style={styles.plantLatinName}>{plant.latin_name}</Text>
                    )}
                  </View>
                  {plant.status && (
                    <View style={[styles.statusBadge, { backgroundColor: bedColor + '20' }]}>
                      <Text style={[styles.statusText, { color: bedColor }]}>{plant.status}</Text>
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePlant(plant.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="close" size={18} color={Colors2026.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>

                {/* Tasks for this plant */}
                {plantTasks.length > 0 && (
                  <View style={styles.tasksContainer}>
                    <View style={styles.tasksDivider} />
                    {openTasks.length > 0 && (
                      <View style={styles.taskGroup}>
                        {openTasks.map((task) => (
                          <TouchableOpacity
                            key={task.id}
                            style={styles.taskRow}
                            onPress={async () => {
                              await toggleTaskCompletion(task.id);
                              loadData();
                            }}
                            activeOpacity={0.6}
                          >
                            <View style={styles.checkbox}>
                              <MaterialIcons name="radio-button-unchecked" size={20} color={Colors2026.primary} />
                            </View>
                            <Text style={styles.taskTitle}>{task.title}</Text>
                            {task.due_date && (
                              <View style={styles.taskDateBadge}>
                                <MaterialIcons name="event" size={12} color={Colors2026.textMuted} />
                                <Text style={styles.taskDate}>
                                  {new Date(task.due_date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                                </Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {completedTasks.length > 0 && (
                      <View style={styles.taskGroup}>
                        <Text style={styles.completedLabel}>Erledigt ({completedTasks.length})</Text>
                        {completedTasks.map((task) => (
                          <TouchableOpacity
                            key={task.id}
                            style={[styles.taskRow, styles.taskRowCompleted]}
                            onPress={async () => {
                              await toggleTaskCompletion(task.id);
                              loadData();
                            }}
                            activeOpacity={0.6}
                          >
                            <View style={styles.checkbox}>
                              <MaterialIcons name="check-circle" size={20} color={Colors2026.status.success} />
                            </View>
                            <Text style={[styles.taskTitle, styles.taskTitleCompleted]}>{task.title}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </GlassCard>
            );
          })
        ) : (
          <EmptyState
            icon={<MaterialIcons name="eco" size={48} color={Colors2026.textMuted} />}
            title="Keine Pflanzen"
            subtitle="Dieses Beet hat noch keine Pflanzen."
            action={
              <TouchableOpacity onPress={handleAddPlant} style={styles.emptyAction}>
                <MaterialIcons name="add" size={18} color="#fff" />
                <Text style={styles.emptyActionText}>Pflanze hinzufügen</Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>

      

      <View style={styles.bottomSpacer} />
      
      <GildeSelector
        visible={showGildeSelector}
        gilden={gilden}
        bedPlantNames={plants.map(p => p.name)}
        onSelect={async (gilde) => {
          try {
            await addGildeToBed(bedId, gilde.id);
            loadBeetGilden();
          } catch (e) {
            console.error('Error adding gilde:', e);
          }
          setShowGildeSelector(false);
        }}
        onClose={() => setShowGildeSelector(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
  },
  errorText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },

  // Hero Header
  hero: {
    paddingTop: Spacing2026.lg,
    paddingBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  heroImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: Radius2026.lg,
    overflow: 'hidden',
    marginBottom: Spacing2026.md,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  heroCameraButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: Radius2026.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors2026.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing2026.md,
    backgroundColor: Colors2026.glass.light,
  },
  heroPlaceholderText: {
    fontSize: Typography2026.small.fontSize,
    marginTop: 8,
    fontWeight: '500',
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing2026.md,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -0.5,
  },
  heroNotes: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
    marginTop: 2,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors2026.glass.light,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section
  section: {
    paddingHorizontal: Spacing2026.xl,
    paddingTop: Spacing2026.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing2026.md,
  },
  sectionTitle: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
  },
  sectionBadge: {
    backgroundColor: Colors2026.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius2026.round,
    marginLeft: 8,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors2026.primary,
  },
  spacer: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.primary + '15',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  gildeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.primary + '15',
    marginLeft: Spacing2026.sm,
  },

  // Plant Card
  plantCard: {
    marginBottom: Spacing2026.md,
  },
  plantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing2026.md,
  },
  plantIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors2026.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing2026.md,
  },
  plantIcon: {
    fontSize: 22,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
  },
  plantLatinName: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius2026.round,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  removeButton: {
    padding: 4,
  },

  // Tasks Container
  tasksContainer: {
    paddingHorizontal: Spacing2026.md,
    paddingBottom: Spacing2026.md,
  },
  tasksDivider: {
    height: 1,
    backgroundColor: Colors2026.border,
    marginBottom: Spacing2026.sm,
  },
  taskGroup: {
    gap: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing2026.sm,
    borderRadius: Radius2026.sm,
  },
  taskRowCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    marginRight: 10,
  },
  taskTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors2026.text,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors2026.textMuted,
  },
  taskDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors2026.bg,
    borderRadius: Radius2026.round,
  },
  taskDate: {
    fontSize: 11,
    color: Colors2026.textMuted,
    fontWeight: '500',
  },
  completedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors2026.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing2026.sm,
    marginBottom: 4,
    marginLeft: Spacing2026.sm,
  },

  // Empty State
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors2026.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: Radius2026.round,
    marginTop: Spacing2026.md,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 100,
  },
});
