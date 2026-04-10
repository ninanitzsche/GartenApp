/**
 * CoverImagePicker Component
 * 2026 - Image picker for cover photos
 */

import React from 'react';
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors2026, Radius2026, Spacing2026, Typography2026, Shadows2026 } from '../../theme/designSystemV2';

interface Props {
  imageUrl?: string | null;
  onChangeImage: (url: string | null) => void;
  placeholder?: string;
  testID?: string;
}

export default function CoverImagePicker({
  imageUrl,
  onChangeImage,
  placeholder,
  testID,
}: Props) {
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        'Berechtigung erforderlich',
        'Bitte erteile die Berechtigung, um Bilder aus der Bibliothek auszuwählen.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChangeImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert(
        'Berechtigung erforderlich',
        'Bitte erteile die Berechtigung, um die Kamera zu verwenden.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChangeImage(result.assets[0].uri);
    }
  };

  const handleRemove = () => {
    onChangeImage(null);
  };

  if (imageUrl) {
    return (
      <View style={styles.container} testID={testID}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={pickImage}
            accessibilityLabel="Bild ändern"
            accessibilityRole="button"
          >
            <Text style={styles.primaryButtonText}>Ändern</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.errorButton]}
            onPress={handleRemove}
            accessibilityLabel="Bild entfernen"
            accessibilityRole="button"
          >
            <Text style={styles.errorButtonText}>Entfernen</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <TouchableOpacity
        style={styles.placeholder}
        onPress={pickImage}
        accessibilityLabel={placeholder || 'Bild auswählen'}
        accessibilityRole="button"
      >
        <Text style={styles.placeholderIcon}>+</Text>
        <Text style={styles.placeholderText}>
          {placeholder || 'Bild auswählen'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={takePhoto}
        accessibilityLabel="Foto aufnehmen"
        accessibilityRole="button"
      >
        <Text style={styles.secondaryButtonText}>Foto aufnehmen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing2026.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: Radius2026.md,
    marginBottom: Spacing2026.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing2026.md,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing2026.md,
    paddingHorizontal: Spacing2026.lg,
    borderRadius: Radius2026.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: Colors2026.primary,
    ...Shadows2026.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
  },
  errorButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors2026.status.error,
  },
  errorButtonText: {
    color: Colors2026.status.error,
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
  },
  placeholder: {
    height: 200,
    backgroundColor: Colors2026.glass.medium,
    borderRadius: Radius2026.md,
    borderWidth: 2,
    borderColor: Colors2026.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing2026.md,
  },
  placeholderIcon: {
    fontSize: 48,
    color: Colors2026.textMuted,
    marginBottom: Spacing2026.sm,
  },
  placeholderText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textSecondary,
    fontWeight: '500',
  },
  secondaryButton: {
    paddingVertical: Spacing2026.md,
    paddingHorizontal: Spacing2026.lg,
    borderRadius: Radius2026.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors2026.glass.light,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  secondaryButtonText: {
    color: Colors2026.primary,
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
  },
});