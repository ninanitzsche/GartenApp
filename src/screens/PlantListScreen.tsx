import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { Plant } from '../types/plant';
import { fetchPlants } from '../services/plantService';

interface PlantListScreenProps {
  navigation: any;
}

export default function PlantListScreen({ navigation }: PlantListScreenProps) {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadPlants();
    }, [])
  );

  const loadPlants = async () => {
    try {
      const data = await fetchPlants();
      setPlants(data);
    } catch (error) {
      console.error('Error loading plants:', error);
      Alert.alert('Fehler', 'Pflanzen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlants();
  };

  const handleAddPlant = () => {
    navigation.navigate('AddPlant');
  };

  const handlePlantPress = (plantId: string) => {
    navigation.navigate('PlantDetail', { plantId });
  };

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
      <Text style={styles.emptyTitle}>Noch keine Pflanzen</Text>
      <Text style={styles.emptyText}>
        Fügen Sie Ihre erste Pflanze hinzu, um Ihr Garten-Inventar zu verwalten.
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
