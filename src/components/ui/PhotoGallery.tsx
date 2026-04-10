/**
 * PhotoGallery Component
 * 2026 - Grid component for displaying photos
 */

import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Photo } from '../../types/photo';
import { Colors2026, Radius2026, Spacing2026, Typography2026 } from '../../theme/designSystemV2';

interface Props {
  photos: Photo[];
  onAddPhoto: () => void;
  onRemovePhoto?: (photoId: string) => void;
  testID?: string;
}

const GRID_SPACING = 4;
const HORIZONTAL_PADDING = 16;

export default function PhotoGallery({
  photos,
  onAddPhoto,
  onRemovePhoto,
  testID,
}: Props) {
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - HORIZONTAL_PADDING * 2 - GRID_SPACING * 2) / 3;

  const renderPhoto = ({ item }: { item: Photo }) => {
    const imageUri = item.thumbnail_url || item.photo_url || item.file_url;

    return (
      <View style={[styles.photoContainer, { width: itemWidth, height: itemWidth }]}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.photo} />
        ) : (
          <View style={styles.placeholderPhoto} />
        )}
        {onRemovePhoto && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => onRemovePhoto(item.id)}
            accessibilityLabel="Foto entfernen"
            accessibilityRole="button"
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderAddButton = () => (
    <TouchableOpacity
      style={[styles.photoContainer, styles.addButton, { width: itemWidth, height: itemWidth }]}
      onPress={onAddPhoto}
      accessibilityLabel="Foto hinzufügen"
      accessibilityRole="button"
      testID="add-photo-button"
    >
      <Text style={styles.addButtonText}>+</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }: { item: Photo }) => {
    if (item.id === '__add__') {
      return renderAddButton();
    }
    return renderPhoto({ item });
  };

  const data = [...photos, { id: '__add__' } as Photo];

  const photosOnly = photos;
  const rows: Photo[][] = [];
  for (let i = 0; i < photosOnly.length; i += 3) {
    rows.push(photosOnly.slice(i, i + 3));
  }

  if (rows.length === 0) {
    return (
      <View testID={testID} style={styles.row}>
        {renderAddButton()}
      </View>
    );
  }

  return (
    <View testID={testID}>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((photo) => renderPhoto({ item: photo }))}
          {rowIndex === rows.length - 1 && renderAddButton()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: GRID_SPACING,
    marginBottom: GRID_SPACING,
  },
  photoContainer: {
    borderRadius: Radius2026.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholderPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors2026.glass.medium,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: Colors2026.glass.light,
    borderWidth: 2,
    borderColor: Colors2026.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 32,
    color: Colors2026.textMuted,
  },
});