import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { importSeedData, ImportProgress } from '../services/seedDataService';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
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
      <View style={styles.content}>
        <MaterialIcons name="eco" size={80} color={Colors.primary} />

        <Text style={styles.title}>Willkommen beim Gartenplaner!</Text>

        <Text style={styles.description}>
          Möchtest du deinen Garten mit Beispieldaten vorausfüllen?
        </Text>

        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={24} color={Colors.info} />
          <Text style={styles.infoText}>
            Du erhältst 32 Beispielpflanzen:{'\n'}
            • 7 etablierte Pflanzen{'\n'}
            • 25 geplante Pflanzen{'\n\n'}
            So kannst du die App direkt ausprobieren!
          </Text>
        </View>

        {!importing ? (
          <>
            <TouchableOpacity
              style={styles.importButton}
              onPress={handleImportData}
            >
              <MaterialIcons name="download" size={24} color="#fff" />
              <Text style={styles.importButtonText}>
                Beispieldaten importieren
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>
                Überspringen - Ich starte leer
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.progressContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
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
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
    lineHeight: 22,
  },
  importButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
    maxWidth: 350,
  },
  importButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  skipButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  progressContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  progressText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 15,
  },
  progressMessage: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  footnote: {
    fontSize: 14,
    color: Colors.textDisabled,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 'auto',
  },
});
