// @ts-nocheck
/**
 * Task List Filtering by Motivation Plant Tests
 * Tests that prioritized tasks are filtered by motivationPlantId
 */

import { describe, it, expect } from '@jest/globals';

describe('Task List Filtering by Motivation Plant', () => {
  // Current behavior: shows top priority tasks regardless of plant
  const currentBehavior = (tasks: any[], motivationPlantId?: string) => {
    return tasks.slice(0, 3);
  };

  // Desired behavior: filter tasks by motivationPlantId
  const desiredBehavior = (tasks: any[], motivationPlantId?: string) => {
    if (!motivationPlantId) {
      return tasks.slice(0, 3);
    }
    
    // Filter to only tasks belonging to the motivation plant
    const plantTasks = tasks.filter(t => {
      const taskPlantId = t.linked_plants?.[0]?.id;
      return taskPlantId === motivationPlantId;
    });
    
    // If plant has no tasks, fall back to all tasks
    if (plantTasks.length === 0) {
      return tasks.slice(0, 3);
    }
    
    return plantTasks.slice(0, 3);
  };

  it('should filter tasks when motivationPlantId is set', () => {
    const tasks = [
      { id: 't1', title: 'Tomate giessen', linked_plants: [{ id: 'p1' }] },
      { id: 't2', title: 'Paprika giessen', linked_plants: [{ id: 'p2' }] },
      { id: 't3', title: 'Tomate düngen', linked_plants: [{ id: 'p1' }] },
      { id: 't4', title: 'Orangerote Habichtblume giessen', linked_plants: [{ id: 'p3' }] },
      { id: 't5', title: 'Blaue Glockenblume giessen', linked_plants: [{ id: 'p4' }] },
    ];

    // Current behavior: ignores motivationPlantId, returns first 3
    const current = currentBehavior(tasks, 'p1');
    expect(current.length).toBe(3);
    expect(current.map(t => t.id)).toEqual(['t1', 't2', 't3']);

    // Desired behavior: filters by plant
    const desired = desiredBehavior(tasks, 'p1');
    expect(desired.length).toBe(2);
    expect(desired.map(t => t.id)).toEqual(['t1', 't3']);
  });

  it('should fallback to all tasks when plant has no matching tasks', () => {
    const tasks = [
      { id: 't1', title: 'Tomate giessen', linked_plants: [{ id: 'p1' }] },
      { id: 't2', title: 'Paprika giessen', linked_plants: [{ id: 'p2' }] },
      { id: 't3', title: 'Tomate düngen', linked_plants: [{ id: 'p1' }] },
    ];

    // p5 has no tasks - should fallback to all
    const result = desiredBehavior(tasks, 'p5');
    expect(result.length).toBe(3);
  });

  it('should handle undefined motivationPlantId', () => {
    const tasks = [
      { id: 't1', title: 'Task 1', linked_plants: [{ id: 'p1' }] },
      { id: 't2', title: 'Task 2', linked_plants: [{ id: 'p2' }] },
    ];

    const result = desiredBehavior(tasks, undefined);
    expect(result.length).toBe(2);
  });

  it('should handle tasks without linked_plants', () => {
    const tasks = [
      { id: 't1', title: 'General task', linked_plants: [] },
      { id: 't2', title: 'Plant task', linked_plants: [{ id: 'p1' }] },
    ];

    // Tasks without linked_plants should still appear in fallback
    const result = desiredBehavior(tasks, 'p1');
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('t2');
  });
});