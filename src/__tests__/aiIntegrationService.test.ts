import { compressImage, analyzePhotoWithHealth, findMatchingPlants, identifyDiseaseWithCache } from '../services/aiIntegrationService';
import { Plant } from '../types/plant';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

jest.mock('../services/aiService', () => ({
  identifyPlant: jest.fn(),
  analyzePlantStatus: jest.fn(),
}));

jest.mock('../services/plantDiseaseService', () => ({
  identifyDisease: jest.fn(),
}));

jest.mock('../services/cacheService', () => ({
  cacheAIIdentification: jest.fn(),
  cachePestDetection: jest.fn(),
  cacheDisease: jest.fn(),
  cacheSuggestions: jest.fn(),
  getAICache: jest.fn(),
  invalidateAICache: jest.fn(),
}));

const { manipulateAsync, SaveFormat } = require('expo-image-manipulator');

describe('compressImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should compress image to max 1200px width', async () => {
    (manipulateAsync as jest.Mock).mockResolvedValue({
      uri: 'file://compressed-image.jpg',
    });

    const result = await compressImage('file://test-image.jpg');

    expect(result).toBeDefined();
    expect(result).toMatch(/^file:\/\//);
    expect(manipulateAsync).toHaveBeenCalledWith(
      'file://test-image.jpg',
      [{ resize: { width: 1200 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
  });

  it('should handle invalid URI gracefully', async () => {
    (manipulateAsync as jest.Mock).mockRejectedValue(new Error('Invalid URI'));

    await expect(compressImage('invalid-uri')).rejects.toThrow(
      'Bildkomprimierung fehlgeschlagen: Invalid URI'
    );
  });
});

describe('analyzePhotoWithHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return analysis with identification, disease, and matching', async () => {
    const { getAICache } = require('../services/cacheService');
    const { identifyPlant } = require('../services/aiService');
    const { identifyDisease } = require('../services/plantDiseaseService');

    (getAICache as jest.Mock).mockResolvedValue({ found: false });
    (identifyPlant as jest.Mock).mockResolvedValue({
      name: 'Erdbeere',
      scientificName: 'Fragaria',
      confidence: 0.9,
      family: 'Rosaceae',
      commonNames: ['Erdbeere'],
    });
    (identifyDisease as jest.Mock).mockResolvedValue({
      results: [],
      remainingRequests: 10,
      identifiedAt: new Date().toISOString(),
    });

    const mockPlants: Plant[] = [
      { id: '1', name: 'Erdbeere', latin_name: 'Fragaria', status: 'etabliert', user_id: 'u1' },
    ];
    
    const result = await analyzePhotoWithHealth('test-uri', mockPlants);
    
    expect(result).toHaveProperty('plantIdentification');
    expect(result).toHaveProperty('diseaseAnalysis');
    expect(result).toHaveProperty('healthStatus');
    expect(result).toHaveProperty('matchingPlants');
  });

  it('should handle identification error gracefully', async () => {
    const { getAICache } = require('../services/cacheService');
    const { identifyPlant } = require('../services/aiService');

    (getAICache as jest.Mock).mockResolvedValue({ found: false });
    (identifyPlant as jest.Mock).mockRejectedValue(new Error('Identification failed'));

    const result = await analyzePhotoWithHealth('invalid-uri', []);
    
    expect(result.errors?.identification).toBeDefined();
    expect(result.plantIdentification).toBeNull();
  });
});

describe('findMatchingPlants', () => {
  const plants: Plant[] = [
    { id: '1', name: 'Erdbeere', latin_name: 'Fragaria', status: 'etabliert', user_id: 'u1' },
    { id: '2', name: 'Tomate', latin_name: 'Solanum', status: 'geplant', user_id: 'u1' },
    { id: '3', name: 'Erdbeere Mieze', latin_name: 'Fragaria', status: 'etabliert', user_id: 'u1' },
  ];

  it('should find exact name match', () => {
    const result = findMatchingPlants('Erdbeere', plants);
    expect(result).toHaveLength(2);
  });

  it('should find partial match', () => {
    const result = findMatchingPlants('Tomate', plants);
    expect(result).toHaveLength(1);
  });

  it('should find latin name match', () => {
    const result = findMatchingPlants('Fragaria', plants);
    expect(result).toHaveLength(2);
  });

  it('should return empty array for no match', () => {
    const result = findMatchingPlants('Gurke', plants);
    expect(result).toHaveLength(0);
  });
});
