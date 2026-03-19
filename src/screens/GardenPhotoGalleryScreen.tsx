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
import { Photo } from '../types/photo';
import Colors from '../theme/colors';
import { fetchAllPhotos, deletePhoto } from '../services/photoService';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'GardenPhotoGallery'>;

const COLUMNS = 3;
const screenWidth = Dimensions.get('window').width;
const photoSize = (screenWidth - 48) / COLUMNS;

export default function GardenPhotoGalleryScreen({ navigation }: Props) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      // Fetch all photos for current user (will be filtered by location if needed)
      const allPhotos = await fetchAllPhotos();
      // Filter photos that are either without plantId (garden photos) or tagged for garden
      const gardenPhotos = allPhotos.filter(
        photo => !photo.plant_id || photo.plant_id === 'garden'
      );
      setPhotos(gardenPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      Alert.alert('Fehler', 'Fotos konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPhotos();
  };

  const handlePhotoPress = (photo: Photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
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
        source={{ uri: item.url }}
        style={styles.photo}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Gartenfotos</Text>
        <TouchableOpacity onPress={handleUploadPhoto}>
          <MaterialIcons name="add-a-photo" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {photos.length > 0 ? (
        <FlatList
          data={photos}
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
          actionLabel="Foto hinzufügen"
          onAction={handleUploadPhoto}
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
                source={{ uri: selectedPhoto.url }}
                style={styles.fullPhoto}
                resizeMode="contain"
              />

              <View style={styles.modalFooter}>
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
  modalFooter: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  deletePhotoButton: {
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
