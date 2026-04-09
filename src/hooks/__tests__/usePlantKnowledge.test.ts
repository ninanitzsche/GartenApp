/**
 * Plant Knowledge Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { usePlantKnowledge } from '../../hooks/usePlantKnowledge';

describe('usePlantKnowledge', () => {
  describe('getKnowledgeForPlant', () => {
    it('should return knowledge for known plant', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const tomatoKnowledge = result.current.getKnowledgeForPlant('Tomate');
      
      expect(tomatoKnowledge).toBeDefined();
      expect(tomatoKnowledge?.plantName).toBe('Tomate');
    });

    it('should return undefined for unknown plant', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const unknownKnowledge = result.current.getKnowledgeForPlant('UnbekanntePflanze123');
      
      expect(unknownKnowledge).toBeUndefined();
    });

    it('should return knowledge with diseases array', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const knowledge = result.current.getKnowledgeForPlant('Tomate');
      
      expect(knowledge?.extractedInfo.diseases).toBeInstanceOf(Array);
      expect(knowledge?.extractedInfo.diseases?.length).toBeGreaterThan(0);
    });

    it('should return knowledge with careTips array', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const knowledge = result.current.getKnowledgeForPlant('Tomate');
      
      expect(knowledge?.extractedInfo.careTips).toBeInstanceOf(Array);
      expect(knowledge?.extractedInfo.careTips?.length).toBeGreaterThan(0);
    });
  });

  describe('searchKnowledge', () => {
    it('should find plants by name', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const results = result.current.searchKnowledge('Tomate');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].plantName).toBe('Tomate');
    });

    it('should return empty array for no matches', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const results = result.current.searchKnowledge('xyznonexistent');
      
      expect(results).toEqual([]);
    });
  });

  describe('allPlants', () => {
    it('should return all plant names', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const plants = result.current.allPlants;
      
      expect(plants).toBeInstanceOf(Array);
      expect(plants.length).toBeGreaterThan(0);
    });

    it('should include common vegetables', () => {
      const { result } = renderHook(() => usePlantKnowledge());
      
      const plants = result.current.allPlants.map(p => p.toLowerCase());
      
      expect(plants).toContain('tomate');
      expect(plants).toContain('gurke');
      expect(plants).toContain('karotte');
    });
  });
});
