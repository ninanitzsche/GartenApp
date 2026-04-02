import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X, Trash2 } from 'lucide-react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { HealthCheck } from '../../types/healthCheck';
import { updateHealthCheckNotes, deleteHealthCheck } from '../../services/healthCheckService';

interface Props {
  healthCheck: HealthCheck;
  onClose: () => void;
  onUpdate: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  gesund: 'Gesund',
  krank: 'Krank',
  unsicher: 'Unsicher',
};

const STATUS_COLORS: Record<string, string> = {
  gesund: Colors2026.status.success,
  krank: Colors2026.status.error,
  unsicher: Colors2026.status.warning,
};

export default function HealthCheckDetailModal({ healthCheck, onClose, onUpdate }: Props) {
  const [notes, setNotes] = useState(healthCheck.notes || '');

  const photoUrl = healthCheck.photo?.photo_url;
  const topDisease = healthCheck.disease_data?.results?.[0];

  const handleSaveNotes = async () => {
    try {
      await updateHealthCheckNotes(healthCheck.id, notes);
    } catch (e) {
      Alert.alert('Fehler', 'Notizen konnten nicht gespeichert werden.');
    }
  };

  const handleDelete = () => {
    Alert.alert('Löschen', 'Health-Check wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHealthCheck(healthCheck.id);
            onUpdate();
            onClose();
          } catch (e) {
            Alert.alert('Fehler', 'Löschen fehlgeschlagen.');
          }
        },
      },
    ]);
  };

  const date = new Date(healthCheck.created_at).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={styles.container}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {photoUrl && (
              <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
            )}

            <View style={styles.content}>
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: STATUS_COLORS[healthCheck.health_status] + '20' },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: STATUS_COLORS[healthCheck.health_status] },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: STATUS_COLORS[healthCheck.health_status] },
                    ]}
                  >
                    {STATUS_LABELS[healthCheck.health_status]}
                  </Text>
                </View>
                <Text style={styles.date}>{date}</Text>
              </View>

              {topDisease && (
                <View style={styles.diseaseSection}>
                  <Text style={styles.diseaseLabel}>Top-Diagnose</Text>
                  <Text style={styles.diseaseName}>{topDisease.label}</Text>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceFill,
                        {
                          width: `${Math.round(topDisease.score * 100)}%`,
                          backgroundColor: STATUS_COLORS[healthCheck.health_status],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.confidenceText}>
                    {Math.round(topDisease.score * 100)}% Confidence
                  </Text>
                </View>
              )}

              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Notizen</Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  onBlur={handleSaveNotes}
                  placeholder="Notiz hinzufügen..."
                  placeholderTextColor={Colors2026.textMuted}
                  multiline
                  style={styles.notesInput}
                />
              </View>

              <View style={styles.actions}>
                <Pressable onPress={handleDelete} style={styles.deleteButton}>
                  <Trash2 size={16} color={Colors2026.status.error} />
                  <Text style={styles.deleteText}>Löschen</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={20} color={Colors2026.text} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors2026.bg,
    borderTopLeftRadius: Radius2026.xl,
    borderTopRightRadius: Radius2026.xl,
    maxHeight: '90%',
  },
  image: {
    width: '100%',
    height: 280,
    borderTopLeftRadius: Radius2026.xl,
    borderTopRightRadius: Radius2026.xl,
  },
  content: {
    padding: Spacing2026.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing2026.lg,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius2026.round,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: Colors2026.textMuted,
  },
  diseaseSection: {
    marginBottom: Spacing2026.lg,
    padding: Spacing2026.md,
    backgroundColor: Colors2026.glass.light,
    borderRadius: Radius2026.md,
  },
  diseaseLabel: {
    fontSize: 11,
    color: Colors2026.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 4,
    backgroundColor: Colors2026.bg,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    fontSize: 11,
    color: Colors2026.textMuted,
  },
  notesSection: {
    marginBottom: Spacing2026.lg,
  },
  notesLabel: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 80,
    padding: Spacing2026.md,
    backgroundColor: Colors2026.glass.light,
    borderRadius: Radius2026.md,
    color: Colors2026.text,
    fontSize: Typography2026.body.fontSize,
    textAlignVertical: 'top',
  },
  actions: {
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.status.error + '10',
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors2026.status.error,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
