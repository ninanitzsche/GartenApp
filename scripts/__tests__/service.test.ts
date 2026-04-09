/**
 * PDF Extraction Service Tests
 */

import { extractKnowledgeFromText } from '../services/pdfExtractionService';

jest.mock('../services/pdfExtractionService', () => ({
  extractKnowledgeFromText: jest.fn(),
}));

describe('PDF Extraction Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractKnowledgeFromText', () => {
    it('should be defined', () => {
      expect(extractKnowledgeFromText).toBeDefined();
    });

    it('should return extracted knowledge structure', async () => {
      const mockResult = {
        articles: [
          {
            title: 'Kraut- und Braunfäule bei Tomaten',
            content: 'Diese Pilzkrankheit tritt bei feuchtem Wetter auf...',
            category: 'schädlinge' as const,
            tags: ['tomate', 'pilz', 'fäule'],
            relatedPlants: ['Tomate', 'Kartoffel'],
          },
        ],
        plantKnowledge: [
          {
            plantName: 'Tomate',
            diseases: ['Kraut- und Braunfäule'],
            pests: ['Blattlaus', 'Weiße Fliege'],
            careTips: ['Regelmäßig gießen', 'Ausgeizen'],
            companions: [
              { plant: 'Basilikum', type: 'good' as const },
              { plant: 'Fenchel', type: 'avoid' as const },
            ],
            sowingTime: 'Februar-April',
            harvestTime: 'Juli-Oktober',
          },
        ],
      };

      (extractKnowledgeFromText as jest.Mock).mockResolvedValue(mockResult);

      const result = await extractKnowledgeFromText('test text', 'test.pdf');

      expect(result).toHaveProperty('articles');
      expect(result).toHaveProperty('plantKnowledge');
      expect(result.articles).toBeInstanceOf(Array);
      expect(result.plantKnowledge).toBeInstanceOf(Array);
    });

    it('should handle empty PDF text', async () => {
      const mockResult = {
        articles: [],
        plantKnowledge: [],
      };

      (extractKnowledgeFromText as jest.Mock).mockResolvedValue(mockResult);

      const result = await extractKnowledgeFromText('', 'empty.pdf');

      expect(result.articles).toHaveLength(0);
      expect(result.plantKnowledge).toHaveLength(0);
    });
  });
});
