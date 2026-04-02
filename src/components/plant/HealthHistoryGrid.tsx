import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Heart, Zap } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import SectionHeader from '../ui/SectionHeader';
import HealthCheckCard from './HealthCheckCard';
import HealthCheckDetailModal from './HealthCheckDetailModal';
import BatchHealthCheckModal from './BatchHealthCheckModal';
import { HealthCheck } from '../../types/healthCheck';
import { createHealthCheck } from '../../services/healthCheckService';

interface Props {
  plantId: string;
  healthChecks: HealthCheck[];
  onRefresh: () => void;
  delay?: number;
  isExistingPlant: boolean;
}

export default function HealthHistoryGrid({
  plantId,
  healthChecks,
  onRefresh,
  delay = 150,
  isExistingPlant,
}: Props) {
  const [selectedCheck, setSelectedCheck] = useState<HealthCheck | null>(null);
  const [checking, setChecking] = useState(false);
  const [batchVisible, setBatchVisible] = useState(false);

  const handleNewCheck = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung', 'Bitte erlaube Fotozugriff.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setChecking(true);
    try {
      await createHealthCheck(plantId, {
        photoUri: result.assets[0].uri,
        runAI: true,
      });
      onRefresh();
    } catch (error) {
      Alert.alert('Fehler', 'Health-Check konnte nicht erstellt werden.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <View style={styles.section}>
      <SectionHeader
        title="Gesundheit"
        subtitle={healthChecks.length > 0 ? `${healthChecks.length} Checks` : undefined}
        icon={<Heart size={20} color={Colors2026.primary} />}
        animated={true}
        delay={delay}
        action={
          isExistingPlant
            ? {
                label: checking ? 'Lädt...' : '+ Check',
                onPress: handleNewCheck,
              }
            : undefined
        }
      />

      {checking && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors2026.primary} />
          <Text style={styles.loadingText}>Analysiere Pflanze...</Text>
        </View>
      )}

      {healthChecks.length > 0 ? (
        <FlatList
          data={healthChecks}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <HealthCheckCard
              healthCheck={item}
              index={index}
              onPress={setSelectedCheck}
            />
          )}
          contentContainerStyle={styles.grid}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Noch keine Gesundheitschecks</Text>
        </View>
      )}

      {selectedCheck && (
        <HealthCheckDetailModal
          healthCheck={selectedCheck}
          onClose={() => setSelectedCheck(null)}
          onUpdate={onRefresh}
        />
      )}

      {isExistingPlant && (
        <Pressable onPress={() => setBatchVisible(true)} style={styles.batchButton}>
          <Zap size={14} color={Colors2026.primary} />
          <Text style={styles.batchButtonText}>Alle Pflanzen prüfen</Text>
        </Pressable>
      )}

      <BatchHealthCheckModal
        visible={batchVisible}
        onClose={() => {
          setBatchVisible(false);
          onRefresh();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing2026.xl,
    paddingHorizontal: Spacing2026.xl,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing2026.md,
  },
  loadingText: {
    fontSize: 13,
    color: Colors2026.textMuted,
  },
  grid: {
    gap: Spacing2026.xs,
  },
  empty: {
    paddingVertical: Spacing2026.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing2026.md,
    paddingVertical: 8,
  },
  batchButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors2026.primary,
  },
});
