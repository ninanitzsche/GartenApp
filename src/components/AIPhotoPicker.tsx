/**
 * AI Photo Picker Component
 * Modal for taking/selecting photos and identifying plants
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors2026, Spacing2026, Radius2026, Typography2026, Shadows2026 } from '../theme/designSystemV2';
import { identifyPlant, pickImage, generatePlantCareInfo } from '../services/aiService';
import { cacheIdentification, getCachedIdentification } from '../services/cacheService';
import { analyzePhotoWithHealth, compressImage } from '../services/aiIntegrationService';
import { fetchPlants, createPlant, updatePlant } from '../services/plantService';
import { fetchBeds } from '../services/bedService';
import { uploadPhoto } from '../services/photoService';
import { createHealthCheck } from '../services/healthCheckService';
import { createTask } from '../services/taskService';
import { getSuggestionsForPlant } from '../services/taskSuggestionService';
import { Plant } from '../types/plant';
import { Bed } from '../types/bed';
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
  onPlantCreated?: (plantId: string) => void;
  linkedPlantId?: string;
}

export default function AIPhotoPicker({
  visible,
  onClose,
  onPlantIdentified,
  onPlantCreated,
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
  const [beds, setBeds] = useState<Bed[]>([]);
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState({
    identification: 'pending' as 'pending' | 'loading' | 'done' | 'error',
    disease: 'pending' as 'pending' | 'loading' | 'done' | 'error',
    matching: 'pending' as 'pending' | 'loading' | 'done' | 'error',
  });

  const ANALYSIS_TIMEOUT = 30000;

  useEffect(() => {
    if (visible) {
      fetchBeds().then(setBeds).catch(console.error);
    }
  }, [visible]);

  useEffect(() => {
    if (currentStep === 2) {
      const timeout = setTimeout(() => {
        setError('Analyse hat zu lange gedauert. Bitte erneut versuchen.');
        setCurrentStep(1);
      }, ANALYSIS_TIMEOUT);
      return () => clearTimeout(timeout);
    }
  }, [currentStep]);

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

  const handleCreateNewPlant = async (correctedName?: string, classification?: 'unkraut' | 'helfer' | 'nutzpflanze') => {
    if (!selectedImage || !analysis?.plantIdentification) return;

    setIsLoading(true);
    setError(null);

    try {
      const name = correctedName || analysis.plantIdentification.name;
      const isWeed = classification === 'unkraut';
      const isHelper = classification === 'helfer';
      const plantType = isWeed ? 'Unkraut' : isHelper ? 'Helferpflanze' : 'Nutzpflanze';
      
      // Generate AI care info first
      let openaiCare = null;
      if (!isWeed) {
        try {
          openaiCare = await generatePlantCareInfo(
            name,
            analysis.plantIdentification.scientificName || name,
            {
              family: analysis.plantIdentification.family,
              genus: analysis.plantIdentification.genus,
              commonNames: analysis.plantIdentification.commonNames,
              scientificName: analysis.plantIdentification.scientificName,
              confidence: analysis.plantIdentification.confidence
            }
          );
        } catch (e) {
          console.log('AI care generation failed:', e);
        }
      }

      const newPlant = await createPlant({
        name,
        latin_name: isWeed ? undefined : (analysis.plantIdentification.scientificName || undefined),
        status: isWeed ? 'unkraut' : isHelper ? 'helfer' : 'geplant',
        identification_source: 'ai',
        openai_care: openaiCare,
        plantnet_data: {
          family: isWeed ? undefined : analysis.plantIdentification.family,
          genus: isWeed ? undefined : analysis.plantIdentification.genus,
          scientificName: isWeed ? undefined : analysis.plantIdentification.scientificName,
          commonNames: isWeed ? [] : analysis.plantIdentification.commonNames,
          confidence: analysis.plantIdentification.confidence,
          corrected: !!correctedName,
          classification: classification || 'nutzpflanze',
        },
        bed_id: (!isWeed && !isHelper && selectedBedId) ? selectedBedId : undefined,
      });

      const compressedUri = await compressImage(selectedImage);
      const fileName = `ai-picker-${Date.now()}.jpg`;
      await uploadPhoto(newPlant.id, compressedUri, fileName);

      await createHealthCheck(newPlant.id, {
        photoUri: compressedUri,
        runAI: !isWeed,
        notes: `Automatisch erstellt durch AI-Identifikation: ${name} (${plantType})`,
      });

      // Auto-generate tasks for nutzpflanze (not for weed or helper)
      if (!isWeed && !isHelper && analysis.plantIdentification?.family) {
        try {
          const taskSuggestions = getSuggestionsForPlant(analysis.plantIdentification.family);
          for (const suggestion of taskSuggestions) {
            await createTask({
              title: suggestion.title,
              category: suggestion.category,
              priority: suggestion.priority,
              description: suggestion.reason,
              plant_ids: [newPlant.id],
            });
          }
        } catch (taskError) {
          console.log('Auto-task generation failed:', taskError);
        }
      }

      if (analysis.plantIdentification) {
        onPlantIdentified(analysis.plantIdentification);
      }
      
      // Call onPlantCreated to allow navigation to plant details
      if (onPlantCreated) {
        onPlantCreated(newPlant.id);
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

  const handleReidentify = async (correctedName: string, classification: 'unkraut' | 'helfer' | 'nutzpflanze') => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const existingPlants = await fetchPlants();
      
      const correctedAnalysis: AIPhotoAnalysis = {
        plantIdentification: {
          name: correctedName,
          scientificName: classification === 'nutzpflanze' ? '' : '',
          confidence: 1.0,
          family: classification === 'nutzpflanze' ? 'Unknown' : '',
          commonNames: [],
        },
        diseaseAnalysis: null,
        healthStatus: 'gesund',
        matchingPlants: [],
        bestMatch: null,
      };

      setAnalysis(correctedAnalysis);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err.message || 'Fehler bei der erneuten Identifikation');
    } finally {
      setIsLoading(false);
    }
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
          plantStatusAnalysis={analysis.plantStatusAnalysis}
          onSelectPlant={handleSelectPlant}
          onCreateNewPlant={() => handleCreateNewPlant()}
          onReidentify={handleReidentify}
          onRetry={handleRetry}
          isLoading={isLoading}
          beds={beds}
          selectedBedId={selectedBedId}
          onSelectBed={setSelectedBedId}
        />
      );
    }

    if (currentStep === 2) {
      return (
        <AIPhotoStep2
          identificationStatus={analysisStatus.identification}
          diseaseStatus={analysisStatus.disease}
          matchingStatus={analysisStatus.matching}
          error={error}
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
            accessibilityLabel="Foto mit Kamera aufnehmen"
            accessibilityRole="button"
          >
            <MaterialIcons name="camera-alt" size={48} color={Colors2026.primary} />
            <Text style={styles.optionText}>Kamera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePickFromGallery}
            accessibilityLabel="Foto aus Galerie auswählen"
            accessibilityRole="button"
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
          <View style={[styles.modalContent, styles.modalContentLarge]}>
            <View style={styles.dragIndicator} />
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <MaterialIcons name="close" size={24} color={Colors2026.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {renderContent()}
            </ScrollView>
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
  modalContentLarge: {
    maxHeight: '95%',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors2026.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    flex: 1,
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
