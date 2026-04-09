/**
 * Plant Care Task Generator Tests
 */

import { generateCareTasksFromKnowledge } from '../../services/plantCareTaskService';

describe('plantCareTaskService', () => {
  describe('generateCareTasksFromKnowledge', () => {
    it('should generate tasks from care tips', () => {
      const plantName = 'Tomate';
      const tasks = generateCareTasksFromKnowledge(plantName);
      
      expect(tasks).toBeInstanceOf(Array);
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should include watering task', () => {
      const tasks = generateCareTasksFromKnowledge('Tomate');
      
      const hasWatering = tasks.some(t => 
        t.title.toLowerCase().includes('gieß') || 
        t.title.toLowerCase().includes('wass')
      );
      expect(hasWatering).toBe(true);
    });

    it('should return empty array for unknown plant', () => {
      const tasks = generateCareTasksFromKnowledge('UnbekanntePflanze');
      
      expect(tasks).toEqual([]);
    });

    it('should have task properties', () => {
      const tasks = generateCareTasksFromKnowledge('Tomate');
      
      if (tasks.length > 0) {
        expect(tasks[0]).toHaveProperty('title');
        expect(tasks[0]).toHaveProperty('description');
        expect(tasks[0]).toHaveProperty('category');
      }
    });
  });
});
