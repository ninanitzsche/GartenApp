import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  ProgressBarAndroid,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { uploadPhoto } from '../services/photoService';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoUpload'>;

export default function PhotoUploadScreen({ route, navigation }: Props) {
  const { plantId } = route.params || {};
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCancelled, setUploadCancelled] = useState(false);

  /**
   * Compress image to reduce file size by ~70%
   * Target: 1200x1200 max, 70% quality JPEG
   */
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200, height: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (error: any) {
      console.error('Error compressing image:', error);
      throw new Error(`Bildkomprimierung fehlgeschlagen: ${error.message}`);
    }
  };

  /**
   * Store upload state in AsyncStorage for resume capability
   */
  const storeUploadState = async (
    plantId: string,
    imageUri: string,
    fileName: string
  ) => {
    try {
      const uploadState = {
        plantId,
        imageUri,
        fileName,
        timestamp: Date.now(),
        status: 'in_progress',
      };
      await AsyncStorage.setItem(
        `upload_${fileName}`,
        JSON.stringify(uploadState)
      );
    } catch (error) {
      console.error('Error storing upload state:', error);
    }
  };

  /**
   * Clear upload state after successful upload
   */
  const clearUploadState = async (fileName: string) => {
    try {
      await AsyncStorage.removeItem(`upload_${fileName}`);
    } catch (error) {
      console.error('Error clearing upload state:', error);
    }
  };

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    return (
      cameraPermission.status === 'granted' &&
      mediaLibraryPermission.status === 'granted'
    );
  };

  const handleCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Berechtigung erforderlich',
        'Bitte erlauben Sie den Zugriff auf Kamera und Galerie.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Berechtigung erforderlich',
        'Bitte erlauben Sie den Zugriff auf Kamera und Galerie.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Fehler', 'Bitte wählen Sie ein Foto aus.');
      return;
    }

    if (!plantId) {
      Alert.alert('Fehler', 'Plant ID nicht gefunden. Bitte versuchen Sie es später erneut.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    setUploadCancelled(false);
    const fileName = `photo-${Date.now()}.jpg`;

    try {
      // Step 1: Compress image (simulated progress 0-30%)
      setUploadProgress(10);
      const compressedUri = await compressImage(selectedImage);
      setUploadProgress(30);

      if (uploadCancelled) return;

      // Step 2: Store upload state for resume capability
      await storeUploadState(plantId, compressedUri, fileName);

      // Step 3: Upload image (30-90%)
      setUploadProgress(40);
      await uploadPhoto(plantId, compressedUri, fileName);
      setUploadProgress(90);

      if (uploadCancelled) return;

      // Step 4: Clear upload state (90-100%)
      await clearUploadState(fileName);
      setUploadProgress(100);

      Alert.alert('Erfolg', 'Foto erfolgreich hochgeladen!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error('Upload error:', error);
      // Store for retry/resume on error
      if (!uploadCancelled) {
        Alert.alert(
          'Fehler',
          `Foto konnte nicht hochgeladen werden: ${error.message}`,
          [
            { text: 'Abbrechen', style: 'cancel' },
            {
              text: 'Erneut versuchen',
              onPress: handleUpload,
            },
          ]
        );
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    setUploadCancelled(true);
    setLoading(false);
    setUploadProgress(0);
    Alert.alert('Abgebrochen', 'Upload wurde abgebrochen. Sie können es später erneut versuchen.');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Foto hochladen</Text>
          <Text style={styles.subtitle}>Wählen Sie ein Foto für diese Pflanze</Text>
        </View>

        {/* Image Preview */}
        {selectedImage ? (
          <View style={styles.previewSection}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.preview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setSelectedImage(null)}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
              <Text style={styles.changeButtonText}>Foto ändern</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="image-not-supported" size={64} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>Noch kein Foto ausgewählt</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCamera}
            disabled={loading}
          >
            <MaterialIcons name="camera-alt" size={32} color={Colors.primary} />
            <Text style={styles.buttonLabel}>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleGallery}
            disabled={loading}
          >
            <MaterialIcons name="photo-library" size={32} color={Colors.primary} />
            <Text style={styles.buttonLabel}>Galerie</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Upload Button & Progress */}
      <View style={styles.footer}>
        {loading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            {Platform.OS === 'android' ? (
              <ProgressBarAndroid
                styleAttr="Horizontal"
                indeterminate={false}
                progress={uploadProgress / 100}
                color={Colors.primary}
              />
            ) : (
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${uploadProgress}%` },
                  ]}
                />
              </View>
            )}
            <Text style={styles.progressText}>{uploadProgress}%</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.uploadButton,
              (!selectedImage || loading) && styles.uploadButtonDisabled,
            ]}
            onPress={handleUpload}
            disabled={!selectedImage || loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.uploadButtonText}>Wird hochgeladen...</Text>
              </>
            ) : (
              <>
                <MaterialIcons name="cloud-upload" size={24} color="#fff" />
                <Text style={styles.uploadButtonText}>Hochladen</Text>
              </>
            )}
          </TouchableOpacity>

          {loading && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelUpload}
            >
              <MaterialIcons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  previewSection: {
    padding: 16,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: Colors.border,
  },
  changeButton: {
    flexDirection: 'row',
    backgroundColor: Colors.error,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textLight,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.textDisabled,
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.error,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
