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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { identifyPlant, pickImage } from '../services/aiService';
import { cacheIdentification, getCachedIdentification } from '../services/cacheService';
import { analyzePhotoWithHealth, compressImage } from '../services/aiIntegrationService';
import { fetchPlants, createPlant } from '../services/plantService';
import { uploadPhoto } from '../services/photoService';
import { createHealthCheck } from '../services/healthCheckService';
import { Plant } from '../types/plant';
import { PlantIdentificationResult, AIPhotoAnalysis } from '../types/ai';
import TaskSuggestionModal from './TaskSuggestionModal';
import AIPhotoStep2 from './AIPhotoStep2';
import AIPhotoStep3 from './AIPhotoStep3';
import AIPhotoStep4 from './AIPhotoStep4';
import { getAllSuggestions } from '../services/taskSuggestionService';
import { TaskSuggestion } from '../types/taskSuggestion';

interface AIPhotoPickerProps {
  visible: boolean;
  onClose: () => void;
  onPlantIdentified: (result: PlantIdentificationResult) => void;
  linkedPlantId?: string;
}

export default function AIPhotoPicker({
  visible,
  onClose,
  onPlantIdentified,
  linkedPlantId,
}: AIPhotoPickerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AIPhotoAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIPhotoAnalysis | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState({
    identification: 'pending' as 'pending' | 'loading' | 'done' | 'error',
    disease: 'pending' as 'pending' | 'loading' | 'done' | 'error',
    matching: 'pending' as 'pending' | 'loading' | 'done' | 'error',
  });

  const resetState = () => {
    setSelectedImage(null);
    setIsLoading(false);
    setResult(null);
    setAnalysisResult(null);
    setError(null);
    setShowSuggestions(false);
    setSuggestions([]);
    setCurrentStep(1);
    setAnalysisStatus({
      identification: 'pending',
      disease: 'pending',
      matching: 'pending',
    });
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

    setCurrentStep(2);
    setIsLoading(true);
    setError(null);

    try {
      const existingPlants = await fetchPlants();
      const analysisResult = await analyzePhotoWithHealth(selectedImage, existingPlants);
      setAnalysis(analysisResult);

      if (analysisResult.plantIdentification) {
        await cacheIdentification(selectedImage, analysisResult.plantIdentification);
      }

      if (analysisResult.bestMatch && (analysisResult.plantIdentification?.confidence ?? 0) >= 0.8) {
        setSelectedPlantId(analysisResult.bestMatch.id);
        setCurrentStep(4);
      } else {
        setCurrentStep(3);
      }
    } catch (err: any) {
      setError(err.message || 'Fehler bei der Analyse');
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlantId(plant.id);
    setCurrentStep(4);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedImage || !selectedPlantId || !analysis?.plantIdentification) return;

    setIsLoading(true);
    setError(null);

    try {
      const compressedUri = await compressImage(selectedImage);
      const fileName = `ai-picker-${Date.now()}.jpg`;
      await uploadPhoto(selectedPlantId, compressedUri, fileName);

      await createHealthCheck(selectedPlantId, {
        photoUri: compressedUri,
        runAI: true,
        notes: `Automatisch erstellt durch AI-Identifikation: ${analysis.plantIdentification.name}`,
      });

      onPlantIdentified(analysis.plantIdentification);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Fehler bei der Zuordnung');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewPlant = async (newPlantName?: string) => {
    if (!selectedImage || !analysis?.plantIdentification) return;

    setIsLoading(true);
    setError(null);

    try {
      const name = newPlantName || analysis.plantIdentification.name;
      const newPlant = await createPlant({
        name,
        latin_name: analysis.plantIdentification.scientificName,
        status: 'geplant',
        identification_source: 'ai',
      });

      const compressedUri = await compressImage(selectedImage);
      const fileName = `ai-picker-${Date.now()}.jpg`;
      await uploadPhoto(newPlant.id, compressedUri, fileName);

      await createHealthCheck(newPlant.id, {
        photoUri: compressedUri,
        runAI: true,
        notes: `Automatisch erstellt durch AI-Identifikation: ${name}`,
      });

      if (analysis.plantIdentification) {
        onPlantIdentified(analysis.plantIdentification);
      }
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Anlegen der Pflanze');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (result) {
      const taskSuggestions = getAllSuggestions({
        plantFamily: result.family,
        plantName: result.name,
        linkedPlantId,
      });
      setSuggestions(taskSuggestions);
      setShowSuggestions(true);
    }
  };

  const handleCloseSuggestions = () => {
    setShowSuggestions(false);
    onPlantIdentified(result!);
    handleClose();
  };

  const handleRetry = () => {
    setResult(null);
    setAnalysisResult(null);
    setError(null);
    setSelectedImage(null);
    setCurrentStep(1);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return Colors2026.status.success;
    if (confidence >= 0.5) return Colors2026.status.warning;
    return Colors2026.status.error;
  };

  const renderContent = () => {
    if (currentStep === 4 && analysis && selectedPlantId) {
      const selectedPlant = analysis.matchingPlants.find(p => p.id === selectedPlantId) || analysis.bestMatch;
      return (
        <AIPhotoStep4
          bestMatch={selectedPlant}
          hasMultipleMatches={analysis.matchingPlants.length > 1}
          onConfirm={handleConfirmAssignment}
          onCreateNew={() => handleCreateNewPlant()}
          onSelectDifferent={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(3)}
        />
      );
    }

    if (currentStep === 3 && analysis && analysis.plantIdentification) {
      return (
        <AIPhotoStep3
          plantName={analysis.plantIdentification.name}
          scientificName={analysis.plantIdentification.scientificName}
          confidence={analysis.plantIdentification.confidence}
          family={analysis.plantIdentification.family}
          commonNames={analysis.plantIdentification.commonNames}
          healthStatus={analysis.healthStatus}
          matchingPlants={analysis.matchingPlants}
          onSelectPlant={handleSelectPlant}
          onCreateNewPlant={() => handleCreateNewPlant()}
          onRetry={handleRetry}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <AIPhotoStep2
          identificationStatus={analysisStatus.identification}
          diseaseStatus={analysisStatus.disease}
          matchingStatus={analysisStatus.matching}
        />
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
              <ActivityIndicator color={Colors2026.surface} />
            ) : (
              <>
                <MaterialIcons name="search" size={20} color={Colors2026.surface} />
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
            <MaterialIcons name="camera-alt" size={48} color={Colors2026.primary} />
            <Text style={styles.optionText}>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePickFromGallery}
          >
            <MaterialIcons name="photo-library" size={48} color={Colors2026.primary} />
            <Text style={styles.optionText}>Galerie</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
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
                <MaterialIcons name="close" size={24} color={Colors2026.text} />
              </TouchableOpacity>
            </View>
            {renderContent()}
          </View>
        </View>
      </Modal>

      <TaskSuggestionModal
        visible={showSuggestions}
        suggestions={suggestions}
        plantName={result?.name}
        linkedPlantId={linkedPlantId}
        onClose={handleCloseSuggestions}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors2026.surface,
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
    color: Colors2026.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors2026.textLight,
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
    backgroundColor: Colors2026.background,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors2026.border,
  },
  optionText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors2026.primary,
  },
  previewContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    minHeight: 400,
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: 16,
    marginBottom: 24,
  },
  identifyButton: {
    backgroundColor: Colors2026.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  resultContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors2026.status.success,
    marginTop: 16,
    marginBottom: 24,
  },
  resultCard: {
    width: '100%',
    backgroundColor: Colors2026.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  plantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors2026.text,
  },
  scientificName: {
    fontSize: 16,
    fontStyle: 'italic',
    color: Colors2026.textLight,
    marginBottom: 16,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 14,
    color: Colors2026.textLight,
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  familyText: {
    fontSize: 14,
    color: Colors2026.textLight,
    marginBottom: 4,
  },
  commonNamesText: {
    fontSize: 14,
    color: Colors2026.textLight,
    fontStyle: 'italic',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors2026.status.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors2026.textLight,
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
    backgroundColor: Colors2026.primary,
  },
  primaryButtonText: {
    color: Colors2026.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors2026.background,
    borderWidth: 1,
    borderColor: Colors2026.border,
  },
  secondaryButtonText: {
    color: Colors2026.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
