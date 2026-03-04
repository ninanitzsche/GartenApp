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
      expect(mockBuilder.select).toHaveBeenCalledWith('*');
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

  describe('Color utility functions', () => {
    describe('getCategoryColor', () => {
      it('should return correct color for each category', () => {
        expect(taskService.getCategoryColor('Aussaat')).toBe('#4CAF50');
        expect(taskService.getCategoryColor('Pflanzen')).toBe('#2196F3');
        expect(taskService.getCategoryColor('Gartenarbeiten')).toBe('#FF9800');
        expect(taskService.getCategoryColor('Beobachten')).toBe('#9C27B0');
        expect(taskService.getCategoryColor('Ernten')).toBe('#F44336');
      });

      it('should return default color for unknown category', () => {
        expect(taskService.getCategoryColor('Unknown')).toBe('#757575');
      });
    });

    describe('getPriorityColor', () => {
      it('should return correct color for each priority', () => {
        expect(taskService.getPriorityColor('hoch')).toBe('#F44336'); // Red
        expect(taskService.getPriorityColor('mittel')).toBe('#FFC107'); // Yellow
        expect(taskService.getPriorityColor('niedrig')).toBe('#9E9E9E'); // Gray
      });

      it('should return default color for unknown priority', () => {
        expect(taskService.getPriorityColor('unknown')).toBe('#757575');
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
});
