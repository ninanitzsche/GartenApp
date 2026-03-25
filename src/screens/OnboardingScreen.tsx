import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Leaf, Download, Info } from 'lucide-react-native';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import AnimatedButton from '../components/ui/AnimatedButton';
import GlassCard from '../components/ui/GlassCard';
import { importSeedData, ImportProgress } from '../services/seedDataService';
import { useReduceMotion, safeFadeInUp } from '../utils/accessibility';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const reduceMotion = useReduceMotion();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const handleImportData = async () => {
    setImporting(true);

    const result = await importSeedData((progress) => {
      setProgress(progress);
    });

    setImporting(false);

    if (result.success) {
      // Wait a moment to show completion message
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else {
      alert('Fehler beim Importieren: ' + (result.error || 'Unbekannter Fehler'));
      setProgress(null);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <View style={styles.container}>
      <View style={styles.seasonalOverlay} />
      <View style={styles.content}>
        {reduceMotion ? (
          <Leaf size={80} color={Colors2026.primary} strokeWidth={1.5} />
        ) : (
          <Animated.View entering={FadeInUp.delay(0)}>
            <Leaf size={80} color={Colors2026.primary} strokeWidth={1.5} />
          </Animated.View>
        )}

        {reduceMotion ? (
          <Text style={styles.title}>Willkommen beim Gartenplaner!</Text>
        ) : (
          <Animated.View entering={FadeInUp.delay(100)}>
            <Text style={styles.title}>Willkommen beim Gartenplaner!</Text>
          </Animated.View>
        )}

        {reduceMotion ? (
          <Text style={styles.description}>
            Möchtest du deinen Garten mit Beispieldaten vorausfüllen?
          </Text>
        ) : (
          <Animated.View entering={FadeInUp.delay(200)}>
            <Text style={styles.description}>
              Möchtest du deinen Garten mit Beispieldaten vorausfüllen?
            </Text>
          </Animated.View>
        )}

        {reduceMotion ? (
          <GlassCard variant="light" animated={false}>
            <View style={styles.infoBox}>
              <Info size={24} color={Colors2026.status.info} />
              <Text style={styles.infoText}>
                Du erhältst 32 Beispielpflanzen:{'\n'}
                • 7 etablierte Pflanzen{'\n'}
                • 25 geplante Pflanzen{'\n\n'}
                So kannst du die App direkt ausprobieren!
              </Text>
            </View>
          </GlassCard>
        ) : (
          <Animated.View entering={FadeInUp.delay(300)}>
            <GlassCard variant="light" animated={false}>
              <View style={styles.infoBox}>
                <Info size={24} color={Colors2026.status.info} />
                <Text style={styles.infoText}>
                  Du erhältst 32 Beispielpflanzen:{'\n'}
                  • 7 etablierte Pflanzen{'\n'}
                  • 25 geplante Pflanzen{'\n\n'}
                  So kannst du die App direkt ausprobieren!
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {reduceMotion ? (
          !importing ? (
            <>
              <AnimatedButton
                title="Beispieldaten importieren"
                onPress={handleImportData}
                variant="primary"
                size="lg"
                icon={<Download size={24} color="#fff" />}
                fullWidth
                style={styles.importButton}
              />
              <AnimatedButton
                title="Überspringen - Ich starte leer"
                onPress={handleSkip}
                variant="ghost"
                size="md"
              />
            </>
          ) : (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={Colors2026.primary} />
              {progress && (
                <>
                  <Text style={styles.progressText}>
                    {progress.current} / {progress.total}
                  </Text>
                  <Text style={styles.progressMessage}>
                    {progress.message}
                  </Text>
                </>
              )}
            </View>
          )
        ) : (
          <Animated.View entering={FadeInUp.delay(400)}>
            {!importing ? (
              <>
                <AnimatedButton
                  title="Beispieldaten importieren"
                  onPress={handleImportData}
                  variant="primary"
                  size="lg"
                  icon={<Download size={24} color="#fff" />}
                  fullWidth
                  style={styles.importButton}
                />
                <AnimatedButton
                  title="Überspringen - Ich starte leer"
                  onPress={handleSkip}
                  variant="ghost"
                  size="md"
                />
              </>
            ) : (
              <View style={styles.progressContainer}>
                <ActivityIndicator size="large" color={Colors2026.primary} />
                {progress && (
                  <>
                    <Text style={styles.progressText}>
                      {progress.current} / {progress.total}
                    </Text>
                    <Text style={styles.progressMessage}>
                      {progress.message}
                    </Text>
                  </>
                )}
              </View>
            )}
          </Animated.View>
        )}

        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                styles.dot,
                i === 0 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.footnote}>
          Du kannst Beispieldaten später auch im Menü importieren.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors2026.bg,
  },
  seasonalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors2026.seasonal.spring.bg,
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: Spacing2026.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography2026.headline,
    color: Colors2026.text,
    marginTop: Spacing2026.xl,
    marginBottom: Spacing2026.lg,
    textAlign: 'center',
  },
  description: {
    ...Typography2026.body,
    color: Colors2026.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing2026.xxxl,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    ...Typography2026.body,
    color: Colors2026.text,
    marginLeft: Spacing2026.md,
  },
  importButton: {
    marginBottom: Spacing2026.lg,
    maxWidth: 350,
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: Spacing2026.xxxl,
  },
  progressText: {
    ...Typography2026.title,
    color: Colors2026.primary,
    marginTop: Spacing2026.lg,
  },
  progressMessage: {
    ...Typography2026.body,
    color: Colors2026.textSecondary,
    marginTop: Spacing2026.sm,
    textAlign: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing2026.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors2026.primary,
  },
  dotInactive: {
    backgroundColor: Colors2026.border,
  },
  footnote: {
    ...Typography2026.caption,
    color: Colors2026.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 'auto',
  },
});
