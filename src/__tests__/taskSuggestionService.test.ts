/**
 * Task Suggestion Service Tests
 * Comprehensive test suite for taskSuggestionService.ts
 */

import { describe, it, expect } from '@jest/globals';
import {
  getSuggestionsForPlant,
  getSuggestionForPest,
  getAllSuggestions,
} from '../services/taskSuggestionService';
import { PEST_TREATMENT_TASKS, SEASONAL_TASKS } from '../types/taskSuggestion';

describe('taskSuggestionService', () => {
  describe('getSuggestionsForPlant', () => {
    describe('Solanaceae (Tomatoes, Peppers)', () => {
      it('should suggest relevant tasks for tomatoes', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles.some(t => t.includes('Ausgeizen') || t.includes('Gießen') || t.includes('Düngen'))).toBe(true);
      });

      it('should include Gießen for tomatoes', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Gießen');
      });

      it('should include family-specific tasks for tomatoes', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        const hasFamilyTask = titles.some(t => 
          t.includes('Ausgeizen') || t.includes('Düngen') || t.includes('Ernten')
        );
        expect(hasFamilyTask).toBe(true);
      });
    });

    describe('Brassicaceae (Cabbage, Kale)', () => {
      it('should suggest Gießen for brassicaceae', () => {
        const suggestions = getSuggestionsForPlant('Brassicaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Gießen');
      });

      it('should suggest relevant tasks for brassicaceae', () => {
        const suggestions = getSuggestionsForPlant('Brassicaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        const hasRelevantTask = titles.some(t => 
          t.includes('Ernten') || t.includes('Schädlinge') || t.includes('Gießen')
        );
        expect(hasRelevantTask).toBe(true);
      });

      it('should suggest Schädlinge kontrollieren for brassicaceae', () => {
        const suggestions = getSuggestionsForPlant('Brassicaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Schädlinge kontrollieren');
      });
    });

    describe('Apiaceae (Carrots, Celery)', () => {
      it('should suggest Boden lockern for apiaceae', () => {
        const suggestions = getSuggestionsForPlant('Apiaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Boden lockern');
      });

      it('should suggest Gießen for apiaceae', () => {
        const suggestions = getSuggestionsForPlant('Apiaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Gießen');
      });

      it('should suggest relevant tasks for apiaceae', () => {
        const suggestions = getSuggestionsForPlant('Apiaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        const hasRelevantTask = titles.some(t => 
          t.includes('Ernten') || t.includes('Boden') || t.includes('Gießen')
        );
        expect(hasRelevantTask).toBe(true);
      });
    });

    describe('Lamiaceae (Basil, Mint)', () => {
      it('should suggest Gießen for lamiaceae', () => {
        const suggestions = getSuggestionsForPlant('Lamiaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Gießen');
      });

      it('should suggest Schnitt or Ernten for lamiaceae', () => {
        const suggestions = getSuggestionsForPlant('Lamiaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        const hasRelevantTask = titles.some(t => 
          t.includes('Schnitt') || t.includes('Ernten')
        );
        expect(hasRelevantTask).toBe(true);
      });

      it('should suggest relevant tasks for lamiaceae', () => {
        const suggestions = getSuggestionsForPlant('Lamiaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles.some(t => t.includes('Gießen') || t.includes('Ernten') || t.includes('Schnitt'))).toBe(true);
      });
    });

    describe('Cucurbitaceae (Cucumber, Zucchini)', () => {
      it('should suggest Gießen for cucurbitaceae', () => {
        const suggestions = getSuggestionsForPlant('Cucurbitaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Gießen');
      });

      it('should suggest Düngen for cucurbitaceae', () => {
        const suggestions = getSuggestionsForPlant('Cucurbitaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Düngen');
      });
    });

    describe('Fabaceae (Beans, Peas)', () => {
      it('should suggest Rankhilfe geben for fabaceae', () => {
        const suggestions = getSuggestionsForPlant('Fabaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Rankhilfe geben');
      });

      it('should suggest Gießen for fabaceae', () => {
        const suggestions = getSuggestionsForPlant('Fabaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Gießen');
      });
    });

    describe('Rosaceae', () => {
      it('should suggest Gießen for rosaceae', () => {
        const suggestions = getSuggestionsForPlant('Rosaceae', 'summer');
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Gießen');
      });

      it('should suggest relevant tasks for rosaceae', () => {
        const suggestions = getSuggestionsForPlant('Rosaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        const hasRelevantTask = titles.some(t => 
          t.includes('Schnitt') || t.includes('Ernten') || t.includes('Gießen')
        );
        expect(hasRelevantTask).toBe(true);
      });
    });

    describe('unknown plant family', () => {
      it('should return seasonal default tasks', () => {
        const suggestions = getSuggestionsForPlant('UnknownFamily', 'summer');
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.length).toBeLessThanOrEqual(3);
      });

      it('should handle null/undefined family', () => {
        const suggestions = getSuggestionsForPlant(undefined, 'summer');
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions.length).toBeLessThanOrEqual(3);
      });
    });

    describe('seasonal variations', () => {
      it('should suggest spring tasks in spring', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'spring', 5);
        const titles = suggestions.map(s => s.title);
        const hasSpringTask = titles.some(t => 
          t.includes('Aussaat') || t.includes('Pflanzen') || t.includes('Boden')
        );
        expect(hasSpringTask).toBe(true);
      });

      it('should suggest Pflanzen in spring', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'spring', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Pflanzen');
      });

      it('should suggest Boden vorbereiten in spring', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'spring', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Boden vorbereiten');
      });

      it('should suggest summer tasks in summer', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer', 5);
        const titles = suggestions.map(s => s.title);
        const hasSummerTask = titles.some(t => 
          t.includes('Gartenarbeiten') || t.includes('Gießen') || t.includes('Ernten')
        );
        expect(hasSummerTask).toBe(true);
      });

      it('should suggest autumn tasks in autumn', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'autumn', 5);
        const titles = suggestions.map(s => s.title);
        const hasAutumnTask = titles.some(t => 
          t.includes('Ernten') || t.includes('Winter') || t.includes('Pflanzzeit')
        );
        expect(hasAutumnTask).toBe(true);
      });

      it('should suggest Wintervorbereitung in autumn', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'autumn', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Wintervorbereitung');
      });

      it('should suggest winter tasks in winter', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'winter', 5);
        const titles = suggestions.map(s => s.title);
        const hasWinterTask = titles.some(t => 
          t.includes('Planung') || t.includes('Samen') || t.includes('Werkzeug')
        );
        expect(hasWinterTask).toBe(true);
      });

      it('should suggest Samen bestellen in winter', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'winter', 5);
        const titles = suggestions.map(s => s.title);
        expect(titles).toContain('Samen bestellen');
      });
    });

    describe('maxSuggestions parameter', () => {
      it('should return max 3 suggestions by default', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer');
        expect(suggestions.length).toBeLessThanOrEqual(3);
      });

      it('should return max 2 suggestions when specified', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer', 2);
        expect(suggestions.length).toBeLessThanOrEqual(2);
      });

      it('should return max 5 suggestions when specified', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer', 5);
        expect(suggestions.length).toBeLessThanOrEqual(5);
      });
    });

    describe('suggestion structure', () => {
      it('should return suggestions with required fields', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer');
        
        suggestions.forEach(suggestion => {
          expect(suggestion).toHaveProperty('title');
          expect(suggestion).toHaveProperty('category');
          expect(suggestion).toHaveProperty('priority');
          expect(suggestion).toHaveProperty('reason');
          expect(typeof suggestion.title).toBe('string');
          expect(suggestion.title.length).toBeGreaterThan(0);
        });
      });

      it('should return suggestions with valid categories', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer');
        const validCategories = ['Aussaat', 'Pflanzen', 'Gartenarbeiten', 'Beobachten', 'Ernten'];
        
        suggestions.forEach(suggestion => {
          expect(validCategories).toContain(suggestion.category);
        });
      });

      it('should return suggestions with valid priorities', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer');
        const validPriorities = ['hoch', 'mittel', 'niedrig'];
        
        suggestions.forEach(suggestion => {
          expect(validPriorities).toContain(suggestion.priority);
        });
      });

      it('should assign hoch priority to treatment tasks', () => {
        const suggestions = getSuggestionsForPlant('Solanaceae', 'summer');
        const behandlungTask = suggestions.find(s => s.title.includes('Behandlung'));
        if (behandlungTask) {
          expect(behandlungTask.priority).toBe('hoch');
        }
      });
    });
  });

  describe('getSuggestionForPest', () => {
    it('should return aphid treatment for "aphids"', () => {
      const suggestion = getSuggestionForPest('aphids');
      expect(suggestion?.title).toBe('Behandlung: Läuse bekämpfen');
      expect(suggestion?.priority).toBe('hoch');
    });

    it('should return aphid treatment for "Aphids" (case insensitive)', () => {
      const suggestion = getSuggestionForPest('Aphids');
      expect(suggestion?.title).toBe('Behandlung: Läuse bekämpfen');
    });

    it('should return powdery mildew treatment for "powdery mildew"', () => {
      const suggestion = getSuggestionForPest('powdery mildew');
      expect(suggestion?.title).toBe('Behandlung: Mehltau behandeln');
      expect(suggestion?.priority).toBe('hoch');
    });

    it('should return spider mites treatment for "spider mites"', () => {
      const suggestion = getSuggestionForPest('spider mites');
      expect(suggestion?.title).toBe('Behandlung: Spinnmilben behandeln');
      expect(suggestion?.priority).toBe('hoch');
    });

    it('should return slugs treatment for "slugs"', () => {
      const suggestion = getSuggestionForPest('slugs');
      expect(suggestion?.title).toBe('Behandlung: Schnecken bekämpfen');
      expect(suggestion?.priority).toBe('mittel');
    });

    it('should return leaf spot treatment for "leaf spot"', () => {
      const suggestion = getSuggestionForPest('leaf spot');
      expect(suggestion?.title).toBe('Behandlung: Blattflecken behandeln');
      expect(suggestion?.priority).toBe('mittel');
    });

    it('should return default treatment for unknown pest', () => {
      const suggestion = getSuggestionForPest('unknown pest');
      expect(suggestion?.title).toBe('Behandlung durchführen');
      expect(suggestion?.priority).toBe('hoch');
    });

    it('should return null for undefined pest', () => {
      const suggestion = getSuggestionForPest(undefined);
      expect(suggestion).toBeNull();
    });

    it('should return null for empty string pest', () => {
      const suggestion = getSuggestionForPest('');
      expect(suggestion).toBeNull();
    });

    it('should include isPestTreatment flag', () => {
      const suggestion = getSuggestionForPest('aphids');
      expect(suggestion?.isPestTreatment).toBe(true);
    });
  });

  describe('getAllSuggestions', () => {
    it('should return 2-3 suggestions for plant with family', () => {
      const suggestions = getAllSuggestions({
        plantFamily: 'Solanaceae',
        plantName: 'Tomato',
      });
      expect(suggestions.length).toBeGreaterThanOrEqual(2);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should include pest treatment when pestType is provided', () => {
      const suggestions = getAllSuggestions({
        plantFamily: 'Solanaceae',
        pestType: 'aphids',
      });
      const pestTask = suggestions.find(s => s.isPestTreatment);
      expect(pestTask).toBeDefined();
      expect(pestTask?.title).toContain('Behandlung');
    });

    it('should combine plant and pest suggestions', () => {
      const suggestions = getAllSuggestions({
        plantFamily: 'Solanaceae',
        plantName: 'Tomato',
        pestType: 'aphids',
      });
      expect(suggestions.length).toBeGreaterThanOrEqual(2);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should handle empty context with seasonal defaults', () => {
      const suggestions = getAllSuggestions({});
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should respect maxSuggestions parameter', () => {
      const suggestions = getAllSuggestions({
        plantFamily: 'Solanaceae',
        maxSuggestions: 2,
      });
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should not duplicate suggestions', () => {
      const suggestions = getAllSuggestions({
        plantFamily: 'Solanaceae',
        plantName: 'Tomato',
        pestType: 'aphids',
        maxSuggestions: 5,
      });
      const titles = suggestions.map(s => s.title);
      const uniqueTitles = [...new Set(titles)];
      expect(titles.length).toBe(uniqueTitles.length);
    });

    it('should link to plant when linkedPlantId is provided', () => {
      const suggestions = getAllSuggestions({
        plantFamily: 'Solanaceae',
        linkedPlantId: 'plant-123',
      });
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('integration scenarios', () => {
    it('scenario: Identify tomato plant in spring', () => {
      const suggestions = getSuggestionsForPlant('Solanaceae', 'spring');
      const titles = suggestions.map(s => s.title);
      
      expect(titles).toContain('Aussaat');
      expect(titles).toContain('Pflanzen');
    });

    it('scenario: Identify tomato plant in summer', () => {
      const suggestions = getSuggestionsForPlant('Solanaceae', 'summer');
      const titles = suggestions.map(s => s.title);
      
      expect(titles).toContain('Ausgeizen');
      expect(titles).toContain('Gießen');
      expect(titles).toContain('Düngen');
    });

    it('scenario: Detect aphids on tomato plant', () => {
      const pestSuggestion = getSuggestionForPest('aphids');
      expect(pestSuggestion).toBeDefined();
      expect(pestSuggestion?.title).toBe('Behandlung: Läuse bekämpfen');
      expect(pestSuggestion?.priority).toBe('hoch');
    });

    it('scenario: Full flow - plant ID + pest detection', () => {
      const plantSuggestions = getSuggestionsForPlant('Solanaceae', 'summer');
      const pestSuggestion = getSuggestionForPest('spider_mites');
      const allSuggestions = getAllSuggestions({
        plantFamily: 'Solanaceae',
        pestType: 'spider_mites',
      });
      
      expect(plantSuggestions.length).toBeGreaterThan(0);
      expect(pestSuggestion).toBeDefined();
      expect(allSuggestions.some(s => s.isPestTreatment)).toBe(true);
    });
  });

  describe('SEASONAL_TASKS constant', () => {
    it('should have tasks for all seasons', () => {
      expect(SEASONAL_TASKS.spring).toBeDefined();
      expect(SEASONAL_TASKS.summer).toBeDefined();
      expect(SEASONAL_TASKS.autumn).toBeDefined();
      expect(SEASONAL_TASKS.winter).toBeDefined();
    });

    it('should have spring tasks', () => {
      const tasks = SEASONAL_TASKS.spring;
      expect(tasks).toContain('Aussaat');
      expect(tasks).toContain('Pflanzen');
    });

    it('should have summer tasks', () => {
      const tasks = SEASONAL_TASKS.summer;
      expect(tasks).toContain('Gartenarbeiten');
      expect(tasks).toContain('Ernten');
    });

    it('should have autumn tasks', () => {
      const tasks = SEASONAL_TASKS.autumn;
      expect(tasks).toContain('Ernten');
      expect(tasks).toContain('Wintervorbereitung');
    });

    it('should have winter tasks', () => {
      const tasks = SEASONAL_TASKS.winter;
      expect(tasks).toContain('Planung');
      expect(tasks).toContain('Samen bestellen');
    });
  });

  describe('PEST_TREATMENT_TASKS constant', () => {
    it('should have all pest treatments defined', () => {
      expect(PEST_TREATMENT_TASKS.aphids).toBeDefined();
      expect(PEST_TREATMENT_TASKS['powdery mildew']).toBeDefined();
      expect(PEST_TREATMENT_TASKS.spider_mites).toBeDefined();
      expect(PEST_TREATMENT_TASKS.slugs).toBeDefined();
      expect(PEST_TREATMENT_TASKS.leaf_spot).toBeDefined();
      expect(PEST_TREATMENT_TASKS.default).toBeDefined();
    });

    it('should have correct priority for each pest', () => {
      expect(PEST_TREATMENT_TASKS.aphids.priority).toBe('hoch');
      expect(PEST_TREATMENT_TASKS['powdery mildew'].priority).toBe('hoch');
      expect(PEST_TREATMENT_TASKS.spider_mites.priority).toBe('hoch');
      expect(PEST_TREATMENT_TASKS.slugs.priority).toBe('mittel');
      expect(PEST_TREATMENT_TASKS.leaf_spot.priority).toBe('mittel');
    });

    it('should all be Gartenarbeiten category', () => {
      Object.values(PEST_TREATMENT_TASKS).forEach(task => {
        expect(task.category).toBe('Gartenarbeiten');
      });
    });
  });
});
