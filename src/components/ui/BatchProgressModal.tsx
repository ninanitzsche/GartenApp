import React from 'react';
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Colors2026, Spacing2026, Radius2026 } from '../../theme/designSystemV2';

interface Props {
  visible: boolean;
  current: number;
  total: number;
  currentPlantName: string;
  onCancel: () => void;
}

export default function BatchProgressModal({ 
  visible, current, total, currentPlantName, onCancel 
}: Props) {
  const progress = total > 0 ? current / total : 0;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={Colors2026.primary} />
          <Text style={styles.title}>Pflanzendaten werden aktualisiert</Text>
          <Text style={styles.progress}>
            {current} von {total}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.currentPlant} numberOfLines={1}>
            {currentPlantName}
          </Text>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: Colors2026.surface,
    borderRadius: Radius2026.lg,
    padding: Spacing2026.xl,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors2026.text,
    marginTop: Spacing2026.md,
  },
  progress: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors2026.primary,
    marginTop: Spacing2026.md,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors2026.border,
    borderRadius: 4,
    marginTop: Spacing2026.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors2026.primary,
    borderRadius: 4,
  },
  currentPlant: {
    fontSize: 14,
    color: Colors2026.textSecondary,
    marginTop: Spacing2026.md,
  },
  cancelButton: {
    marginTop: Spacing2026.lg,
    padding: Spacing2026.sm,
  },
  cancelText: {
    fontSize: 14,
    color: Colors2026.status.error,
  },
});
