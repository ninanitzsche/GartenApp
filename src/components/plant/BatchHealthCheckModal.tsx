import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { X, Heart, CheckCircle2, AlertCircle, SkipForward } from 'lucide-react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026 } from '../../theme/designSystemV2';
import { runBatchHealthCheck, BatchHealthCheckResult } from '../../services/healthCheckService';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function BatchHealthCheckModal({ visible, onClose }: Props) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, plantName: '' });
  const [results, setResults] = useState<BatchHealthCheckResult[]>([]);

  const handleStart = async () => {
    setRunning(true);
    setResults([]);

    const batchResults = await runBatchHealthCheck((current, total, plantName) => {
      setProgress({ current, total, plantName });
    });

    setResults(batchResults);
    setRunning(false);
  };

  const successCount = results.filter((r) => r.status === 'success').length;
  const skippedCount = results.filter((r) => r.status === 'skipped').length;
  const errorCount = results.filter((r) => r.status === 'error').length;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          entering={SlideInDown.duration(300)}
          exiting={SlideOutDown.duration(200)}
          style={styles.container}
        >
          <View style={styles.header}>
            <Heart size={24} color={Colors2026.primary} />
            <Text style={styles.title}>Gesundheits-Check für alle Pflanzen</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <X size={20} color={Colors2026.text} />
            </Pressable>
          </View>

          {!running && results.length === 0 && (
            <View style={styles.startSection}>
              <Text style={styles.description}>
                Für jede Pflanze wird die KI-Krankheitsanalyse durchgeführt.
                Pflanzen mit Bildern bekommen eine PlantNet-Diagnose, Pflanzen ohne Bild werden als &quot;gesund&quot; eingetragen.
              </Text>
              <Pressable onPress={handleStart} style={styles.startButton}>
                <Heart size={18} color="#fff" />
                <Text style={styles.startButtonText}>Check starten</Text>
              </Pressable>
            </View>
          )}

          {running && (
            <View style={styles.progressSection}>
              <ActivityIndicator size="large" color={Colors2026.primary} />
              <Text style={styles.progressText}>
                Prüfe {progress.current}/{progress.total}
              </Text>
              <Text style={styles.progressPlant}>{progress.plantName}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: progress.total > 0
                        ? `${(progress.current / progress.total) * 100}%`
                        : '0%',
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {!running && results.length > 0 && (
            <ScrollView style={styles.resultsSection} showsVerticalScrollIndicator={false}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <CheckCircle2 size={16} color={Colors2026.status.success} />
                  <Text style={styles.summaryText}>{successCount} OK</Text>
                </View>
                <View style={styles.summaryItem}>
                  <SkipForward size={16} color={Colors2026.status.warning} />
                  <Text style={styles.summaryText}>{skippedCount} Übersprungen</Text>
                </View>
                <View style={styles.summaryItem}>
                  <AlertCircle size={16} color={Colors2026.status.error} />
                  <Text style={styles.summaryText}>{errorCount} Fehler</Text>
                </View>
              </View>

              {results.map((result) => (
                <View key={result.plantId} style={styles.resultRow}>
                  {result.status === 'success' && (
                    <CheckCircle2 size={14} color={Colors2026.status.success} />
                  )}
                  {result.status === 'skipped' && (
                    <SkipForward size={14} color={Colors2026.status.warning} />
                  )}
                  {result.status === 'error' && (
                    <AlertCircle size={14} color={Colors2026.status.error} />
                  )}
                  <Text style={styles.resultName}>{result.plantName}</Text>
                  {result.reason && (
                    <Text style={styles.resultReason}>{result.reason}</Text>
                  )}
                </View>
              ))}

              <Pressable onPress={onClose} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Fertig</Text>
              </Pressable>
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: Spacing2026.xl,
  },
  container: {
    backgroundColor: Colors2026.bg,
    borderRadius: Radius2026.xl,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing2026.sm,
    padding: Spacing2026.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  title: {
    flex: 1,
    fontSize: Typography2026.title.fontSize,
    fontWeight: '700',
    color: Colors2026.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors2026.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startSection: {
    padding: Spacing2026.xl,
    alignItems: 'center',
  },
  description: {
    fontSize: Typography2026.body.fontSize,
    color: Colors2026.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing2026.xl,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius2026.lg,
    backgroundColor: Colors2026.primary,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  progressSection: {
    padding: Spacing2026.xl,
    alignItems: 'center',
    gap: Spacing2026.md,
  },
  progressText: {
    fontSize: Typography2026.body.fontSize,
    fontWeight: '600',
    color: Colors2026.text,
  },
  progressPlant: {
    fontSize: 13,
    color: Colors2026.textMuted,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: Colors2026.glass.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: Spacing2026.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors2026.primary,
    borderRadius: 3,
  },
  resultsSection: {
    padding: Spacing2026.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing2026.lg,
    paddingBottom: Spacing2026.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors2026.text,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors2026.divider,
  },
  resultName: {
    fontSize: 14,
    color: Colors2026.text,
    fontWeight: '500',
    flex: 1,
  },
  resultReason: {
    fontSize: 11,
    color: Colors2026.textMuted,
  },
  doneButton: {
    marginTop: Spacing2026.lg,
    paddingVertical: 12,
    borderRadius: Radius2026.md,
    backgroundColor: Colors2026.primary + '15',
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors2026.primary,
  },
});
