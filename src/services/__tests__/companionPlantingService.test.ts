/**
 * Companion Planting Service Tests
 */

import { 
  getCompanionSuggestions,
  getBadCompanions,
  isGoodCompanion,
} from '../../services/companionPlantingService';

describe('companionPlantingService', () => {
  describe('getCompanionSuggestions', () => {
    it('should return good companions for Tomato', () => {
      const suggestions = getCompanionSuggestions('Tomate');
      
      expect(suggestions).toBeDefined();
      expect(suggestions.good).toBeInstanceOf(Array);
      expect(suggestions.bad).toBeInstanceOf(Array);
    });

    it('should include Basilikum as good companion for Tomato', () => {
      const suggestions = getCompanionSuggestions('Tomate');
      
      const hasBasil = suggestions.good.some(
        c => c.toLowerCase().includes('basilikum')
      );
      expect(hasBasil).toBe(true);
    });

    it('should return empty for unknown plant', () => {
      const suggestions = getCompanionSuggestions('UnbekanntePflanze');
      
      expect(suggestions.good).toHaveLength(0);
      expect(suggestions.bad).toHaveLength(0);
    });
  });

  describe('isGoodCompanion', () => {
    it('should return true for Basilikum with Tomato', () => {
      const result = isGoodCompanion('Tomate', 'Basilikum');
      expect(result).toBe(true);
    });

    it('should return false for Fenchel with Tomato', () => {
      const result = isGoodCompanion('Tomate', 'Fenchel');
      expect(result).toBe(false);
    });
  });
});
