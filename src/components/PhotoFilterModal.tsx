import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { fetchPhotoLocations, fetchPlantsWithPhotos, PhotoFilters } from '../services/photoService';
import { Plant } from '../types/plant';

interface PhotoFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: PhotoFilters) => void;
  currentFilters?: PhotoFilters;
}

type DateRangeType = 'all-time' | 'this-year' | 'this-month';

export default function PhotoFilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
}: PhotoFilterModalProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set(currentFilters?.locations || [])
  );
  const [selectedPlants, setSelectedPlants] = useState<Set<string>>(
    new Set(currentFilters?.plantIds || [])
  );
  const [dateRange, setDateRange] = useState<DateRangeType>(
    currentFilters?.dateRange ? 'custom' : 'all-time'
  );

  // Load filter options on mount
  useEffect(() => {
    if (visible) {
      loadFilterOptions();
    }
  }, [visible]);

  const loadFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      const [locationsData, plantsData] = await Promise.all([
        fetchPhotoLocations(),
        fetchPlantsWithPhotos(),
      ]);
      setLocations(locationsData);
      setPlants(plantsData);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLocation = (location: string) => {
    const newSet = new Set(selectedLocations);
    if (newSet.has(location)) {
      newSet.delete(location);
    } else {
      newSet.add(location);
    }
    setSelectedLocations(newSet);
  };

  const togglePlant = (plantId: string) => {
    const newSet = new Set(selectedPlants);
    if (newSet.has(plantId)) {
      newSet.delete(plantId);
    } else {
      newSet.add(plantId);
    }
    setSelectedPlants(newSet);
  };

  const getDateRange = (type: DateRangeType): { from: Date; to: Date } | undefined => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (type) {
      case 'this-month': {
        const from = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from, to: tomorrow };
      }
      case 'this-year': {
        const from = new Date(today.getFullYear(), 0, 1);
        return { from, to: tomorrow };
      }
      case 'all-time':
      default:
        return undefined;
    }
  };

  const handleApply = () => {
    const filters: PhotoFilters = {};

    if (selectedLocations.size > 0) {
      filters.locations = Array.from(selectedLocations);
    }

    if (selectedPlants.size > 0) {
      filters.plantIds = Array.from(selectedPlants);
    }

    const dateRangeFilter = getDateRange(dateRange);
    if (dateRangeFilter) {
      filters.dateRange = dateRangeFilter;
    }

    onApply(filters);
  };

  const handleClearAll = () => {
    setSelectedLocations(new Set());
    setSelectedPlants(new Set());
    setDateRange('all-time');
    onApply({});
  };

  const activeFilterCount = selectedLocations.size + selectedPlants.size + (dateRange !== 'all-time' ? 1 : 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Filter</Text>
            {activeFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{activeFilterCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onClose}>
            <MaterialIcons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Location Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Standort</Text>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={styles.filterItem}
                  onPress={() => toggleLocation(location)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedLocations.has(location) && styles.checkboxChecked,
                    ]}
                  >
                    {selectedLocations.has(location) && (
                      <MaterialIcons name="check" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.filterLabel}>{location}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Plant Filter */}
            {plants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Verknüpfte Pflanzen</Text>
                {plants.map((plant) => (
                  <TouchableOpacity
                    key={plant.id}
                    style={styles.filterItem}
                    onPress={() => togglePlant(plant.id)}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        selectedPlants.has(plant.id) && styles.checkboxChecked,
                      ]}
                    >
                      {selectedPlants.has(plant.id) && (
                        <MaterialIcons name="check" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.filterLabel}>{plant.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Date Range Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Zeitraum</Text>
              {(['all-time', 'this-year', 'this-month'] as const).map((range) => (
                <TouchableOpacity
                  key={range}
                  style={styles.filterItem}
                  onPress={() => setDateRange(range)}
                >
                  <View
                    style={[
                      styles.radio,
                      dateRange === range && styles.radioChecked,
                    ]}
                  >
                    {dateRange === range && (
                      <View style={styles.radioDot} />
                    )}
                  </View>
                  <Text style={styles.filterLabel}>
                    {range === 'all-time' && 'Gesamter Zeitraum'}
                    {range === 'this-year' && 'Dieses Jahr'}
                    {range === 'this-month' && 'Dieser Monat'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Footer Buttons */}
        <View style={styles.footer}>
          {activeFilterCount > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Filter zurücksetzen</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.applyButton]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Anwenden</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioChecked: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  filterLabel: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: 'transparent',
  },
  clearButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
