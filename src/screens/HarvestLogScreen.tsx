import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { HarvestWithPlant } from '../types/harvest';
import Colors from '../theme/colors';
import { fetchHarvests, deleteHarvest, formatHarvestWithPlant } from '../services/harvestService';

type Props = NativeStackScreenProps<RootStackParamList, 'HarvestLog'>;
type RouteProps = RouteProp<RootStackParamList, 'HarvestLog'>;

export default function HarvestLogScreen({ navigation }: Props) {
  const route = useRoute<RouteProps>();
  const filterByPlantId = route.params?.plantId;

  const [harvests, setHarvests] = useState<HarvestWithPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load harvests on focus
  useFocusEffect(
    useCallback(() => {
      loadHarvests();
    }, [filterByPlantId])
  );

  const loadHarvests = async () => {
    try {
      setLoading(true);
      const data = await fetchHarvests(
        filterByPlantId ? { plantId: filterByPlantId } : undefined
      );
      setHarvests(data);
    } catch (error: any) {
      Alert.alert('Fehler', `Ernten konnten nicht geladen werden: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadHarvests();
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (harvestId: string, plantName: string) => {
    Alert.alert(
      'Ernte löschen',
      `Sind Sie sicher, dass Sie diese Ernte von ${plantName} löschen möchten?`,
      [
        { text: 'Abbrechen', onPress: () => {}, style: 'cancel' },
        {
          text: 'Löschen',
          onPress: async () => {
            try {
              await deleteHarvest(harvestId);
              await loadHarvests();
              Alert.alert('Erfolg', 'Ernte wurde gelöscht');
            } catch (error: any) {
              Alert.alert('Fehler', `Löschen fehlgeschlagen: ${error.message}`);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderHarvestCard = ({ item }: { item: HarvestWithPlant }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <MaterialIcons name="local-florist" size={20} color={Colors.primary} />
          <Text style={styles.harvestPlant}>{item.plant_name}</Text>
        </View>
        <Text style={styles.harvestQuantity}>
          {item.quantity} {item.unit}
        </Text>
      </View>

      <Text style={styles.harvestDate}>
        {new Date(item.harvest_date).toLocaleDateString('de-DE', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </Text>

      {item.notes && <Text style={styles.harvestNotes}>{item.notes}</Text>}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('AddHarvest', {
              harvestId: item.id,
            })
          }
        >
          <MaterialIcons name="edit" size={18} color={Colors.primary} />
          <Text style={styles.actionText}>Bearbeiten</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id, item.plant_name)}
        >
          <MaterialIcons name="delete" size={18} color="#F44336" />
          <Text style={[styles.actionText, styles.deleteText]}>Löschen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={harvests}
        keyExtractor={(item) => item.id}
        renderItem={renderHarvestCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="sentiment-dissatisfied" size={48} color={Colors.textLight} />
            <Text style={styles.emptyStateText}>Noch keine Ernten dokumentiert</Text>
            <Text style={styles.emptyStateSubtext}>
              Tippen Sie auf das + Symbol, um Ihre erste Ernte zu dokumentieren
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          navigation.navigate('AddHarvest', {
            plantId: filterByPlantId,
          })
        }
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 12,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  harvestPlant: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  harvestQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  harvestDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 8,
  },
  harvestNotes: {
    fontSize: 12,
    color: Colors.text,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteButton: {
    borderColor: '#ffebee',
  },
  actionText: {
    fontSize: 12,
    color: Colors.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  deleteText: {
    color: '#F44336',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 200,
  },
});
