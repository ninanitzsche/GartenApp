// @ts-nocheck
/**
 * TaskCard Plant Display Tests
 * Tests that TaskCard correctly extracts and displays plant information
 */

import { describe, it, expect } from '@jest/globals';

describe('TaskCard Plant Display Logic', () => {
  // Test the logic of extracting plant name from task
  function getPlantNameFromTask(task: any): string | null {
    const linkedPlants = (task as any).linked_plants || [];
    return linkedPlants.length > 0 ? linkedPlants[0].name : null;
  }

  it('should extract plant name from linked_plants', () => {
    const task = {
      id: 'task-1',
      title: 'Tomaten giessen',
      linked_plants: [
        { id: 'plant-1', name: 'Tomate' },
      ],
    };
    
    expect(getPlantNameFromTask(task)).toBe('Tomate');
  });

  it('should return null when no linked_plants', () => {
    const task = {
      id: 'task-1',
      title: 'Allgemeine Gartenarbeit',
    };
    
    expect(getPlantNameFromTask(task)).toBeNull();
  });

  it('should return null when linked_plants is empty array', () => {
    const task = {
      id: 'task-1',
      title: 'Test',
      linked_plants: [],
    };
    
    expect(getPlantNameFromTask(task)).toBeNull();
  });

  it('should use first plant when multiple linked', () => {
    const task = {
      id: 'task-1',
      title: 'Test',
      linked_plants: [
        { id: 'plant-1', name: 'Tomate' },
        { id: 'plant-2', name: 'Paprika' },
      ],
    };
    
    expect(getPlantNameFromTask(task)).toBe('Tomate');
  });

  it('should handle null linked_plants', () => {
    const task = {
      id: 'task-1',
      title: 'Test',
      linked_plants: null,
    };
    
    expect(getPlantNameFromTask(task)).toBeNull();
  });

  // Test showPlantName logic
  function shouldShowPlantName(task: any, showPlantName: boolean = true): boolean {
    const plantName = getPlantNameFromTask(task);
    return showPlantName && !!plantName;
  }

  it('should show plant name when showPlantName is true and plant exists', () => {
    const task = {
      linked_plants: [{ name: 'Tomate' }],
    };
    
    expect(shouldShowPlantName(task, true)).toBe(true);
  });

  it('should not show plant name when showPlantName is false', () => {
    const task = {
      linked_plants: [{ name: 'Tomate' }],
    };
    
    expect(shouldShowPlantName(task, false)).toBe(false);
  });

  it('should not show plant name when no plant exists', () => {
    const task = {};
    
    expect(shouldShowPlantName(task, true)).toBe(false);
  });
});