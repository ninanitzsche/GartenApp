/**
 * PDF Extraction Types Tests
 */

import {
  KnowledgeArticle,
  KNOWLEDGE_ARTICLES,
} from '../knowledge-articles';
import {
  PlantKnowledgeEntry,
  PLANT_KNOWLEDGE_MAP,
} from '../plant-knowledge-map';
import {
  ProcessedPDF,
  PROCESSED_PDFS,
} from '../pdf-sources';

describe('PDF Extraction Types', () => {
  describe('KnowledgeArticle interface', () => {
    it('should have all required fields', () => {
      const article: KnowledgeArticle = {
        id: 'test_1',
        title: 'Test Article',
        content: 'Test content',
        category: 'pflege',
        tags: ['test'],
        sourceType: 'pdf',
        sourceFile: 'test.pdf',
        relatedPlants: ['Tomate'],
        created_at: '2024-01-01',
      };

      expect(article.id).toBeDefined();
      expect(article.title).toBeDefined();
      expect(article.content).toBeDefined();
      expect(article.category).toBeDefined();
      expect(article.tags).toBeInstanceOf(Array);
      expect(article.sourceType).toBe('pdf');
      expect(article.sourceFile).toBeDefined();
      expect(article.relatedPlants).toBeInstanceOf(Array);
      expect(article.created_at).toBeDefined();
    });

    it('should accept valid category values', () => {
      const categories = ['pflege', 'schädlinge', 'pflanzen', 'ernte', 'boden', 'sonstiges'] as const;
      
      categories.forEach(category => {
        const article: KnowledgeArticle = {
          id: 'test',
          title: 'Test',
          content: 'Test',
          category,
          tags: [],
          sourceType: 'pdf',
          sourceFile: 'test.pdf',
          relatedPlants: [],
          created_at: '2024-01-01',
        };
        expect(article.category).toBe(category);
      });
    });
  });

  describe('PlantKnowledgeEntry interface', () => {
    it('should have all required fields', () => {
      const entry: PlantKnowledgeEntry = {
        plantName: 'Tomate',
        articleIds: ['article_1'],
        extractedInfo: {
          diseases: ['Kraut- und Braunfäule'],
          pests: ['Blattläuse'],
          careTips: ['Regelmäßig gießen'],
          companions: [{ plant: 'Basilikum', type: 'good' }],
          sowingTime: 'März-April',
          harvestTime: 'Juli-September',
        },
      };

      expect(entry.plantName).toBe('Tomate');
      expect(entry.articleIds).toBeInstanceOf(Array);
      expect(entry.extractedInfo).toBeDefined();
    });

    it('should accept companion with type good', () => {
      const entry: PlantKnowledgeEntry = {
        plantName: 'Tomate',
        articleIds: [],
        extractedInfo: {
          companions: [{ plant: 'Basilikum', type: 'good' }],
        },
      };

      expect(entry.extractedInfo.companions?.[0].type).toBe('good');
    });

    it('should accept companion with type avoid', () => {
      const entry: PlantKnowledgeEntry = {
        plantName: 'Tomate',
        articleIds: [],
        extractedInfo: {
          companions: [{ plant: 'Fenchel', type: 'avoid' }],
        },
      };

      expect(entry.extractedInfo.companions?.[0].type).toBe('avoid');
    });
  });

  describe('ProcessedPDF interface', () => {
    it('should have all required fields', () => {
      const pdf: ProcessedPDF = {
        filename: 'test.pdf',
        processedAt: '2024-01-01T00:00:00Z',
        articleCount: 5,
        plantsFound: ['Tomate', 'Paprika'],
      };

      expect(pdf.filename).toBeDefined();
      expect(pdf.processedAt).toBeDefined();
      expect(pdf.articleCount).toBeDefined();
      expect(pdf.plantsFound).toBeInstanceOf(Array);
    });
  });

  describe('Default exports', () => {
    it('should export empty KNOWLEDGE_ARTICLES array', () => {
      expect(KNOWLEDGE_ARTICLES).toBeInstanceOf(Array);
    });

    it('should export empty PLANT_KNOWLEDGE_MAP array', () => {
      expect(PLANT_KNOWLEDGE_MAP).toBeInstanceOf(Array);
    });

    it('should export empty PROCESSED_PDFS array', () => {
      expect(PROCESSED_PDFS).toBeInstanceOf(Array);
    });
  });
});
