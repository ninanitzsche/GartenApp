import React, { useEffect, useState } from 'react';
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
import { fetchPhotos, deletePhoto } from '../services/photoService';

type PhotoGalleryRouteProp = RouteProp<RootStackParamList, 'PhotoGallery'>;
type Props = NativeStackScreenProps<RootStackParamList, 'PhotoGallery'>;

interface PhotoGridItem extends Photo {
  key: string;
}

export default function PhotoGalleryScreen({ navigation }: Props) {
  const route = useRoute<PhotoGalleryRouteProp>();
  const { plantId } = route.params;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (plantId) {
      loadPhotos();
    }
  }, [plantId]);

  const loadPhotos = async () => {
    if (!plantId) return;

    try {
      setLoading(true);
      const photoList = await fetchPhotos(plantId);
      setPhotos(photoList);
    } catch (error: any) {
      Alert.alert('Fehler', `Fotos konnten nicht geladen werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPhotos();
    } catch (error: any) {
      Alert.alert('Fehler', `Fotos konnten nicht aktualisiert werden: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  const handleDeletePhoto = () => {
    if (!selectedPhoto) return;

    Alert.alert(
      'Foto löschen?',
      'Dieses Foto wird permanent gelöscht.',
      [
        {
          text: 'Abbrechen',
          style: 'cancel',
        },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePhoto(selectedPhoto.id, selectedPhoto.photo_url);
              setModalVisible(false);
              setSelectedPhoto(null);
              await loadPhotos();
              Alert.alert('Erfolg', 'Foto wurde gelöscht.');
            } catch (error: any) {
              Alert.alert('Fehler', `Foto konnte nicht gelöscht werden: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleUploadPhoto = () => {
    if (plantId) {
      navigation.navigate('PhotoUpload', { plantId });
    }
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

  const renderPhotoItem = ({ item }: { item: PhotoGridItem }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: item.file_url || item.photo_url }}
        style={styles.photoImage}
        resizeMode="cover"
      />
      <View style={styles.photoOverlay}>
        <MaterialIcons name="zoom-in" size={32} color="#fff" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <MaterialIcons name="image-not-supported" size={64} color={Colors.textLight} />
      <Text style={styles.emptyStateTitle}>Keine Fotos vorhanden</Text>
      <Text style={styles.emptyStateSubtitle}>
        Fügen Sie ein Foto hinzu, um diese Pflanze zu dokumentieren
      </Text>
      <TouchableOpacity
        style={styles.addPhotoButtonSmall}
        onPress={handleUploadPhoto}
      >
        <MaterialIcons name="add-a-photo" size={20} color={Colors.primary} />
        <Text style={styles.addPhotoButtonText}>Foto hochladen</Text>
      </TouchableOpacity>
    </View>
  );

  const gridData: PhotoGridItem[] = photos.map((photo) => ({
    ...photo,
    key: photo.id,
  }));

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
        {photos.length > 0 && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPhoto}
          >
            <MaterialIcons name="add-a-photo" size={24} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Gallery Grid */}
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
                source={{ uri: selectedPhoto.file_url || selectedPhoto.photo_url }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            )}

            {/* Photo Info and Delete Button */}
            {selectedPhoto && (
              <View style={styles.photoInfoContainer}>
                <View>
                  <Text style={styles.photoDate}>
                    {formatDate(selectedPhoto.created_at)}
                  </Text>
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
  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
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
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  addPhotoButtonSmall: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    gap: 8,
  },
  addPhotoButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
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
