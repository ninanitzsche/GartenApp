/**
 * PlantDetailScreen - Redesigned 2026
 * Glassmorphism + Bold Cards + Hero Image
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import { Leaf, Edit, Camera, Sprout, ChevronLeft, Snowflake, MapPin, Calendar, Sparkles, Droplets, Thermometer } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../services/supabase';
import { fetchPlant } from '../services/plantService';
import { enrichPhotoWithUrl } from '../services/photoService';
import { getHarvestsByPlant, getTotalHarvestByPlant } from '../services/harvestService';
import { getCompanionsByPlantName } from '../services/companionService';
import { Plant } from '../types/plant';
import { Photo } from '../types/photo';
import { Harvest, HarvestTotal } from '../types/harvest';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import AnimatedButton from '../components/ui/AnimatedButton';
import FloatingAction from '../components/ui/FloatingAction';
import CompanionCard from '../components/CompanionCard';

type PlantDetailRouteProp = RouteProp<RootStackParamList, 'PlantDetail'>;
type PlantDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlantDetail'>;

export default function PlantDetailScreen() {
  const route = useRoute<PlantDetailRouteProp>();
  const navigation = useNavigation<PlantDetailNavigationProp>();
  const { plantId } = route.params;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [harvestTotals, setHarvestTotals] = useState<HarvestTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchPlantDetails();
    }, [plantId])
  );

  const fetchPlantDetails = async () => {
    try {
      setLoading(true);

      const [plantData, photoDataResult, harvestData, totals] = await Promise.all([
        fetchPlant(plantId),
        supabase.from('photo_plants').select('photos(*)').eq('plant_id', plantId),
        getHarvestsByPlant(plantId).catch(() => []),
        getTotalHarvestByPlant(plantId).catch(() => []),
      ]);

      setPlant(plantData);

      if (!photoDataResult.error && photoDataResult.data) {
        const photoList = photoDataResult.data
          .map((pp: any) => pp.photos)
          .filter((p: Photo | null) => p !== null)
          .map((p: Photo) => enrichPhotoWithUrl(p))
          .filter((p: Photo) => !!p.photo_url) as Photo[];
        setPhotos(photoList);
      }

      setHarvests(harvestData);
      setHarvestTotals(totals);

    } catch (error: any) {
      console.error('Error fetching plant details:', error);
      Alert.alert('Fehler', 'Pflanze konnte nicht geladen werden.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors2026.primary} />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Pflanze nicht gefunden</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Glass Header */}
        <BlurView intensity={60} style={styles.glassHeader}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <ChevronLeft size={24} color={Colors2026.text} />
            </Pressable>
            <View style={styles.headerInfo}>
              <Text style={styles.plantName}>{plant.name}</Text>
              {plant.latin_name && (
                <Text style={styles.plantLatin}>{plant.latin_name}</Text>
              )}
            </View>
            <Pressable onPress={() => navigation.navigate('EditPlant', { plantId: plant.id })} style={styles.editButton}>
              <Edit size={20} color={Colors2026.primary} />
            </Pressable>
          </View>
        </BlurView>

        {/* Status & Quick Info */}
        <View style={styles.quickInfo}>
          <StatusBadge status={plant.status} size="md" />

          <View style={styles.infoRow}>
            {plant.location && (
              <View style={styles.infoChip}>
                <MapPin size={14} color={Colors2026.textMuted} />
                <Text style={styles.infoText}>{plant.location}</Text>
              </View>
            )}
            {plant.quantity && plant.quantity > 1 && (
              <View style={styles.infoChip}>
                <Text style={styles.infoText}>{plant.quantity}x</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <SectionHeader
            title="Details"
            icon={<Leaf size={20} color={Colors2026.primary} />}
            animated={true}
          />

          <GlassCard variant="light">
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Sprout size={16} color={Colors2026.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Typ</Text>
                  <Text style={styles.detailValue}>{plant.type || '-'}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <Calendar size={16} color={Colors2026.primary} />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Gepflanzt</Text>
                  <Text style={styles.detailValue}>{formatDate(plant.planted_date)}</Text>
                </View>
              </View>

              {plant.essbar && (
                <View style={styles.detailItem}>
                  <Sparkles size={16} color={Colors2026.status.success} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Essbar</Text>
                    <Text style={styles.detailValue}>Ja</Text>
                  </View>
                </View>
              )}

              {plant.winterhart && (
                <View style={styles.detailItem}>
                  <Snowflake size={16} color={Colors2026.status.info} />
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Winterhart</Text>
                    <Text style={styles.detailValue}>Ja</Text>
                  </View>
                </View>
              )}
            </View>
          </GlassCard>
        </View>

        {/* PlantNet Info Section */}
        {plant.plantnet_data && !plant.plantnet_data.notFound && (
          <View style={styles.section}>
            <SectionHeader
              title="Pflanzen-Info"
              icon={<Leaf size={20} color={Colors2026.primary} />}
              animated={true}
              delay={50}
            />
            <GlassCard variant="light">
              {plant.plantnet_data.commonNames?.length > 0 && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Deutsche Namen:</Text>
                  <Text style={styles.infoValue}>
                    {plant.plantnet_data.commonNames.join(', ')}
                  </Text>
                </View>
              )}
              {plant.plantnet_data.family && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Familie:</Text>
                  <Text style={styles.infoValue}>{plant.plantnet_data.family}</Text>
                </View>
              )}
              {plant.plantnet_data.genus && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Gattung:</Text>
                  <Text style={styles.infoValue}>{plant.plantnet_data.genus}</Text>
                </View>
              )}
              {plant.plantnet_data.scientificName && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>Wissenschaftlich:</Text>
                  <Text style={[styles.infoValue, styles.italic]}>
                    {plant.plantnet_data.scientificName}
                  </Text>
                </View>
              )}
              {plant.plantnet_data.confidence && (
                <View style={styles.plantNetInfoRow}>
                  <Text style={styles.infoLabel}>KI-Identifikation:</Text>
                  <Text style={styles.infoValue}>
                    {Math.round(plant.plantnet_data.confidence * 100)}% sicher
                  </Text>
                </View>
              )}
            </GlassCard>
          </View>
        )}

        {plant.plantnet_data?.notFound && (
          <View style={styles.section}>
            <View style={styles.notFoundBadge}>
              <Text style={styles.notFoundText}>⚠️ Keine PlantNet-Daten gefunden</Text>
            </View>
          </View>
        )}

        {/* Photos Section */}
        {photos.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Fotos"
              subtitle={`${photos.length} Foto${photos.length > 1 ? 's' : ''}`}
              icon={<Camera size={20} color={Colors2026.primary} />}
              animated={true}
              delay={100}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {photos.map((photo, index) => (
                <Pressable
                  key={photo.id || index}
                  onPress={() => navigation.navigate('PhotoGallery', { plantId: plant.id })}
                >
                  <Image
                    source={{ uri: photo.photo_url }}
                    style={styles.photoThumbnail}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Notes Section */}
        {plant.notes && (
          <View style={styles.section}>
            <SectionHeader
              title="Notizen"
              icon={<Droplets size={20} color={Colors2026.primary} />}
              animated={true}
              delay={100}
            />

            <GlassCard variant="light">
              <Text style={styles.notesText}>{plant.notes}</Text>
            </GlassCard>
          </View>
        )}

        {/* Harvests Section */}
        {harvestTotals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Ernten"
              subtitle={`${harvestTotals.reduce((sum, h) => sum + h.quantity, 0).toFixed(1)} ${harvestTotals[0]?.unit || 'Stück'} gesamt`}
              icon={<Sprout size={20} color={Colors2026.plantStatus.geerntet} />}
              animated={true}
              delay={200}
            />

            <GlassCard variant="light">
              {harvestTotals.map((total, index) => (
                <View key={index} style={styles.harvestRow}>
                  <Text style={styles.harvestName}>{total.plant_name || plant.name}</Text>
                  <Text style={styles.harvestValue}>{total.quantity.toFixed(1)} {total.unit}</Text>
                </View>
              ))}
            </GlassCard>
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

      {/* FAB */}
      <FloatingAction
        onPress={() => navigation.navigate('AddHarvest', { plantId: plant.id })}
        icon={<Sprout size={24} color="#fff" />}
        accessibilityLabel="Ernte hinzufügen"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors2026.bg,
  },
  errorText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },
  glassHeader: {
    paddingTop: 60,
    paddingBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors2026.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: Typography2026.headline.fontSize,
    fontWeight: '800',
    color: Colors2026.text,
    letterSpacing: -0.8,
  },
  plantLatin: {
    fontSize: Typography2026.caption.fontSize,
    color: Colors2026.textMuted,
    fontStyle: 'italic',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors2026.glass.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickInfo: {
    paddingHorizontal: Spacing2026.xl,
    paddingVertical: Spacing2026.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: Spacing2026.sm,
    marginTop: Spacing2026.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing2026.sm,
    paddingVertical: Spacing2026.xs,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.bg,
  },
  infoText: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
  },
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  detailsGrid: {
    gap: Spacing2026.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography2026.small.fontSize,
    color: Colors2026.textMuted,
  },
  detailValue: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  notesText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.text,
    lineHeight: 24,
  },
  harvestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing2026.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.border,
  },
  harvestName: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.text,
  },
  harvestValue: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  spacer: {
    height: 100,
  },
  photoScroll: {
    marginTop: Spacing2026.sm,
  },
  photoThumbnail: {
    width: 160,
    height: 120,
    borderRadius: Radius2026.md,
    marginRight: Spacing2026.sm,
    backgroundColor: Colors2026.glass.tint,
  },
  plantNetInfoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors2026.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: Colors2026.text,
  },
  italic: {
    fontStyle: 'italic',
  },
  notFoundBadge: {
    backgroundColor: Colors2026.status.warning + '20',
    borderRadius: 8,
    padding: 12,
  },
  notFoundText: {
    fontSize: 14,
    color: Colors2026.status.warning,
  },
});
