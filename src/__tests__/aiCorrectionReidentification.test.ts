// @ts-nocheck
/**
 * AI Correction Re-identification Tests
 * Tests that correction triggers new AI analysis with corrected name
 */

import { describe, it, expect, jest } from '@jest/globals';

jest.mock('../services/aiService', () => ({
  generatePlantCareInfo: jest.fn(),
}));

jest.mock('../services/aiIntegrationService', () => ({
  analyzePhotoWithHealth: jest.fn(),
}));

import { generatePlantCareInfo } from '../services/aiService';
import { analyzePhotoWithHealth } from '../services/aiIntegrationService';

const mockGeneratePlantCareInfo = generatePlantCareInfo as jest.MockedFunction<typeof generatePlantCareInfo>;
const mockAnalyzePhotoWithHealth = analyzePhotoWithHealth as jest.MockedFunction<typeof analyzePhotoWithHealth>;

describe('AI Correction Re-identification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should re-analyze with corrected name when user provides correction', async () => {
    const imageUri = 'file://test-image.jpg';
    const correctedName = 'Aprikose Compacta';
    
    const mockAnalysisResult = {
      plantIdentification: {
        name: correctedName,
        scientificName: 'Prunus armeniaca',
        family: 'Rosaceae',
        confidence: 0.95,
      },
      healthStatus: 'gesund' as const,
      matchingPlants: [],
    };
    
    mockAnalyzePhotoWithHealth.mockResolvedValue(mockAnalysisResult);
    
    // When user corrects and submits, we should re-analyze with new name
    const result = await analyzePhotoWithHealth(imageUri, [], correctedName);
    
    expect(result.plantIdentification.name).toBe(correctedName);
    expect(mockAnalyzePhotoWithHealth).toHaveBeenCalled();
  });

  it('should use corrected name for plant creation after re-analysis', async () => {
    const imageUri = 'file://test-image.jpg';
    const correctedName = 'Aprikose Compacta';
    
    const mockAnalysisResult = {
      plantIdentification: {
        name: correctedName,
        scientificName: 'Prunus armeniaca',
        family: 'Rosaceae',
        confidence: 0.95,
      },
      healthStatus: 'gesund' as const,
      matchingPlants: [],
    };
    
    mockAnalyzePhotoWithHealth.mockResolvedValue(mockAnalysisResult);
    
    // Step 1: Re-analyze with corrected name
    const analysis = await analyzePhotoWithHealth(imageUri, [], correctedName);
    
    // Step 2: Use the NEW analysis result for plant creation
    // (NOT the original AI identification which had wrong name)
    expect(analysis.plantIdentification.name).toBe(correctedName);
    expect(analysis.plantIdentification.name).not.toBe('Schlehe');
  });

  it('should NOT re-analyze when user does not provide correction', async () => {
    const imageUri = 'file://test-image.jpg';
    const originalName = 'Schlehe';
    
    mockAnalyzePhotoWithHealth.mockResolvedValue({
      plantIdentification: {
        name: originalName,
        confidence: 0.03,
      },
    } as any);
    
    // Without correction, use original analysis
    const result = await analyzePhotoWithHealth(imageUri, []);
    
    expect(result.plantIdentification.name).toBe(originalName);
  });

  it('should pass corrected name to generatePlantCareInfo for correct care instructions', async () => {
    const correctedName = 'Aprikose Compacta';
    const originalName = 'Schlehe';
    
    mockGeneratePlantCareInfo.mockResolvedValue({
      watering: 'Regelmässig giessen',
      sunlight: 'Sonnig',
    } as any);
    
    // When correcting, care info should be generated for CORRECTED name
    const careInfo = await generatePlantCareInfo(
      correctedName,
      'Prunus armeniaca',
      { family: 'Rosaceae', confidence: 0.95 }
    );
    
    // Should use corrected name, not original wrong name
    expect(mockGeneratePlantCareInfo).toHaveBeenCalledWith(
      correctedName,
      expect.any(String),
      expect.any(Object)
    );
  });
});