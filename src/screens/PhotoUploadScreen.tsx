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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { uploadPhoto } from '../services/photoService';

type Props = NativeStackScreenProps<RootStackParamList, 'PhotoUpload'>;

export default function PhotoUploadScreen({ route, navigation }: Props) {
  const { plantId } = route.params;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    try {
      const fileName = `photo-${Date.now()}.jpg`;
      await uploadPhoto(plantId, selectedImage, fileName);

      Alert.alert('Erfolg', 'Foto erfolgreich hochgeladen!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Fehler', `Foto konnte nicht hochgeladen werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
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

      {/* Upload Button */}
      <View style={styles.footer}>
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
  uploadButton: {
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
});
