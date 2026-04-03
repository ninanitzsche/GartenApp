// @ts-nocheck
/**
 * Motivation Plant Selection Tests
 * Tests for correct plant selection in motivation message
 */

import { describe, it, expect } from '@jest/globals';
import { getMotivationMessage } from '../services/gamificationService';

describe('Motivation Plant Selection', () => {
  it('should return plantId from plantProgress when tasks completed today', () => {
    const plantProgress = [
      { plantId: '1', plantName: 'Tomate', totalTasks: 5, completedTasks: 2, allDone: false },
      { plantId: '2', plantName: 'Paprika', totalTasks: 3, completedTasks: 1, allDone: false },
    ];
    
    const result = getMotivationMessage(plantProgress, 1);
    
    // Result should have a plantId from the non-completed plants
    expect(result.plantId).toBeDefined();
    expect(['1', '2']).toContain(result.plantId);
  });

  it('should NOT select completed plants (allDone=true)', () => {
    const plantProgress = [
      { plantId: '1', plantName: 'Tomate', totalTasks: 5, completedTasks: 5, allDone: true },
      { plantId: '2', plantName: 'Paprika', totalTasks: 3, completedTasks: 1, allDone: false },
    ];
    
    const result = getMotivationMessage(plantProgress, 1);
    
    // Should select Paprika, not Tomate (Tomate is allDone)
    expect(result.plantId).toBe('2');
  });

  it('should return undefined when all plants are completed', () => {
    const plantProgress = [
      { plantId: '1', plantName: 'Tomate', totalTasks: 5, completedTasks: 5, allDone: true },
    ];
    
    const result = getMotivationMessage(plantProgress, 1);
    
    // All plants done - celebration message, no plantId
    expect(result.plantId).toBeUndefined();
  });

  it('should handle empty plantProgress array', () => {
    const plantProgress: any[] = [];
    
    const result = getMotivationMessage(plantProgress, 1);
    
    // Should still return a message (no crash)
    expect(result.message).toBeDefined();
    expect(result.plantId).toBeUndefined();
  });

  it('should select plant with tasks (totalTasks > 0)', () => {
    const plantProgress = [
      { plantId: '1', plantName: 'Tomate', totalTasks: 0, completedTasks: 0, allDone: false },
      { plantId: '2', plantName: 'Paprika', totalTasks: 3, completedTasks: 1, allDone: false },
    ];
    
    const result = getMotivationMessage(plantProgress, 1);
    
    // Should select Paprika (has tasks)
    expect(result.plantId).toBe('2');
  });
});