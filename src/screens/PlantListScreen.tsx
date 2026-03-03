import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { Plant, PLANT_STATUSES, PLANT_TYPES } from '../types/plant';
import { fetchPlants, getUniqueLocations, PlantFilters } from '../services/plantService';

type Props = NativeStackScreenProps<RootStackParamList, 'PlantList'>;

export default function PlantListScreen({ navigation }: Props) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatusList, setFilterStatusList] = useState<string[]>([]);
  const [filterLocationList, setFilterLocationList] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<string | undefined>();
  const [filterEssbar, setFilterEssbar] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      loadPlants();
      loadLocations();
    }, [])
  );

  // Debounce search, filters, and type with 300ms delay
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      loadPlants();
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, filterStatusList, filterLocationList, filterType, filterEssbar]);

  const loadPlants = async () => {
    try {
      const filters: PlantFilters = {
        searchQuery: searchQuery || undefined,
        statuses: filterStatusList.length > 0 ? filterStatusList : undefined,
        locations: filterLocationList.length > 0 ? filterLocationList : undefined,
        type: filterType,
        essbar: filterEssbar || undefined,
      };
      const data = await fetchPlants(filters);
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants:', error);
      Alert.alert('Fehler', 'Pflanzen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await getUniqueLocations();
      setLocations(data);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlants();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleAddPlant = () => {
    navigation.navigate('AddPlant');
  };

  const handlePlantPress = (plantId: string) => {
    navigation.navigate('PlantDetail', { plantId });
  };

  const handleStatusFilterToggle = (status: string) => {
    setFilterStatusList(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleLocationFilterToggle = (location: string) => {
    setFilterLocationList(prev =>
      prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
    );
  };

  const handleTypeFilterChange = (type: string) => {
    setFilterType(filterType === type ? undefined : type);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatusList([]);
    setFilterLocationList([]);
    setFilterType(undefined);
    setFilterEssbar(false);
  };

  const hasActiveFilters =
    searchQuery ||
    filterStatusList.length > 0 ||
    filterLocationList.length > 0 ||
    filterType ||
    filterEssbar;

  const filterCount =
    (searchQuery ? 1 : 0) +
    filterStatusList.length +
    filterLocationList.length +
    (filterType ? 1 : 0) +
    (filterEssbar ? 1 : 0);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'etabliert':
        return Colors.success;
      case 'geplant':
        return Colors.info;
      case 'bestellt':
        return Colors.warning;
      case 'gepflanzt':
        return Colors.primaryLight;
      case 'geerntet':
        return Colors.secondary;
      case 'entfernt':
        return Colors.textDisabled;
      default:
        return Colors.textLight;
    }
  };

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={() => handlePlantPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.plantHeader}>
        <View style={styles.plantTitleContainer}>
          <Text style={styles.plantName}>{item.name}</Text>
          {item.latin_name && (
            <Text style={styles.plantLatinName}>{item.latin_name}</Text>
          )}
        </View>
        <MaterialIcons name="chevron-right" size={24} color={Colors.textLight} />
      </View>

      <View style={styles.plantDetails}>
        {item.location && (
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={16} color={Colors.textLight} />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.plantMeta}>
        {item.essbar && (
          <View style={styles.metaChip}>
            <MaterialIcons name="restaurant" size={14} color={Colors.primary} />
            <Text style={styles.metaText}>Essbar</Text>
          </View>
        )}
        {item.winterhart && (
          <View style={styles.metaChip}>
            <MaterialIcons name="ac-unit" size={14} color={Colors.info} />
            <Text style={styles.metaText}>Winterhart</Text>
          </View>
        )}
        {item.quantity && item.quantity > 1 && (
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{item.quantity}x</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="eco" size={80} color={Colors.border} />
      <Text style={styles.emptyTitle}>
        {hasActiveFilters ? 'Keine Pflanzen gefunden' : 'Noch keine Pflanzen'}
      </Text>
      <Text style={styles.emptyText}>
        {hasActiveFilters
          ? 'Passen Sie Ihre Filter an, um weitere Pflanzen zu finden.'
          : 'Fügen Sie Ihre erste Pflanze hinzu, um Ihr Garten-Inventar zu verwalten.'}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddPlant}>
        <MaterialIcons name="add" size={24} color="#fff" />
        <Text style={styles.emptyButtonText}>Pflanze hinzufügen</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Lade Pflanzen...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Pflanze suchen..."
          placeholderTextColor={Colors.textDisabled}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={Colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filter Chips Section */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterChipsContainer}
        contentContainerStyle={styles.filterChipsContent}
      >
        {/* Status Filters */}
        {PLANT_STATUSES.map(status => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.filterChip,
              filterStatusList.includes(status.value) && styles.filterChipActive,
            ]}
            onPress={() => handleStatusFilterToggle(status.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterStatusList.includes(status.value) && styles.filterChipTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Secondary Filters Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.secondaryFilterContainer}
        contentContainerStyle={styles.secondaryFilterContent}
      >
        {/* Location Filters */}
        {locations.map(location => (
          <TouchableOpacity
            key={location}
            style={[
              styles.filterChip,
              styles.locationChip,
              filterLocationList.includes(location) && styles.filterChipActive,
            ]}
            onPress={() => handleLocationFilterToggle(location)}
          >
            <MaterialIcons
              name="place"
              size={14}
              color={filterLocationList.includes(location) ? '#fff' : Colors.textLight}
              style={styles.chipIcon}
            />
            <Text
              style={[
                styles.filterChipText,
                filterLocationList.includes(location) && styles.filterChipTextActive,
              ]}
            >
              {location}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Type Filters */}
        {PLANT_TYPES.map(type => (
          <TouchableOpacity
            key={type.value}
            style={[
              styles.filterChip,
              styles.typeChip,
              filterType === type.value && styles.filterChipActive,
            ]}
            onPress={() => handleTypeFilterChange(type.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                filterType === type.value && styles.filterChipTextActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Essbar Toggle */}
        <TouchableOpacity
          style={[styles.filterChip, filterEssbar && styles.filterChipActive]}
          onPress={() => setFilterEssbar(!filterEssbar)}
        >
          <MaterialIcons
            name="restaurant"
            size={14}
            color={filterEssbar ? '#fff' : Colors.textLight}
            style={styles.chipIcon}
          />
          <Text
            style={[
              styles.filterChipText,
              filterEssbar && styles.filterChipTextActive,
            ]}
          >
            Essbar
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <View style={styles.activeSummaryContainer}>
          <View style={styles.activeSummaryContent}>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
            <Text style={styles.activeSummaryText}>Filter aktiv</Text>
          </View>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllFilters}
          >
            <MaterialIcons name="clear-all" size={18} color={Colors.primary} />
            <Text style={styles.clearButtonText}>Löschen</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Plants List */}
      <FlatList
        data={plants}
        renderItem={renderPlantItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={plants.length === 0 ? styles.listEmpty : styles.listContent}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      />

      {plants.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddPlant}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  filterChipsContainer: {
    maxHeight: 50,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterChipsContent: {
    gap: 8,
    paddingHorizontal: 0,
  },
  secondaryFilterContainer: {
    maxHeight: 50,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  secondaryFilterContent: {
    gap: 8,
    paddingHorizontal: 0,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  chipIcon: {
    marginRight: 2,
  },
  locationChip: {
    // Location chips have specific styling
  },
  typeChip: {
    // Type chips have specific styling
  },
  activeSummaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
  },
  activeSummaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeSummaryText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  clearButtonText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textLight,
  },
  listContent: {
    padding: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
  plantCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plantTitleContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  plantLatinName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textLight,
  },
  plantDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  plantMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});
