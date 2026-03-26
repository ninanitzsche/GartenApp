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
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { fetchHarvests, deleteHarvest, formatHarvestWithPlant } from '../services/harvestService';
import EmptyHarvestIllustration from '../components/illustrations/EmptyHarvestIllustration';
import Animated, { FadeInDown } from 'react-native-reanimated';
import GlassCard from '../components/ui/GlassCard';

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
          <MaterialIcons name="local-florist" size={20} color={Colors2026.primary} />
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
          <MaterialIcons name="edit" size={18} color={Colors2026.primary} />
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
        <ActivityIndicator size="large" color={Colors2026.primary} />
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
            <EmptyHarvestIllustration />
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
    backgroundColor: Colors2026.background,
  },
  listContent: {
    padding: Spacing2026.sm,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.sm,
    padding: Spacing2026.sm,
    marginBottom: Spacing2026.sm,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing2026.xs,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.xs,
    flex: 1,
  },
  harvestPlant: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  harvestQuantity: {
    fontSize: Typography2026.caption.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  harvestDate: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textSecondary,
    marginBottom: Spacing2026.xs,
  },
  harvestNotes: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.text,
    marginBottom: Spacing2026.xs,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing2026.xs,
    marginTop: Spacing2026.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing2026.xs,
    paddingHorizontal: Spacing2026.sm,
    borderRadius: 6,
    backgroundColor: Colors2026.background,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  deleteButton: {
    borderColor: '#ffebee',
  },
  actionText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.primary,
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
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors2026.primary,
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
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    marginTop: Spacing2026.sm,
  },
  emptyStateSubtext: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textSecondary,
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 200,
  },
});
