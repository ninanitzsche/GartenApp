import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { fetchPlant, progressPlantStatus, getNextStatus } from '../services/plantService';
import { enrichPhotoWithUrl } from '../services/photoService';
import { getHarvestsByPlant, getTotalHarvestByPlant } from '../services/harvestService';
import { getCompanionsByPlantName } from '../services/companionService';
import { getIdentificationsForPlant } from '../services/aiMetadataService';
import { PlantCompanion } from '../types/companion';
import { Plant } from '../types/plant';
import { Photo, PhotoPlant } from '../types/photo';
import { Harvest, HarvestTotal } from '../types/harvest';
import { AIIdentification } from '../types/ai';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';

type PlantDetailRouteProp = RouteProp<RootStackParamList, 'PlantDetail'>;
type PlantDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlantDetail'>;

export default function PlantDetailScreen() {
  const route = useRoute<PlantDetailRouteProp>();
  const navigation = useNavigation<PlantDetailNavigationProp>();
  const { plantId } = route.params;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [harvestTotals, setHarvestTotals] = useState<HarvestTotal[]>([]);
  const [companions, setCompanions] = useState<PlantCompanion | null>(null);
  const [aiIdentifications, setAiIdentifications] = useState<AIIdentification[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload plant details whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchPlantDetails();
    }, [plantId])
  );

  // PERFORMANCE FIX: Parallel data fetching with Promise.all
  const fetchPlantDetails = async () => {
    try {
      setLoading(true);

      // Parallel fetch: Plant + all dependent data simultaneously
      const [plantData, photoDataResult, harvestData, totals, identifications] = await Promise.all([
        fetchPlant(plantId),
        supabase
          .from('photo_plants')
          .select('photos(*)')
          .eq('plant_id', plantId),
        getHarvestsByPlant(plantId).catch(err => {
          console.error('Error fetching harvests:', err);
          return [];
        }),
        getTotalHarvestByPlant(plantId).catch(err => {
          console.error('Error fetching harvest totals:', err);
          return [];
        }),
        getIdentificationsForPlant(plantId).catch(err => {
          console.error('Error fetching AI identifications:', err);
          return [];
        }),
      ]);

      // Set plant data
      setPlant(plantData);

      // Process photos
      if (!photoDataResult.error && photoDataResult.data) {
        const photoList = photoDataResult.data
          .map((pp: any) => pp.photos)
          .filter((p: Photo | null) => p !== null)
          .map((p: Photo) => {
            const enriched = enrichPhotoWithUrl(p);
            return enriched;
          })
          .filter((p: Photo) => !!p.photo_url) as Photo[];
        setPhotos(photoList);
      } else {
        console.error('Error fetching photos:', photoDataResult.error);
      }

      // Set harvest data
      setHarvests(harvestData);
      setHarvestTotals(totals);

      // Fetch companion planting info (depends on plant name)
      if (plantData?.name) {
        try {
          const companionData = await getCompanionsByPlantName(plantData.name);
          setCompanions(companionData);
        } catch (companionError) {
          console.error('Error fetching companions:', companionError);
        }
      }

      // Set AI identifications
      setAiIdentifications(identifications);

    } catch (error: any) {
      console.error('Error fetching plant details:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Memoized format functions
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  }, []);

  const formatBoolean = useCallback((value?: boolean) => {
    if (value === undefined || value === null) return '-';
    return value ? 'Ja' : 'Nein';
  }, []);

  // Memoized status color function
  const getStatusColor = useCallback((status: string): string => {
    const statusColors: { [key: string]: string } = {
      geplant: Colors.info,
      bestellt: Colors.warning,
      ausgesät: '#2196F3',
      pikiert: '#1976D2',
      ausgepflanzt: Colors.primary,
      etabliert: Colors.success,
      geerntet: '#FF9800',
      unklar: Colors.textLight,
      entfernt: Colors.textLight,
    };
    return statusColors[status.toLowerCase()] || Colors.textLight;
  }, []);

  // Helper to get status label from value
  const getStatusLabel = useCallback((statusValue: string): string => {
    const statusMap: { [key: string]: string } = {
      geplant: 'Geplant',
      bestellt: 'Bestellt',
      ausgesät: 'Ausgesät',
      pikiert: 'Pikiert',
      ausgepflanzt: 'Ausgepflanzt',
      etabliert: 'Etabliert',
      geerntet: 'Geerntet',
      unklar: 'Unklar',
      entfernt: 'Entfernt',
    };
    return statusMap[statusValue.toLowerCase()] || statusValue;
  }, []);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleEdit = useCallback(() => {
    navigation.navigate('EditPlant', { plantId });
  }, [navigation, plantId]);

  const handleViewGallery = useCallback(() => {
    navigation.navigate('PhotoGallery', { plantId });
  }, [navigation, plantId]);

  const handleUploadPhoto = useCallback(() => {
    navigation.navigate('PhotoUpload', { plantId });
  }, [navigation, plantId]);

  const handleProgressStatus = useCallback(async () => {
    if (!plant) return;

    const nextStatus = getNextStatus(plant.status);
    if (!nextStatus) {
      Alert.alert('Info', 'Die Pflanze hat bereits den Status "geerntet" erreicht.');
      return;
    }

    const statusMap: { [key: string]: string } = {
      geplant: 'Geplant',
      bestellt: 'Bestellt',
      ausgesät: 'Ausgesät',
      pikiert: 'Pikiert',
      ausgepflanzt: 'Ausgepflanzt',
      etabliert: 'Etabliert',
      geerntet: 'Geerntet',
      unklar: 'Unklar',
    };
    const nextStatusLabel = statusMap[nextStatus.toLowerCase()] || nextStatus;

    Alert.alert(
      'Status aktualisieren',
      `Pflanze als "${nextStatusLabel}" markieren?`,
      [
        { text: 'Abbrechen', onPress: () => {}, style: 'cancel' },
        {
          text: 'Bestätigen',
          onPress: async () => {
            try {
              console.log('Updating status to:', nextStatus);
              await progressPlantStatus(plantId);
              const updated = await fetchPlant(plantId);
              console.log('Updated plant:', updated?.status);
              if (updated) {
                setPlant(updated);
              }
              Alert.alert('Erfolg', `Status wurde auf "${nextStatusLabel}" aktualisiert.`);
            } catch (error: any) {
              console.error('Status update error:', error);
              Alert.alert('Fehler', `Status konnte nicht aktualisiert werden: ${error.message}`);
            }
          },
        },
      ]
    );
  }, [plant, plantId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Lade Pflanze...</Text>
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="error-outline" size={64} color={Colors.error} />
        <Text style={styles.errorText}>Pflanze nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.plantName}>{plant.name}</Text>
          {plant.latin_name && (
            <Text style={styles.latinName}>{plant.latin_name}</Text>
          )}
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grundinformationen</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="place" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Standort:</Text>
            <Text style={styles.infoValue}>{plant.location || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="category" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Typ:</Text>
            <Text style={styles.infoValue}>{plant.type || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="info" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Status:</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(plant.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(plant.status)}</Text>
            </View>
          </View>

          {/* Status Progression Button */}
          {getNextStatus(plant.status) && (
            <TouchableOpacity
              style={styles.statusProgressButton}
              onPress={handleProgressStatus}
            >
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
              <Text style={styles.statusProgressButtonText}>
                Als {getStatusLabel(getNextStatus(plant.status) || '')} markieren
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.infoRow}>
            <MaterialIcons name="format-list-numbered" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Anzahl:</Text>
            <Text style={styles.infoValue}>{plant.quantity || '-'}</Text>
          </View>
        </View>

        {/* Properties Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eigenschaften</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="ac-unit" size={20} color={Colors.info} />
            <Text style={styles.infoLabel}>Winterhart:</Text>
            <Text style={styles.infoValue}>{formatBoolean(plant.winterhart)}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="restaurant" size={20} color={Colors.accent} />
            <Text style={styles.infoLabel}>Essbar:</Text>
            <Text style={styles.infoValue}>{formatBoolean(plant.essbar)}</Text>
          </View>
        </View>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termine</Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="event" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Gepflanzt:</Text>
            <Text style={styles.infoValue}>{formatDate(plant.planted_date)}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="event-available" size={20} color={Colors.success} />
            <Text style={styles.infoLabel}>Ernte:</Text>
            <Text style={styles.infoValue}>{formatDate(plant.harvest_date)}</Text>
          </View>
        </View>

        {/* Tags Section */}
        {plant.tags && plant.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {plant.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Notes Section */}
        {plant.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notizen</Text>
            <Text style={styles.notesText}>{plant.notes}</Text>
          </View>
        )}

        {/* Photos Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              📸 Fotos {photos.length > 0 ? `(${photos.length})` : ''}
            </Text>
            <TouchableOpacity
              style={styles.galleryButton}
              onPress={handleViewGallery}
            >
              <MaterialIcons name="photo-library" size={20} color={Colors.primary} />
              <Text style={styles.galleryButtonText}>Galerie</Text>
            </TouchableOpacity>
          </View>
          {photos.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoWrapper}>
                    <Image
                      source={{ uri: photo.photo_url }}
                      style={styles.photoThumbnail}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          {photos.length === 0 && (
            <View style={styles.noPhotosContainer}>
              <Text style={styles.noPhotosText}>Noch keine Fotos hochgeladen</Text>
              <TouchableOpacity
                style={styles.uploadPhotoButton}
                onPress={handleUploadPhoto}
              >
                <MaterialIcons name="add-a-photo" size={18} color="#fff" />
                <Text style={styles.uploadPhotoButtonText}>Foto hinzufügen</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Metadata Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Metadaten</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={20} color={Colors.textLight} />
            <Text style={styles.infoLabel}>Erstellt:</Text>
            <Text style={styles.infoValue}>{formatDate(plant.created_at)}</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="update" size={20} color={Colors.textLight} />
            <Text style={styles.infoLabel}>Aktualisiert:</Text>
            <Text style={styles.infoValue}>{formatDate(plant.updated_at)}</Text>
          </View>
        </View>

        {/* Companion Planting Section */}
        {companions && (companions.good_companions?.length > 0 || companions.bad_companions?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mischkultur-Informationen</Text>

            {/* Good Companions */}
            {companions.good_companions && companions.good_companions.length > 0 && (
              <View style={styles.companionsContainer}>
                <Text style={styles.companionLabel}>✓ Gute Nachbarn</Text>
                <View style={styles.companionChipsContainer}>
                  {companions.good_companions.map((companion, index) => (
                    <View key={index} style={[styles.companionChip, styles.goodCompanion]}>
                      <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
                      <Text style={styles.companionChipText}>{companion}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Bad Companions */}
            {companions.bad_companions && companions.bad_companions.length > 0 && (
              <View style={styles.companionsContainer}>
                <Text style={styles.companionLabel}>✗ Ungünstige Nachbarn</Text>
                <View style={styles.companionChipsContainer}>
                  {companions.bad_companions.map((companion, index) => (
                    <View key={index} style={[styles.companionChip, styles.badCompanion]}>
                      <MaterialIcons name="cancel" size={14} color="#F44336" />
                      <Text style={styles.companionChipText}>{companion}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Harvest Section */}
        {(harvests.length > 0 || harvestTotals.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ernten</Text>

            {/* Harvest Totals */}
            {harvestTotals.length > 0 && (
              <View style={styles.harvestTotalsContainer}>
                {harvestTotals.map((total, index) => (
                  <View key={index} style={styles.harvestTotal}>
                    <Text style={styles.harvestTotalValue}>
                      {total.quantity.toFixed(2)} {total.unit}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Last 3 Harvests */}
            {harvests.length > 0 && (
              <View style={styles.recentHarvestsContainer}>
                <Text style={styles.subSectionTitle}>Letzte Ernten</Text>
                {harvests.slice(0, 3).map((harvest, index) => (
                  <View key={index} style={styles.harvestItem}>
                    <Text style={styles.harvestItemText}>
                      {harvest.quantity} {harvest.unit} • {formatDate(harvest.harvest_date)}
                    </Text>
                    {harvest.notes && <Text style={styles.harvestNotes}>{harvest.notes}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Harvest Action Buttons */}
            <View style={styles.harvestButtonsContainer}>
              <TouchableOpacity
                style={[styles.harvestButton, styles.harvestButtonPrimary]}
                onPress={() => navigation.navigate('AddHarvest', { plantId })}
              >
                <MaterialIcons name="agriculture" size={18} color="#fff" />
                <Text style={styles.harvestButtonText}>Ernte dokumentieren</Text>
              </TouchableOpacity>
              {harvests.length > 3 && (
                <TouchableOpacity
                  style={[styles.harvestButton, styles.harvestButtonSecondary]}
                  onPress={() => navigation.navigate('HarvestLog', { plantId })}
                >
                  <MaterialIcons name="view-list" size={18} color={Colors.primary} />
                  <Text style={[styles.harvestButtonText, styles.harvestButtonTextSecondary]}>
                    Alle anzeigen
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* AI Analysis Section */}
        {aiIdentifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 KI-Analysen</Text>
            {aiIdentifications.slice(0, 5).map((ident, index) => (
              <View key={ident.id || index} style={styles.aiIdentificationItem}>
                <View style={styles.aiIdentificationHeader}>
                  <MaterialIcons 
                    name={ident.ai_type === 'plant' ? 'eco' : 'bug-report'} 
                    size={18} 
                    color={Colors.primary} 
                  />
                  <Text style={styles.aiIdentificationType}>
                    {ident.ai_type === 'plant' ? 'Pflanzen-Erkennung' : 'Schädlings-Erkennung'}
                  </Text>
                </View>
                {ident.result_json && (
                  <Text style={styles.aiIdentificationResult}>
                    {ident.result_json.name || ident.result_json.pest || JSON.stringify(ident.result_json).substring(0, 50)}
                  </Text>
                )}
                <View style={styles.aiIdentificationMeta}>
                  <Text style={styles.aiIdentificationDate}>
                    {formatDate(ident.created_at)}
                  </Text>
                  {ident.confidence && (
                    <Text style={[
                      styles.aiIdentificationConfidence,
                      { color: ident.confidence >= 0.8 ? Colors.success : Colors.warning }
                    ]}>
                      {Math.round(ident.confidence * 100)}%
                    </Text>
                  )}
                </View>
              </View>
            ))}
            {aiIdentifications.length > 5 && (
              <Text style={styles.moreIdentificationsText}>
                + {aiIdentifications.length - 5} weitere Analysen
              </Text>
            )}
          </View>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Floating Edit Button */}
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <MaterialIcons name="edit" size={24} color="#fff" />
        <Text style={styles.editButtonText}>Bearbeiten</Text>
      </TouchableOpacity>
    </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.error,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    alignItems: 'center',
  },
  plantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  latinName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#fff',
    opacity: 0.9,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.surface,
    marginTop: 12,
    padding: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  notesText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    gap: 6,
  },
  galleryButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  photoWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
  },
  noPhotosContainer: {
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: Colors.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  noPhotosText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  uploadPhotoButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    gap: 6,
  },
  uploadPhotoButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  harvestTotalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  harvestTotal: {
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  harvestTotalValue: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  recentHarvestsContainer: {
    marginBottom: 12,
  },
  subSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    marginBottom: 8,
  },
  harvestItem: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  harvestItemText: {
    fontSize: 12,
    color: Colors.text,
  },
  harvestNotes: {
    fontSize: 11,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  harvestButtonsContainer: {
    gap: 8,
    marginTop: 12,
  },
  harvestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  harvestButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  harvestButtonSecondary: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  harvestButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  harvestButtonTextSecondary: {
    color: Colors.primary,
  },
  statusProgressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.success,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 8,
    gap: 6,
  },
  statusProgressButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  companionsContainer: {
    marginBottom: 12,
  },
  companionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  companionChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  companionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 4,
  },
  goodCompanion: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  badCompanion: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  companionChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text,
  },
  aiIdentificationItem: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiIdentificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  aiIdentificationType: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  aiIdentificationResult: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  aiIdentificationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiIdentificationDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
  aiIdentificationConfidence: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  moreIdentificationsText: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  spacer: {
    height: 80,
  },
});
