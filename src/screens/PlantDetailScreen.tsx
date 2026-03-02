import React, { useEffect, useState } from 'react';
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
import { fetchPlant } from '../services/plantService';
import { Plant } from '../types/plant';
import { Photo, PhotoPlant } from '../types/photo';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlantDetails();
  }, [plantId]);

  const fetchPlantDetails = async () => {
    try {
      setLoading(true);

      // Fetch plant data using service
      const plantData = await fetchPlant(plantId);
      setPlant(plantData);

      // Fetch related photos via junction table
      const { data: photoData, error: photoError } = await supabase
        .from('photo_plants')
        .select('photos(*)')
        .eq('plant_id', plantId);

      if (photoError) {
        console.error('Error fetching photos:', photoError);
      } else if (photoData) {
        const photoList = photoData
          .map((pp: any) => pp.photos)
          .filter((p: Photo | null) => p !== null) as Photo[];
        setPhotos(photoList);
      }
    } catch (error: any) {
      console.error('Error fetching plant details:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditPlant', { plantId });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  const formatBoolean = (value?: boolean) => {
    if (value === undefined || value === null) return '-';
    return value ? 'Ja' : 'Nein';
  };

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
              <Text style={styles.statusText}>{plant.status}</Text>
            </View>
          </View>

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
        {photos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos ({photos.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.photosContainer}>
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoWrapper}>
                    <Image
                      source={{ uri: photo.thumbnail_url || photo.file_url }}
                      style={styles.photoThumbnail}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

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
      </ScrollView>

      {/* Floating Edit Button */}
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <MaterialIcons name="edit" size={24} color="#fff" />
        <Text style={styles.editButtonText}>Bearbeiten</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStatusColor = (status: string): string => {
  const statusColors: { [key: string]: string } = {
    etabliert: Colors.success,
    geplant: Colors.info,
    bestellt: Colors.warning,
    gepflanzt: Colors.primaryLight,
    geerntet: Colors.accent,
    entfernt: Colors.textLight,
  };
  return statusColors[status.toLowerCase()] || Colors.textLight;
};

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
});
