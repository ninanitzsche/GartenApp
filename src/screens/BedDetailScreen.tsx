/**
 * Bed Detail Screen
 * Shows detailed information about a single bed
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../types/navigation';
import Colors from '../theme/colors';
import { Colors2026 } from '../theme/designSystemV2';
import { Bed } from '../types/bed';
import { Plant } from '../types/plant';
import { fetchBed, fetchBedPlants, unlinkBedFromPlant } from '../services/bedService';
import { uploadPhotoForBed, setBedCoverPhoto } from '../services/photoBedService';
import EmptyState from '../components/ui/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'BedDetail'>;

export default function BedDetailScreen({ navigation, route }: Props) {
  const { bedId } = route.params;
  const [bed, setBed] = useState<Bed | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [bedId])
  );

  const loadData = async () => {
    try {
      const bedData = await fetchBed(bedId);
      setBed(bedData);

      if (bedData) {
        const plantsData = await fetchBedPlants(bedId);
        setPlants(plantsData);
      }
    } catch (error) {
      console.error('Error loading bed data:', error);
      Alert.alert('Fehler', 'Beetdaten konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleEdit = () => {
    navigation.navigate('EditBed', { bedId });
  };

  const handleCoverPhoto = async () => {
    if (uploading) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]) return;

      setUploading(true);
      console.log('Uploading cover photo:', result.assets[0].uri);

      const photoPath = await uploadPhotoForBed(bedId, result.assets[0].uri);
      const { data } = (await import('../services/supabase')).supabase.storage
        .from('plant-photos')
        .getPublicUrl(photoPath);

      await setBedCoverPhoto(bedId, data.publicUrl);

      setBed(prev => prev ? { ...prev, cover_photo_url: data.publicUrl } : null);
      Alert.alert('Erfolg', 'Titelbild gesetzt!');
    } catch (error: any) {
      console.error('Error setting cover photo:', error);
      Alert.alert('Fehler', error.message || 'Foto konnte nicht hochgeladen werden.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePlant = (plantId: string) => {
    Alert.alert(
      'Pflanze entfernen',
      'Möchten Sie diese Pflanze wirklich aus dem Beet entfernen?',
      [
        { text: 'Abbrechen', onPress: () => {}, style: 'cancel' },
        {
          text: 'Entfernen',
          onPress: async () => {
            try {
              await unlinkBedFromPlant(bedId, plantId);
              setPlants(plants.filter((p) => p.id !== plantId));
              Alert.alert('Erfolg', 'Pflanze entfernt.');
            } catch (error) {
              console.error('Error removing plant:', error);
              Alert.alert('Fehler', 'Pflanze konnte nicht entfernt werden.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddPlant = () => {
    // TODO: Implement plant selection/linking
    Alert.alert(
      'Info',
      'Funktionalität zum Hinzufügen von Pflanzen wird noch implementiert.'
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!bed) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Beet nicht gefunden</Text>
      </View>
    );
  }

  const renderPlantItem = ({ item }: { item: Plant }) => (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={() => navigation.navigate('PlantDetail', { plantId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.plantHeader}>
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.name}</Text>
          {item.latin_name && (
            <Text style={styles.plantLatinName}>{item.latin_name}</Text>
          )}
        </View>
      </View>

      {item.status && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemovePlant(item.id)}
      >
        <MaterialIcons name="close" size={18} color={Colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Bed Header */}
      {bed.cover_photo_url ? (
        <View style={styles.coverPhotoContainer}>
          <Image
            source={{ uri: bed.cover_photo_url }}
            style={styles.coverPhoto}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.cameraButton} onPress={handleCoverPhoto}>
            <MaterialIcons name="photo-camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.header}>
        <View
          style={[
            styles.colorIndicator,
            { backgroundColor: bed.color || '#4CAF50' },
          ]}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{bed.name}</Text>
          {bed.notes && <Text style={styles.notes}>{bed.notes}</Text>}
        </View>
        {!bed.cover_photo_url && (
          <TouchableOpacity onPress={handleCoverPhoto} style={styles.headerCameraButton} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <MaterialIcons name="add-a-photo" size={22} color={Colors.primary} />
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleEdit}>
          <MaterialIcons name="edit" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Bed Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailRow}>
          <MaterialIcons name="aspect-ratio" size={16} color={Colors.textLight} />
          <Text style={styles.detailLabel}>Größe</Text>
          <Text style={styles.detailValue}>
            {bed.width.toFixed(0)}% × {bed.height.toFixed(0)}%
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color={Colors.textLight} />
          <Text style={styles.detailLabel}>Position</Text>
          <Text style={styles.detailValue}>
            X: {bed.position_x.toFixed(0)}%, Y: {bed.position_y.toFixed(0)}%
          </Text>
        </View>
        {bed.shape && (
          <View style={styles.detailRow}>
            <MaterialIcons name="crop-square" size={16} color={Colors.textLight} />
            <Text style={styles.detailLabel}>Form</Text>
            <Text style={styles.detailValue}>
              {bed.shape === 'circle' ? 'Kreis' : 'Rechteck'}
            </Text>
          </View>
        )}
      </View>

      {/* Plants Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Pflanzen ({plants.length})
          </Text>
          <TouchableOpacity onPress={handleAddPlant}>
            <MaterialIcons name="add-circle-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {plants.length > 0 ? (
          <FlatList
            data={plants}
            renderItem={renderPlantItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <EmptyState
            icon={<MaterialIcons name="eco" size={40} color={Colors2026.primary} />}
            title="Keine Pflanzen"
            subtitle="Dieses Beet hat noch keine Pflanzen."
            action={
              <TouchableOpacity onPress={handleAddPlant} style={styles.emptyAction}>
                <Text style={styles.emptyActionText}>Pflanze hinzufügen</Text>
              </TouchableOpacity>
            }
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  colorIndicator: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  notes: {
    fontSize: 12,
    color: Colors.textLight,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textLight,
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  plantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  plantHeader: {
    flex: 1,
  },
  plantInfo: {
    marginBottom: 4,
  },
  plantName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  plantLatinName: {
    fontSize: 12,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  statusBadge: {
    backgroundColor: Colors.info + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  statusText: {
    fontSize: 11,
    color: Colors.info,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
  },
  emptyAction: {
    backgroundColor: Colors2026.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  emptyActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  coverPhotoContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCameraButton: {
    marginRight: 8,
  },
});
