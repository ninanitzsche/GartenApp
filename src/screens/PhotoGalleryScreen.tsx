import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { Photo } from '../types/photo';
import Colors from '../theme/colors';
import { Colors2026 } from '../theme/designSystemV2';
import { fetchAllPhotos, fetchPhotos as fetchPhotosForPlant, deletePhoto, PhotoFilters } from '../services/photoService';
import EmptyState from '../components/ui/EmptyState';
import PhotoFilterModal from '../components/PhotoFilterModal';
import EmptyPhotosIllustration from '../components/illustrations/EmptyPhotosIllustration';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoGallery'>;
type PhotoGalleryRouteProp = RouteProp<RootStackParamList, 'PhotoGallery'>;

interface PhotoGridItem extends Photo {
  key: string;
}

const PHOTO_BATCH_SIZE = 50;

export default function PhotoGalleryScreen({ navigation }: Props) {
  // Get route params
  const route = useRoute<PhotoGalleryRouteProp>();
  const { plantId } = route.params || {};
  const isPlantSpecific = !!plantId;

  // State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Filters & Pagination
  const [currentFilters, setCurrentFilters] = useState<PhotoFilters>({});
  const [paginationOffset, setPaginationOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load initial photos on mount
  useEffect(() => {
    loadPhotos();
  }, [currentFilters, plantId]); // Reload when filters or plantId changes

  const loadPhotos = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPaginationOffset(0);
      } else {
        setLoading(true);
      }

      let newPhotos: Photo[];

      if (isPlantSpecific && plantId) {
        // Plant-specific mode: show only photos for this plant
        newPhotos = await fetchPhotosForPlant(plantId);
      } else {
        // Gallery mode: show all user photos with filters and pagination
        newPhotos = await fetchAllPhotos(currentFilters, {
          offset: 0,
          limit: PHOTO_BATCH_SIZE,
        });
      }

      // Filter out photos without valid URLs
      const validPhotos = newPhotos.filter(p => !!p.photo_url);
      setPhotos(validPhotos);
      setHasMore(newPhotos.length >= PHOTO_BATCH_SIZE);
    } catch (error: any) {
      Alert.alert('Fehler', `Fotos konnten nicht geladen werden: ${error.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentFilters, plantId, isPlantSpecific]);

  const onRefresh = useCallback(async () => {
    await loadPhotos(true);
  }, [loadPhotos]);

  const loadMorePhotos = useCallback(async () => {
    // Don't paginate in plant-specific mode
    if (isPlantSpecific || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextOffset = paginationOffset + PHOTO_BATCH_SIZE;

      const morePhotos = await fetchAllPhotos(currentFilters, {
        offset: nextOffset,
        limit: PHOTO_BATCH_SIZE,
      });

      if (morePhotos.length === 0) {
        setHasMore(false);
      } else {
        // Filter out photos without valid URLs
        const validPhotos = morePhotos.filter(p => !!p.photo_url);
        setPhotos([...photos, ...validPhotos]);
        setPaginationOffset(nextOffset);
        setHasMore(morePhotos.length >= PHOTO_BATCH_SIZE);
      }
    } catch (error: any) {
      console.error('Error loading more photos:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [photos, paginationOffset, currentFilters, isLoadingMore, hasMore, isPlantSpecific]);

  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;

    Alert.alert('Foto löschen', 'Dieses Foto wird permanent gelöscht. Fortfahren?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePhoto(selectedPhoto.id, selectedPhoto.file_url);
            setModalVisible(false);
            setSelectedPhoto(null);
            await loadPhotos(true); // Reload gallery
            Alert.alert('Erfolg', 'Foto wurde gelöscht');
          } catch (error: any) {
            Alert.alert('Fehler', `${error.message}`);
          }
        },
      },
    ]);
  };

  const handleApplyFilters = (filters: PhotoFilters) => {
    setCurrentFilters(filters);
    setFilterModalVisible(false);
    setPaginationOffset(0);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Determine active filter count for badge
  const activeFilterCount =
    (currentFilters.locations?.length || 0) +
    (currentFilters.plantIds?.length || 0) +
    (currentFilters.dateRange ? 1 : 0);

  // Memoized photo item renderer
  const renderPhotoItem = useCallback(
    ({ item }: { item: PhotoGridItem }) => (
      <TouchableOpacity
        style={styles.photoItem}
        onPress={() => handlePhotoPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.photo_url }}
          style={styles.photoImage}
          resizeMode="cover"
        />
        <View style={styles.photoOverlay}>
          <MaterialIcons name="zoom-in" size={32} color="#fff" />
        </View>
      </TouchableOpacity>
    ),
    []
  );

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon={<EmptyPhotosIllustration />}
        title="Keine Fotos vorhanden"
        subtitle={isPlantSpecific ? "Diese Pflanze hat noch keine Fotos" : "Sie haben noch keine Fotos in Ihrer Galerie"}
        containerStyle={styles.emptyStateContainer}
      />
    ),
    [isPlantSpecific]
  );

  const renderFooter = useCallback(() => {
    if (!hasMore || photos.length === 0) return null;
    return isLoadingMore ? (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    ) : null;
  }, [isLoadingMore, hasMore, photos.length]);

  const gridData: PhotoGridItem[] = useMemo(
    () =>
      photos.map((photo) => ({
        ...photo,
        key: photo.id,
      })),
    [photos]
  );

  // Item height calculation for 2-column grid
  const PHOTO_ITEM_HEIGHT = 170;
  const PHOTO_GRID_ROW_HEIGHT = PHOTO_ITEM_HEIGHT + 8;

  const getItemLayout = useCallback(
    (_data: PhotoGridItem[] | null, index: number) => ({
      length: PHOTO_GRID_ROW_HEIGHT,
      offset: Math.floor(index / 2) * PHOTO_GRID_ROW_HEIGHT,
      index,
    }),
    []
  );

  if (loading && photos.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Lade Fotos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Fotos</Text>
          <Text style={styles.headerSubtitle}>{photos.length} Foto(s)</Text>
        </View>
        <View style={styles.headerButtons}>
          {photos.length > 0 && !isPlantSpecific && (
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <MaterialIcons name="tune" size={24} color={Colors.primary} />
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Gallery Grid or Empty State */}
      {photos.length > 0 ? (
        <FlatList
          data={gridData}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.key}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.gridContent}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={4}
          getItemLayout={getItemLayout}
          onEndReached={loadMorePhotos}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <FlatList
          data={[]}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.key}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* Filter Modal */}
      <PhotoFilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        currentFilters={currentFilters}
      />

      {/* Full-size Photo Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Dark Background */}
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setModalVisible(false)}
            activeOpacity={1}
          />

          {/* Image and Controls */}
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* Full Image */}
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto.photo_url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}

            {/* Photo Info and Delete Button */}
            {selectedPhoto && (
              <View style={styles.photoInfoContainer}>
                <View>
                  <Text style={styles.photoDate}>{formatDate(selectedPhoto.created_at)}</Text>
                  {selectedPhoto.notes && (
                    <Text style={styles.photoNotes}>{selectedPhoto.notes}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDeletePhoto}
                >
                  <MaterialIcons name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  photoItem: {
    flex: 1,
    aspectRatio: 1,
    marginHorizontal: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingFooter: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullImage: {
    width: '100%',
    height: '70%',
    borderRadius: 8,
    marginBottom: 16,
  },
  photoInfoContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoDate: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  photoNotes: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontStyle: 'italic',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
