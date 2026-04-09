/**
 * PlantDetailScreen - Redesigned
 * Cleaner layout, pull-to-refresh, dynamic FAB, merged Steckbrief
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Leaf, Edit, Sprout, ChevronLeft, Snowflake, MapPin, Sparkles, Camera as CameraIcon, Camera } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../theme/designSystemV2';
import GlassCard from '../components/ui/GlassCard';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import FloatingAction from '../components/ui/FloatingAction';
import PlantCareCard from '../components/plant/PlantCareCard';
import HealthHistoryGrid from '../components/plant/HealthHistoryGrid';
import PlantMetaSection from '../components/plant/PlantMetaSection';
import HarvestPrediction from '../components/plant/HarvestPrediction';
import PlantTasksCard from '../components/plant/PlantTasksCard';
import { usePlantDetail } from '../hooks/usePlantDetail';
import { usePlantKnowledge } from '../hooks/usePlantKnowledge';
import { generateCareTasksFromKnowledge } from '../services/plantCareTaskService';
import AIPhotoPicker from '../components/AIPhotoPicker';
import PlantKnowledgeCard from '../components/plant/PlantKnowledgeCard';
import CareTaskCard from '../components/plant/CareTaskCard';
import { PlantIdentificationResult } from '../types/ai';

type PlantDetailRouteProp = RouteProp<RootStackParamList, 'PlantDetail'>;
type PlantDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlantDetail'>;

export default function PlantDetailScreen() {
  const route = useRoute<PlantDetailRouteProp>();
  const navigation = useNavigation<PlantDetailNavigationProp>();
  const { plantId } = route.params;

  const [aiPickerVisible, setAIPickerVisible] = useState(false);

  const { plant, photos, harvestTotals, tasks, healthChecks, loading, refreshing, handleRefresh, refetch } = usePlantDetail(plantId);
  const { getKnowledgeForPlant } = usePlantKnowledge();
  const plantKnowledge = plant ? getKnowledgeForPlant(plant.name) : undefined;
  const careTasks = plant ? generateCareTasksFromKnowledge(plant.name) : [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('de-DE');
  };

  const onRefresh = useCallback(async () => {
    await handleRefresh();
  }, [handleRefresh]);

  // Dynamic FAB
  const getFabConfig = () => {
    if (!plant) return null;
    if (plant.status === 'ausgepflanzt' || plant.status === 'etabliert') return { icon: <Sprout size={24} color="#fff" />, label: 'Ernte hinzufügen', action: () => navigation.navigate('AddHarvest', { plantId: plant.id }) };
    return { icon: <CameraIcon size={24} color="#fff" />, label: 'Foto hinzufügen', action: () => navigation.navigate('PhotoGallery', { plantId: plant.id }) };
  };

  const fab = getFabConfig();

  const handlePlantIdentified = (result: PlantIdentificationResult) => {
    refetch();
  };

  const isExistingPlant = plant && plant.status !== 'geplant' && plant.status !== 'bestellt';

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors2026.primary} />
        }
      >
        {/* Header */}
        <BlurView intensity={60} style={styles.glassHeader}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => navigation.navigate('PlantList')} style={styles.backButton}>
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

        {/* Status & Standort */}
        <View style={styles.quickInfo}>
          <StatusBadge status={plant.status} size="md" />
          <View style={styles.chipRow}>
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

        {/* Steckbrief — Details + PlantNet combined */}
        <View style={styles.section}>
          <SectionHeader
            title="Steckbrief"
            icon={<Leaf size={20} color={Colors2026.primary} />}
            animated={true}
          />
          <GlassCard variant="light">
            {/* Row items */}
            {plant.type && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Typ</Text>
                <Text style={styles.infoValue}>{plant.type}</Text>
              </View>
            )}
            {plant.planted_date && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gepflanzt</Text>
                <Text style={styles.infoValue}>{formatDate(plant.planted_date)}</Text>
              </View>
            )}
            {plant.plantnet_data?.family && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Familie</Text>
                <Text style={styles.infoValue}>{plant.plantnet_data.family}</Text>
              </View>
            )}
            {plant.plantnet_data?.genus && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Gattung</Text>
                <Text style={styles.infoValue}>{plant.plantnet_data.genus}</Text>
              </View>
            )}
            {plant.plantnet_data?.scientificName && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Wissenschaftlich</Text>
                <Text style={[styles.infoValue, styles.italic]}>{plant.plantnet_data.scientificName}</Text>
              </View>
            )}
            {plant.plantnet_data?.commonNames?.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Andere Namen</Text>
                <Text style={styles.infoValue}>{plant.plantnet_data.commonNames.join(', ')}</Text>
              </View>
            )}

            {/* Badges */}
            <View style={styles.badgeRow}>
              {plant.essbar && (
                <View style={styles.badge}>
                  <Sparkles size={14} color={Colors2026.status.success} />
                  <Text style={styles.badgeText}>Essbar</Text>
                </View>
              )}
              {plant.winterhart && (
                <View style={styles.badge}>
                  <Snowflake size={14} color={Colors2026.status.info} />
                  <Text style={styles.badgeText}>Winterhart</Text>
                </View>
              )}
              {plant.plantnet_data?.confidence && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>🔍 {Math.round(plant.plantnet_data.confidence * 100)}% sicher</Text>
                </View>
              )}
            </View>
          </GlassCard>
        </View>

        {/* Ernte-Prognose */}
        {plant.openai_care?.profile && (
          <HarvestPrediction
            plantedDate={plant.planted_date}
            harvestTime={plant.openai_care.profile.harvestTime}
            expectedYield={plant.openai_care.profile.expectedYield}
          />
        )}

        {/* KI Pflege-Info — now 5 separate sections */}
        {plant.openai_care && <PlantCareCard care={plant.openai_care} delay={60} />}

        {/* Plant Knowledge (from generated data) */}
        {plantKnowledge && (
          <View style={styles.section}>
            <PlantKnowledgeCard knowledge={plantKnowledge} />
          </View>
        )}

        {/* Care Tasks from Knowledge */}
        {careTasks.length > 0 && (
          <View style={styles.section}>
            <CareTaskCard tasks={careTasks} />
          </View>
        )}

        {/* Aufgaben */}
        <PlantTasksCard tasks={tasks} onTaskUpdate={refetch} delay={120} />

        {/* Gesundheitshistorie */}
        <HealthHistoryGrid
          plantId={plant.id}
          healthChecks={healthChecks}
          onRefresh={refetch}
          delay={150}
          isExistingPlant={!!isExistingPlant}
        />

        {/* Photos, Notizen, Ernten */}
        <PlantMetaSection
          plantId={plant.id}
          plantName={plant.name}
          photos={photos}
          notes={plant.notes}
          harvestTotals={harvestTotals}
        />

        <View style={styles.spacer} />
      </ScrollView>

      {/* FAB */}
      {fab && (
        <View>
          <FloatingAction
            onPress={fab.action}
            icon={fab.icon}
            accessibilityLabel={fab.label}
          />
          <Pressable style={styles.aiButton} onPress={() => setAIPickerVisible(true)}>
            <Camera size={20} color="#fff" />
          </Pressable>
        </View>
      )}

      <AIPhotoPicker
        visible={aiPickerVisible}
        onClose={() => setAIPickerVisible(false)}
        onPlantIdentified={handlePlantIdentified}
        linkedPlantId={plantId}
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
  chipRow: {
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
    marginBottom: Spacing2026.lg,
    paddingHorizontal: Spacing2026.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors2026.textMuted,
  },
  infoValue: {
    fontSize: 13,
    color: Colors2026.text,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  italic: {
    fontStyle: 'italic',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius2026.round,
    backgroundColor: Colors2026.bg,
  },
  badgeText: {
    fontSize: 12,
    color: Colors2026.text,
    fontWeight: '500',
  },
  spacer: {
    height: 100,
  },
  aiButton: {
    position: 'absolute',
    right: 90,
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors2026.accent,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.8,
  },
});
