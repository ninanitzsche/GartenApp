/**
 * AI Photo Picker Component
 * Modal for taking/selecting photos and identifying plants
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../theme/colors';
import { identifyPlant, pickImage } from '../services/aiService';
import { cacheIdentification, getCachedIdentification } from '../services/cacheService';
import { PlantIdentificationResult } from '../types/ai';

interface AIPhotoPickerProps {
  visible: boolean;
  onClose: () => void;
  onPlantIdentified: (result: PlantIdentificationResult) => void;
}

export default function AIPhotoPicker({
  visible,
  onClose,
  onPlantIdentified,
}: AIPhotoPickerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setSelectedImage(null);
    setIsLoading(false);
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePickFromGallery = async () => {
    const image = await pickImage('gallery');
    if (image) {
      setSelectedImage(image.uri);
    }
  };

  const handleTakePhoto = async () => {
    const image = await pickImage('camera');
    if (image) {
      setSelectedImage(image.uri);
    }
  };

  const handleIdentify = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cached = await getCachedIdentification(selectedImage);
      if (cached.found && cached.result) {
        setResult(cached.result);
        setIsLoading(false);
        return;
      }

      // Call API
      const identification = await identifyPlant(selectedImage);

      // Cache result
      await cacheIdentification(selectedImage, identification);

      setResult(identification);
    } catch (err: any) {
      console.error('Identification error:', err);
      setError(err.message || 'Fehler bei der Pflanzen-Erkennung');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (result) {
      onPlantIdentified(result);
      handleClose();
    }
  };

  const handleRetry = () => {
    setResult(null);
    setError(null);
    setSelectedImage(null);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return Colors.success;
    if (confidence >= 0.5) return Colors.warning;
    return Colors.error;
  };

  const renderContent = () => {
    if (result) {
      return (
        <View style={styles.resultContainer}>
          <MaterialIcons name="check-circle" size={64} color={Colors.success} />
          <Text style={styles.resultTitle}>Erkannt!</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.plantName}>{result.name}</Text>
            <Text style={styles.scientificName}>{result.scientificName}</Text>
            
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Konfidenz:</Text>
              <Text
                style={[
                  styles.confidenceValue,
                  { color: getConfidenceColor(result.confidence) },
                ]}
              >
                {Math.round(result.confidence * 100)}%
              </Text>
            </View>

            {result.family && (
              <Text style={styles.familyText}>Familie: {result.family}</Text>
            )}

            {result.commonNames.length > 0 && (
              <Text style={styles.commonNamesText}>
                Auch bekannt als: {result.commonNames.slice(0, 3).join(', ')}
              </Text>
            )}
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleRetry}
            >
              <MaterialIcons name="refresh" size={20} color={Colors.text} />
              <Text style={styles.secondaryButtonText}>Nochmal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleAccept}
            >
              <MaterialIcons name="add" size={20} color={Colors.surface} />
              <Text style={styles.primaryButtonText}>Hinzufügen</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.resultContainer}>
          <MaterialIcons name="error-outline" size={64} color={Colors.error} />
          <Text style={styles.errorTitle}>Erkennung fehlgeschlagen</Text>
          <Text style={styles.errorText}>{error}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleRetry}
            >
              <MaterialIcons name="refresh" size={20} color={Colors.text} />
              <Text style={styles.secondaryButtonText}>Nochmal versuchen</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (selectedImage) {
      return (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
          
          <TouchableOpacity
            style={[styles.button, styles.identifyButton]}
            onPress={handleIdentify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.surface} />
            ) : (
              <>
                <MaterialIcons name="search" size={20} color={Colors.surface} />
                <Text style={styles.primaryButtonText}>Pflanze erkennen</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.pickerContainer}>
        <Text style={styles.title}>Pflanze erkennen</Text>
        <Text style={styles.subtitle}>
          Fotografiere oder wähle ein Bild aus
        </Text>

        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handleTakePhoto}
          >
            <MaterialIcons name="camera-alt" size={48} color={Colors.primary} />
            <Text style={styles.optionText}>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePickFromGallery}
          >
            <MaterialIcons name="photo-library" size={48} color={Colors.primary} />
            <Text style={styles.optionText}>Galerie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <MaterialIcons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          {renderContent()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
  },
  pickerContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  optionCard: {
    width: 140,
    height: 140,
    backgroundColor: Colors.background,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  optionText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  previewContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginBottom: 24,
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.success,
    marginTop: 16,
    marginBottom: 24,
  },
  resultCard: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  plantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors.textLight,
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  familyText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 4,
  },
  commonNamesText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
