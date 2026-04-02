import { compressImage } from '../services/aiIntegrationService';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
  },
}));

jest.mock('../services/aiService', () => ({
  identifyPlant: jest.fn(),
}));

jest.mock('../services/cacheService', () => ({
  cacheAIIdentification: jest.fn(),
  cachePestDetection: jest.fn(),
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
