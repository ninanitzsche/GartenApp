/**
 * Garden Photo Gallery Screen
 * Displays photos of the garden (all plants or specific beds)
 * Reuses PhotoGalleryScreen component
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Photo, PhotoFilters } from '../types/photo';
import Colors from '../theme/colors';
import { fetchAllPhotos, deletePhoto } from '../services/photoService';
import EmptyState from '../components/EmptyState';
import { getAnalysesForPhoto, fetchCloudAnalysisForPhoto } from '../services/aiMetadataService';
import { AIIdentification } from '../types/ai';

type Props = NativeStackScreenProps<RootStackParamList, 'GardenPhotoGallery'>;

const COLUMNS = 3;
const screenWidth = Dimensions.get('window').width;
const photoSize = (screenWidth - 48) / COLUMNS;

export default function GardenPhotoGalleryScreen({ navigation }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<PhotoFilters>(PhotoFilters.ALL);
  const [photoAnalysis, setPhotoAnalysis] = useState<AIIdentification | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [photos, currentFilter]);

  const applyFilter = () => {
    if (currentFilter === PhotoFilters.ALL) {
      setFilteredPhotos(photos);
    } else if (currentFilter === PhotoFilters.AI_ANALYZED) {
      setFilteredPhotos(photos.filter(p => p.has_ai_analysis || p.ai_analysis));
    } else {
      setFilteredPhotos(photos.filter(p => !p.has_ai_analysis && !p.ai_analysis));
    }
  };

  const loadPhotos = async () => {
    try {
      const allPhotos = await fetchAllPhotos();
      const gardenPhotos = allPhotos.filter(
        photo => !photo.plant_id || photo.plant_id === 'garden'
      );
      const photosWithAI = await Promise.all(
        gardenPhotos.map(async (photo) => {
          const analysis = await fetchCloudAnalysisForPhoto(photo.id);
          return {
            ...photo,
            has_ai_analysis: !!analysis,
          };
        })
      );
      setPhotos(photosWithAI);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Fehler', 'Fotos konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleFilterChange = (filter: PhotoFilters) => {
    setCurrentFilter(filter);
  };

  const handlePhotoPress = async (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoAnalysis(null);
    setModalVisible(true);
    
    if (photo.has_ai_analysis) {
      setLoadingAnalysis(true);
      try {
        const analysis = await fetchCloudAnalysisForPhoto(photo.id);
        setPhotoAnalysis(analysis);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoadingAnalysis(false);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPhotos();
  };

  const handleDeletePhoto = (photo: Photo) => {
    Alert.alert(
      'Löschen',
      'Möchten Sie dieses Foto wirklich löschen?',
      [
        { text: 'Abbrechen', onPress: () => {}, style: 'cancel' },
        {
          text: 'Löschen',
          onPress: async () => {
            try {
              await deletePhoto(photo.id);
              setPhotos(photos.filter((p) => p.id !== photo.id));
              setModalVisible(false);
              Alert.alert('Erfolg', 'Foto gelöscht.');
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Fehler', 'Foto konnte nicht gelöscht werden.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleUploadPhoto = () => {
    navigation.navigate('PhotoUpload', { plantId: 'garden' });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderPhotoItem = ({ item }: { item: Photo }) => (
    <TouchableOpacity
      style={[styles.photoItem, { width: photoSize, height: photoSize }]}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.photo_url }}
        style={styles.photo}
        resizeMode="cover"
      />
      {item.has_ai_analysis && (
        <View style={styles.aiBadge}>
          <MaterialIcons name="auto-awesome" size={14} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterChip, currentFilter === PhotoFilters.ALL && styles.filterChipActive]}
        onPress={() => handleFilterChange(PhotoFilters.ALL)}
      >
        <Text style={[styles.filterChipText, currentFilter === PhotoFilters.ALL && styles.filterChipTextActive]}>
          Alle
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, currentFilter === PhotoFilters.AI_ANALYZED && styles.filterChipActive]}
        onPress={() => handleFilterChange(PhotoFilters.AI_ANALYZED)}
      >
        <MaterialIcons name="auto-awesome" size={16} color={currentFilter === PhotoFilters.AI_ANALYZED ? '#fff' : Colors.primary} />
        <Text style={[styles.filterChipText, currentFilter === PhotoFilters.AI_ANALYZED && styles.filterChipTextActive]}>
          KI-Analysiert
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterChip, currentFilter === PhotoFilters.MANUAL && styles.filterChipActive]}
        onPress={() => handleFilterChange(PhotoFilters.MANUAL)}
      >
        <Text style={[styles.filterChipText, currentFilter === PhotoFilters.MANUAL && styles.filterChipTextActive]}>
          Manuell
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gartenfotos</Text>
        <TouchableOpacity onPress={handleUploadPhoto}>
          <MaterialIcons name="add-a-photo" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      {renderFilterChips()}

      {filteredPhotos.length > 0 ? (
        <FlatList
          data={filteredPhotos}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMNS}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      ) : (
        <EmptyState
          icon="photo-library"
          title="Keine Fotos"
          message="Fügen Sie Fotos Ihres Gartens hinzu."
        />
      )}

      {/* Photo Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <MaterialIcons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {selectedPhoto && (
            <>
              <Image
                source={{ uri: selectedPhoto.photo_url }}
                style={styles.fullPhoto}
                resizeMode="contain"
              />

              {(loadingAnalysis || photoAnalysis) && (
                <View style={styles.aiAnalysisSection}>
                  <View style={styles.aiAnalysisHeader}>
                    <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
                    <Text style={styles.aiAnalysisTitle}>KI-Analyse</Text>
                  </View>
                  
                  {loadingAnalysis ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : photoAnalysis ? (
                    <View style={styles.aiAnalysisContent}>
                      <Text style={styles.aiAnalysisType}>
                        {photoAnalysis.ai_type === 'plant' ? 'Pflanzen-Erkennung' : 'Schädlings-Erkennung'}
                      </Text>
                      {photoAnalysis.result_json && (
                        <Text style={styles.aiAnalysisResult}>
                          {photoAnalysis.result_json.name || JSON.stringify(photoAnalysis.result_json)}
                        </Text>
                      )}
                      {photoAnalysis.confidence && (
                        <View style={styles.confidenceContainer}>
                          <Text style={styles.confidenceLabel}>Konfidenz:</Text>
                          <Text style={[
                            styles.confidenceValue,
                            { color: photoAnalysis.confidence >= 0.8 ? Colors.success : Colors.warning }
                          ]}>
                            {Math.round(photoAnalysis.confidence * 100)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : null}
                </View>
              )}

              <View style={styles.modalFooter}>
                {!selectedPhoto.has_ai_analysis && (
                  <TouchableOpacity
                    style={styles.analyzeButton}
                    onPress={() => {
                      setModalVisible(false);
                      Alert.alert('Info', 'Nutzen Sie die Pflanzenerkennung im Hauptmenü.');
                    }}
                  >
                    <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                    <Text style={styles.analyzeButtonText}>Analysieren</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deletePhotoButton}
                  onPress={() => handleDeletePhoto(selectedPhoto)}
                >
                  <MaterialIcons name="delete" size={20} color="#fff" />
                  <Text style={styles.deletePhotoText}>Löschen</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.text,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 8,
  },
  photoItem: {
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  aiBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  fullPhoto: {
    width: screenWidth - 32,
    height: screenWidth - 32,
    borderRadius: 8,
  },
  aiAnalysisSection: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
  },
  aiAnalysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiAnalysisTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  aiAnalysisContent: {
    gap: 4,
  },
  aiAnalysisType: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  aiAnalysisResult: {
    fontSize: 14,
    color: Colors.text,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confidenceLabel: {
    fontSize: 12,
    color: Colors.textLight,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deletePhotoButton: {
    flex: 1,
    backgroundColor: Colors.error,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  deletePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
