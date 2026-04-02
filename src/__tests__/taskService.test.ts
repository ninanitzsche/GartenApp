// @ts-nocheck
/**
 * Task Service Tests
 * Comprehensive test suite for taskService.ts
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as taskService from '../services/taskService';
import { supabase } from '../services/supabase';
import { mockUser, createMockQueryBuilder } from './mocks/supabaseMock';

// Mock the supabase module
jest.mock('../services/supabase');

// Mock data creators
function mockTask(overrides?: any) {
  return {
    id: 'task-1',
    user_id: 'user-123',
    title: 'Test Task',
    description: 'Test Description',
    category: 'Gartenarbeiten',
    priority: 'mittel',
    location: 'Hauptbeet',
    created_at: '2026-03-04T10:00:00Z',
    updated_at: '2026-03-04T10:00:00Z',
    ...overrides,
  };
}

function mockPlant(overrides?: any) {
  return {
    id: 'plant-1',
    user_id: 'user-123',
    name: 'Tomato',
    ...overrides,
  };
}

describe('taskService', () => {
  const mockUserData = mockUser();

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUserData },
      error: null,
    });
  });

  describe('fetchTasks', () => {
    it('should fetch all tasks for current user', async () => {
      const tasks = [
        mockTask({ id: 'task-1', priority: 'hoch' }),
        mockTask({ id: 'task-2', priority: 'mittel' }),
      ];

      const mockBuilder = createMockQueryBuilder(tasks);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.fetchTasks();

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mockBuilder.select).toHaveBeenCalled(); // select was called with task/plant data
      expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', mockUserData.id);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should sort tasks by priority descending then created_at ascending', async () => {
      const tasks = [
        mockTask({ id: 'task-1', priority: 'mittel', created_at: '2026-03-04T10:00:00Z' }),
        mockTask({ id: 'task-2', priority: 'hoch', created_at: '2026-03-04T11:00:00Z' }),
        mockTask({ id: 'task-3', priority: 'niedrig', created_at: '2026-03-04T09:00:00Z' }),
      ];

      const mockBuilder = createMockQueryBuilder(tasks);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await taskService.fetchTasks();

      expect(mockBuilder.order).toHaveBeenCalledWith('priority', { ascending: false });
      expect(mockBuilder.order).toHaveBeenCalledWith('created_at', { ascending: true });
    });

    it('should handle authentication error', async () => {
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      });

      await expect(taskService.fetchTasks()).rejects.toThrow('User not authenticated');
    });

    it('should handle empty task list', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.fetchTasks();

      expect(result).toEqual([]);
    });
  });

  describe('fetchTask', () => {
    it('should fetch single task by ID', async () => {
      const task = mockTask({ id: 'task-123' });
      const mockBuilder = createMockQueryBuilder([task]);
      mockBuilder.single = jest.fn().mockResolvedValue({ data: task, error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.fetchTask('task-123');

      expect(supabase.from).toHaveBeenCalledWith('tasks');
      expect(mockBuilder.eq).toHaveBeenCalledWith('id', 'task-123');
      expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', mockUserData.id);
      expect(mockBuilder.single).toHaveBeenCalled();
      expect(result?.id).toBe('task-123');
    });

    it('should return null if task not found', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.single = jest.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.fetchTask('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle database error', async () => {
      const mockBuilder = createMockQueryBuilder(null);
      mockBuilder.single = jest
        .fn()
        .mockResolvedValue({ data: null, error: new Error('DB Error') });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(taskService.fetchTask('task-123')).rejects.toThrow('Error fetching task');
    });

    it('should enrich task with plant names', async () => {
      const task = mockTask({ id: 'task-123' });

      // Mock task fetch
      const taskBuilder = createMockQueryBuilder(task);
      taskBuilder.single = jest.fn().mockResolvedValue({ data: task, error: null });

      // Mock plant fetch
      const plants = [mockPlant({ name: 'Tomato' }), mockPlant({ id: 'plant-2', name: 'Basil' })];
      const plantBuilder = createMockQueryBuilder([
        { plant_id: 'plant-1', plants: plants[0] },
        { plant_id: 'plant-2', plants: plants[1] },
      ]);
      plantBuilder.select = jest.fn().mockReturnValue(plantBuilder);

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'tasks') {
          return taskBuilder;
        }
        if (table === 'plant_tasks') {
          return plantBuilder;
        }
        return taskBuilder;
      });

      const result = await taskService.fetchTask('task-123');

      expect(result).toBeDefined();
    });
  });

  describe('createTask', () => {
    it('should create a new task with valid data', async () => {
      const formData = {
        title: 'New Task',
        description: 'New Description',
        category: 'Aussaat',
        priority: 'hoch',
        location: 'Hochbeet',
        plant_ids: [],
      };

      const createdTask = {
        id: 'task-new',
        user_id: mockUserData.id,
        ...formData,
        created_at: '2026-03-04T10:00:00Z',
        updated_at: '2026-03-04T10:00:00Z',
      };

      const mockBuilder = createMockQueryBuilder([createdTask]);
      mockBuilder.insert = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.select = jest.fn().mockReturnValue(mockBuilder);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.createTask(formData);

      expect(mockBuilder.insert).toHaveBeenCalled();
      expect(mockBuilder.select).toHaveBeenCalled();
    });

    it('should validate title is required', async () => {
      const formData = {
        title: '',
        description: 'Description',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        plant_ids: [],
      };

      await expect(taskService.createTask(formData)).rejects.toThrow('Task title is required');
    });

    it('should validate title minimum length', async () => {
      const formData = {
        title: 'ab',
        description: 'Description',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        plant_ids: [],
      };

      await expect(taskService.createTask(formData)).rejects.toThrow(
        'Task title must be at least 3 characters'
      );
    });

    it('should trim title and description', async () => {
      const formData = {
        title: '  New Task  ',
        description: '  Description  ',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        location: '  Hauptbeet  ',
        plant_ids: [],
      };

      const createdTask = {
        id: 'task-new',
        user_id: mockUserData.id,
        title: 'New Task',
        description: 'Description',
        location: 'Hauptbeet',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        created_at: '2026-03-04T10:00:00Z',
        updated_at: '2026-03-04T10:00:00Z',
      };

      const mockBuilder = createMockQueryBuilder([createdTask]);
      mockBuilder.insert = jest.fn(function (data: any) {
        // Verify trimming happens
        if (Array.isArray(data) && data.length > 0) {
          expect(data[0].title).toBe('New Task');
          expect(data[0].description).toBe('Description');
          expect(data[0].location).toBe('Hauptbeet');
        }
        return this;
      });
      mockBuilder.select = jest.fn().mockResolvedValue({ data: [createdTask], error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.createTask(formData);

      expect(mockBuilder.insert).toHaveBeenCalled();
      expect(result.title).toBe('New Task');
    });

    it('should link plants when provided', async () => {
      const formData = {
        title: 'New Task',
        description: 'Description',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        plant_ids: ['plant-1', 'plant-2'],
      };

      const createdTask = {
        id: 'task-new',
        user_id: mockUserData.id,
        ...formData,
        created_at: '2026-03-04T10:00:00Z',
        updated_at: '2026-03-04T10:00:00Z',
      };

      const mockBuilder = createMockQueryBuilder([createdTask]);
      mockBuilder.insert = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.select = jest.fn().mockReturnValue(mockBuilder);

      const plantBuilder = createMockQueryBuilder([]);
      plantBuilder.insert = jest.fn().mockReturnValue(plantBuilder);

      let isTaskTable = false;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        isTaskTable = table === 'tasks';
        if (isTaskTable) {
          return mockBuilder;
        }
        return plantBuilder;
      });

      await taskService.createTask(formData);

      expect(mockBuilder.insert).toHaveBeenCalled();
    });

    it('should handle database error', async () => {
      const formData = {
        title: 'New Task',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        plant_ids: [],
      };

      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder.insert = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.select = jest
        .fn()
        .mockResolvedValue({ data: null, error: new Error('DB Error') });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(taskService.createTask(formData)).rejects.toThrow('Error creating task');
    });
  });

  describe('updateTask', () => {
    it('should update existing task', async () => {
      const formData = {
        title: 'Updated Task',
        description: 'Updated Description',
        category: 'Pflanzen',
        priority: 'hoch',
        location: 'Gewächshaus',
        plant_ids: [],
      };

      const updatedTask = {
        id: 'task-123',
        user_id: mockUserData.id,
        ...formData,
        updated_at: '2026-03-04T11:00:00Z',
      };

      const mockBuilder = createMockQueryBuilder([updatedTask]);
      mockBuilder.update = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.select = jest.fn().mockReturnValue(mockBuilder);

      const plantBuilder = createMockQueryBuilder([]);
      plantBuilder.delete = jest.fn().mockReturnValue(plantBuilder);

      let isTaskTable = false;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        isTaskTable = table === 'tasks';
        if (isTaskTable) {
          return mockBuilder;
        }
        return plantBuilder;
      });

      await taskService.updateTask('task-123', formData);

      expect(mockBuilder.update).toHaveBeenCalled();
    });

    it('should validate title on update', async () => {
      const formData = {
        title: '',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        plant_ids: [],
      };

      await expect(taskService.updateTask('task-123', formData)).rejects.toThrow(
        'Task title is required'
      );
    });

    it('should remove and re-add plant links on update', async () => {
      const formData = {
        title: 'Updated Task',
        category: 'Gartenarbeiten',
        priority: 'mittel',
        plant_ids: ['plant-3', 'plant-4'],
      };

      const updatedTask = mockTask({ id: 'task-123' });

      const taskBuilder = createMockQueryBuilder([updatedTask]);
      taskBuilder.update = jest.fn().mockReturnValue(taskBuilder);
      taskBuilder.select = jest.fn().mockResolvedValue({ data: [updatedTask], error: null });

      // Create a proper builder that supports chaining
      const plantBuilder = createMockQueryBuilder([]);
      plantBuilder.delete = jest.fn().mockReturnValue(plantBuilder);
      plantBuilder.insert = jest.fn().mockReturnValue(plantBuilder);

      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'tasks') {
          return taskBuilder;
        }
        if (table === 'plant_tasks') {
          return plantBuilder;
        }
        return taskBuilder;
      });

      await taskService.updateTask('task-123', formData);

      // Verify the plant links were processed
      expect(plantBuilder.delete).toHaveBeenCalled();
      expect(plantBuilder.insert).toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete task and its plant links', async () => {
      const plantBuilder = createMockQueryBuilder([]);
      plantBuilder.delete = jest.fn().mockReturnValue(plantBuilder);

      const taskBuilder = createMockQueryBuilder([]);
      taskBuilder.delete = jest.fn().mockReturnValue(taskBuilder);

      let isTaskTable = false;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        isTaskTable = table === 'tasks';
        if (isTaskTable) {
          return taskBuilder;
        }
        return plantBuilder;
      });

      await taskService.deleteTask('task-123');

      expect(plantBuilder.delete).toHaveBeenCalled();
      expect(taskBuilder.delete).toHaveBeenCalled();
    });

    it('should handle database error on plant link deletion', async () => {
      const plantBuilder = createMockQueryBuilder([]);
      plantBuilder.delete = jest
        .fn()
        .mockResolvedValue({ data: null, error: new Error('DB Error') });

      (supabase.from as jest.Mock).mockReturnValue(plantBuilder);

      await expect(taskService.deleteTask('task-123')).rejects.toThrow('Error deleting task');
    });

    it('should handle database error on task deletion', async () => {
      const plantBuilder = createMockQueryBuilder([]);
      plantBuilder.delete = jest.fn().mockReturnValue(plantBuilder);

      const taskBuilder = createMockQueryBuilder([]);
      taskBuilder.delete = jest
        .fn()
        .mockResolvedValue({ data: null, error: new Error('DB Error') });

      let isTaskTable = false;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        isTaskTable = table === 'tasks';
        if (isTaskTable) {
          return taskBuilder;
        }
        return plantBuilder;
      });

      await expect(taskService.deleteTask('task-123')).rejects.toThrow('Error deleting task');
    });
  });

  describe('linkPlantsToTask', () => {
    it('should link plants to task', async () => {
      const plantIds = ['plant-1', 'plant-2'];
      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder.insert = jest.fn().mockReturnValue(mockBuilder);

      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await taskService.linkPlantsToTask('task-123', plantIds);

      expect(supabase.from).toHaveBeenCalledWith('plant_tasks');
      expect(mockBuilder.insert).toHaveBeenCalledWith([
        { task_id: 'task-123', plant_id: 'plant-1' },
        { task_id: 'task-123', plant_id: 'plant-2' },
      ]);
    });

    it('should handle empty plant list', async () => {
      // Should return early without error
      await expect(taskService.linkPlantsToTask('task-123', [])).resolves.not.toThrow();
    });

    it('should handle database error', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder.insert = jest
        .fn()
        .mockResolvedValue({ data: null, error: new Error('DB Error') });

      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(taskService.linkPlantsToTask('task-123', ['plant-1'])).rejects.toThrow(
        'Error linking plants to task'
      );
    });
  });

  describe('unlinkPlantsFromTask', () => {
    it('should unlink all plants from task', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder.delete = jest.fn().mockReturnValue(mockBuilder);

      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await taskService.unlinkPlantsFromTask('task-123');

      expect(supabase.from).toHaveBeenCalledWith('plant_tasks');
      expect(mockBuilder.delete).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('task_id', 'task-123');
    });

    it('should handle database error', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      mockBuilder.delete = jest
        .fn()
        .mockResolvedValue({ data: null, error: new Error('DB Error') });

      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await expect(taskService.unlinkPlantsFromTask('task-123')).rejects.toThrow(
        'Error unlinking plants from task'
      );
    });
  });

  describe('fetchPlantsForSelection', () => {
    it('should fetch all plants for current user', async () => {
      const plants = [
        mockPlant({ name: 'Tomato' }),
        mockPlant({ id: 'plant-2', name: 'Basil' }),
      ];

      const mockBuilder = createMockQueryBuilder(plants);
      mockBuilder.select = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.eq = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.order = jest.fn().mockResolvedValue({ data: plants, error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.fetchPlantsForSelection();

      expect(supabase.from).toHaveBeenCalledWith('plants');
      expect(mockBuilder.select).toHaveBeenCalled();
      expect(mockBuilder.eq).toHaveBeenCalledWith('user_id', mockUserData.id);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should sort plants by name ascending', async () => {
      const plants = [
        mockPlant({ name: 'Basil' }),
        mockPlant({ id: 'plant-2', name: 'Tomato' }),
      ];

      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      await taskService.fetchPlantsForSelection();

      expect(mockBuilder.order).toHaveBeenCalledWith('name', { ascending: true });
    });

    it('should handle empty plant list', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.fetchPlantsForSelection();

      expect(result).toEqual([]);
    });
  });

  describe('getTaskPlants', () => {
    it('should fetch plants linked to task', async () => {
      const plants = [
        { plant_id: 'plant-1', plants: mockPlant({ name: 'Tomato' }) },
        { plant_id: 'plant-2', plants: mockPlant({ id: 'plant-2', name: 'Basil' }) },
      ];

      const mockBuilder = createMockQueryBuilder(plants);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.getTaskPlants('task-123');

      expect(supabase.from).toHaveBeenCalledWith('plant_tasks');
      expect(mockBuilder.eq).toHaveBeenCalledWith('task_id', 'task-123');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter out null plants', async () => {
      const plants = [
        { plant_id: 'plant-1', plants: mockPlant({ name: 'Tomato' }) },
        { plant_id: 'plant-2', plants: null },
      ];

      const mockBuilder = createMockQueryBuilder(plants);
      mockBuilder.select = jest.fn().mockReturnValue(mockBuilder);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.getTaskPlants('task-123');

      // Should filter out null plants
      expect(result.every((p: any) => p !== null)).toBe(true);
    });

    it('should handle empty result', async () => {
      const mockBuilder = createMockQueryBuilder([]);
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.getTaskPlants('task-123');

      expect(result).toEqual([]);
    });
  });

  describe('toggleTaskCompletion', () => {
    it('should mark incomplete task as complete', async () => {
      const mockBuilder = createMockQueryBuilder([
        { id: 'task-1', completed_at: null },
      ]);
      mockBuilder.single = jest
        .fn()
        .mockResolvedValue({ data: { id: 'task-1', completed_at: null }, error: null });
      mockBuilder.update = jest.fn().mockReturnValue(mockBuilder);

      const updateBuilder = createMockQueryBuilder([
        { id: 'task-1', completed_at: '2026-03-04T16:00:00Z' },
      ]);
      updateBuilder.update = jest.fn().mockReturnValue(updateBuilder);
      updateBuilder.eq = jest.fn().mockReturnValue(updateBuilder);
      updateBuilder.select = jest
        .fn()
        .mockResolvedValue({
          data: [{ id: 'task-1', completed_at: '2026-03-04T16:00:00Z' }],
          error: null,
        });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        callCount++;
        if (callCount === 1) return mockBuilder;
        return updateBuilder;
      });

      const result = await taskService.toggleTaskCompletion('task-1');

      expect(result.completed_at).toBeDefined();
    });

    it('should mark complete task as incomplete', async () => {
      const mockBuilder = createMockQueryBuilder([
        { id: 'task-1', completed_at: '2026-03-04T15:00:00Z' },
      ]);
      mockBuilder.single = jest.fn().mockResolvedValue({
        data: { id: 'task-1', completed_at: '2026-03-04T15:00:00Z' },
        error: null,
      });
      mockBuilder.update = jest.fn().mockReturnValue(mockBuilder);

      const updateBuilder = createMockQueryBuilder([
        { id: 'task-1', completed_at: null },
      ]);
      updateBuilder.update = jest.fn().mockReturnValue(updateBuilder);
      updateBuilder.eq = jest.fn().mockReturnValue(updateBuilder);
      updateBuilder.select = jest
        .fn()
        .mockResolvedValue({ data: [{ id: 'task-1', completed_at: null }], error: null });

      let callCount = 0;
      (supabase.from as jest.Mock).mockImplementation((table) => {
        callCount++;
        if (callCount === 1) return mockBuilder;
        return updateBuilder;
      });

      const result = await taskService.toggleTaskCompletion('task-1');

      expect(result.completed_at).toBeNull();
    });
  });

  describe('markTaskComplete', () => {
    it('should mark task as complete with timestamp', async () => {
      const completedTask = {
        id: 'task-1',
        completed_at: new Date().toISOString(),
      };

      const mockBuilder = createMockQueryBuilder([completedTask]);
      mockBuilder.update = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.eq = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.select = jest
        .fn()
        .mockResolvedValue({ data: [completedTask], error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.markTaskComplete('task-1');

      expect(result.completed_at).toBeDefined();
      expect(mockBuilder.update).toHaveBeenCalled();
    });
  });

  describe('markTaskIncomplete', () => {
    it('should mark task as incomplete (null completed_at)', async () => {
      const incompleteTask = {
        id: 'task-1',
        completed_at: null,
      };

      const mockBuilder = createMockQueryBuilder([incompleteTask]);
      mockBuilder.update = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.eq = jest.fn().mockReturnValue(mockBuilder);
      mockBuilder.select = jest
        .fn()
        .mockResolvedValue({ data: [incompleteTask], error: null });
      (supabase.from as jest.Mock).mockReturnValue(mockBuilder);

      const result = await taskService.markTaskIncomplete('task-1');

      expect(result.completed_at).toBeNull();
      expect(mockBuilder.update).toHaveBeenCalled();
    });
  });

  describe('Color utility functions', () => {
    describe('getCategoryColor', () => {
      it('should return correct color for each category', () => {
        expect(taskService.getCategoryColor('Aussaat')).toBe('#2D4739');
        expect(taskService.getCategoryColor('Pflanzen')).toBe('#4A6FA5');
        expect(taskService.getCategoryColor('Gartenarbeiten')).toBe('#8D5B3E');
        expect(taskService.getCategoryColor('Beobachten')).toBe('#006064');
        expect(taskService.getCategoryColor('Ernten')).toBe('#8D5B3E');
      });

      it('should return default color for unknown category', () => {
        expect(taskService.getCategoryColor('Unknown')).toBe('#8A8A8A');
      });
    });

    describe('getPriorityColor', () => {
      it('should return correct color for each priority', () => {
        expect(taskService.getPriorityColor('hoch')).toBe('#D32F2F');
        expect(taskService.getPriorityColor('mittel')).toBe('#F57C00');
        expect(taskService.getPriorityColor('niedrig')).toBe('#5A7A7A');
      });

      it('should return default color for unknown priority', () => {
        expect(taskService.getPriorityColor('unknown')).toBe('#8A8A8A');
      });
    });

    describe('getPriorityLabel', () => {
      it('should return correct label for each priority', () => {
        expect(taskService.getPriorityLabel('hoch')).toBe('Hoch');
        expect(taskService.getPriorityLabel('mittel')).toBe('Mittel');
        expect(taskService.getPriorityLabel('niedrig')).toBe('Niedrig');
      });

      it('should return default label for unknown priority', () => {
        expect(taskService.getPriorityLabel('unknown')).toBe('Unbekannt');
      });
    });
  });

  describe('Sorting utility functions', () => {
    describe('getPriorityValue', () => {
      it('should return correct numeric values for priorities', () => {
        expect(taskService.getPriorityValue('hoch')).toBe(3);
        expect(taskService.getPriorityValue('mittel')).toBe(2);
        expect(taskService.getPriorityValue('niedrig')).toBe(1);
      });

      it('should return 0 for unknown priority', () => {
        expect(taskService.getPriorityValue('unknown')).toBe(0);
      });
    });

    describe('getSortLabel', () => {
      it('should return correct German labels for sort options', () => {
        expect(taskService.getSortLabel('priority')).toBe('Nach Priorität');
        expect(taskService.getSortLabel('created_at')).toBe('Nach Erstellungsdatum');
        expect(taskService.getSortLabel('category')).toBe('Nach Kategorie');
        expect(taskService.getSortLabel('title')).toBe('Nach Titel');
      });

      it('should return default label for unknown sort option', () => {
        expect(taskService.getSortLabel('unknown')).toBe('Sortierung');
      });
    });

    describe('sortTasks', () => {
      const createTaskListItem = (overrides?: any) => ({
        ...mockTask(),
        plant_names: [],
        ...overrides,
      });

      describe('sort by priority (default)', () => {
        it('should sort by priority descending (hoch → mittel → niedrig)', () => {
          const tasks = [
            createTaskListItem({ id: 'task-1', priority: 'niedrig', created_at: '2026-03-04T10:00:00Z' }),
            createTaskListItem({ id: 'task-2', priority: 'hoch', created_at: '2026-03-04T11:00:00Z' }),
            createTaskListItem({ id: 'task-3', priority: 'mittel', created_at: '2026-03-04T09:00:00Z' }),
          ];

          const sorted = taskService.sortTasks(tasks, 'priority');

          expect(sorted[0].id).toBe('task-2'); // hoch
          expect(sorted[1].id).toBe('task-3'); // mittel
          expect(sorted[2].id).toBe('task-1'); // niedrig
        });

        it('should sort by created_at ascending when priorities are equal', () => {
          const tasks = [
            createTaskListItem({ id: 'task-1', priority: 'mittel', created_at: '2026-03-04T11:00:00Z' }),
            createTaskListItem({ id: 'task-2', priority: 'mittel', created_at: '2026-03-04T09:00:00Z' }),
            createTaskListItem({ id: 'task-3', priority: 'mittel', created_at: '2026-03-04T10:00:00Z' }),
          ];

          const sorted = taskService.sortTasks(tasks, 'priority');

          expect(sorted[0].id).toBe('task-2'); // earliest
          expect(sorted[1].id).toBe('task-3'); // middle
          expect(sorted[2].id).toBe('task-1'); // latest
        });
      });

      describe('sort by created_at', () => {
        it('should sort by created_at descending (newest first)', () => {
          const tasks = [
            createTaskListItem({ id: 'task-1', created_at: '2026-03-04T09:00:00Z' }),
            createTaskListItem({ id: 'task-2', created_at: '2026-03-04T11:00:00Z' }),
            createTaskListItem({ id: 'task-3', created_at: '2026-03-04T10:00:00Z' }),
          ];

          const sorted = taskService.sortTasks(tasks, 'created_at');

          expect(sorted[0].id).toBe('task-2'); // newest
          expect(sorted[1].id).toBe('task-3'); // middle
          expect(sorted[2].id).toBe('task-1'); // oldest
        });
      });

      describe('sort by category', () => {
        it('should sort alphabetically by category (A-Z)', () => {
          const tasks = [
            createTaskListItem({ id: 'task-1', category: 'Pflanzen' }),
            createTaskListItem({ id: 'task-2', category: 'Aussaat' }),
            createTaskListItem({ id: 'task-3', category: 'Gartenarbeiten' }),
          ];

          const sorted = taskService.sortTasks(tasks, 'category');

          expect(sorted[0].category).toBe('Aussaat');
          expect(sorted[1].category).toBe('Gartenarbeiten');
          expect(sorted[2].category).toBe('Pflanzen');
        });
      });

      describe('sort by title', () => {
        it('should sort alphabetically by title (A-Z)', () => {
          const tasks = [
            createTaskListItem({ id: 'task-1', title: 'Zebra Task' }),
            createTaskListItem({ id: 'task-2', title: 'Apple Task' }),
            createTaskListItem({ id: 'task-3', title: 'Banana Task' }),
          ];

          const sorted = taskService.sortTasks(tasks, 'title');

          expect(sorted[0].title).toBe('Apple Task');
          expect(sorted[1].title).toBe('Banana Task');
          expect(sorted[2].title).toBe('Zebra Task');
        });
      });

      it('should return a new array without mutating the original', () => {
        const originalTasks = [
          createTaskListItem({ id: 'task-1', priority: 'niedrig' }),
          createTaskListItem({ id: 'task-2', priority: 'hoch' }),
        ];
        const originalOrder = originalTasks.map(t => t.id);

        const sorted = taskService.sortTasks(originalTasks, 'priority');

        expect(originalTasks.map(t => t.id)).toEqual(originalOrder); // unchanged
        expect(sorted[0].id).toBe('task-2'); // sorted differently
      });

      it('should handle empty task list', () => {
        const sorted = taskService.sortTasks([], 'priority');
        expect(sorted).toEqual([]);
      });

      it('should handle single task', () => {
        const tasks = [createTaskListItem({ id: 'task-1' })];
        const sorted = taskService.sortTasks(tasks, 'priority');
        expect(sorted).toHaveLength(1);
        expect(sorted[0].id).toBe('task-1');
      });

      it('should default to priority sort when sortBy is invalid', () => {
        const tasks = [
          createTaskListItem({ id: 'task-1', priority: 'niedrig' }),
          createTaskListItem({ id: 'task-2', priority: 'hoch' }),
        ];

        const sorted = taskService.sortTasks(tasks, 'invalid-option');

        // Should default to priority sort
        expect(sorted[0].id).toBe('task-2'); // hoch
        expect(sorted[1].id).toBe('task-1'); // niedrig
      });
    });
  });

  describe('getCurrentSeason', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return Frühling for March-May', () => {
      jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(3); // April
      expect(taskService.getCurrentSeason()).toBe('Frühling');
    });

    it('should return Sommer for June-August', () => {
      jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(7); // August
      expect(taskService.getCurrentSeason()).toBe('Sommer');
    });

    it('should return Herbst for September-November', () => {
      jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(10); // November
      expect(taskService.getCurrentSeason()).toBe('Herbst');
    });

    it('should return Winter for December-February', () => {
      jest.spyOn(Date.prototype, 'getMonth').mockReturnValue(0); // January
      expect(taskService.getCurrentSeason()).toBe('Winter');
    });
  });

  describe('getSeasonFromDate', () => {
    it('should return season based on date month', () => {
      expect(taskService.getSeasonFromDate('2026-04-15T12:00:00')).toBe('Frühling');
      expect(taskService.getSeasonFromDate('2026-07-15T12:00:00')).toBe('Sommer');
      expect(taskService.getSeasonFromDate('2026-10-15T12:00:00')).toBe('Herbst');
      expect(taskService.getSeasonFromDate('2026-01-15T12:00:00')).toBe('Winter');
    });

    it('should return Unbekannt for null', () => {
      expect(taskService.getSeasonFromDate(null)).toBe('Unbekannt');
    });
  });

  describe('isTaskOverdue', () => {
    it('should return true for past dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(taskService.isTaskOverdue(yesterday.toISOString())).toBe(true);
    });

    it('should return false for today', () => {
      expect(taskService.isTaskOverdue(new Date().toISOString())).toBe(false);
    });

    it('should return false for null', () => {
      expect(taskService.isTaskOverdue(null)).toBe(false);
    });
  });

  describe('isTaskDueThisWeek', () => {
    it('should return true for date within current week', () => {
      const today = new Date();
      expect(taskService.isTaskDueThisWeek(today.toISOString())).toBe(true);
    });

    it('should return false for date next week', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);
      expect(taskService.isTaskDueThisWeek(nextWeek.toISOString())).toBe(false);
    });

    it('should return false for null', () => {
      expect(taskService.isTaskDueThisWeek(null)).toBe(false);
    });
  });

  describe('isTaskDueNextWeek', () => {
    it('should return true for date next week', () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 8);
      expect(taskService.isTaskDueNextWeek(nextWeek.toISOString())).toBe(true);
    });

    it('should return false for date this week', () => {
      const today = new Date();
      expect(taskService.isTaskDueNextWeek(today.toISOString())).toBe(false);
    });

    it('should return false for null', () => {
      expect(taskService.isTaskDueNextWeek(null)).toBe(false);
    });
  });

  describe('filterTasksBySeason', () => {
    it('should return all tasks for Alle season', () => {
      const tasks = [
        { scheduled_date: '2026-04-15T12:00:00' },
        { scheduled_date: '2026-07-15T12:00:00' },
      ] as any;
      expect(taskService.filterTasksBySeason(tasks, 'Alle')).toHaveLength(2);
    });

    it('should filter tasks by season', () => {
      const tasks = [
        { scheduled_date: '2026-04-15T12:00:00' },
        { scheduled_date: '2026-07-15T12:00:00' },
      ] as any;
      const filtered = taskService.filterTasksBySeason(tasks, 'Frühling');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].scheduled_date).toBe('2026-04-15T12:00:00');
    });
  });

  describe('sortTasksByMonth', () => {
    it('should sort tasks by date ascending', () => {
      const tasks = [
        { scheduled_date: '2026-07-15T12:00:00' },
        { scheduled_date: '2026-03-15T12:00:00' },
        { scheduled_date: '2026-05-15T12:00:00' },
      ] as any;
      const sorted = taskService.sortTasksByMonth(tasks);
      expect(sorted[0].scheduled_date).toBe('2026-03-15T12:00:00');
      expect(sorted[2].scheduled_date).toBe('2026-07-15T12:00:00');
    });
  });

  describe('getSortLabel', () => {
    it('should return month label for month sort', () => {
      expect(taskService.getSortLabel('month')).toBe('Nach Monat');
    });
  });
});
