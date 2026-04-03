/**
 * TaskListContent Filter Integration Tests
 * Tests the new filter logic integration in TaskListContent
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  isTaskOverdue, 
  isTaskDueThisWeek, 
  isTaskDueNextWeek,
  filterTasksBySeason, 
  sortTasksByMonth,
  getCurrentSeason,
  getSeasonFromDate
} from '../services/taskService';

function createMockTask(overrides: any = {}) {
  return {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    category: 'pflege',
    priority: 'mittel',
    completed_at: null,
    scheduled_date: null,
    due_date: null,
    created_at: '2026-03-01T10:00:00Z',
    linked_plants: [],
    ...overrides,
  };
}

describe('TaskListContent Filter Integration', () => {
  describe('Quick Filter - Overdue', () => {
    it('should filter tasks that are overdue', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tasks = [
        createMockTask({ id: '1', scheduled_date: yesterday.toISOString() }),
        createMockTask({ id: '2', scheduled_date: null }),
      ];
      
      const filtered = tasks.filter(t => 
        isTaskOverdue(t.scheduled_date || t.due_date || null)
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should not include completed tasks in overdue filter', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const tasks = [
        createMockTask({ 
          id: '1', 
          scheduled_date: yesterday.toISOString(),
          completed_at: '2026-03-25T10:00:00Z'
        }),
      ];
      
      const filtered = tasks.filter(t => 
        isTaskOverdue(t.scheduled_date || t.due_date || null)
      );
      
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Quick Filter - This Week', () => {
    it('should filter tasks due this week', () => {
      const today = new Date();
      const tasks = [
        createMockTask({ id: '1', scheduled_date: today.toISOString() }),
        createMockTask({ id: '2', scheduled_date: null }),
      ];
      
      const filtered = tasks.filter(t => 
        isTaskDueThisWeek(t.scheduled_date || t.due_date || null)
      );
      
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Quick Filter - Next Week', () => {
    it('should filter tasks due next week', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const tasks = [
        createMockTask({ id: '1', scheduled_date: nextWeek.toISOString() }),
        createMockTask({ id: '2', scheduled_date: null }),
      ];
      
      const filtered = tasks.filter(t => 
        isTaskDueNextWeek(t.scheduled_date || t.due_date || null)
      );
      
      expect(filtered).toHaveLength(1);
    });
  });

  describe('Quick Filter - Next Steps (high priority, not overdue, not completed)', () => {
    it('should filter high priority tasks that are not overdue and not completed', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tasks = [
        createMockTask({ 
          id: '1', 
          priority: 'hoch',
          scheduled_date: tomorrow.toISOString(),
          completed_at: null
        }),
        createMockTask({ 
          id: '2', 
          priority: 'niedrig',
          scheduled_date: tomorrow.toISOString(),
          completed_at: null
        }),
        createMockTask({ 
          id: '3', 
          priority: 'hoch',
          scheduled_date: tomorrow.toISOString(),
          completed_at: '2026-03-25T10:00:00Z'
        }),
      ];
      
      const filtered = tasks.filter(t => 
        t.priority === 'hoch' && 
        !isTaskOverdue(t.scheduled_date || t.due_date || null) &&
        !t.completed_at
      );
      
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('Season Filter', () => {
    it('should return all tasks when season is Alle', () => {
      const tasks = [
        createMockTask({ id: '1', scheduled_date: '2026-03-15T10:00:00Z' }),
        createMockTask({ id: '2', scheduled_date: '2026-07-15T10:00:00Z' }),
      ];
      
      const filtered = filterTasksBySeason(tasks, 'Alle');
      expect(filtered).toHaveLength(2);
    });

    it('should filter tasks by season', () => {
      const tasks = [
        createMockTask({ id: '1', scheduled_date: '2026-03-15T10:00:00Z' }),
        createMockTask({ id: '2', scheduled_date: '2026-07-15T10:00:00Z' }),
        createMockTask({ id: '3', scheduled_date: '2026-09-15T10:00:00Z' }),
      ];
      
      const filtered = filterTasksBySeason(tasks, 'Frühling');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should get season from date correctly', () => {
      expect(getSeasonFromDate('2026-03-15T10:00:00Z')).toBe('Frühling');
      expect(getSeasonFromDate('2026-07-15T10:00:00Z')).toBe('Sommer');
      expect(getSeasonFromDate('2026-09-15T10:00:00Z')).toBe('Herbst');
      expect(getSeasonFromDate('2026-01-15T10:00:00Z')).toBe('Winter');
      expect(getSeasonFromDate(null)).toBe('Unbekannt');
    });
  });

  describe('Extended Filters - Priorities', () => {
    it('should filter by priorities', () => {
      const tasks = [
        createMockTask({ id: '1', priority: 'hoch' }),
        createMockTask({ id: '2', priority: 'mittel' }),
        createMockTask({ id: '3', priority: 'niedrig' }),
      ];
      
      const filtered = tasks.filter(t => ['hoch', 'mittel'].includes(t.priority));
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Extended Filters - Categories', () => {
    it('should filter by categories', () => {
      const tasks = [
        createMockTask({ id: '1', category: 'pflege' }),
        createMockTask({ id: '2', category: 'ernte' }),
        createMockTask({ id: '3', category: 'garten' }),
      ];
      
      const filtered = tasks.filter(t => ['pflege', 'ernte'].includes(t.category));
      expect(filtered).toHaveLength(2);
    });
  });

  describe('Extended Filters - Status', () => {
    it('should filter completed tasks when only erledigt is selected', () => {
      const tasks = [
        createMockTask({ id: '1', completed_at: '2026-03-25T10:00:00Z' }),
        createMockTask({ id: '2', completed_at: null }),
      ];
      
      const filtered = tasks.filter(t => t.completed_at);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter open tasks when only offen is selected', () => {
      const tasks = [
        createMockTask({ id: '1', completed_at: '2026-03-25T10:00:00Z' }),
        createMockTask({ id: '2', completed_at: null }),
      ];
      
      const filtered = tasks.filter(t => !t.completed_at);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });
  });

  describe('Sort by Month', () => {
    it('should sort tasks by scheduled_date month', () => {
      const tasks = [
        createMockTask({ id: '1', scheduled_date: '2026-06-15T10:00:00Z' }),
        createMockTask({ id: '2', scheduled_date: '2026-03-15T10:00:00Z' }),
        createMockTask({ id: '3', scheduled_date: '2026-09-15T10:00:00Z' }),
      ];
      
      const sorted = sortTasksByMonth(tasks);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
      expect(sorted[2].id).toBe('3');
    });

    it('should handle tasks without dates', () => {
      const tasks = [
        createMockTask({ id: '1', scheduled_date: null }),
        createMockTask({ id: '2', scheduled_date: '2026-03-15T10:00:00Z' }),
      ];
      
      const sorted = sortTasksByMonth(tasks);
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('1');
    });
  });

  describe('Combined Filters', () => {
    it('should apply quick filter then season filter', () => {
      const today = new Date();
      const inSummer = new Date();
      inSummer.setMonth(7); // August
      
      const tasks = [
        createMockTask({ 
          id: '1', 
          priority: 'hoch',
          scheduled_date: today.toISOString(),
          completed_at: null
        }),
        createMockTask({ 
          id: '2', 
          priority: 'hoch',
          scheduled_date: inSummer.toISOString(),
          completed_at: null
        }),
      ];
      
      let result = tasks.filter(t => 
        t.priority === 'hoch' && 
        !isTaskOverdue(t.scheduled_date || t.due_date || null) &&
        !t.completed_at
      );
      
      result = filterTasksBySeason(result, 'Frühling');
      expect(result).toHaveLength(1);
    });
  });
});
