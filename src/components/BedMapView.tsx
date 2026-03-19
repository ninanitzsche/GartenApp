/**
 * BedMapView Component
 * Interactive map showing beds as positioned objects
 * Tapping a bed shows its details
 */
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Bed } from '../types/bed';
import Colors from '../theme/colors';

interface BedMapViewProps {
  beds: Bed[];
  onBedPress: (bedId: string) => void;
  onAddBedPress?: () => void;
  style?: ViewStyle;
}

export default function BedMapView({
  beds,
  onBedPress,
  onAddBedPress,
  style,
}: BedMapViewProps) {
  const screenWidth = Dimensions.get('window').width - 32; // Account for padding

  const renderBed = (bed: Bed) => {
    const left = (bed.position_x / 100) * screenWidth;
    const top = (bed.position_y / 100) * 300; // Assume 300px height for map
    const width = (bed.width / 100) * screenWidth;
    const height = (bed.height / 100) * 300;

    const bedStyle: ViewStyle = {
      position: 'absolute',
      left,
      top,
      width,
      height,
      backgroundColor: bed.color || '#4CAF50',
      borderWidth: 2,
      borderColor: Colors.border,
      borderRadius: bed.shape === 'circle' ? width / 2 : 4,
      opacity: 0.8,
      justifyContent: 'center',
      alignItems: 'center',
    };

    return (
      <TouchableOpacity
        key={bed.id}
        style={bedStyle}
        onPress={() => onBedPress(bed.id)}
        activeOpacity={0.6}
      >
        <Text style={styles.bedLabel} numberOfLines={2}>
          {bed.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapContainer}>
        {beds.map(renderBed)}
        {onAddBedPress && beds.length === 0 && (
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={onAddBedPress}
          >
            <MaterialIcons name="add-circle-outline" size={48} color={Colors.primary} />
            <Text style={styles.emptyStateText}>Beet hinzufügen</Text>
          </TouchableOpacity>
        )}
      </View>

      {onAddBedPress && beds.length > 0 && (
        <TouchableOpacity style={styles.addButton} onPress={onAddBedPress}>
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Beet hinzufügen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
    height: 300,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 16,
  },
  bedLabel: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
  emptyStateButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 8,
    color: Colors.textLight,
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
